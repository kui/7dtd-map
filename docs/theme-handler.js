console.log("Running Theme Handler!");

const toggle = document.getElementById("theme-toggle");

const storedTheme = localStorage.getItem("theme") || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");

if (storedTheme) document.documentElement.setAttribute("data-theme", storedTheme);

if (storedTheme === "dark") {
  toggle.checked = true;
}

if (toggle) {
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