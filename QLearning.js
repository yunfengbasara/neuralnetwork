class Agent {
    constructor() {
        this._memorySize = 5000;
        this._QTable = [];  // {state,value} action state 对应
        this._learnSpeed = 0.9;
        this._lambda = 0.95;
    }

    FindQValue(state, action) {
        let qItem = this._QTable.find(item => {
            return item.state === state;
        });
        if (qItem === undefined) {
            return 0;
        }
        return qItem.value[action];
    }

    SetQValue(state, action, value) {
        let index = this._QTable.findIndex(item => {
            return item.state === state;
        });
        if (index === -1) {
            return;
        }
        this._QTable[index].value[action] = value;
    }

    FindMaxQValue(state) {
        let qItem = this._QTable.find(item => {
            return item.state === state;
        });
        if (qItem === undefined) {
            return 0;
        }
        return Math.max(...qItem.value);
    }

    HasState(state) {
        let qItem = this._QTable.find(item => {
            return item.state === state;
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
        s[a] = 1;
        return s;
    }

    ReverseState(s) {
        let rs = s.map(a => {
            if (a === -1) return 1;
            if (a === 1) return -1;
        });
        return rs;
    }

    UpdateQTable(s, a, r) {
        let QSA = this.FindQValue(s, a);

    }
}

module.exports = Agent;