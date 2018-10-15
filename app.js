var dragDiv = document.getElementsByClassName("draggable-div");
var line = document.getElementById("line");
var inputSection = document.querySelectorAll("[data-for]");

var btnRun = document.getElementById('btn-run');
var btnFwdRun = document.getElementById('btn-fwd-run');
var btnReset = document.getElementById('btn-reset');

var simX = document.getElementById("input-deg-x");
var simY = document.getElementById("input-deg-y");

var initElements = [];
var elCount = 0;

(function () {
  for (let i = 0; i < dragDiv.length; i++) {
    let curObj = {
      dragDiv: dragDiv[i],
      inputX: document.querySelector(`[data-for="${dragDiv[i].id}"]`).children[0],
      inputY: document.querySelector(`[data-for="${dragDiv[i].id}"]`).children[1]
    }
    initElements.push(curObj);

    lineChecker(dragDiv[i]);
    inputGetter(inputSection[i], dragDiv[i]);

    elCount = i;
  }

  for (let i = 0; i < initElements.length; i++) {
    setValue(initElements[i].inputX, initElements[i].inputY, initElements[i].dragDiv);
    dragElement(initElements[i].dragDiv);
  }
})();

btnRun.onclick = function () {
  var curX = parseInt(dragDiv[elCount].style.left.split('px')[0]);
  var curY = parseInt(dragDiv[elCount].style.top.split('px')[0]);

  simX.disabled = true; simX.classList.add('disabled');
  simY.disabled = true; simY.classList.add('disabled');
  btnRun.disabled = true; btnRun.classList.add('disabled');

  var id = setInterval(simMovement, 5);
  function simMovement() {
    if (curX == simX.value && curY == simY.value) {
      clearInterval(id);

      simX.disabled = false; simX.classList.remove('disabled');
      simY.disabled = false; simY.classList.remove('disabled');
      btnRun.disabled = false; btnRun.classList.remove('disabled');
    }

    if (curX < simX.value) {
      dragDiv[elCount].style.left = parseInt(curX++) + "px";
      lineChecker(dragDiv[elCount]);
    }
    else if (curX > simX.value) {
      dragDiv[elCount].style.left = parseInt(curX--) + "px";
      lineChecker(dragDiv[elCount]);
    }

    if (curY < simY.value) {
      dragDiv[elCount].style.top = parseInt(curY++) + "px";
      lineChecker(dragDiv[elCount]);
    }
    else if (curY > simY.value) {
      dragDiv[elCount].style.top = parseInt(curY--) + "px";
      lineChecker(dragDiv[elCount]);
    }
  }
}

var count = 0;
var count1 = 0; var count2 = 0; var teta = 0;

btnFwdRun.onclick = function () {
  switch (elCount) {
    case 1: fwd1DoF(); break;
    case 2: fwd2DoF(); break;
    default: break;
  }

  function fwd1DoF() {
    let teta = parseInt(document.getElementById(`teta${elCount}`).value);
    let length = parseInt(document.querySelector(`[data-line='line${elCount}']`).value);

    let mov = setInterval(simMovement, 10);

    function simMovement() {
      if (count == teta) {
        clearInterval(mov);
        count = teta;
      }
      else {
        if (count < teta) count++;
        else if (count > teta) count--;

        let data1DoF = calc1DoF(count, teta, length);

        simX.value = data1DoF.xValue;
        simY.value = data1DoF.yValue;
      }
    }
  }

  function fwd2DoF() {
    let teta2 = parseInt(document.getElementById(`teta${elCount}`).value);
    let teta1 = parseInt(document.getElementById(`teta${elCount - 1}`).value);
    let length2 = parseInt(document.querySelector(`[data-line='line${elCount}']`).value);
    let length1 = parseInt(document.querySelector(`[data-line='line${elCount - 1}']`).value);

    // if (teta2 >= teta1) teta = teta2; 
    // else teta = teta1;

    if ((teta2 == 0 || teta1 == 0) && (count2 != 0 || count1 != 0) ) {
      if (count2 > count1) teta = count2;
      else teta = count1;
    }
    else {
      if (teta2 >= teta1) teta = teta2;
      else teta = teta1;
    }

    var mov = setInterval(simMovement, 10);

    function simMovement() {
      if (count == teta) {
        clearInterval(mov);
        teta = 0; count = 0; count2 = teta2; count1 = teta1;
      }
      else {
        count++;

        if (count2 < teta2) count2++;
        else if (count2 > teta2) count2--;

        if (count1 < teta1) count1++;
        else if (count1 > teta1) count1--;

        calc1DoF(count1, length1, 1);
        let data2DoF = calc2Dof(count2, count1, length2, length1);

        simX.value = data2DoF.xValue;
        simY.value = data2DoF.yValue;
      }
    }
  }

  function calc1DoF(teta, length, ordo = 0) {
    let eoeX = length * Math.cos(toRadians(teta));
    let eoeY = length * Math.sin(toRadians(teta));

    let divPrevLeft = parseInt(dragDiv[0].style.left.split('px')[0]);
    let divPrevTop = parseInt(dragDiv[0].style.top.split('px')[0]);

    dragDiv[elCount - ordo].style.left = eoeX + divPrevLeft + "px";
    dragDiv[elCount - ordo].style.top = eoeY + divPrevTop + "px";

    lineChecker(dragDiv[elCount - 1]);

    return {
      xValue: Math.round(eoeX) + divPrevLeft,
      yValue: Math.round(eoeY) + divPrevTop
    }
  }

  function calc2Dof(teta2, teta1, length2, length1, ordo = 0) {
    let eoeX = length1 * Math.cos(toRadians(teta1)) + length2 * Math.cos(toRadians(teta1 + teta2));
    let eoeY = length1 * Math.sin(toRadians(teta1)) + length2 * Math.sin(toRadians(teta1 + teta2));

    let divPrevLeft = parseInt(dragDiv[0].style.left.split('px')[0]);
    let divPrevTop = parseInt(dragDiv[0].style.top.split('px')[0]);

    dragDiv[elCount].style.left = eoeX + divPrevLeft + "px";
    dragDiv[elCount].style.top = eoeY + divPrevTop + "px";

    simX.value = Math.round(eoeX) + divPrevLeft;
    simY.value = Math.round(eoeY) + divPrevTop;

    lineChecker(dragDiv[elCount]);

    return {
      xValue: Math.round(eoeX) + divPrevLeft,
      yValue: Math.round(eoeY) + divPrevTop
    }
  }

}



function toDegrees(angle) {
  return angle * (180 / Math.PI);
}

function toRadians(angle) {
  return angle * (Math.PI / 180);
}

btnReset.onclick = function () {
  location.reload();
}

// document.getElementById('btn-add-item').onclick = function () {
//   let color = document.getElementById('input-item').value;
//   let divHtml = `<div class="draggable-div" id="div+${elCount}" style="background: ${color};
//   top: 100px; left: 100px;"></div>`;
//   let lineHtml = `<line data-from="div+${elCount - 1}" data-to="div+${elCount}" style="stroke:darkorange;stroke-width:2" />`;

//   let line = document.getElementById('line');
//   line.insertAdjacentHTML('beforeBegin', divHtml);
//   line.innerHTML += lineHtml;

//   dragElement(document.getElementById(`div+${elCount}`));
// }

function dragElement(elmnt) {
  var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
  if (document.getElementById(elmnt.id + "header")) {
    /* if present, the header is where you move the DIV from:*/
    document.getElementById(elmnt.id + "header").onmousedown = dragMouseDown;
  } else {
    /* otherwise, move the DIV from anywhere inside the DIV:*/
    elmnt.onmousedown = dragMouseDown;
  }

  function dragMouseDown(e) {
    e = e || window.event;
    e.preventDefault();
    // get the mouse cursor position at startup:
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    // call a function whenever the cursor moves:
    document.onmousemove = elementDrag;
  }

  function elementDrag(e) {
    e = e || window.event;
    e.preventDefault();
    // calculate the new cursor position:
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    // set the element's new position:
    elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
    elmnt.style.top = (elmnt.offsetTop - pos2) + "px";

    lineChecker(elmnt);

    for (let i = 0; i < inputSection.length; i++) {
      inputGetter(inputSection[i], elmnt);
    }
  }

  function closeDragElement() {
    /* stop moving when mouse button is released:*/
    document.onmouseup = null;
    document.onmousemove = null;
  }
}

function setValue(elmntX, elmntY, target) {
  elmntX.onkeyup = function () { movePos() };
  elmntY.onkeyup = function () { movePos() };

  function movePos() {
    target.style.left = (parseInt(elmntX.value)) + 'px';
    target.style.top = (parseInt(elmntY.value)) + 'px';

    lineChecker(target);
  }
}

function inputGetter(inputSection, elmnt) {
  if (inputSection.getAttribute("data-for") == elmnt.id) {
    inputSection.children[0].value = elmnt.offsetLeft;
    inputSection.children[1].value = elmnt.offsetTop;
  }
}

function moveLine(line, lineIndex) {
  let selectLine = line.children[lineIndex];
  let divFrom = document.getElementById(selectLine.getAttribute("data-from"));
  let divTo = document.getElementById(selectLine.getAttribute("data-to"));

  let centerLX1 = divFrom.offsetLeft + divFrom.offsetWidth / 2;
  let centerLY1 = divFrom.offsetTop + divFrom.offsetHeight / 2;
  let centerLX2 = divTo.offsetLeft + divTo.offsetWidth / 2;
  let centerLY2 = divTo.offsetTop + divTo.offsetHeight / 2;

  let coordinates = { x1: centerLX1, y1: centerLY1, x2: centerLX2, y2: centerLY2 };

  insertCoordinate(line.children[lineIndex], coordinates);

  return { selectLine: selectLine, coordinates: coordinates };
}

function insertCoordinate(lineItem, arr) {
  for (let i = 0; i < Object.keys(arr).length; i++) {
    lineItem.setAttribute(Object.keys(arr)[i], Object.values(arr)[i]);
  }
}

function lineChecker(elmnt) {
  let elId = elmnt.getAttribute("id");
  var dataLine = {};

  for (let i = 0; i < line.childElementCount; i++) {
    if (line.children[i].getAttribute("data-from") == elId) {
      dataLine = distanceCalc(moveLine(line, i));
      document.querySelector(`[data-line="${line.children[i].id}"]`).value = dataLine.distance;
    }
    else if (line.children[i].getAttribute("data-to") == elId) {
      dataLine = distanceCalc(moveLine(line, i));
      document.querySelector(`[data-line="${line.children[i].id}"]`).value = dataLine.distance;
    }

    let dataLineA = document.querySelector(`[data-line-a="${line.children[i].id}"]`);
    let dataLineB = document.querySelector(`[data-line-b="${line.children[i].id}"]`);

    // if (dataLineA && dataLineA.getAttribute("data-line-a") == line.children[i].id) {
    //   // console.log(document.querySelector(`[data-line="${line.children[i].id}"]`).value);
    //   if(dataLineA && dataLineB) {
    //     dataLineA.value = 11;
    //     dataLineB.value = 10;

    //     console.log('dari a ' + dataLineA.value + dataLineB.value);
    //   }
    // }

    // if (dataLineB && dataLineB.getAttribute("data-line-b") == line.children[i].id) {
    //   if(dataLineA && dataLineB) {
    //     dataLineA.value = dataLine.distance;
    //     dataLineB.value = 10;

    //     console.log('dari b ' + dataLineA.value + dataLineB.value);
    //   }
    // }
  }
}

function distanceCalc(moveObj) {
  let xDelta = moveObj.coordinates.x2 - moveObj.coordinates.x1;
  let yDelta = moveObj.coordinates.y2 - moveObj.coordinates.y1;
  distance = Math.round(Math.sqrt(Math.pow(xDelta, 2) + Math.pow(yDelta, 2)));

  return { lineId: moveObj.selectLine.id, distance: distance };
}

function tetaCalc() {
  // console.log(dataLine);

}