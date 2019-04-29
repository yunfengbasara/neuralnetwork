class Agent {
    // 默认我方1 对方-1，每次的行动都是1
    constructor() {
        this._memorySize = 100000;   // Q表总大小
        this._cacheSize = 5000;      // 缓冲空间
        this._batch = 100;           // 获取样本间隔
        this._QTable = new Map();    // state,values
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

    Update({ state, action, reward }) {
        if (this._QTable.size < this._memorySize) {
            this.UpdateQTable(state, action, reward);
            return;
        }

        // 删除旧记录
        let delSize = this._cacheSize;
        for (let [key] of this._QTable) {
            this._QTable.delete(key);
            if (delSize-- == 0) {
                break;
            }
        }
    }

    UpdateQTable(s, a, r) {
        let stateStr = s.join(",");
        let values = s.map(() => 0);
        if (this._QTable.has(stateStr)) {
            values = this._QTable.get(stateStr);
        }

        let nState = s.slice();
        nState[a] = 1;
        nState = nState.map(a => {
            if (a === -1) return 1;
            if (a === 1) return -1;
            return 0;
        });

        let nStateStr = nState.join(",");
        let nMaxValue = this.FindMaxQValue(nStateStr);
        if (nMaxValue === 0 && r === 0 && values[a] === 0) {
            return;
        }

        nMaxValue = -nMaxValue;
        let reward = this._learnSpeed * (r + this._lambda * nMaxValue);
        values[a] = (1 - this._learnSpeed) * values[a] + reward;
        this._QTable.set(stateStr, values);
    }

    GetBatchs() {
        let totalSize = Math.min(this._batch, this._QTable.size);
        let destIndex = Math.floor(Math.random() * totalSize);
        let samples = [];
        let srcIndex = -1;
        for (let [key, values] of this._QTable) {
            srcIndex++;
            if (srcIndex !== destIndex) {
                continue;
            }
            srcIndex = -1;
            destIndex = this._batch;
            let state = key.split(",");
            state = state.map(n => parseInt(n));

            samples.push({ x: state, y: values });
        }
        return samples;
    }

    Print() {
        for (let [key, value] of this._QTable) {
            // if (value.findIndex(v => v !== 0 && v != 0.9 && v != -0.9) == -1) {
            //     continue;
            // }
            console.log(`state:${key}`);
            console.log(`value:${value}`);
        }
    }
}

module.exports = Agent;