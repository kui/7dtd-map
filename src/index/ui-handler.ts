import * as IndexMain from "../index";

export function UIHandler() {
  const toggle: HTMLInputElement = document.getElementById("theme-toggle") as HTMLInputElement;

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
