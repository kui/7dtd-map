const WORLD_DIR = "worlds";
const WORKSPACE_DIR = "workspace";

export async function listWorlds(): Promise<string[]> {
  return Array.fromAsync((await worldDir()).keys());
}

async function worldDir() {
  const root = await navigator.storage.getDirectory();
  return root.getDirectoryHandle(WORLD_DIR, { create: true });
}
