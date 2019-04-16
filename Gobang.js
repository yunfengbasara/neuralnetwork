// Gobang rule

// board size 6 * 6
const BoardSize = 6;

// win piece count
const WinCount = 4;

class Game {
    constructor() {
        this._start = "black";  // "white"
        this._board = [];
        for (let n = 0; n < BoardSize ** 2; n++) {
            // type: empty black white
            // order: 1 2 3 4 ……
            this._board.push({ type: "empty", order: 0 });
        }

        this._board[this.PosToIndex({ x: 0, y: 0 })] = { type: "white", order: 0 };
        this._board[this.PosToIndex({ x: 2, y: 1 })] = { type: "black", order: 0 };
        this._board[this.PosToIndex({ x: 3, y: 2 })] = { type: "black", order: 0 };
        this._board[this.PosToIndex({ x: 4, y: 3 })] = { type: "black", order: 0 };
        this._board[this.PosToIndex({ x: 5, y: 4 })] = { type: "black", order: 0 };
        this._board[this.PosToIndex({ x: 5, y: 5 })] = { type: "white", order: 0 };
        console.log(this.CheckWin("black", { x: 2, y: 1 }));
    }

    IndexToPos(idx) {
        let x = Math.floor(idx / BoardSize);
        let y = Math.floor(idx % BoardSize);
        return { x: x, y: y };
    }

    PosToIndex(pos) {
        return pos.x * BoardSize + pos.y;
    }

    CheckWin(type, pos) {
        if (this.N_S(type, pos)) { return true; }
        if (this.W_E(type, pos)) { return true; }
        if (this.WN_ES(type, pos)) { return true; }
        if (this.EN_WS(type, pos)) { return true; }
        return false;
    }

    N_S(type, pos) {
        let startX = Math.max(0, pos.x - WinCount + 1);
        let endX = Math.min(BoardSize - 1, pos.x + WinCount);
        let nWinCount = 0;
        for (let n = startX; n < endX; n++) {
            let p = { x: n, y: pos.y };
            let idx = this.PosToIndex(p);
            if (this._board[idx].type === type) {
                nWinCount++;
            } else {
                nWinCount = 0;
            }
            if (nWinCount === WinCount) {
                return true;
            }
        }
        return false;
    }

    W_E(type, pos) {
        let startY = Math.max(0, pos.y - WinCount + 1);
        let endY = Math.min(BoardSize - 1, pos.y + WinCount);
        let nWinCount = 0;
        for (let n = startY; n < endY; n++) {
            let p = { x: pos.x, y: n };
            let idx = this.PosToIndex(p);
            if (this._board[idx].type === type) {
                nWinCount++;
            } else {
                nWinCount = 0;
            }
            if (nWinCount === WinCount) {
                return true;
            }
        }
        return false;
    }

    WN_ES(type, pos) {
        let startSep = Math.min(pos.x, pos.y);
        let endSep = Math.min(BoardSize - pos.x, BoardSize - pos.y);
        let startPos = { x: pos.x - startSep, y: pos.y - startSep };
        let nWinCount = 0;
        for (let n = 0; n < startSep + endSep; n++) {
            let p = { x: startPos.x + n, y: startPos.y + n };
            let idx = this.PosToIndex(p);
            if (this._board[idx].type === type) {
                nWinCount++;
            } else {
                nWinCount = 0;
            }
            if (nWinCount === WinCount) {
                return true;
            }
        }
        return false;
    }

    EN_WS(type, pos) {

    }
};

module.exports = Game;