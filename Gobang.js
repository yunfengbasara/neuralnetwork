// Gobang rule

// board size 6 * 6
const BoardSize = 6;

// win piece count
const WinCount = 4;

class Game {
    constructor() {
        this._type = [1, -1];
        this._curType = 0;
        this._board = [];
        this._order = [];
        this._explore = 0.1;    // 处于智能体的时候探索概率
    }

    Init() {
        this.Shuffle(this._type);
        this._curType = 0;

        this._board = [];
        for (let n = 0; n < BoardSize ** 2; n++) {
            // type: empty black white 0 1 -1
            this._board.push(0);
        }

        this._order = [];
        for (let n = 0; n < BoardSize ** 2; n++) {
            this._order.push(n);
        }
    }

    // 产生随机比赛
    GenerateRandom() {
        this.Init();
        this.Shuffle(this._order);

        // {state:board, action:index, type:1 -1}
        let gameStep = [];
        let winType = 0;

        for (let n = 0; n < this._order.length; n++) {
            let index = this._order[n];
            let curtype = this.GetCurType();

            gameStep.push({
                state: this._board.slice(),
                action: index,
                type: curtype,
            });

            this._board[index] = curtype;

            if (this.CheckWin(curtype, this.IndexToPos(index))) {
                winType = curtype;
                break;
            }
            this.NextTurn();
        }
        return { gameStep, winType };
    }

    // 产生智能棋局
    GenerateNeural(neuralNetwork) {
        this.Init();

        // {state:board, action:index, type:1 -1}
        let gameStep = [];
        let winType = 0;

        let curtype = this.GetCurType();
        let action = this.GenerateNeuralStep(neuralNetwork, curtype);
        while (action !== -1) {
            gameStep.push({
                state: this._board.slice(),
                action: action,
                type: curtype,
            });

            this._board[action] = curtype;

            if (this.CheckWin(curtype, this.IndexToPos(action))) {
                winType = curtype;
                break;
            }

            this.NextTurn();
            curtype = this.GetCurType();
            action = this.GenerateNeuralStep(neuralNetwork, curtype);
        }

        return { gameStep, winType };
    }

    GenerateNeuralStep(neuralNetwork, type) {
        let board = this._board;
        // 探索概率
        if (Math.random() < this._explore) {
            let emptySpace = [];
            board.forEach((v, index) => v === 0 ? emptySpace.push(index) : 0);
            if (emptySpace.length === 0) {
                return -1;
            }
            this.Shuffle(emptySpace);
            return emptySpace[0];
        }

        // 单边化
        if (type === -1) {
            board = this._board.map(s => {
                if (s === 1) return -1;
                if (s === -1) return 1;
                return 0;
            });
        }
        neuralNetwork.Inputs = board;
        let values = neuralNetwork.Results;
        let step = -1;
        let maxV = -Number.MIN_VALUE;
        values.forEach((v, index) => {
            if (board[index] !== 0) {
                return;
            };

            if (v < maxV) {
                return;
            }

            maxV = v;
            step = index;
        });

        return step;
    }

    GenerateQTable(qtable) {
        this.Init();

        let gameStep = [];
        let winType = 0;

        let curtype = this.GetCurType();
        let action = this.GenerateQTableStep(qtable, curtype);
        while (action !== -1) {
            gameStep.push({
                state: this._board.slice(),
                action: action,
                type: curtype,
            });

            this._board[action] = curtype;

            if (this.CheckWin(curtype, this.IndexToPos(action))) {
                winType = curtype;
                break;
            }

            this.NextTurn();
            curtype = this.GetCurType();
            action = this.GenerateQTableStep(qtable, curtype);
        }

        return { gameStep, winType };
    }

    GenerateQTableStep(qtable, type) {
        let board = this._board;
        if (type === -1) {
            board = this._board.map(s => {
                if (s === 1) return -1;
                if (s === -1) return 1;
                return 0;
            });
        }

        let state = board.join(",");
        let values = qtable.get(state);
        if (values === undefined || Math.random() < this._explore) {
            let emptySpace = [];
            board.forEach((v, index) => v === 0 ? emptySpace.push(index) : 0);
            if (emptySpace.length === 0) {
                return -1;
            }
            this.Shuffle(emptySpace);
            return emptySpace[0];
        }

        let step = -1;
        let maxV = -Number.MAX_VALUE;
        values.forEach((v, index) => {
            if (board[index] !== 0) {
                return;
            };

            // 给与随机特性
            let newV = v + Math.random() * 1e-5
            if (newV < maxV) {
                return;
            }

            maxV = newV;
            step = index;
        });

        return step;
    }

    PrintResult() {
        let board = "";
        this._board.forEach((type, idx) => {
            if (idx !== 0 && idx % BoardSize === 0) {
                board += "|\r\n";
            }
            switch (type) {
                case 0: board += `| `; break;
                case 1: board += `|○`; break;
                case -1: board += `|x`; break;
            }
        });
        board += "|";
        console.log(board);
    }

    Print({ state, action }) {
        let board = "";
        state.forEach((t, idx) => {
            if (idx !== 0 && idx % BoardSize === 0) {
                board += "|\r\n";
            }
            if (idx === action) {
                board += `|●`;
                return;
            }
            switch (t) {
                case 0: board += `| `; break;
                case 1: board += `|○`; break;
                case -1: board += `|x`; break;
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

module.exports = Game;