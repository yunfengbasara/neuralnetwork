class Agent {
    // 默认我方1 对方-1，每次的行动都是1
    constructor(neural) {
        this._memorySize = 100000;   // Q表总大小
        this._cacheSize = 5000;      // 缓冲空间
        this._batch = 100;           // 获取样本间隔
        this._QTable = new Map();    // state,values
        this._learnSpeed = 0.9;
        this._lambda = 0.95;
        this._min = -1;              // 归一化处理
        this._max = 1;
        this._neural = neural;
    }

    get QTable() { return this._QTable; }
    set QTable(qtable) { this._QTable = qtable; }

    FindMaxQValue(state) {
        let values = this._QTable.get(state);
        if (values === undefined) {
            return 0;
        }

        let states = state.split(",");
        let tmpvalues = values.filter((_, index) => states[index] == "0");
        return Math.max(...tmpvalues);
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
        // 从Q表中获取
        if (this._QTable.has(stateStr)) {
            values = this._QTable.get(stateStr);
        }
        // 从神经网路中获取
        else {
            this._neural.Inputs = s;
            values = this._neural.Results;
            let sep = this._max - this._min;
            values = values.map((v, index) => {
                if (s[index] !== 0) {
                    return 0;
                }
                return v * sep + this._min;
            });
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

        // 阈值处理
        if (this._min > values[a]) {
            values[a] = this._min;
        }

        if (this._max < values[a]) {
            values[a] = this._max;
        }

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

            // Min-max normalization
            let sep = this._max - this._min;
            let tmpvalues = values.map(v => (v - this._min) / sep);
            samples.push({ x: state, y: tmpvalues });
        }
        return samples;
    }

    Print() {
        for (let [key, value] of this._QTable) {
            console.log(`state:${key}`);
            console.log(`value:${value}`);
        }
    }

    Save() {
        let fs = require("fs");
        let file = fs.openSync(`qlearning_temp`, 'w+');
        let qtablelist = [];
        for (let [key, value] of this._QTable) {
            qtablelist.push({ s: key, v: value });
        }
        fs.writeSync(file, JSON.stringify(qtablelist));
        fs.closeSync(file);
    }

    static Load(neural) {
        var fs = require("fs");
        let stats = fs.statSync(`qlearning_temp`);
        let file = fs.openSync(`qlearning_temp`, 'r');
        let buffer = new Buffer.alloc(stats.size);
        fs.readSync(file, buffer, 0, stats.size);
        let qtablelist = JSON.parse(buffer);
        fs.closeSync(file);

        let QTable = new Map();
        qtablelist.forEach(item => {
            QTable.set(item.s, item.v);
        });
        let agent = new Agent(neural);
        agent.QTable = QTable;
        return agent;
    }

}

module.exports = Agent;