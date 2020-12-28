let dt = new Date();
let month = 1 + dt.getMonth();
let date = dt.getDate();
dayTxt = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
let button = document.querySelector('#addButton');
const trashButton = document.querySelector('#trash');
const saveButton = document.querySelector('#save');
let firstLoad = true;
let column = {}; //columnを入れるためのオブジェクト、インデックスはnumber（1スタート）
let outer = {};
let input = {};
let number = null;
let startTime = '00:00';
let doneJudge = {};  //tureは未チェック
let recovered = Boolean(window.localStorage.getItem('recovered'));  //保存データがあるかどうか。trueでデータあり
let currentFocusUnit = null;
let dateMonthSpan = null;
let dateDateSpan = null;
let colorNumber = 0;	//テーマ色を指定する変数。0=blue, 1=white
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

//色のセットを作るためのクラス
class pallet {
	constructor(lightColor, bgColor, bgColor2, shadowColor, txtColor, txtColor2, checkColor, checkColor2) {
		this.lightColor  = lightColor;
		this.bgColor     = bgColor;
		this.bgColor2    = bgColor2;
		this.shadowColor = shadowColor;
		this.txtColor    = txtColor;
		this.txtColor2   = txtColor2;
		this.checkColor  = checkColor;
		this.checkColor2 = checkColor2;
	}
}
//青色用のインスタンス
const blue  = new pallet('hsl(208, 75%, 90%)',  'hsl(208, 75%, 80%)', 'hsl(208, 75%, 77%)', 'hsl(208, 75%, 70%)', 'hsl(221, 10%, 18%)', 'hsl(221, 10%, 55%)', 'hsl(208, 97%, 97%)', 'hsl(208, 55%, 65%)');
const white = new pallet('hsl(240, 19%, 100%)', 'hsl(217, 23%, 93%)', 'hsl(217, 23%, 90%)', 'hsl(219, 25%, 80%)', 'hsl(221, 10%, 18%)', 'hsl(221, 10%, 55%)', 'hsl(217, 23%, 50%)', 'hsl(217, 23%, 80%)');
const green = new pallet('hsl(120, 76%, 89%)',  'hsl(120, 75%, 80%)', 'hsl(120, 75%, 77%)', 'hsl(120, 75%, 70%)', 'hsl(221, 10%, 18%)', 'hsl(221, 10%, 55%)', 'hsl(208, 97%, 97%)', 'hsl(120, 55%, 65%)');

//色のセット
const colorSet = [blue, white, green];

document.querySelector('body').style.backgroundColor = colorSet[colorNumber].bgColor;

//Neumorphism用のシャドウを返す関数
let convex = (offset, blur =offset*2 , light = colorSet[colorNumber].lightColor, shadow = colorSet[colorNumber].shadowColor) => {
	return `${offset}px ${offset}px ${blur}px ${shadow}, -${offset}px -${offset}px ${blur}px ${light}, inset ${offset}px ${offset}px ${blur}px hsla(208, 75%, 70%, 0), inset -${offset}px -${offset}px ${blur}px hsla(208, 75%, 70%, 0)`;
};
let dent = (offset, blur =offset*2 , light = colorSet[colorNumber].lightColor, shadow = colorSet[colorNumber].shadowColor) => {
	return `inset ${offset}px ${offset}px ${blur}px ${shadow}, inset -${offset}px -${offset}px ${blur}px ${light}, ${offset}px ${offset}px ${blur}px hsla(208, 75%, 70%, 0), -${offset}px -${offset}px ${blur}px hsla(208, 75%, 70%, 0)`;
};

//追加する要素を返す関数　引数は'カウント'、'開始時間'、'columnの内容'
let unit = (n, sT, txt) => {
  return `<div class="todoUnit" id='todoUnit${n}'>
			<div class="innerUnit">
				<div class="columnOuter" id="outer${n}">
	      	<div contenteditable="true" class="todoColumn"id="column${n}" onfocus='focusWatch()' onfocusout='deldel()'>${txt}</div>
					<div class="del" id="del${n}" onclick="delUnit(${n})"><i class="fas fa-times"></i></div>
				</div>
				<div class="check" id="check${n}" onclick='check(${n})'><i class="fas fa-check"></i></div>
			</div>
			<div class="inputBox">
				<span class="timeDisplay" id="timeDisplay${n}">${sT}</span>
				<input type="time" value=${sT} id='input${n}' oninput="timeDisplayFunc(${n})">
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
		save();
  };
	//enter to change
	let enterchangeDay = (e) => {
		if (e.keyCode === 13) {
			changeDay();
			e.target.blur();
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
		timeDisplayFunc(0);
    for (let i of orderArray) {
      unitBox[`todoUnit${i}`] = unitBoxArray[orderArray.findIndex(item => item === i)];
			document.querySelector('#container').insertAdjacentHTML('beforeend', unit(i, unitBox[`todoUnit${i}`].time, unitBox[`todoUnit${i}`].columnTxt))
			document.querySelector(`#todoUnit${i}`).style.opacity = 0;
			setTimeout( () => {
				column[i] = document.querySelector(`#column${i}`);
				outer[i] = document.querySelector(`#outer${i}`);
	      doneJudge[i] = !Boolean(unitBox[`todoUnit${i}`].checked);
	      check(i);
				document.querySelector(`#todoUnit${i}`).style.opacity = 1;
			}, (1000/orderArray.length)*orderArray.findIndex(item => item === i));
    }
    number = 1 + orderArray.reduce( (a, b) => {return Math.max(a,b)});
  } else {
    orderArray = [1];
    document.querySelector('#container').insertAdjacentHTML('beforeend', unit(1, '00:00', ''));
    column[1] = document.querySelector('#column1');
		outer[1] = document.querySelector(`#outer1`);
    doneJudge[1] = true;
    unitBox[`todoUnit${1}`] = new unitData();
    number = 2;
  }
	setTimeout( () => firstLoad = false, 1200);
};

let focusWatch = () => {
  currentFocusUnit = document.activeElement.closest('.todoUnit');  //focusするたびにcurrentFocusUnitを更新
	let del = currentFocusUnit.querySelector('.del');
	setTimeout( () => {
		del.style.transitionTimingFunction= 'ease-out';
		del.style.visibility = 'visible';
		del.style.opacity = 1;
	}, 250);	//focusしたらそのcolumnのdelを表示
};

let deldel = () => {
	let del = currentFocusUnit.querySelector('.del');
	del.style.transitionTimingFunction= 'ease-in';
	del.style.opacity = 0;
	setTimeout( () => del.style.visibility = 'hidden' , 250);	//focusoutしたらそのcolumnのdelを非表示
	save();
};

let openMenu = () => {
	document.querySelector('#dropDown').style.visibility = 'visible';
};


let addTodoUnit = (e) => {
  doneJudge[number] = true;  //numberはidのインデックス。1スタート。現在のカウントは今追加する要素のインデックス
  if (currentFocusUnit !== null) {
    startTime = currentFocusUnit.querySelector('input').value;
    currentFocusUnit.insertAdjacentHTML('afterend', unit(number, startTime, '')); //currentFocusUnitの下に新しい要素を追加
    let a = Number(currentFocusUnit.id.replace(/[^0-9]/g, ''));
    let b = orderArray.findIndex(item => item === a);
    orderArray.splice(b+1, 0, number);
  } else {
    document.querySelector('#container').insertAdjacentHTML('beforeend', unit(number, startTime, '')); //buttonの上に新しい要素を追加
    orderArray.push(number);
  }
  column[number] = document.querySelector(`#column${number}`);
	outer[number] = document.querySelector(`#outer${number}`);
	unitBox[`todoUnit${number}`] = new unitData();
	let addedUnit = document.querySelector(`#todoUnit${number}`);
	addedUnit.style.opacity = 0;
	setTimeout( () => addedUnit.style.opacity = 1, 10);
	number++
	if (!firstLoad) {
		save();
	}
};

let delUnit = (x) => {
  let targetParent = document.querySelector('#container');
  let target = document.querySelector(`#todoUnit${x}`)
  targetParent.removeChild(target);
  currentFocusUnit = null;
  let index = orderArray.findIndex(item => item === x);
  orderArray.splice(index,1);
	save();
};

let check = (c) => {
  let checkMark = document.querySelector(`#check${c}`);
  if (doneJudge[c]) {
    column[c].style.textDecoration = 'line-through';
		column[c].style.color = colorSet[colorNumber].txtColor2;
		outer[c].style.boxShadow = dent(3);
		outer[c].style.backgroundColor = colorSet[colorNumber].bgColor2;
		checkMark.style.backgroundColor = colorSet[colorNumber].bgColor2;
		checkMark.style.color = colorSet[colorNumber].checkColor2;
		checkMark.style.boxShadow = dent(3);
    doneJudge[c] = !doneJudge[c];
  }else{
    column[c].style.textDecoration = 'none';
    column[c].style.color = colorSet[colorNumber].txtColor;
		outer[c].style.boxShadow = convex(3);
		outer[c].style.backgroundColor = colorSet[colorNumber].bgColor;
		checkMark.style.backgroundColor = colorSet[colorNumber].bgColor;
		checkMark.style.color = colorSet[colorNumber].checkColor;
		checkMark.style.boxShadow = convex(3);
    doneJudge[c] = !doneJudge[c];
  }
	if (!firstLoad) {
		save();
	}
};

let timeDisplayFunc = (d) => {
	if (d === 0) {
		document.querySelector('#timeStartBox').querySelector('span').innerHTML = document.querySelector('#timeStart').value;
	} else {
		document.querySelector(`#timeDisplay${d}`).innerHTML = document.querySelector(`#input${d}`).value;
	}
	if (!firstLoad) {
		save();
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
//	saved();
	if (!recovered) {
    recovered = !recovered
  }
};

let saved = () => {
	const saved = document.querySelector('#saved');
	const savedTxt = saved.querySelector('div');
  saved.style.transitionTimingFunction = 'ease-out';
	saved.style.boxShadow = convex(2);
	saved.querySelector('div').style.backgroundColor = colorSet[colorNumber].bgColor;
	savedTxt.style.opacity = 1;
  setTimeout( () => {
    saved.style.transitionTimingFunction = 'ease-in';
		saved.style.boxShadow = convex(2, 4, 'hsla(208, 75%, 70%, 0)', 'hsla(206, 74%, 90%, 0)');
		saved.querySelector('div').style.backgroundColor = colorSet[colorNumber].bgColor;
		savedTxt.style.opacity = 0;
	},1500);
};

trashButton.addEventListener("click",trash,false);
//saveButton.addEventListener("click",save,false);
