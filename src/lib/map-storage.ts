import { printError } from "./utils.ts";

const DB_NAME = "7dtd-map-a20";

/**
 * Remove data from IndexedDB for old implementations.
 */
function flushDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.deleteDatabase(DB_NAME);
    req.onsuccess = resolve;
    req.onerror = reject;
  });
}

flushDb().catch(printError);
