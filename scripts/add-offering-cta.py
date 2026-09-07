"""Add a clickable "learn more" call to action to the price-free one-pagers.

The header price and the pill behind it were removed for the September re-entry
batch, which left an empty space beside the title. That space now carries a CTA
pointing at /for-schools, drawn in Helvetica (a base 14 font, so nothing needs
embedding) with a Link annotation over it so it is clickable rather than just
printed. The same CTA repeats at the foot of the last page, since that is where
a reader finishes.
"""

import re
import sys
from pathlib import Path

from pypdf import PdfWriter
from pypdf.annotations import Link
from pypdf.generic import ArrayObject, DictionaryObject, NameObject, DecodedStreamObject

SRC = Path("public/downloads")
FILES = [
    "the-pulse-overview.pdf",
    "the-focus-overview.pdf",
    "the-cohort-overview.pdf",
    "the-blueprint-overview.pdf",
]

URL = "https://www.teachersdeserveit.com/for-schools"
LABEL = "Learn more: teachersdeserveit.com/for-schools"
FONT_KEY = "/TDICta"
SIZE = 9.5
# Deep indigo, picked to sit with the existing title colour rather than shout.
INK = ".2863 .2235 .4706"

# Helvetica advance widths (per 1000 units) for the characters we actually use.
W = {
    " ": 278, ".": 278, "/": 278, ":": 278,
    "L": 556, "a": 556, "b": 556, "c": 500, "d": 556, "e": 556, "h": 556,
    "i": 222, "l": 222, "m": 833, "n": 556, "o": 556, "r": 333, "s": 500,
    "t": 278, "u": 556, "v": 500, "w": 722, "-": 333,
}


def text_width(label: str, size: float) -> float:
    return sum(W.get(ch, 556) for ch in label) / 1000.0 * size


def ensure_font(page) -> None:
    """Base 14 Helvetica needs no embedding, just a resource entry."""
    resources = page[NameObject("/Resources")]
    if NameObject("/Font") not in resources:
        resources[NameObject("/Font")] = DictionaryObject()
    fonts = resources[NameObject("/Font")]
    if NameObject(FONT_KEY) in fonts:
        return
    fonts[NameObject(FONT_KEY)] = DictionaryObject({
        NameObject("/Type"): NameObject("/Font"),
        NameObject("/Subtype"): NameObject("/Type1"),
        NameObject("/BaseFont"): NameObject("/Helvetica"),
        NameObject("/Encoding"): NameObject("/WinAnsiEncoding"),
    })


def new_stream(writer, body: str):
    stream = DecodedStreamObject()
    stream.set_data(body.encode("latin-1"))
    return writer._add_object(stream)


def draw_cta(writer, page, x: float, baseline: float) -> None:
    """Add the CTA as extra content streams, leaving the original bytes alone.

    /Contents may be an array of streams, which a viewer concatenates and runs
    as one. Two things make that awkward here.

    First, the original applies `.24 0 0 -.24 0 792 cm` at the top level, before
    any `q`. Its q and Q operators are balanced, so that transform is still in
    force when our content runs, and text placed at page coordinates lands at a
    quarter size in the wrong corner. Wrapping the original in a saved graphics
    state fixes it without having to parse and invert the matrix.

    Second, reading the old bytes off a writer page is unreliable: get_data()
    returns None for these particular files, which silently produced a blank
    page on the first attempt. Appending streams avoids reading them at all.
    """
    ensure_font(page)
    save = new_stream(writer, "q\n")
    cta = new_stream(
        writer,
        f"Q\nq\nBT\n{FONT_KEY} {SIZE} Tf\n{INK} rg\n"
        f"1 0 0 1 {x:.2f} {baseline:.2f} Tm\n({LABEL}) Tj\nET\nQ\n",
    )

    existing = page.raw_get("/Contents")
    middle = list(existing) if isinstance(existing, ArrayObject) else [existing]
    page[NameObject("/Contents")] = ArrayObject([save] + middle + [cta])


def main() -> int:
    width = text_width(LABEL, SIZE)
    for name in FILES:
        path = SRC / name
        writer = PdfWriter(clone_from=str(path))
        pages = writer.pages
        last = len(pages) - 1

        # Page 1: beside the title, in the space the price badge used to occupy.
        spots = [(0, 178.0, 707.0)]
        # Last page: a closing line at the foot, unless the document is one page.
        if last > 0:
            spots.append((last, 48.0, 120.0))

        for index, x, baseline in spots:
            page = pages[index]
            draw_cta(writer, page, x, baseline)
            writer.add_annotation(
                page_number=index,
                annotation=Link(
                    rect=(x - 2, baseline - 3, x + width + 2, baseline + SIZE),
                    url=URL,
                ),
            )

        with open(path, "wb") as fh:
            writer.write(fh)
        print(f"{name}: CTA on pages {[s[0] + 1 for s in spots]}, "
              f"link width {width:.1f}pt, {path.stat().st_size:,} bytes")
    return 0


if __name__ == "__main__":
    sys.exit(main())
