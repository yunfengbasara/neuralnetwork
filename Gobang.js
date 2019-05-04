// Gobang rule

// board size 6 * 6
const BoardSize = 6;

// win piece count
const WinCount = 4;

class Game {
    constructor(agent, neural) {
        this._type = [1, -1];
        this._curType = 0;
        this._board = [];
        this._order = [];
        this._explore = 0.1;    // 处于智能体的时候探索概率
        this._agent = agent;
        this._neural = neural;
    }

    NewGame(turn) {
        this.Init();
        switch (turn) {
            case `1`: this._type = [1, -1]; break;
            case `2`: this._type = [-1, 1]; break;
            case `3`: this.Shuffle(this._type); break;
        }

        if (this.GetCurType() === -1) {
            this.ComputerInput();
        } else {
            this.PrintResult();
        }
    }

    HumanInput(pos) {
        // a1 = 0
        let alpha = ['a', 'b', 'c', 'd', 'e', 'f'];
        let posary = pos.split("");
        let row = alpha.findIndex(n => n == posary[0]);
        let action = row * BoardSize + parseInt(posary[1] - 1);
        let curtype = this.GetCurType();
        this._board[action] = curtype;
        this.PrintResult();
        this.NextTurn();
        if (this.CheckWin(curtype, this.IndexToPos(action))) {
            return "human";
        }
        return "nowin";
    }

    ComputerInput() {
        let curtype = this.GetCurType();
        let action = this.GenerateNeuralStep(curtype);
        if (action === -1) {
            return "draw game";
        }
        this._board[action] = curtype;
        this.PrintResult();
        this.NextTurn();
        if (this.CheckWin(curtype, this.IndexToPos(action))) {
            return "computer";
        }
        return "nowin";
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

    // 根据神经网络产生智能棋局
    GenerateNeural() {
        this.Init();

        // {state:board, action:index, type:1 -1}
        let gameStep = [];
        let winType = 0;

        let curtype = this.GetCurType();
        let action = this.GenerateNeuralStep(curtype);
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
            action = this.GenerateNeuralStep(curtype);
        }

        return { gameStep, winType };
    }

    // 根据神经网络选择最优一步
    GenerateNeuralStep(type) {
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
        this._neural.Inputs = board;
        let values = this._neural.Results;
        return this.OptimizationStep(values, board);
    }

    // 根据QTable产生智能棋局
    GenerateAgent() {
        this.Init();

        let gameStep = [];
        let winType = 0;

        let curtype = this.GetCurType();
        let action = this.GenerateAgentStep(curtype);
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
            action = this.GenerateAgentStep(curtype);
        }

        return { gameStep, winType };
    }

    // 根据QTable选择最优一步
    GenerateAgentStep(type) {
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

        let state = board.join(",");
        let values = this._agent.QTable.get(state);
        // 如果q表没找到,从神经网络中生成
        if (values === undefined) {
            this._neural.Inputs = board;
            values = this._neural.Results;
        }

        return this.OptimizationStep(values, board);
    }

    // 找到最佳一步
    OptimizationStep(values, board) {
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