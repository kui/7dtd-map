"use strict";
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
          desc = {
            enumerable: true,
            get: function () {
              return m[k];
            },
          };
        }
        Object.defineProperty(o, k2, desc);
      }
    : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? function (o, v) {
        Object.defineProperty(o, "default", { enumerable: true, value: v });
      }
    : function (o, v) {
        o["default"] = v;
      });
var __importStar =
  (this && this.__importStar) ||
  function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null)
      for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.UIHandler = void 0;
const IndexMain = __importStar(require("../index"));
function UIHandler() {
  const toggle = document.getElementById("theme-toggle");
  const storedTheme = localStorage.getItem("theme") || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  if (storedTheme) document.documentElement.setAttribute("data-theme", storedTheme);
  if (toggle) {
    if (storedTheme === "dark") {
      toggle.checked = true;
    }
    toggle.onclick = function () {
      const currentTheme = document.documentElement.getAttribute("data-theme");
      let targetTheme = "light";
      if (currentTheme === "light") {
        targetTheme = "dark";
      }
      document.documentElement.setAttribute("data-theme", targetTheme);
      localStorage.setItem("theme", targetTheme);
    };
  }
  // CONTROLLER WRAPPER
  const con = document.getElementById("controller");
  const conTop = document.querySelector(".con-top");
  conTop?.addEventListener("click", () => {
    con?.classList.toggle("controller-lowered");
    // To improve performance and reduce lag
    if (con?.classList.contains(".controller-lowered")) {
      //TODO: ADD LAZY LOADING
    } else {
      IndexMain.clearPrefabLi();
    }
  });
  // UPLOAD WORLD FILE BUTTON
  const filesInput = document.getElementById("files-btn");
  filesInput?.addEventListener("click", () => {
    const inputFile = document.getElementById("files");
    try {
      inputFile?.click();
    } catch (err) {
      console.log(err);
    }
  });
}
exports.UIHandler = UIHandler;
//# sourceMappingURL=ui-handler.js.map
