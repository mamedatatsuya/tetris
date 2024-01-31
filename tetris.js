let interval;							//実行プログラム
let dead = false;						//ゲームオーバーフラグ
let play = false;						//playフラグ
let isFalling = false;				//落ちているブロックがあるか

let playTime =  0;					//プレイ時間
let cells;								//盤面情報
let nextCells;							//次のブロック表示用
let holdCells;							//ホールドブロック表示用

let score = 0;							//スコア

let nextBlock = null;				//次のブロック
let fallingBlockNum = 0;			//落ちているブロックの数

const state = document.getElementById("state");
const btn = document.getElementById("start");

const blocks = {//blockの形定義
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
let keys = Object.keys(blocks);	//


document.onkeydown = function (e) {//キーボードが押されたとき
	if(play){
		switch (e.keyCode) {
		case 65: //Aキーが押さえた
			moveLeft();
			break;
			case 68: //Dキーが押された
				moveRight();
			break;
			case 83: //Sキーが押された
				fallBlocks();
				break;
			case 87: //Wが押された
				fallTrough();
				break;
			case 39: //→が押された
				rotateRight();
				break;
			case 37: //←が押された
				rotateLeft();
				break;
			case 80: //Pが押された
				gameStop();
				break;
		}
	} else {
		switch (e.keyCode) {
			case 80: //Pが押された
				gameReStart();
				break;
		}
	}
}
/*--------------------ゲームの初期化--------------------*/

loadGameBoard();
loadNextBoard();
loadHoldBoard();
generateNextBlock();

/*--------------------関数宣言部分--------------------*/

function gameStop(){//一時停止
	if(play){
		play = false;
		btn.innerHTML = "スタート";
		clearInterval(interval);
	}
}

function gameReStart(){//再開
	if(!play){
		if(dead){
			document.location.reload();
		}
		play = true;
		btn.innerHTML = "ポーズ";
		interval = setInterval(exec, 800);
	}
}

function gameOver(){//ゲームオーバー
	play = false;
	dead = true;
	clearInterval(interval);
	state.textContent = "GameOver"
	nextBlock = null;
	clearBord(cells);
	btn.innerHTML = "もう一度";
}

function exec(){//繰り返し行う処理
	
	state.textContent = "TIME：" + playTime + " スコア：" + score;
	playTime++;// playTimeを1秒に１づつ増やす
	if (hasFallingBlock()) {
		fallBlocks();
	} else {
		deleteRow();
		for (var row = 0; row < 2; row++) {
			for (var col = 3; col < 7; col++) {
				if (cells[row][col].className !== "") {
					gameOver();//blockを作成する領域に他のblockがあるとゲームオーバー
				}
			}
		}
		generateBlock();
	}
}

function loadGameBoard() {	//GameBoardの状況を２次元配列に格納
	var td_array = document.getElementById("gameBoard").getElementsByTagName("td");
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

function loadNextBoard() {	//NextBoardの状況を２次元配列に格納
	var td_array = document.getElementById("nextBoard").getElementsByTagName("td");
	nextCells = [];
	var index = 0;
	for (var row = 0; row < 4; row++) {
		nextCells[row] = [];
		for (var col = 0; col < 5; col++) {
			nextCells[row][col] = td_array[index];
			index++;
		}
	}
}

function loadHoldBoard() {	//HoldBoardの状況を２次元配列に格納
	var td_array = document.getElementById("holdBoard").getElementsByTagName("td");
	holdCells = [];
	var index = 0;
	for (var row = 0; row < 4; row++) {
		holdCells[row] = [];
		for (var col = 0; col < 5; col++) {
			holdCells[row][col] = td_array[index];
			index++;
		}
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

function hasFallingBlock() {	//落下中のブロックがあるか確認
	return isFalling;
}

function deleteRow() { // そろった行を消す
	var deleteLine = 0;
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
			deleteLine++;
		} else {
			row--;
		}
	}
	if (deleteLine == 1) {
		score += 100;
	} else if (deleteLine == 2) {
		score +=1000;
	} else if (deleteLine == 3) {
		score += 3000;
	} else if (deleteLine >= 4) {
		score += deleteLine * 5000;
	}
	document.getElementById("gimmick").textContent = deleteLine + "消し";
}

function generateBlock() {	//ブロック生成
	var fallBlock;
	for (var row = 0; row < 20; row++) {
		for (var col = 0; col < 10; col++) {	//baseのクリア
			if (cells[row][col].base) {
				cells[row][col].base = null
			}
		}
	}
	fallBlock = nextBlock;
	var nextFallingBlockNum = fallingBlockNum + 1;
	var pattern = fallBlock.pattern;
	cells[0][3].base = true;
	for (var row = 0; row < pattern.length; row++) {//	一番上の真ん中にブロック生成
		for (var col = 0; col < pattern[row].length; col++){
			if (pattern[row][col]) {
				cells[row][col + 3].className = fallBlock.class;
				cells[row][col + 3].blockNum = nextFallingBlockNum;
			}
		}
	}
	isFalling = true;	//落下しているブロックあり
	fallingBlockNum = nextFallingBlockNum;	//何個目に落下したやつか
	generateNextBlock();
}

function generateNextBlock(){	//次のブロックの表示
	clearBord(nextCells);	//NextBoardをまっさらに
	var nextBlockkey = keys[Math.floor(Math.random() * keys.length)];
	nextBlock = blocks[nextBlockkey];//どのパターンのブロックにするか
	var pattern = nextBlock.pattern;
	for (var row = 0; row < pattern.length; row++) {//	NextBoardにブロック生成
		for (var col = 0; col < pattern[row].length; col++){
			if (pattern[row][col]) {
				nextCells[row + 1][col + 1].className = nextBlock.class;
			}
		}
	}
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
		for (var col = 8; col >= 0; col--) {	//baseの移動
			if (cells[row][col].base) {
				cells[row][col + 1].base = true;
				cells[row][col].base = null;
			}
			if (cells[row][col].blockNum === fallingBlockNum) {	//ブロックの移動
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
			//document.getElementById("state").textContent = "左にいけません";
			return;//左端に来たら何もしない
		}
	}
	for (var col = 1; col < 10; col++) {	//左にブロックがないか確認
		for (var row = 0; row < 20; row++) {
			if (cells[row][col].blockNum === fallingBlockNum) {
				if (cells[row][col - 1].className !== "" 
					&& cells[row][col - 1].blockNum !== fallingBlockNum){
					//document.getElementById("state").textContent = "左にブロックあり";
					return;
				}
			}
		}
	}
	for (var row = 0; row < 20; row++) {
		for (var col = 1; col < 10; col++) {
			if (cells[row][col].base) {	//baseの移動
				cells[row][col - 1].base = true;
				cells[row][col].base = null;
			}
			if (cells[row][col].blockNum === fallingBlockNum) {	//ブロックの移動
				cells[row][col - 1].className = cells[row][col].className;
				cells[row][col - 1].blockNum = cells[row][col].blockNum;
				cells[row][col].className = "";
				cells[row][col].blockNum = null;
			}
		}
	}
}

function rotateRight() { // ブロックを時計回りに回転させる
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
			if (cells[row][col].base) {	//baseの場所の確認
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
			if (rotetedBlockClass[i][j] !== "") {
				cells[initRow+i][initCol+j].blockNum = fallingBlockNum;
			}
		}
	}
}

function rotateLeft() { // ブロックを反時計回りに回転させる
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
			if (cells[row][col].base) {	//baseの場所の確認
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
			rotetedBlockClass[blockRange-1-j][i] = cells[initRow+i][initCol+j].className;
		}
	}
	for (var i = 0; i < blockRange; i++) {
		for (var j = 0; j < blockRange; j++) {
			cells[initRow+i][initCol+j].blockNum = null;
			cells[initRow+i][initCol+j].className = rotetedBlockClass[i][j];
			if (rotetedBlockClass[i][j] !== "") {
				cells[initRow+i][initCol+j].blockNum = fallingBlockNum;
			}
		}
	}
}

function fallTrough() {	//落ちるところまで落とす
	while(isFalling) {
		fallBlocks();
	}
}

function clearBord(clearCells) {	//受け取ったボードの中身をまっさらに
	for (var row = 0; row < clearCells.length; row++) {
		for (var col = 0; col < clearCells[row].length; col++) {
			if (clearCells[row][col].className !== "") {
				clearCells[row][col].className = "";
			} else if (clearCells[row][col].blockNum !== null) {
				clearCells[row][col].blockNum = null;
			} else if (clearCells[row][col].base) {
				clearCells[row][col].base = null;
			}
		}
	}
}
