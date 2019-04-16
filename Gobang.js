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

        this._board[0] = { type: "black", order: 0 };
        this._board[6] = { type: "black", order: 0 };
        this._board[12] = { type: "black", order: 0 };
        this._board[18] = { type: "black", order: 0 };
        this._board[24] = { type: "black", order: 0 };
        this._board[30] = { type: "black", order: 0 };
        console.log(this.CheckWin("black", { x: 1, y: 0 }));
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
        if (this.N_S(type, pos)) {
            return true;
        }
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
        let StartX = Math.max(0, pos.x - WinCount + 1);
        let startY = Math.max(0, pos.y - WinCount + 1);
        let endX = Math.min(BoardSize - 1, pos.x + WinCount);
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

    EN_WS(type, pos) {

    }
};

module.exports = Game;