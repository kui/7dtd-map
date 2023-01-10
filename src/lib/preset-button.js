"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.init = void 0;
const utils_1 = require("./utils");
function init() {
  document.body.addEventListener("click", ({ target }) => {
    if (target instanceof HTMLButtonElement && target.dataset.inputFor != null) {
      const input = (0, utils_1.component)(target.dataset.inputFor, HTMLInputElement);
      input.value = (0, utils_1.requireNonnull)(target.dataset.inputText ?? target.textContent);
      input.dispatchEvent(new Event("input"));
    }
  });
}
exports.init = init;
//# sourceMappingURL=preset-button.js.map
