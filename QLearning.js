class Agent {
    // 默认我方1 对方-1，每次的行动都是1
    constructor() {
        this._memorySize = 5000;
        this._QTable = [];  // {state,value} action state 对应
        this._learnSpeed = 0.9;
        this._lambda = 0.95;
    }

    ArrayIsSame(a, b) {
        return a.join() === b.join();
    }

    FindQValue(state, action) {
        let qItem = this._QTable.find(item => {
            return this.ArrayIsSame(item.state, state);
        });
        if (qItem === undefined) {
            return 0;
        }
        return qItem.value[action];
    }

    SetQValue(state, action, value) {
        let index = this._QTable.findIndex(item => {
            return this.ArrayIsSame(item.state, state);
        });
        if (index === -1) {
            return;
        }
        this._QTable[index].value[action] = value;
    }

    FindMaxQValue(state) {
        let qItem = this._QTable.find(item => {
            return this.ArrayIsSame(item.state, state);
        });
        if (qItem === undefined) {
            return 0;
        }
        return Math.max(...qItem.value);
    }

    HasState(state) {
        let qItem = this._QTable.find(item => {
            return this.ArrayIsSame(item.state, state);
        });
        if (qItem === undefined) {
            return false;
        }
        return true;
    }

    AddQValue(state, value) {
        if (this._QTable.length >= this._memorySize) {
            this._QTable.shift();
        }
        this._QTable.push({ state: state, value: value });
    }

    GetNextState(s, a) {
        let ns = s.slice();
        ns[a] = 1;
        return ns;
    }

    ReverseState(s) {
        let rs = s.map(a => {
            if (a === -1) return 1;
            if (a === 1) return -1;
            return 0;
        });
        return rs;
    }

    UpdateQTable(s, a, r) {
        let stateValue = this.FindQValue(s, a);
        let nextState = this.GetNextState(s, a);
        let reverseState = this.ReverseState(nextState);
        let nextMaxValue = this.FindMaxQValue(reverseState);
        nextMaxValue = -nextMaxValue;
        let reward = this._learnSpeed * (r + this._lambda * nextMaxValue);
        stateValue = (1 - this._learnSpeed) * stateValue + reward;
        this.SetQValue(s, a, stateValue);
    }

    Print() {
        this._QTable.forEach(item => {
            console.log(`state:${item.state}`);
            console.log(`value:${item.value}`);
        });
    }
}

module.exports = Agent;