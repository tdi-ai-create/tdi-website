'use client';

/**
 * Print the page with every section already open.
 *
 * A leader building an internal case wants the whole list on paper, not the
 * four items a closed accordion happens to show. Opening the details elements
 * before printing is the only reliable way to get that: a print stylesheet
 * cannot force a closed <details> to render its contents in every browser.
 *
 * Sections that were closed before printing are closed again afterward, so the
 * screen is left exactly as the reader had it.
 */
export default function PrintButton() {
  const printEverything = () => {
    const sections = Array.from(
      document.querySelectorAll<HTMLDetailsElement>('.wi-page details.wi-more')
    );
    const wereClosed = sections.filter((section) => !section.open);
    wereClosed.forEach((section) => {
      section.open = true;
    });

    const restore = () => {
      wereClosed.forEach((section) => {
        section.open = false;
      });
      window.removeEventListener('afterprint', restore);
    };
    window.addEventListener('afterprint', restore);

    window.print();
  };

  return (
    <div className="wi-printrow">
      <button type="button" className="wi-printbtn" onClick={printEverything}>
        Print this page with every tool listed
      </button>
    </div>
  );
}
