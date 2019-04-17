// Gobang rule

// board size 6 * 6
const BoardSize = 6;

// win piece count
const WinCount = 4;

class Game {
    constructor() {
        this._type = ["black", "white"];
        this._curType = 0;
        this._board = [];
        this._order = [];
    }

    Init() {
        this.Shuffle(this._type);
        this._curType = 0;

        this._board = [];
        for (let n = 0; n < BoardSize ** 2; n++) {
            // type: empty black white
            // order: 1 2 3 4 ……
            this._board.push({ type: "empty", order: 0 });
        }

        this._order = [];
        for (let n = 0; n < BoardSize ** 2; n++) {
            this._order.push(n);
        }
        this.Shuffle(this._order);
    }

    Run() {
        for (let n = 0; n < this._order.length; n++) {
            let ord = this._order[n];
            this._board[ord] = { type: this.GetCurType(), order: n };
            if (this.CheckWin(this.GetCurType(), this.IndexToPos(ord))) {
                return { winner: this.GetCurType() };
            }
            this.NextTurn();
        }
        return { winner: "draw game" };
    }

    Print() {
        let board = "";
        this._board.forEach((item, idx) => {
            if (idx !== 0 && idx % BoardSize === 0) {
                board += "|\r\n";
            }
            switch (item.type) {
                case "empty": board += `| `; break;
                case "black": board += `|x`; break;
                case "white": board += `|o`; break;
            }
        });
        board += "|";
        console.log(board);
    }

    GetCurType() {
        return this._type[this._curType];
    }

    NextTurn() {
        this._curType++;
        this._curType %= this._type.length;
    }

    Shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            let j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    IndexToPos(idx) {
        let x = Math.floor(idx % BoardSize);
        let y = Math.floor(idx / BoardSize);
        return { x: x, y: y };
    }

    PosToIndex(pos) {
        return pos.y * BoardSize + pos.x;
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
        let index = this.PosToIndex(pos);
        return this._board[index].type === type;
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

module.exports = Game;