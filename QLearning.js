class Agent {
    // 默认我方1 对方-1，每次的行动都是1
    constructor() {
        this._memorySize = 10000;   // Q表总大小
        this._cacheSize = 1000;     // 缓冲空间
        this._QTable = new Map();   // state,values
        this._learnSpeed = 0.9;
        this._lambda = 0.95;
        this._learnStart = false;   // 是否开始学习一次
    }

    get LearnStart() { return this._learnStart; }

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
        this._learnStart = false;
        // 删除旧记录
        if (this._QTable.size >= this._memorySize) {
            this._learnStart = true;
            let delSize = this._cacheSize;
            for (let [key] of this._QTable) {
                this._QTable.delete(key);
                if (delSize-- == 0) {
                    break;
                }
            }
        }

        // 添加新纪录
        let stateStr = state.join();
        if (!this._QTable.has(stateStr)) {
            let values = state.map(() => 0);
            this._QTable.set(stateStr, values);
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
        console.log(this._QTable.size);
        return;
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