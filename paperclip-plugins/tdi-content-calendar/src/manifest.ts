import type { PaperclipPluginManifestV1 } from "@paperclipai/plugin-sdk";

/**
 * The content calendar, as a page inside Paperclip.
 *
 * Rae, 13 September: build a calendar style approval piece IN paperclip, not
 * outside of it. The same view previously lived in the TDI admin portal, which
 * meant approving content happened in one app and everything else happened here.
 *
 * The content itself lives in the Learning Hub database and is reached over
 * HTTP, so this plugin holds no content of its own. It is a window, not a store.
 */
const manifest: PaperclipPluginManifestV1 = {
  id: "tdi-content-calendar",
  apiVersion: 1,
  version: "0.4.1",
  displayName: "Content calendar",
  description:
    "Plan and approve TDI content by month, on the board, without leaving Paperclip.",
  author: "Teachers Deserve It",
  categories: ["ui"],
  capabilities: [
    "ui.page.register",
    "ui.sidebar.register",
    "http.outbound",
    "plugin.state.read",
    "plugin.state.write",
  ],
  // Operator-editable, per instance. Named instanceConfigSchema by the host.
  // The key lives here as a plain value, which is not where a credential
  // belongs. Both better options are closed: this host build answers a
  // secret_ref with "Plugin secret references are disabled until company-scoped
  // plugin config lands", and plugin workers deliberately do not inherit the
  // host's environment.
  //
  // So the key that goes here is not the agents' sync key. It can read the queue
  // and record a decision, and nothing else. Revoking it stops this page and no
  // agent. When company-scoped plugin config lands, this becomes a secret_ref
  // and the plain field goes away.
  instanceConfigSchema: {
    type: "object",
    required: ["calendarKey"],
    properties: {
      calendarKey: {
        type: "string",
        title: "Calendar key",
        description:
          "The CONTENT_CALENDAR_KEY the content queue accepts. This key can only read the queue and record a decision; it cannot place briefs, pass gates or publish. Revoking it stops this calendar and nothing else.",
      },
      apiBase: {
        type: "string",
        title: "Content queue API base",
        description: "Where the content queue lives. Normally https://www.teachersdeserveit.com",
        default: "https://www.teachersdeserveit.com",
      },
    },
  },
  entrypoints: {
    worker: "./dist/worker.js",
    ui: "./dist/ui",
  },
  // Without this the page exists and nobody can reach it. A route you have to be
  // told about is not shipped: Kristin would need someone to hand her a URL.
  launchers: [
    {
      id: "content-calendar-nav",
      displayName: "Content calendar",
      description: "Plan and approve content by month.",
      placementZone: "sidebar",
      order: 40,
      action: { type: "navigate", target: "content-calendar" },
    },
  ],
  ui: {
    slots: [
      {
        type: "page",
        id: "content-calendar",
        displayName: "Content calendar",
        routePath: "content-calendar",
        exportName: "ContentCalendarPage",
      },
    ],
  },
};

export default manifest;
