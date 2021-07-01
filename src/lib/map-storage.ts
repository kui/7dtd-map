import { DBSchema, IDBPDatabase, openDB, StoreNames } from "idb";
import { GenerationInfo } from "./generation-info-loader";

const DB_NAME = "7dtd-map";
const DB_VERSION = 1;

type Db = IDBPDatabase<DbSchema>;
interface DbSchema extends DBSchema {
  maps: {
    value: MapObject;
    key: number;
  };
  largeObjects: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    value: LargeObject<any>;
    key: [number, string];
  };
}

export interface MapObject {
  id: number;
  name: string;
  generationInfo?: GenerationInfo;
}

export const LARGE_OBJECT_TYPES = ["biomes", "splat3", "splat4", "rad", "height", "subHeight", "prefabs"] as const;
type LargeObjectType = typeof LARGE_OBJECT_TYPES[number];
export interface LargeObjects {
  biomes: ImageObject;
  splat3: ImageObject;
  splat4: ImageObject;
  rad: ImageObject;
  height: HeightsObject;
  subHeight: HeightsObject;
  prefabs: Prefab[];
}
export interface LargeObject<T extends LargeObjectType> {
  mapId: number;
  type: T;
  data: LargeObjects[T];
}
interface ImageObject {
  width: number;
  height: number;
  bitmap: ImageBitmap;
}
interface HeightsObject {
  width: number;
  height: number;
  bitmap: Uint8Array;
}

const MAP_PROPERTY_TYPES = ["maps", ...LARGE_OBJECT_TYPES] as const;
type MapPropertyType = typeof MAP_PROPERTY_TYPES[number];
type MapPropertyValue<T extends MapPropertyType> = T extends LargeObjectType ? LargeObject<T> : DbSchema["maps"]["value"];

function dbUpgrade(db: Db, oldVersion: number, newVersion: number) {
  for (let version = oldVersion + 1; version <= newVersion; version++) {
    if (version === 1) {
      db.createObjectStore("maps", { keyPath: "id", autoIncrement: true });
      db.createObjectStore("largeObjects", { keyPath: ["mapId", "type"] });
    }
  }
}

export class MapStorage {
  _db?: Db;

  async put<Type extends MapPropertyType>(type: Type, value: MapPropertyValue<Type>): Promise<void> {
    const db = await getDb(this);
    await db.put(storeName(type), value);
  }

  async get<Type extends MapPropertyType>(type: Type, mapId: number): Promise<MapPropertyValue<Type> | undefined> {
    const db = await getDb(this);
    let key: number | [number, string];
    if (isLargeObjectType(type)) {
      key = [mapId, type];
    } else if (type === "maps") {
      key = mapId;
    } else {
      throw Error(`Unreachable code: ${type}`);
    }
    const r = await db.get(storeName(type), key);
    return r as MapPropertyValue<Type> | undefined;
  }

  async listMaps(): Promise<MapObject[]> {
    const db = await getDb(this);
    return db.getAll("maps");
  }

  async createMap(name = "New Map"): Promise<MapObject> {
    const db = await getDb(this);
    const id = await db.put("maps", { name } as MapObject);
    return { id, name };
  }

  async deleteMap(mapId: number): Promise<void> {
    const db = await getDb(this);
    await Promise.all([db.delete("maps", mapId), ...LARGE_OBJECT_TYPES.map((t) => db.delete("largeObjects", [mapId, t]))]);
  }
}

async function getDb(self: MapStorage) {
  if (!self._db) {
    self._db = await openDB<DbSchema>(DB_NAME, DB_VERSION, { upgrade: dbUpgrade });
  }
  return self._db;
}

function isLargeObjectType(type: MapPropertyType): type is LargeObjectType {
  return (LARGE_OBJECT_TYPES as readonly string[]).includes(type);
}

function storeName<Type extends MapPropertyType>(type: Type): StoreNames<DbSchema> {
  if (isLargeObjectType(type)) {
    return "largeObjects";
  }
  if (type === "maps") {
    return type;
  }
  throw Error(`Unreachable code: ${type}`);
}
