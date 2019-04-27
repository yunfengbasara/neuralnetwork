class Agent {
    // 默认我方1 对方-1，每次的行动都是1
    constructor() {
        this._memorySize = 50000;
        this._QTable = new Map();  // state,values
        this._learnSpeed = 0.9;
        this._lambda = 0.95;
    }

    FindMaxQValue(state) {
        let values = this._QTable.get(state);
        if (values === undefined) {
            return 0;
        }
        return Math.max(...values);
    }

    ReverseState(s) {
        let rs = s.map(a => {
            if (a === -1) return 1;
            if (a === 1) return -1;
            return 0;
        });
        return rs;
    }

    Update({ state, action, reward }) {
        // 添加新纪录
        let stateStr = state.join();
        if (!this._QTable.has(stateStr)) {
            let values = state.map(() => 0);
            this._QTable.set(stateStr, values);

            if (this._QTable.size >= this._memorySize) {
                // 删除一些记录
            }
        }

        this.UpdateQTable(stateStr, action, reward);
    }

    UpdateQTable(s, a, r) {
        let values = this._QTable.get(s);
        let stateValue = values[a];
        let nextState = s.split(",");
        nextState = nextState.map(n => parseInt(n));
        nextState[a] = 1;
        let reverseState = this.ReverseState(nextState);
        let nextMaxValue = this.FindMaxQValue(reverseState.join());
        nextMaxValue = -nextMaxValue;
        let reward = this._learnSpeed * (r + this._lambda * nextMaxValue);
        stateValue = (1 - this._learnSpeed) * stateValue + reward;
        values[a] = stateValue;
        this._QTable.set(s, values);
    }

    Print() {
        for (let [key, value] of this._QTable) {
            if (value.findIndex(v => v !== 0 && v != 0.9 && v != -0.9) == -1) {
                continue;
            }
            console.log(`state:${key}`);
            console.log(`value:${value}`);
        }
    }
}

module.exports = Agent;