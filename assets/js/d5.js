// "use strict";
/*
PROJECT: d5 (a Yahtzee! clone...)
AUTHOR: Craig Sorenson
Version:
CHANGELOG:
  20211112: "Fixed" issue with clicking directly on score text in a cell was not read as a click in the cell.
            Also capture a "prop 0 of 'null' error" when clicking on non-clickable elements with a try/catch statement (just cleans up the console) 
  20210901: Sweeping changes using jQuery and string literals...this alone cut ~50 lines of code!
            Moved die images on to buttons.
  20210728: Added -1 z-index for d5 div (now goes beneath score sheet on window shrink) and 1000 for theme menu 
  (always visible when open).
  20210727: Added capability for user to set theme and theme is saved between sessions using localStorage;
    added theme.js, additional code to d5.css (.dropdown*), and code to index.html.
  20210722: Split javascript out of index.html to d5.css
  20210722: Began using variables for colors in d5.css to aid in theming.

TODO: Get all formatting out of HTML page
TODO: Properly declare all variables in global context that are global, and otherwise.
TODO: Get player names and use them.
TODO: Switch to using an HTML form to get names and num players.
TODO: Get colors out of js.
DONE: implement user selectable themes
TODO: Allow for 2nd and 3rd d5 ...this will require some effort because code is 'broken' --> not easy to configure this due to piss poor method of tracking user and turns
20200128-xxxx: Multiple fixes over past 24 hours:
              1) Fixed issue with could click on score cells before ever rolling and it would lock out cell with no score
              2) Made "Roll" button display "Game Over" and made it run init() on click at game end to start new game.
              3) Rounded buttons and other minor css changes
              4) Not fixed: all of one die type is detected as full house....
20200120-0703: Simulated die roll working; moved imgages and css into assets folder.
20200120-0630: all working, looking great. But need animation on dice roll.
20200119-2000: muliplayer working
20200119-1435: workable single player code
20200119-0953: Renamed to d^5; olive drab theme
20200117-1728: working towards single player; specials detection
20200117-1057: Development commences as yahtzee
*/

//GLOBALS
//theme
const DEBUG = false;
var choicesColor = "#ffca18"; // Set to match theme in d5.css
var curPlayer = 1;
init();

//MAIN control routine ... need to get this put in a function that calls this when a click is detected..
if (initDone) {
  var tblCells = document.getElementsByTagName("td");
  for (var i = 0; i < tblCells.length; i++) {
    var tblCell = tblCells[i];
    if (tblCell.addEventListener) {
      tblCell.addEventListener("click", hide, false);
    } else tblCell.attachEvent("onclick", hide); // for <= IE8 compatibility
  }
  function onclick(e) {
    if (DEBUG) console.log("onclick: ", e);
    if (DEBUG) {p1 = /[?=R]\d+/; p2 = /[?=C]\d+/; p3 = /\d+/;};
    if (DEBUG) console.log("e?", e.target.id.match(p2)[0]);
    if (turns >= 13 * numPlayers) {
      document.getElementsByName("results")[0].innerText = "GAME OVER! Press F5 to play again."
      return;
    }

    let targetID=''; // Added this bit in with targetID to resolve issue with click on # in table cell not read as click in cell. 20211112
    (e.target.id !== '') ? targetID = e.target.id : targetID = e.path[2].id;
    p1 = /[?=R]\d+/; p2 = /[?=C]\d+/; p3 = /\d+/;

    try { // Added this to eat property 0 of null error when not clicking on clickable elements 20211112
      row = (targetID.match(p1)[0].match(p3)[0]);
      column = (targetID.match(p2)[0].match(p3)[0]);
    }
    catch { 
      return 
    };

    // p1 = /[?=R]\d+/; p2 = /[?=C]\d+/; p3 = /\d+/;
    // row = (e.target.id.match(p1)[0].match(p3)[0]);
    // column = (e.target.id.match(p2)[0].match(p3)[0]);

    if ((scoreCardAry[1][row][column] == "1") && (column == curPlayer) && (rolls != 0)) {
      scoreCardAry[0][row][column] = document.getElementsByName("R" + row + "C" + curPlayer)[0].innerText;
      for (var j = 0; j < 5; ++j) { // set all to roll, invert for kkepRoll flip
        diceArray[1][j] = true;
        keepRoll(j);
      }
      scoreCardAry[1][row][column] = 0;
      document.getElementsByName("R" + row + "C" + column)[0].innerHTML = "<font color='#000000'></font>";
      document.getElementsByName("R" + row + "C" + column)[0].innerText = scoreCardAry[0][row][column];
      //update score
      scoreTempTop = 0; scoreTempBot = 0;
      for (var i = 1; i <= 6; ++i) { //top of card
        scoreTempTop = scoreTempTop + Number(scoreCardAry[0][i][curPlayer]);
      }
      scoreCardAry[0][8][curPlayer] = scoreTempTop;
      for (var i = 9; i <= 17; ++i) { //bottom of card
        scoreTempBot = scoreTempBot + Number(scoreCardAry[0][i][curPlayer]);
      }
      if (scoreTempTop > 63) {
        scoreCardAry[0][7][curPlayer] = 35;
        scoreCardAry[0][8][curPlayer] = scoreTempTop + 35;
      }
      scoreCardAry[0][18][curPlayer] = scoreTempBot;
      scoreCardAry[0][19][curPlayer] = scoreTempTop + scoreTempBot + Number(scoreCardAry[0][7][curPlayer]);
      scoreTempTop = 0; scoreTempBot = 0;
      rolls = 0;
      turns++;
      document.getElementsByName("myAnswer0")[0].innerText = "Rolls left: " + (3 - rolls);
      if (curPlayer < numPlayers) { curPlayer++ }
      else curPlayer = 1;
    }
    else return;
    refreshScoreCard();
    document.getElementsByName("results")[0].innerText = "Rolling, rolling, rolling...";
  }
}
//MAIN control routine ... need to get this put in a function that calls this when a click is detected..
function init() {
  numPlayers = prompt("Welcome to d5.\nNumber of players? (1 - 4)", 1);
  numPlayers = Number(numPlayers);
  if (numPlayers < 1 || numPlayers > 4) { init(); }

  document.getElementsByName("tbl01")[0].innerHTML = drawGame();
  diceArray = [];
  diceArray[0] = new Array(5);
  diceArray[1] = new Array(2);
  for (var i = 0; i < 5; ++i) {
    diceArray[0][i] = rollDie(); diceArray[1][i] = false;
  }

  rolls = 0; turns = 0;

  //Build Score Card
  scoreCardAry = [];
  scoreCardAry[0] =
    [
      ["", "PL1", "PL2", "PL3", "PL4"],
      ["One's", "", "", "", ""],
      ["Two's", "", "", "", ""],
      ["Three's", "", "", "", ""],
      ["Four's", "", "", "", ""],
      ["Five's", "", "", "", ""],
      ["Six's", "", "", "", ""],
      ["Over 63 Bonus&nbsp(35)", "", "", "", ""],
      ["Subtotal", "", "", "", ""],
      ["3 of a Kind&nbsp(Sum)", "", "", "", ""],
      ["4 of a Kind&nbsp(Sum)", "", "", "", ""],
      ["Sm. Straight&nbsp(30)", "", "", "", ""],
      ["Lg. Straight&nbsp(40)", "", "", "", ""],
      ["Full House&nbsp(25)", "", "", "", ""],
      ["Chance&nbsp(Sum)", "", "", "", ""],
      ["d<sup>5</sup>&nbsp(50)", "", "", "", ""],
      ["The Future", "", "", "", ""], //Bonus Yahtzee! Future Implementation
      ["is Not Now", "", "", "", ""], //Bonus Yahtzee! Future Implementation
      ["Subtotal", "", "", "", ""],
      ["Total", "", "", "", ""],
    ]

  scoreCardAry[1] = [];
  scoreCardAry[1] =
    [
      [5, 1, 1, 1, 1],
      [5, 1, 1, 1, 1],
      [5, 1, 1, 1, 1],
      [5, 1, 1, 1, 1],
      [5, 1, 1, 1, 1],
      [5, 1, 1, 1, 1],
      [5, 1, 1, 1, 1],
      [6, 6, 6, 6, 6],
      [6, 6, 6, 6, 6],
      [5, 1, 1, 1, 1],
      [5, 1, 1, 1, 1],
      [5, 1, 1, 1, 1],
      [5, 1, 1, 1, 1],
      [5, 1, 1, 1, 1],
      [5, 1, 1, 1, 1],
      [5, 1, 1, 1, 1],
      [5, 0, 0, 0, 0],
      [5, 0, 0, 0, 0],
      [6, 6, 6, 6, 6],
      [6, 6, 6, 6, 6],
    ]

  refreshScoreCard();
  document.getElementsByName("R0C1")[0].innerHTML = `<font color=${choicesColor}>You're up!</font>`; //7759 Get rid of this font color crap
  // turns = 0; 7759 20210902
  simRoll = 0;
  gameOver = false;
  initDone = true;
  return diceArray;
}
function rollDie() {
  var face = Math.floor(Math.random() * 6) + 1;
  return face;
}
function keepRoll(d) {
  if (rolls < 1) { return; } //don't allow keep of previous turn's dice
  diceArray[1][d] = !diceArray[1][d]; //toggles keeping die on each roll
  // 7759
  for (let i = 0; i < 5; i++) {
    if (diceArray[1][i] == true) {
      $(`#keep${i+1}`).css("opacity",0.5)
    }
    else {
      $(`#keep${i+1}`).css("opacity",1.0)
    }
  }
}
function playGame() {
  if (gameOver == true) { init(); }
  if (rolls >= 3) { document.getElementsByName("results")[0].innerText = "No rolls left. Place score to continue."; return diceArray; }
  document.getElementsByName("myAnswer0")[0].innerText = "Rolls Left: " + (2 - rolls);
  for (var i = 0; i < 5; ++i) {
    if (diceArray[1][i] == false) {
      diceArray[0][i] = rollDie();
    }
  }
  rolls++;
  if (DEBUG) console.log(diceArray[0], "Rolls left = ", 3 - rolls);
  document.getElementsByName("results")[0].innerText = "Rolling, rolling, rolling...";
  drawDice2();
  detectSpecials();
  return diceArray;
}
function drawGame() {
  tableHtml = "<tr><th name=R0C0 id=R0C0>Category</th><th name='R0C1' id='R0C1'>ABC</th><th name='R0C2' id='R0C2'>Category</th><th name='R0C3' id='R0C3'>ABC</th><th name='R0C4' id='R0C4'>ABC</th></tr>"
  for (var i = 1; i < 20; i++) {
    tableHtml = tableHtml + "<tr>";
    for (var j = 0; j < 5; ++j) {
      if (i != 7 && i != 8 && i != 18 && i != 19) {
        tableHtml = tableHtml + "<td name='R" + i.toString() + "C" + j.toString() + "' id='R" + i.toString() + "C" + j.toString() + "'>" + "TEXT" + "</td>";
      }
      else {
        tableHtml = tableHtml + "<th name='R" + i.toString() + "C" + j.toString() + "' id='R" + i.toString() + "C" + j.toString() + "'>" + "TEXT" + "</th>";
      }
    }
    tableHtml = tableHtml + "</tr>";
  }
  return tableHtml;
}
function drawDice2() {
  if (simRoll >= 30000) {
    drawDice();
    simRoll = 0;
  }
  else {
    for (j = 0; j < 150; j++) {
      setTimeout(function () {
        for (var i = 0; i < 5; ++i) {
          $(`#keep${i+1}`).html(`<img class="img_dice" src="./assets/img/${diceArray[0][i]}.png" onclick="keepRoll(${i})" width="70"/>`);
        }
        simRoll++;
      }, 60);
    }
  }
}
function drawDice() {

    for (i = 0; i < 5; ++i) {
    $(`#keep${i+1}`).html(`<img class="img_dice" src="./assets/img/${diceArray[0][i]}.png" onclick="keepRoll(${i})" width="70"/>`);
  }
}
function detectSpecials() {
  let a = [...diceArray[0]];
  a.sort(); specials = new Array(15); dieTotal = 0;
  dieTotal = diceArray[0].reduce((a,b) => a + b);
  // detect fullhouse
  if ((a[0] !== a[4] && a[0] == a[1] && a[2] == a[3] && a[3] == a[4]) || (a[0] !== a[4] && a[0] == a[1] && a[1] == a[2] && a[3] == a[4])) { specials[0] = true; }
  // detect three of a kind
  if (((a[0] == a[1] && a[1] == a[2]) || (a[1] == a[2] && a[2] == a[3]) || (a[2] == a[3] && a[3] == a[4]))) { specials[1] = true; }
  // detect four of a kind
  if (((a[0] == a[1] && a[1] == a[2] && a[2] == a[3]) || (a[1] == a[2] && a[2] == a[3] && a[3] == a[4]))) { specials[2] = true; }
  // detect small straight
  if ((a[1] == a[0] + 1 && a[2] == a[1] + 1 && a[3] == a[2] + 1) || (a[2] == a[1] + 1 && a[3] == a[2] + 1 && a[4] == a[3] + 1)) { specials[3] = true; }
  // detect small straight (paired mid)
  if ((a[1] == a[0] + 1 && a[2] == a[0] + 2 && a[4] == a[0] + 3) || (a[1] == a[0] + 1 && a[3] == a[0] + 2 && a[4] == a[0] + 3)) { specials[3] = true; }
  //detect large straight
  if ((a[1] == a[0] + 1 && a[2] == a[1] + 1 && a[3] == a[2] + 1 && a[4] == a[3] + 1) || (a[2] == a[1] + 1 && a[3] == a[2] + 1 && a[4] == a[3] + 1 && a[5] == a[4] + 1)) { specials[4] = true; }
  // detect d5
  if (a[0] == a[1] && a[1] == a[2] && a[2] == a[3] && a[3] == a[4]) { specials[5] = true; }
  if (DEBUG) {
    console.log("Specials: ", specials); console.log("a: ", a);
  };
  //present score options
  score = 0;
  // curPlayer = 1;
  for (var i = 1; i < scoreCardAry[0].length; ++i) {
    if ((i != 7 && i != 8 && i != 18 && i != 19) && (scoreCardAry[0][i][curPlayer] == '')) {
      showPossible(curPlayer, i, score);
      // score die totals for 1, 2, 3, 4, 5 and 6
      for (var k = 1; k <= 6; ++k) {
        for (var j = 0; j <= 5; ++j) {
          if (diceArray[0][j] == k) { score = score + k; }
        }
        showPossible(curPlayer, k, score); score = 0;
      }
    }
  }
  s = specials; types = " ";
  if (s[0]) { types = types + "Full House, "; showPossible(curPlayer, 13, 25); }
  if (s[1]) { types = types + "3 of a Kind, "; showPossible(curPlayer, 9, dieTotal); }
  if (s[2]) { types = types + "4 of a Kind, "; showPossible(curPlayer, 10, 25); }
  if (s[3]) { types = types + "Small Straight, "; showPossible(curPlayer, 11, 30); }
  if (s[4]) { types = types + "Large Straight, "; showPossible(curPlayer, 12, 40); }
  if (s[5]) { types = types + "d5!, "; showPossible(curPlayer, 15, 50); }
  showPossible(curPlayer, 14, dieTotal); // Chance
  return s;
}
function clickDetect() {
  // Future use?
}
function hide(event) { //event.target.style.visibility = "hidden";
}
function refreshScoreCard() {
  for (var i = 0; i < scoreCardAry[0].length; ++i) {
    for (var j = 0; j < scoreCardAry[0][i].length; ++j) {
      document.getElementsByName("R" + i + "C" + j)[0].innerHTML = scoreCardAry[0][i][j];
    }
  }
  document.getElementsByName("R0C" + curPlayer)[0].innerHTML = `<b><font color=${choicesColor}>You're up!</font></b>`;
}
function showPossible(curPlayer, row, score) {
  if (scoreCardAry[1][row][curPlayer] == 1) {
    document.getElementsByName("R" + row + "C" + curPlayer)[0].innerHTML = score;
    document.getElementsByName("R" + row + "C" + curPlayer)[0].innerHTML = document.getElementsByName("R" + row + "C" + curPlayer)[0].innerHTML.fontcolor(choicesColor); //#F5FFFA
    document.getElementsByName("R" + row + "C" + curPlayer)[0].innerHTML = document.getElementsByName("R" + row + "C" + curPlayer)[0].innerHTML.bold();
  }
  score = 0;
}

setInterval(function () {
  if (turns >= 13 * numPlayers) {
    document.getElementsByName("results")[0].innerText = "GAME OVER! Press F5 to play again.";
    document.getElementsByName("myAnswer0")[0].innerText = "GAME OVER!";
    rolls = 3;
    gameOver = true;
    return;
  }
  if (rolls == 3) {
    document.getElementsByName("results")[0].innerText = "No rolls left. Place score to continue.";
  }
  // drawDice(); // 7759 Removing this appears to fix keep/roll lag!
}, 500); //7759 had to increase from 120 to 500 to make keep/roll toggle work reliably

//implement keyboard controls
$(document).keypress(function (event) {
  key = String.fromCharCode(event.which);
  if ((key >= 'a' && key <= 'z') || (key >= 'A' && key <= 'Z') || (key >= '0' && key <= '9')) {
    if (key == '1') { keepRoll(0); onclick("R0C0"); }
    if (key == '2') { keepRoll(1); onclick("R0C0"); }
    if (key == '3') { keepRoll(2); onclick("R0C0"); }
    if (key == '4') { keepRoll(3); onclick("R0C0"); }
    if (key == '5') { keepRoll(4); onclick("R0C0"); }
    if (key == 'z') { playGame(0); onclick("R0C0"); }
  }

})

// added 20210921 to simplify testing
function testDieDetection(arr=[1,2,3,4,5]) {
  diceArray[0] = [...arr];
  drawDice();
  return detectSpecials();
}