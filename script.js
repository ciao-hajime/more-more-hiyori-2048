// =========================
// 2048 Game
// Part 1
// =========================

// ---------- 設定 ----------
const SIZE = 4;

// ---------- 要素取得 ----------
const gameBoard = document.getElementById("game-board");
const scoreElement = document.getElementById("score");
const bestScoreElement = document.getElementById("best-score");
const restartButton = document.getElementById("restart-btn");

// オーバーレイ
const overlay = document.getElementById("overlay");
const overlayTitle = document.getElementById("overlay-title");
const overlayText = document.getElementById("overlay-text");
const overlayButton = document.getElementById("overlay-button");

function showOverlay(title, text){

    overlayTitle.textContent = title;
    overlayText.textContent = text;

    overlay.classList.remove("hidden");

}

overlayButton.onclick = () => {

    overlay.classList.add("hidden");
    initGame();

};

// メッセージ表示
const message = document.getElementById("message");
const messageText = document.getElementById("message-text");

function showMessage(text) {

    messageText.textContent = text;

    message.classList.remove("hidden");

}

// ---------- 効果音データ ----------
const spawnSound = new Audio("sounds/spawn.mp3");
const mergeSound = new Audio("sounds/merge.mp3");
const clearSound = new Audio("sounds/clear.mp3");

// ---------- ゲームデータ ----------
let board = [];
let score = 0;
let bestScore = localStorage.getItem("bestScore") || 0;

let cleared = false;
let gameOver = false;
let mergedTiles = [];

// ---------- 効果音ON/OFF ----------
let soundEnabled =
    localStorage.getItem("hiyori2048Sound") !== "off";

const soundButton = document.getElementById("sound-btn");

function updateSoundButton() {

    if (soundEnabled) {
        soundButton.textContent = "🔊 Sound ON";
    } else {
        soundButton.textContent = "🔇 Sound OFF";
    }

}

soundButton.addEventListener("click", () => {

    soundEnabled = !soundEnabled;

    localStorage.setItem(
        "hiyori2048Sound",
        soundEnabled ? "on" : "off"
    );

    updateSoundButton();

});

updateSoundButton();


// ---------- 初期化 ----------
function initGame() {

    cleared = false;
    gameOver = false;

    overlay.classList.add("hidden");
    message.classList.add("hidden");

    board = new Array(16).fill(0);

    score = 0;

    updateScore();
    bestScoreElement.textContent = bestScore;

    addRandomTile();
    addRandomTile();

    renderBoard();

    saveGame();

}

// ---------- スコア ----------
function updateScore() {

    scoreElement.textContent = score;

    if (score > bestScore) {

        bestScore = score;

        localStorage.setItem("bestScore", bestScore);

        bestScoreElement.textContent = bestScore;

    }

}

// ---------- ゲーム保存 ----------
function saveGame() {

    const gameData = {
        board: board,
        score: score,
        cleared: cleared,
        gameOver: gameOver
    };

    localStorage.setItem(
        "hiyori2048Game",
        JSON.stringify(gameData)
    );

}

// ---------- ゲーム読み込み ----------
function loadGame() {

    const savedGame = localStorage.getItem("hiyori2048Game");

    if (!savedGame) {
        return false;
    }

    const gameData = JSON.parse(savedGame);

    board = gameData.board;
    score = gameData.score;
    cleared = gameData.cleared;
    gameOver = gameData.gameOver;

    updateScore();
    bestScoreElement.textContent = bestScore;

    renderBoard();

    return true;

}

// ---------- 描画 ----------
function renderBoard(animationData = null) {

    console.log(board);

    gameBoard.innerHTML = "";

    board.forEach((value, index) => {

        const cell = document.createElement("div");
        cell.className = "cell";

        if (value !== 0) {

            cell.classList.add(`tile-${value}`);

            // 合体アニメーション
            if (mergedTiles.includes(index)) {
                cell.classList.add("pop");
            }

            // 数字
            const number = document.createElement("span");
            number.className = "tile-number";
            number.textContent = value;

            // 画像
            const img = document.createElement("img");
            img.src = `images/${value}.png`;
            img.alt = value;

            cell.appendChild(number);
            cell.appendChild(img);

            // 動いたパネルだけアニメーション
            if (animationData && animationData.includes(index)) {
                cell.classList.add("slide");
            }
        }

        gameBoard.appendChild(cell);

    });

    console.log("マスの数:", gameBoard.children.length);

}

// ---------- ランダム生成 ----------
function addRandomTile() {

    const empty = [];

    board.forEach((value, index) => {

        if (value === 0) {

            empty.push(index);

        }

    });

    if (empty.length === 0) return;

    const randomIndex =
        empty[Math.floor(Math.random() * empty.length)];

    board[randomIndex] =
            Math.random() < 0.9 ? 2 : 4;

    if (soundEnabled) {
        spawnSound.currentTime = 0;
        spawnSound.play();
    }

}

// ---------- リスタート ----------
restartButton.addEventListener("click", () => {

    localStorage.removeItem("hiyori2048Game");

    initGame();

});

// ---------- 起動 ----------
if (!loadGame()) {
    initGame();
}

console.log(gameBoard.children.length);

// ---------- キーボード ----------
document.addEventListener("keydown", handleKeyDown);

// ---------- スワイプ操作 ----------
let touchStartX = 0;
let touchStartY = 0;

// 指を置いた位置を記録
gameBoard.addEventListener("touchstart", (event) => {

    event.preventDefault();

    touchStartX = event.touches[0].clientX;
    touchStartY = event.touches[0].clientY;

}, { passive: false });

// スクロールを防ぐ
gameBoard.addEventListener("touchmove", (event) => {

    event.preventDefault();

}, { passive: false });

// 指を離したとき
gameBoard.addEventListener("touchend", (event) => {

    event.preventDefault();

    const touchEndX = event.changedTouches[0].clientX;
    const touchEndY = event.changedTouches[0].clientY;

    const dx = touchEndX - touchStartX;
    const dy = touchEndY - touchStartY;

    if (Math.abs(dx) < 30 && Math.abs(dy) < 30) return;

    if (Math.abs(dx) > Math.abs(dy)) {

        if (dx > 0) {
            move("right");
        } else {
            move("left");
        }

    } else {

        if (dy > 0) {
            move("down");
        } else {
            move("up");
        }

    }

}, { passive: false });

function handleKeyDown(event) {
    // 矢印キーで画面がスクロールするのを防ぐ
    if (
        event.key === "ArrowLeft" ||
        event.key === "ArrowRight" ||
        event.key === "ArrowUp" ||
        event.key === "ArrowDown"
    ) {
        event.preventDefault();
    }

    // ESCでオーバーレイを閉じる
    if (event.key === "Escape") {

        overlay.classList.add("hidden");
        return;

    }

    // ゲームオーバー中は操作しない
    if (gameOver) return;

    switch (event.key) {

        case "ArrowLeft":
            move("left");
            break;

        case "ArrowRight":
            move("right");
            break;

        case "ArrowUp":
            move("up");
            break;

        case "ArrowDown":
            move("down");
            break;

    }

}
function reverseRows() {

    for (let row = 0; row < SIZE; row++) {

        const start = row * SIZE;

        const line = board.slice(start, start + SIZE).reverse();

        for (let col = 0; col < SIZE; col++) {
            board[start + col] = line[col];
        }

    }

}

function transposeBoard() {

    const newBoard = [...board];

    for (let row = 0; row < SIZE; row++) {

        for (let col = 0; col < SIZE; col++) {

            newBoard[col * SIZE + row] =
                board[row * SIZE + col];

        }

    }

    for (let i = 0; i < board.length; i++) {
        board[i] = newBoard[i];
    }

}

function moveLeft() {

    let moved = false;

    mergedTiles = [];

    // 実際に移動したパネルの「移動先」
    const slideIndexes = [];

    for (let row = 0; row < SIZE; row++) {

        // 値だけではなく「元いた場所」も一緒に持つ
        let line = board
            .slice(row * SIZE, row * SIZE + SIZE)
            .map((value, col) => ({
                value: value,
                origin: row * SIZE + col
            }))
            .filter(tile => tile.value !== 0);

        const originalLine = line.map(tile => tile.value);

        // 合体
        for (let i = 0; i < line.length - 1; i++) {

            if (line[i].value === line[i + 1].value) {

                // 合体するパネル
                line[i].value *= 2;

                score += line[i].value;

                // 右側のパネルは消える
                line[i + 1].value = 0;

                if (soundEnabled) {
                    mergeSound.currentTime = 0;
                    mergeSound.play();
                }

                // 8192達成
                if (line[i].value === 8192 && !cleared) {

                    cleared = true;

                    if (soundEnabled) {
                        clearSound.currentTime = 0;
                        clearSound.play();
                    }

                    setTimeout(() => {

                        showOverlay(
                            "🎉8192達成！🎉",
                            "沢山遊んでくれてありがとう！\nと～っても、いい日和♪\nハイスコア目指して続けて遊べるね！また遊んでね♪"
                        );

                        overlayButton.onclick = () => {

                            overlay.classList.add("hidden");

                            // 通常のゲームオーバー用ボタンに戻す
                            overlayButton.textContent = "もう一度遊ぶ";

                            overlayButton.onclick = () => {

                                overlay.classList.add("hidden");
                                initGame();

                            };

                        };

                    }, 200);

                }

                // 合体後の位置を記録
                mergedTiles.push(row * SIZE + i);

                i++;

            }

        }

        // 消えたパネルを取り除く
        line = line.filter(tile => tile.value !== 0);

        // 新しい位置を決定
        line.forEach((tile, col) => {

            const destination =
                row * SIZE + col;

            // 元の位置と違うなら「本当に移動した」
            if (tile.origin !== destination) {

                // 合体したパネルは slide ではなく pop
                if (!mergedTiles.includes(destination)) {

                    slideIndexes.push(destination);

                }

                moved = true;

            }

        });

        // 元の行と比べて変化があったか
        const newLine = line.map(tile => tile.value);

        if (
            originalLine.toString() !==
            newLine.toString()
        ) {

            moved = true;

        }

        // 0を追加
        while (line.length < SIZE) {

            line.push({
                value: 0,
                origin: -1
            });

        }

        // boardへ戻す
        for (let col = 0; col < SIZE; col++) {

            board[row * SIZE + col] =
                line[col].value;

        }

    }

    updateScore();

    return {
        moved: moved,
        slideIndexes: slideIndexes,
        mergedIndexes: [...mergedTiles]
    };

}
function move(direction) {

    let result;

    switch(direction) {

        case "left":

            result = moveLeft();

            break;


        case "right":

            reverseRows();

            result = moveLeft();

            reverseRows();

            // 右向きの座標に戻す
            result.slideIndexes =
                result.slideIndexes.map(index => {

                    const row = Math.floor(index / SIZE);
                    const col = index % SIZE;

                    return row * SIZE + (SIZE - 1 - col);

                });

            result.mergedIndexes =
                result.mergedIndexes.map(index => {

                    const row = Math.floor(index / SIZE);
                    const col = index % SIZE;

                    return row * SIZE + (SIZE - 1 - col);

                });

            break;


        case "up":

            transposeBoard();

            result = moveLeft();

            transposeBoard();

            // 転置前の座標に戻す
            result.slideIndexes =
                result.slideIndexes.map(index => {

                    const row = Math.floor(index / SIZE);
                    const col = index % SIZE;

                    return col * SIZE + row;

                });

            result.mergedIndexes =
                result.mergedIndexes.map(index => {

                    const row = Math.floor(index / SIZE);
                    const col = index % SIZE;

                    return col * SIZE + row;

                });

            break;


        case "down":

            transposeBoard();

            reverseRows();

            result = moveLeft();

            reverseRows();

            transposeBoard();

            // 下向きの座標に戻す
            result.slideIndexes =
                result.slideIndexes.map(index => {

                    const row = Math.floor(index / SIZE);
                    const col = index % SIZE;

                    return col * SIZE + (SIZE - 1 - row);

                });

            result.mergedIndexes =
                result.mergedIndexes.map(index => {

                    const row = Math.floor(index / SIZE);
                    const col = index % SIZE;

                    return col * SIZE + (SIZE - 1 - row);

                });

            break;

    }

    if (!result || !result.moved) {

        return;

    }

    // 合体した場所を保存
    mergedTiles = result.mergedIndexes;

    // 新しいパネルを生成
    const empty = [];

    board.forEach((value, index) => {

        if (value === 0) {

            empty.push(index);

        }

    });

    let spawnIndex = -1;

    if (empty.length > 0) {

        spawnIndex =
            empty[Math.floor(Math.random() * empty.length)];

        board[spawnIndex] =
            Math.random() < 0.9 ? 2 : 4;

        if (soundEnabled) {

            spawnSound.currentTime = 0;
            spawnSound.play();

        }

    }

    // 新しく出現したパネルはスライドさせない
    const slideIndexes =
        result.slideIndexes.filter(
            index => index !== spawnIndex
        );

    renderBoard(slideIndexes);

    saveGame();


    // ゲームオーバー判定
    if (isGameOver() && !gameOver) {

        gameOver = true;

        saveGame();

        setTimeout(() => {

            showOverlay(
                "🌞 Game Over",
                "うんうん♬最後まで遊んでくれて\nありがとう！\nまた遊びに来てね♪"
            );

        }, 150);

    }

}

function isGameOver() {

    // 空きマスがあるなら終了じゃない
    if (board.includes(0)) {
        return false;
    }

    // 横を見る
    for (let row = 0; row < SIZE; row++) {

        for (let col = 0; col < SIZE - 1; col++) {

            const index = row * SIZE + col;

            if (board[index] === board[index + 1]) {
                return false;
            }

        }

    }

    // 縦を見る
    for (let row = 0; row < SIZE - 1; row++) {

        for (let col = 0; col < SIZE; col++) {

            const index = row * SIZE + col;

            if (board[index] === board[index + SIZE]) {
                return false;
            }

        }

    }

    return true;

}
