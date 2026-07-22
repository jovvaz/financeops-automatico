import { createDemoDatabase } from "./demo-data";
import type { DemoDatabase } from "./types";

declare global {
  var financeOpsDemoStore: DemoDatabase | undefined;
}

export function getStore(): DemoDatabase {
  if (!globalThis.financeOpsDemoStore) globalThis.financeOpsDemoStore = createDemoDatabase();
  return globalThis.financeOpsDemoStore;
}

export function resetStore(): DemoDatabase {
  globalThis.financeOpsDemoStore = createDemoDatabase();
  return globalThis.financeOpsDemoStore;
}
