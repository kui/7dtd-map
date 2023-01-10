"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.init = void 0;
const utils_1 = require("./utils");
function init() {
  for (const output of Array.from(document.querySelectorAll("output[data-sync-for]"))) {
    const input = (0, utils_1.component)(output.dataset.syncFor, HTMLInputElement);
    output.value = input.value;
    input.addEventListener("input", () => (output.value = input.value));
  }
}
exports.init = init;
//# sourceMappingURL=sync-output.js.map
