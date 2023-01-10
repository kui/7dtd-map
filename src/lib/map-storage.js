"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MapStorage = exports.LARGE_OBJECT_TYPES = void 0;
const idb_1 = require("idb");
const utils_1 = require("./utils");
const DB_NAME = "7dtd-map-a20";
const DB_VERSION = 2;
const DEFAULT_WORLD_NAME = "New-World";
exports.LARGE_OBJECT_TYPES = ["biomes", "splat3", "splat4", "rad", "elevations", "subElevations", "prefabs", "generationInfo"];
const MAP_PROPERTY_TYPES = ["maps", ...exports.LARGE_OBJECT_TYPES];
function dbUpgrade(db, oldVersion, newVersion) {
  for (let version = oldVersion + 1; version <= newVersion; version++) {
    if (version === 1) {
      db.createObjectStore("maps", { keyPath: "id", autoIncrement: true });
      db.createObjectStore("largeObjects", { keyPath: ["mapId", "type"] });
      db.createObjectStore("selectedMap", { keyPath: "id" });
    }
  }
}
const CHANGE_LISTENERS = [(mapId) => console.log("MapStorage change current map", mapId)];
class MapStorage {
  async put(type, data) {
    const db = await this.getDb();
    const mapId = await currentId(db);
    if (isLargeObjectType(type)) {
      await db.put("largeObjects", { mapId, type, data });
    } else if (type === "maps") {
      await db.put("maps", { id: mapId, name: data });
    } else {
      throw Error(`Unreachable code: type=${type}`);
    }
  }
  async getCurrent(type) {
    const db = await this.getDb();
    const mapId = await currentId(db);
    if (isLargeObjectType(type)) {
      return await db.get("largeObjects", [mapId, type]);
    } else if (type === "maps") {
      return (0, utils_1.requireNonnull)(await db.get("maps", mapId), () => `Unexpected state: ${mapId}`);
    } else {
      throw Error(`Unreachable code: ${type}`);
    }
  }
  async listMaps() {
    const db = await this.getDb();
    return db.getAll("maps");
  }
  async createMap(name = DEFAULT_WORLD_NAME) {
    const db = await this.getDb();
    return await createMap(db, name);
  }
  async deleteMap(mapIdOrUndefined) {
    const db = await this.getDb();
    const mapId = mapIdOrUndefined ?? (await currentId(db));
    await Promise.all([db.delete("maps", mapId), ...exports.LARGE_OBJECT_TYPES.map((t) => db.delete("largeObjects", [mapId, t]))]);
  }
  async changeMap(mapId) {
    const db = await this.getDb();
    await Promise.all([changeMap(db, mapId), ...CHANGE_LISTENERS.map((fn) => fn(mapId, this))]);
  }
  async currentId() {
    return currentId(await this.getDb());
  }
  static addListener(listener) {
    CHANGE_LISTENERS.push(listener);
  }
  async getDb() {
    if (!this._db) {
      this._db = await (0, idb_1.openDB)(DB_NAME, DB_VERSION, { upgrade: dbUpgrade });
    }
    return this._db;
  }
}
exports.MapStorage = MapStorage;
async function createMap(db, name) {
  const id = await db.put("maps", { name });
  return { id, name };
}
function isLargeObjectType(type) {
  return exports.LARGE_OBJECT_TYPES.includes(type);
}
async function changeMap(db, mapId) {
  await db.put("selectedMap", { id: 0, mapId });
}
async function currentId(db) {
  const map = await db.get("selectedMap", 0);
  if (map) {
    return map.mapId;
  }
  const all = await db.getAll("maps");
  if (all[0]) {
    await changeMap(db, all[0].id);
    return currentId(db);
  }
  const newMap = await createMap(db, DEFAULT_WORLD_NAME);
  await changeMap(db, newMap.id);
  return currentId(db);
}
//# sourceMappingURL=map-storage.js.map
