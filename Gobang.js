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
    }

    IndexToPos(idx) {
        let x = Math.floor(idx / BoardSize);
        let y = Math.floor(idx % BoardSize);
        return { x: x, y: y };
    }
};

module.exports = Game;