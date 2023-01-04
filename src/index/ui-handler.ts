// THEME TOGGLE
export function UIHandler() {

    const toggle: HTMLInputElement = document.getElementById("theme-toggle") as HTMLInputElement;
    
    const storedTheme = localStorage.getItem("theme") || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    
    if (storedTheme) document.documentElement.setAttribute("data-theme", storedTheme);
    
    if (toggle) {
    // Sets the theme if local storage theme info available
    if (storedTheme === "dark") {
        toggle.checked = true;
    }
    
    // Changes theme on theme toggle click
    toggle.onclick = function () {
        const currentTheme = document.documentElement.getAttribute("data-theme");
    let targetTheme = "light";
    if (currentTheme === "light") {
        targetTheme = "dark";
    }
    
    // Update the local storage theme data and informs CSS file to use correct color variables based on current theme
    document.documentElement.setAttribute("data-theme", targetTheme);
    localStorage.setItem("theme", targetTheme);
};
}

// UPLOAD WORLD FILE BUTTON
    function open_file() {
        const inputFile = document.getElementById("files");
        try {
            inputFile?.click()
        }
        catch (err) {
            console.log(err);
        }
    }
}