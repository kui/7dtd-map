import type { Config } from "jest";
const config: Config = {
  testEnvironment: "jsdom",
  transform: {
    "^.+\\.ts$": "@swc/jest",
  },
};
export default config;
