// 20230724 - Cleaned up duplicate entries
// 20210727 - using localStorage, added capability to save theme settings between sessions.
// 20210727 - switched to using string literals and pageName binding to make this useable on other pages.
setVisible();
let pageName = "d5_dice_game";
funcTheme(parseInt(localStorage.getItem(`${pageName}-theme`)));
if (localStorage.getItem(`${pageName}-theme`) === null) {
  funcTheme(4);
}
/* Look at using setProperty(property, value, priority) and getPropertyValue(property) to deal with background... */
function funcTheme(d) {
  if (d === 1) {
    document.getElementById("cssTheme").href = "assets/css/theme1.css";
    localStorage.setItem(`${pageName}-theme`, 1);
  }
  if (d === 5) {
    document.getElementById("cssTheme").href = "assets/css/theme5.css";
    localStorage.setItem(`${pageName}-theme`, 5);
  }
  if (d === 3) {
    document.getElementById("cssTheme").href = "assets/css/theme3.css";
    localStorage.setItem(`${pageName}-theme`, 3);
  }
  if (d === 2) {
    document.getElementById("cssTheme").href = "assets/css/color.css"; // default theme
    localStorage.setItem(`${pageName}-theme`, 2);
  }
  if (d === 6) {
    document.getElementById("cssTheme").href = "assets/css/theme6.css";
    // document.body.style.backgroundImage="none";
    localStorage.setItem(`${pageName}-theme`, 6);
  }
}

function setVisible() {
  document.getElementById("themeCrumb").style.display = "block";
}
