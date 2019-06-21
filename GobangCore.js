// Gobang rule simple

// board size 6 * 6
const BoardSize = 6;

// win piece count
const WinCount = 4;

class GobangCore {
    constructor() {
        this._curType = 0;  // -1 -2 神经网络不知道为什么，输入负数的效果居然更好？
        this._board = [];
        this._order = [];
    }

    Init() {
        this._curType = -1;
        this._board = [];
        for (let n = 0; n < BoardSize ** 2; n++) {
            this._board.push(0);
        }
        this._order = [];
    }

    GetOrderSize() {
        return this._order.length;
    }

    PrintResult() {
        let alpha = ['a', 'b', 'c', 'd', 'e', 'f'];
        let board = "   1 2 3 4 5 6\r\n";
        this._board.forEach((type, idx) => {
            if (idx !== 0 && idx % BoardSize === 0) {
                board += `|\r\n`;
            }

            if (idx % BoardSize === 0) {
                let index = Math.floor(idx / BoardSize);
                board += `${alpha[index]} `;
            }

            switch (type) {
                case 0: board += `| `; break;
                case -1: board += `|○`; break;
                case -2: board += `|x`; break;
            }
        });
        board += "|";
        console.log(board);
    }

    Print() {
        let action = this._order[this._order.length - 1];
        let board = "";
        this._board.forEach((t, idx) => {
            if (idx !== 0 && idx % BoardSize === 0) {
                board += "|\r\n";
            }
            if (idx === action) {
                board += `|●`;
                return;
            }
            switch (t) {
                case 0: board += `| `; break;
                case -1: board += `|○`; break;
                case -2: board += `|x`; break;
            }
        });
        board += "|";
        console.log(`step:${this._order.length}`);
        console.log(board);
    }

    NextTurn() {
        if (this._curType === -1) {
            this._curType = -2;
        } else {
            this._curType = -1;
        }
    }

    GoStep(idx) {
        // return: "-1" "-2" "draw" "continue" 
        let type = this._curType;
        this.NextTurn();

        this._board[idx] = type;
        this._order.push(idx);

        let pos = this.IndexToPos(idx);
        if (this.CheckWin(type, pos)) {
            return `${type}`;
        }

        if (this._order.length === (BoardSize ** 2)) {
            return "draw";
        }

        return "continue";
    }

    GetType() {
        return this._curType;
    }

    GetBoard() {
        // 单边化
        if (this._curType === -1) {
            return this._board.slice();
        }

        return this._board.map(n => {
            if (n === -1) return -2;
            if (n === -2) return -1;
            return 0;
        });
    }

    IndexToPos(idx) {
        let x = Math.floor(idx % BoardSize);
        let y = Math.floor(idx / BoardSize);
        return { x: x, y: y };
    }

    CheckWin(type, pos) {
        if (this.N_S(type, pos)) { return true; }
        if (this.W_E(type, pos)) { return true; }
        if (this.WN_ES(type, pos)) { return true; }
        if (this.EN_WS(type, pos)) { return true; }
        return false;
    }

    CheckEdge(pos) {
        if (pos.x >= 0 &&
            pos.x < BoardSize &&
            pos.y >= 0 &&
            pos.y < BoardSize) {
            return true;
        }
        return false;
    }

    CheckType(pos, type) {
        let index = pos.y * BoardSize + pos.x;
        return this._board[index] === type;
    }

    GetDirectionSameType(pos, type, diropt) {
        let nSamePiece = 0;
        while (this.CheckEdge(pos) &&
            this.CheckType(pos, type)) {
            nSamePiece++;
            diropt(pos);
        }
        return nSamePiece;
    }

    N_S(type, pos) {
        let nSamePiece = 1, checkPos = {};
        checkPos = { x: pos.x, y: pos.y - 1 };
        nSamePiece += this.GetDirectionSameType(checkPos, type, (p) => p.y--);
        if (nSamePiece >= WinCount) { return true; }
        checkPos = { x: pos.x, y: pos.y + 1 };
        nSamePiece += this.GetDirectionSameType(checkPos, type, (p) => p.y++);
        if (nSamePiece >= WinCount) { return true; }
        return false;
    }

    W_E(type, pos) {
        let nSamePiece = 1, checkPos = {};
        checkPos = { x: pos.x - 1, y: pos.y };
        nSamePiece += this.GetDirectionSameType(checkPos, type, (p) => p.x--);
        if (nSamePiece >= WinCount) { return true; }
        checkPos = { x: pos.x + 1, y: pos.y };
        nSamePiece += this.GetDirectionSameType(checkPos, type, (p) => p.x++);
        if (nSamePiece >= WinCount) { return true; }
        return false;
    }

    WN_ES(type, pos) {
        let nSamePiece = 1, checkPos = {};
        checkPos = { x: pos.x - 1, y: pos.y - 1 };
        nSamePiece += this.GetDirectionSameType(checkPos, type, (p) => (p.x-- , p.y--));
        if (nSamePiece >= WinCount) { return true; }
        checkPos = { x: pos.x + 1, y: pos.y + 1 };
        nSamePiece += this.GetDirectionSameType(checkPos, type, (p) => (p.x++ , p.y++));
        if (nSamePiece >= WinCount) { return true; }
        return false;
    }

    EN_WS(type, pos) {
        let nSamePiece = 1, checkPos = {};
        checkPos = { x: pos.x + 1, y: pos.y - 1 };
        nSamePiece += this.GetDirectionSameType(checkPos, type, (p) => (p.x++ , p.y--));
        if (nSamePiece >= WinCount) { return true; }
        checkPos = { x: pos.x - 1, y: pos.y + 1 };
        nSamePiece += this.GetDirectionSameType(checkPos, type, (p) => (p.x-- , p.y++));
        if (nSamePiece >= WinCount) { return true; }
        return false;
    }
};

module.exports = GobangCore;