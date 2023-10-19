document.getElementById("hello_text").textContent = "テトリス作ってみた";

let paused = false;
var count = 0;
var cells;
var isFull = false;
var score = 0;
var blocks = {
	i: {
		class: "i", pattern: [[1, 1, 1, 1]]
	},
	o: {
		class: "o", pattern: [[1, 1], [1, 1]]
	},
	t: {
		class: "t", pattern: [[0, 1, 0], [1, 1, 1]]
	},
	s: {
		class: "s", pattern: [[0, 1, 1], [1, 1, 0]]
	},
	z: {
		class: "z", pattern: [[1, 1, 0], [0, 1, 1]]
	},
	j: {
		class: "j", pattern: [[1, 0, 0], [1, 1, 1]]
	},
	l: {
		class: "l", pattern: [[0, 0, 1], [1, 1, 1]]
	}
}



loadTable();
		document.addEventListener("keydown", onKeyDown);

const timerID = setInterval(function () {
	if (!paused) {
			// countを1秒に１づつ増やす
		count++;
		document.getElementById("hello_text").textContent = "TIME：" + count + "　スコア：" + score;

		if (hasFallingBlock()) {
			fallBlocks();
		} else {
			deleteRow();
			for (var row = 0; row < 2; row++) {
				for (var col = 3; col < 7; col++) {
					if (cells[row][col].className !== "") {
						document.getElementById("hello_text").textContent = "ゲーム終了"
						clearInterval(timerID);
					}
				}
			}
			generateBlock();
		}
	}

}, 300) //setInterval(動かしたい関数, 繰り返す間隔(ミリ秒))

/* --------------------------　ここから下は関数の宣言　------------------------------------*/

function loadTable() {	//tdの状況を２次元配列に格納
	var td_array = document.getElementsByTagName("td");
	cells = [];
	var index = 0;
	for (var row = 0; row < 20; row++) {
		cells[row] = [];
		for (var col = 0; col < 10; col++) {
			cells[row][col] = td_array[index];
			index++;
		}
	}
}

function onKeyDown(event) {//左右キー入力時の操作
	if (event.keyCode === 37 && !paused) {
		moveLeft();
	} else if (event.keyCode === 38 && !paused) {
		rotate();
	} else if (event.keyCode === 39 && !paused) {
		moveRight();
	} else if (event.keyCode === 40 && !paused) {
		fallTrough();
	} else if (event.keyCode === 80) {
		stop();
	}
}

function stop() {//一時停止
	if (paused) {
		paused = false;
	} else {
		paused = true;
	}
}

function fallBlocks() {		//ブロックを下へ
	for (var i = 0; i < 10; i++) {	//底にブロックがついたか
		if (cells[19][i].blockNum === fallingBlockNum) {
			isFalling = false;
			return;
		}
	}
	for (var row = 18; row >= 0; row--) {	//一個下にブロックがないか確認
		for (var col = 0; col < 10; col++) {
			if (cells[row][col].blockNum === fallingBlockNum) {
				if (cells[row + 1][col].className !== "" 
					&& cells[row + 1][col].blockNum !== fallingBlockNum) {
					isFalling = false;
					return;
				}
			}
		}
	}
	for (var row = 18; row >= 0; row--) {	//下から順にクラスを下へ移動
		for (var col = 0; col < 10; col++) {
			if (cells[row][col].base) {
				cells[row + 1][col].base = true;
				cells[row][col].base = null;
			}
			if (cells[row][col].blockNum === fallingBlockNum) {
				cells[row + 1][col].className = cells[row][col].className;
				cells[row + 1][col].blockNum = cells[row][col].blockNum;
				cells[row][col].className = "";
				cells[row][col].blockNum = null;
			}
		}
	}
}


var isFalling = false;
function hasFallingBlock() {	//落下中のブロックがあるか確認
	return isFalling;
}

function deleteRow() { // そろった行を消す
	var cntDeleteLine = 0;
	var row = 19;
	while(row >= 0) {
		var canDelete = true;
		for (var col = 0; col < 10; col++) {
			if (cells[row][col].className === "") {
				canDelete = false;
			}
		}
		if (canDelete) {
			// 1行消す
			score++
			for (var col = 0; col < 10; col++) {
				cells[row][col].className = "";
			}
			// 上の行のブロックをすべて1マス落とす
			for (var downRow = row-1; downRow >= 0; downRow--) {
				for (var col = 0; col < 10; col++) {
					cells[downRow+1][col].className = cells[downRow][col].className;
					cells[downRow+1][col].blockNum = cells[downRow][col].blockNum;
					cells[downRow][col].className = "";
					cells[downRow][col].blockNum = null;
				}
			}
			cntDeleteLine++;
		} else {
			row--;
		}
	}
	// if (cntDeleteLine === 4) { // 消した行数の表示
	// 	document.getElementById("information").textContent = "TETRIS";
	// 	point += 1000;
	// } else if (cntDeleteLine >= 2){
	// 	document.getElementById("information").textContent = cntDeleteLine + " lines were deleted!";
	// 	point += cntDeleteLine * 100;
	// } else if (cntDeleteLine) {
	// 	document.getElementById("information").textContent = cntDeleteLine + " line was deleted!";
	// 	point += cntDeleteLine * 100;
	// } else {
	// 	document.getElementById("information").innerHTML = "<br>";
	// }
 }


var fallingBlockNum = 0;
function generateBlock() {	//ブロック生成
	for (var row = 0; row < 20; row++) {
		for (var col = 0; col < 10; col++) {
			if (cells[row][col].base) {
				cells[row][col].base = null
			}
		}
	}
	var keys = Object.keys(blocks);
	var nextBlockkey = keys[Math.floor(Math.random() * keys.length)];
	var nextBlock = blocks[nextBlockkey];//どのパターンのブロックにするか
	var nextFallingBlockNum = fallingBlockNum + 1;

	var pattern = nextBlock.pattern;
	cells[0][3].base = true;
	for (var row = 0; row < pattern.length; row++) {//	一番上の真ん中にブロック生成
		for (var col = 0; col < pattern[row].length; col++){
			if (pattern[row][col]) {
				cells[row][col + 3].className = nextBlock.class;
				cells[row][col + 3].blockNum = nextFallingBlockNum;
			}
		}
	}
	isFalling = true;	//落下しているブロックあり
	fallingBlockNum = nextFallingBlockNum;	//何個目に落下したやつか
}

function moveRight() {
	// ブロックを右に移動させる
	for (var row = 0; row < 20; row++) {
		if (cells[row][9].blockNum === fallingBlockNum) {
			return;//右端に来たら何もしない
		}
	}
	for (var col = 8; col >= 0; col--) {	//右にブロックがないか確認
		for (var row = 0; row < 20; row++) {
			if (cells[row][col].blockNum === fallingBlockNum) {
				if (cells[row][col + 1].className !== "" 
					&& cells[row][col + 1].blockNum !== fallingBlockNum){
					return;
				}
			}
		}
	}
	for (var row = 0; row < 20; row++) {
		for (var col = 8; col >= 0; col--) {
			if (cells[row][col].base) {
				cells[row][col + 1].base = true;
				cells[row][col].base = null;
			}
			if (cells[row][col].blockNum === fallingBlockNum) {
				cells[row][col + 1].className = cells[row][col].className;
				cells[row][col + 1].blockNum = cells[row][col].blockNum;
				cells[row][col].className = "";
				cells[row][col].blockNum = null;
			}
		}
	}
}

function moveLeft() {
	// ブロックを左に移動させる
	for (var row = 0; row < 20; row++) {
		if (cells[row][0].blockNum === fallingBlockNum) {
			//document.getElementById("hello_text").textContent = "左にいけません";
			return;//左端に来たら何もしない
		}
	}
	for (var col = 1; col < 10; col++) {	//左にブロックがないか確認
		for (var row = 0; row < 20; row++) {
			if (cells[row][col].blockNum === fallingBlockNum) {
				if (cells[row][col - 1].className !== "" 
					&& cells[row][col - 1].blockNum !== fallingBlockNum){
					//document.getElementById("hello_text").textContent = "左にブロックあり";
					return;
				}
			}
		}
	}
	for (var row = 0; row < 20; row++) {
		for (var col = 1; col < 10; col++) {
			if (cells[row][col].base) {
				cells[row][col - 1].base = true;
				cells[row][col].base = null;
			}
			if (cells[row][col].blockNum === fallingBlockNum) {
				cells[row][col - 1].className = cells[row][col].className;
				cells[row][col - 1].blockNum = cells[row][col].blockNum;
				cells[row][col].className = "";
				cells[row][col].blockNum = null;
			}
		}
	}
}

function rotate() { // ブロックを回転させる
	// 1. ブロックの回転に関係する範囲を決める (blockRange ** 2 の範囲)
	var blockRange = 0;
	var initRow, initCol;
	var blockClass;
	for (var row = 0; row < 20; row++) {
		for (var col = 0; col < 10; col++) {
			if (cells[row][col].blockNum === fallingBlockNum) {
				if (cells[row][col].className === "o") {
					return; // 四角は回転できない
				} else if (cells[row][col].className === "i") {
					blockRange = 4;
				} else {
					blockRange = 3;
				}
				blockClass = cells[row][col].className
				break;
			}
		}
	}
	for (var row = 0; row < 20; row++) {
		for (var col = 0; col < 10; col++) {
			if (cells[row][col].base) {
				initRow = row;
				initCol = col;
				break;
			}
		}
	}
	// 3. 範囲内に別のブロックが存在しないか確認する
	for (var i = 0; i < blockRange; i++) {
		for (var j = 0; j < blockRange; j++) {
			if (cells[initRow+i][initCol+j].className !== ""
					&& cells[initRow+i][initCol+j].blockNum !== fallingBlockNum) {
				return; // 回転不可
			}
		}
	}

	// 4. ブロックを回転させる
	var rotetedBlockClass;
	if (blockRange === 3) {
		rotetedBlockClass = [["","",""],["","",""],["","",""]]
	} else if (blockRange === 4) {
		rotetedBlockClass = [["","","",""],["","","",""],["","","",""],["","","",""]]
	}
	for (var i = 0; i < blockRange; i++) {
		for (var j = 0; j < blockRange; j++) {
			rotetedBlockClass[j][blockRange-1-i] = cells[initRow+i][initCol+j].className;
		}
	}
	for (var i = 0; i < blockRange; i++) {
		for (var j = 0; j < blockRange; j++) {
			cells[initRow+i][initCol+j].blockNum = null;
			cells[initRow+i][initCol+j].className = rotetedBlockClass[i][j];
			//cells[initRow+i][initCol+j].textContent = "c"
			if (rotetedBlockClass[i][j] !== "") {
				cells[initRow+i][initCol+j].blockNum = fallingBlockNum;
			}
		}
	}
}

function fallTrough() { // 落ちるところまで落とす
	while(isFalling) {
		fallBlocks();
	}
}