let dt = new Date();
let month = 1 + dt.getMonth();
let date = dt.getDate();
dayTxt = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const button = document.querySelector('#addButton');
const trashButton = document.querySelector('#trash');
const saveButton = document.querySelector('#save');
let column = {}; //columnを入れるためのオブジェクト、インデックスはnumber（1スタート）
let number = null;
let startTime = '00:00';
let doneJudge = {};  //tureは未チェック
let recovered = Boolean(window.localStorage.getItem('recovered'));  //保存データがあるかどうか。trueでデータあり
let currentFocusUnit = null;
let dateMonthSpan = null;
let dateDateSpan = null;
let orderArray = []; //現在存在するユニットを数えるための配列。要素はnumber。addでspliceで追加。deleteしたらそのnumberの要素をspliceで削除して詰める。lengthが現在存在するユニットの総数
let unitBox = {}; //ユニットのデータのインスタンス用のオブジェクト。インデックスは親要素のID名（todoUnit${number}）
let unitBoxArray = [];  //unitBoxを保存するための配列
//ユニットのデータを一時的に保存するクラス。インスタンスを生成するのはaddTodoUnit
class unitData {
  constructor() {
    this.time = '00:00';
    this.columnTxt = '';
    this.checked = 'true';
   }
}

//追加する要素を返す関数　引数は'カウント'、'開始時間'、'columnの内容'
let unit = (n, sT, txt) => {
  return `<div class="todoUnit" id='todoUnit${n}'>
      <input type="time" value=${sT} id='input${n}' class='input'>
      <div contenteditable="true" class="todoColumn"id="column${n}" onfocus='focusWatch()'>${txt}</div>
      <div class="checkDel">
        <div class="check" id="check${n}" onclick='check(${n})'><i class="fas fa-check"></i></div>
        <div class="del" id="del${n}" onclick="delUnit(${n})"><i class="fas fa-minus"></i></div>
      </div>
    </div>`;
};

//ヘッダーの日付&復元
let showDate = () => {
  let day = dayTxt[dt.getDay()];
  let dateBox = document.querySelector('#dateBox');
  dateBox.insertAdjacentHTML('afterbegin', '<span contenteditable="true" id="dateMonth">' + month + '</span>' + '<span>/</span>'+ '<span contenteditable="true" id="dateDate">' + date + '</span>' + '<span id="day">&nbsp;' + day + '</span>')
  dateMonthSpan = document.querySelector('#dateMonth')
  dateDateSpan = document.querySelector('#dateDate')
  let changeDay = (event) => {
    let virtualDate = new Date(dt.getFullYear(), Number(dateMonthSpan.textContent) - 1, Number(dateDateSpan.textContent));
    let virtualDay = dayTxt[virtualDate.getDay()];
    let daySpan = document.querySelector('#day')
    daySpan.innerHTML = '&nbsp;' + virtualDay;
  };
	//enter to change
	let enterchangeDay = (e) => {
		if (e.keyCode === 13) {
			changeDay();
			e.preventDefault();
		}
		return false;
	};
  dateMonthSpan.addEventListener("DOMFocusOut", changeDay ,false);
  dateDateSpan.addEventListener("DOMFocusOut", changeDay ,false);
	dateMonthSpan.addEventListener("keypress", enterchangeDay ,false);
  dateDateSpan.addEventListener("keypress", enterchangeDay ,false);


  //データをもとにリストを復元する関数
  if (recovered) {
    let virtualDate = new Date(dt.getFullYear(), Number(window.localStorage.getItem('dateMonth')) - 1, Number(window.localStorage.getItem('dateDate')));
    let virtualDay = dayTxt[virtualDate.getDay()];
    let daySpan = document.querySelector('#day')
    daySpan.innerHTML = '&nbsp;' + virtualDay;
    dateMonthSpan.innerHTML = Number(window.localStorage.getItem('dateMonth'));
    dateDateSpan.innerHTML = Number(window.localStorage.getItem('dateDate'));
    orderArray = JSON.parse(window.localStorage.getItem('orderArray'));
    unitBoxArray = JSON.parse(window.localStorage.getItem('objects'));
    document.querySelector('#timeStart').value = window.localStorage.getItem('timeStart');
    for (let i of orderArray) {
      unitBox[`todoUnit${i}`] = unitBoxArray[orderArray.findIndex(item => item === i)];
      button.insertAdjacentHTML('beforebegin', unit(i, unitBox[`todoUnit${i}`].time, unitBox[`todoUnit${i}`].columnTxt));
      column[i] = document.querySelector(`#column${i}`);
      doneJudge[i] = !Boolean(unitBox[`todoUnit${i}`].checked);
      check(i);
    }
    number = 1 + orderArray.reduce( (a, b) => {return Math.max(a,b)});
  } else {
    orderArray = [1];
    button.insertAdjacentHTML('beforebegin', unit(1, '00:00', ''));
    column[1] = document.querySelector('#column1');
    doneJudge[1] = true;
    unitBox[`todoUnit${1}`] = new unitData();
    number = 2;
  }
};

let focusWatch = () => {
  currentFocusUnit = document.activeElement.closest('.todoUnit');  //focusするたびにcurrentFocusUnitを更新
};

let addTodoUnit = () => {
  doneJudge[number] = true;  //numberはidのインデックス。1スタート。現在のカウントは今追加する要素のインデックス
  if (currentFocusUnit !== null) {
    startTime = currentFocusUnit.querySelector('input').value;
    currentFocusUnit.insertAdjacentHTML('afterend', unit(number, startTime, '')); //currentFocusUnitの下に新しい要素を追加
    let a = Number(currentFocusUnit.id.replace(/[^0-9]/g, ''));
    let b = orderArray.findIndex(item => item === a);
    orderArray.splice(b+1, 0, number);
  } else {
    button.insertAdjacentHTML('beforebegin', unit(number, startTime, '')); //buttonの上に新しい要素を追加
    orderArray.push(number);
  }
  column[number] = document.querySelector(`#column${number}`);
  unitBox[`todoUnit${number}`] = new unitData();
  number++
};

let delUnit = (x) => {
  if (window.confirm('この項目を削除します')) {
    let targetParent = document.querySelector('#container');
    let target = document.querySelector(`#todoUnit${x}`)
    targetParent.removeChild(target);
    currentFocusUnit = null;
    let index = orderArray.findIndex(item => item === x);
    orderArray.splice(index,1);
  }
};

let check = (c) => {
  let checkMark = document.querySelector(`#check${c}`);
  if (doneJudge[c]) {
    column[c].style.textDecoration = 'line-through';
    column[c].style.backgroundColor = '#dadada';
    column[c].style.color = '#636363';
    checkMark.style.backgroundColor = '#005eff';
    doneJudge[c] = !doneJudge[c];
  }else{
    column[c].style.textDecoration = 'none';
    column[c].style.backgroundColor = '#fff';
    column[c].style.color = '#000000';
    checkMark.style.backgroundColor = '#56a6d2';
    doneJudge[c] = !doneJudge[c];
  }
};

let trash = (event) => {
  if (window.confirm('全てのデータを削除します')) {
    window.localStorage.removeItem('timeStart');
    window.localStorage.removeItem('objects');
    window.localStorage.removeItem('orderArray');
    window.localStorage.removeItem('dateMonth');
    window.localStorage.removeItem('dateDate');
    window.localStorage.setItem('recovered', '');
    if (recovered) {
      recovered = !recovered
    }
  location.reload();
  }
};

let save = (event) => {
  unitBoxArray.splice(0,unitBoxArray.length);
  for (let i of orderArray) {
    unitBox[`todoUnit${i}`].columnTxt = document.querySelector(`#column${i}`).textContent;
    unitBox[`todoUnit${i}`].time = document.querySelector(`#input${i}`).value;
    if (doneJudge[i]) {
      unitBox[`todoUnit${i}`].checked = 'true';
    } else {
      unitBox[`todoUnit${i}`].checked = '';
    }
    unitBoxArray.push(unitBox[`todoUnit${i}`]);
  }
  let timeStart = document.querySelector('#timeStart').value;
  let dM = document.querySelector('#dateMonth').textContent;
  let dD = document.querySelector('#dateDate').textContent;
  window.localStorage.setItem('timeStart', timeStart);
  window.localStorage.setItem('dateMonth', dM);
  window.localStorage.setItem('dateDate', dD);
  window.localStorage.setItem('objects',JSON.stringify(unitBoxArray));
  window.localStorage.setItem('orderArray',JSON.stringify(orderArray));
  window.localStorage.setItem('recovered', 'true');
  if (!recovered) {
    recovered = !recovered
  }
  const saved = document.querySelector('#saved');
  saved.style.visibility = 'visible';
  saved.style.opacity = 1;
  setTimeout( () => {
    saved.style.transitionTimingFunction = 'ease-out';
    saved.style.opacity = 0;
  },1000);
  setTimeout( () => saved.visibility = 'hidden',1500);
};

trashButton.addEventListener("click",trash,false);
saveButton.addEventListener("click",save,false);
