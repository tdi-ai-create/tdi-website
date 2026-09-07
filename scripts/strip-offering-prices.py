"""Build price-free copies of the four offering one-pagers for the re-entry campaign.

The PDFs are print-to-PDF output with subsetted, glyph-encoded fonts and no HTML
source in the repo. Every price sits inside a BT/ET text block drawn one glyph at
a time as `<hex> Tj` with `X 0 Td` offsets between them, so removing a price is
either a whole-block delete (the header figure, which is its own block) or a
truncation of the trailing operator run (a price at the end of a sentence or a
comparison row).

Anything containing a "$" that does not match one of the three known shapes is
reported and the file is not written, so a new price style cannot slip through.
"""

import re
import sys
import zlib
from pathlib import Path

from pypdf import PdfWriter
from pypdf.generic import DecodedStreamObject, NameObject

SRC = Path("public/downloads")

# (source, campaign copy)
FILES = [
    ("the-pulse.pdf", "the-pulse-overview.pdf"),
    ("the-focus.pdf", "the-focus-overview.pdf"),
    ("the-cohort.pdf", "the-cohort-overview.pdf"),
    ("the-blueprint.pdf", "the-blueprint-overview.pdf"),
]

HEADER_PRICE = re.compile(r"^\$[\d,]+(?:\s*[–—-]\s*\$?[\d,]+)?\s*A YEAR$")
TOKEN = re.compile(
    rb"(?:(?P<td>[-\d.]+\s+[-\d.]+\s+Td)\s+)?<(?P<hex>[0-9A-Fa-f]+)>\s*Tj"
)


def glyph_map(raw: bytes) -> dict:
    """Reverse the ToUnicode CMaps so a block's glyph codes can be read as text."""
    out = {}
    for m in re.finditer(rb"stream\r?\n", raw):
        start = m.end()
        end = raw.find(b"endstream", start)
        try:
            dec = zlib.decompress(raw[start:end])
        except Exception:
            continue
        for blk in re.findall(rb"beginbfchar(.*?)endbfchar", dec, re.S):
            for src, dst in re.findall(rb"<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>", blk):
                out[src.decode().upper().zfill(4)] = chr(int(dst.decode()[:4], 16))
        for blk in re.findall(rb"beginbfrange(.*?)endbfrange", dec, re.S):
            for lo, hi, st in re.findall(
                rb"<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>", blk
            ):
                base = int(st.decode()[:4], 16)
                for code in range(int(lo, 16), int(hi, 16) + 1):
                    out[format(code, "04X")] = chr(base + code - int(lo, 16))
    return out


def read_tokens(block: bytes, gmap: dict):
    """Each drawn glyph, with where it sits in the block and in the decoded text."""
    tokens = []
    cursor = 0
    for m in TOKEN.finditer(block):
        hexes = m.group("hex").decode().upper()
        text = "".join(
            gmap.get(hexes[i : i + 4].zfill(4), "?") for i in range(0, len(hexes), 4)
        )
        tokens.append({"start": m.start(), "end": m.end(), "at": cursor, "text": text})
        cursor += len(text)
    return tokens


def cut_index(text: str):
    """Where to truncate a block, or None if the whole block goes, or False if unknown."""
    if HEADER_PRICE.match(text.strip()):
        return None  # delete the block outright
    if " · $" in text:
        return text.index(" · $")  # "The Pulse · $2,500" keeps "The Pulse"
    if "The district spent $" in text:
        idx = text.index("The district spent $")
        return idx - 1 if idx and text[idx - 1] == " " else idx
    return False


PATH_OPS = {b"m", b"l", b"c", b"v", b"y", b"h", b"re"}
NUMBER = re.compile(rb"^-?[\d.]+$")


def badge_span(data: bytes, bt_start: int):
    """The filled pill drawn behind a header price, if there is one.

    The header figure sits in a rounded rectangle: a bezier path closed with `h`
    and filled with `f`, then the text colour is set to white and the text drawn.
    Deleting only the text leaves an empty coloured pill, so the path goes too.
    Returns the byte span of the path, or None when the block has no badge.
    """
    head = data[:bt_start]
    marker = head.rfind(b"\nf\n")
    if marker == -1:
        return None
    # Nothing but a colour change may sit between the fill and the text.
    between = head[marker + 3 : bt_start].strip()
    if between and not re.fullmatch(rb"[\d.\s]+(?:RG|rg)(?:\s+[\d.\s]+(?:RG|rg))*", between):
        return None
    # Walk back over the path construction operators to find where the path began.
    tokens = list(re.finditer(rb"\S+", head[:marker]))
    start = marker
    for tok in reversed(tokens):
        word = tok.group()
        if NUMBER.match(word) or word in PATH_OPS:
            start = tok.start()
            continue
        break
    return (start, marker + 3) if start < marker else None


def strip_page(data: bytes, gmap: dict, report: list) -> bytes:
    edits = []
    for block in re.finditer(rb"BT(.*?)ET", data, re.S):
        body = block.group(1)
        tokens = read_tokens(body, gmap)
        text = "".join(t["text"] for t in tokens)
        if "$" not in text:
            continue
        where = cut_index(text)
        if where is False:
            report.append(("UNKNOWN", text))
            continue
        if where is None:
            edits.append((block.start(), block.end(), b""))
            badge = badge_span(data, block.start())
            if badge:
                edits.append((badge[0], badge[1], b""))
            report.append(
                ("removed block", f"{text} ({'with badge' if badge else 'no badge'})")
            )
            continue
        keep = [t for t in tokens if t["at"] < where]
        if not keep:
            edits.append((block.start(), block.end(), b""))
            report.append(("removed block", text))
            continue
        # Drop every operator after the last glyph we are keeping.
        body_start = block.start() + 2  # past "BT"
        edits.append((body_start + keep[-1]["end"], block.end() - 2, b"\n"))
        report.append(("truncated", f"{text!r} -> {''.join(t['text'] for t in keep)!r}"))

    for start, end, replacement in sorted(edits, reverse=True):
        data = data[:start] + replacement + data[end:]
    return data


def main() -> int:
    failures = 0
    for src_name, out_name in FILES:
        src = SRC / src_name
        raw = src.read_bytes()
        gmap = glyph_map(raw)
        report: list = []

        writer = PdfWriter(clone_from=str(src))
        for page in writer.pages:
            contents = page.get_contents()
            if contents is None:
                continue
            new_data = strip_page(contents.get_data(), gmap, report)
            stream = DecodedStreamObject()
            stream.set_data(new_data)
            page[NameObject("/Contents")] = writer._add_object(stream)
            page.compress_content_streams()

        unknown = [t for kind, t in report if kind == "UNKNOWN"]
        print(f"=== {src_name} -> {out_name}")
        for kind, detail in report:
            print(f"    {kind}: {detail}")
        if unknown:
            print(f"    NOT WRITTEN: {len(unknown)} price style(s) not recognised")
            failures += 1
            continue
        if not report:
            print("    NOT WRITTEN: no price found, source may have changed")
            failures += 1
            continue

        with open(SRC / out_name, "wb") as fh:
            writer.write(fh)
        print(f"    written {(SRC / out_name).stat().st_size:,} bytes")
    return 1 if failures else 0


if __name__ == "__main__":
    sys.exit(main())
