import type { Config } from "jest";
const config: Config = {
  testEnvironment: "jsdom",
  transform: {
    "^.+\\.ts$": "esbuild-jest",
  },
};
export default config;
