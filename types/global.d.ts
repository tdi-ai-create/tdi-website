// Google Analytics is loaded by a script tag, so window.gtag has no type of
// its own. This declaration used to live inside app/pd-diagnostic/page.tsx,
// which meant deleting that page broke typechecking for every other file that
// reports an analytics event. It belongs somewhere no single feature owns.
//
// Used by: app/contact, app/nominate, app/for-schools/request, app/get-started

export {};

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}
