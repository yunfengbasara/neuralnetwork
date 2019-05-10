// weight param
const Confident = 1.41;

// Monte Carlo Tree Search Node Desc
class Node {
    constructor() {
        this._win = 0;
        this._total = 0;
        this._index = -1;
        this._parent = null;
        this._children = [];
        this._unExpands = [];
    }

    get Win() { return this._win; }
    get Total() { return this._total; }
    get Index() { return this._index; }
    get Parent() { return this._parent; }
    get Children() { return this._children; }
    get UnExpands() { return this._unExpands; }

    set Win(v) { this._win = v; }
    set Total(v) { this._total = v; }
    set Index(v) { this._index = v; }
    set Parent(v) { this._parent = v; }
    set Children(v) { this._children = v; }
    set UnExpands(v) { this._unExpands = v; }

    UCB() {
        if (this._total === 0 ||
            this._parent === null ||
            this._parent.Total === 0) {
            return Math.random() * 1e5;
        }

        let winRate = this._win / this._total;
        let lambda = Math.sqrt(this._parent.Total / this._total);
        return winRate + Confident * lambda;
    }

    Value() {
        if (this._total === 0) {
            return 0;
        }

        return this._win / this._total;
    }

    Selection() {
        if (this._unExpands.length !== 0) {
            return this.Expansion();
        }

        let maxUCB = 0;
        let selecNode = {};
        this._children.forEach(n => {
            let ucb = n.UCB();
            if (ucb < maxUCB) {
                return;
            }
            maxUCB = ucb;
            selecNode = n;
        });
        return selecNode;
    }

    SelectMaxValue() {
        let maxValue = 0;
        let selecNode = {};
        this._children.forEach(n => {
            let value = n.Value();
            if (value < maxValue) {
                return;
            }
            maxValue = value;
            selecNode = n;
        });
        return selecNode;
    }

    Expansion() {
        let rd = Math.floor(Math.random() * this._unExpands.length);
        let rm = this._unExpands.splice(rd, 1);
        let child = new Node();
        child.Index = rm[0];
        child.Parent = this;
        child.UnExpands = this.GetUnExpands(rm[0]);
        this._children.push(child);
        return child;
    }

    GetUnExpands(index) {
        let unExpands = this._unExpands.filter(n => n !== index);
        let childrenIndex = this._children.map(c => c.Index);
        return unExpands.concat(childrenIndex);
    }
}

// Monte Carlo Tree Search with UCB
class MCTS {
    constructor() {
        this._root = {};
        this._nextWin = false;  // 隔层设置胜负
    }

    Init(size) {
        this._root = new Node();
        for (let index = 0; index < size; index++) {
            this._root.UnExpands.push(index);
        }
    }

    Run() {
        let { node, line } = this.Selection();
        this.Simulation(node);
        this.Backpropagation(node);
    }

    SelectMaxValue() {
        return this._root.SelectMaxValue();
    }

    Selection() {
        let line = [];
        let node = this._root.Selection();
        line.push(node.Index);
        while (node.Total !== 0) {
            node = node.Selection();
            line.push(node.Index);
        }
        return { node, line };
    }

    Simulation(node) {
        node.Total++;
        if (Math.floor(Math.random() * 2)) {
            this._nextWin = false;
            node.Win++;
        } else {
            this._nextWin = true;
        }
    }

    Backpropagation(node) {
        let parent = node.Parent;
        while (parent !== null) {
            parent.Total++;
            this._nextWin ? 0 : parent.Win++;
            this._nextWin = !this._nextWin;
            parent = parent.Parent;
        }
    }

    Print() {
        // let { node, line } = this.Selection();
        // let expands = node.Children.map(n => n.Index);
        // let unexpands = node.UnExpands.slice();
        // console.log(`expands:${expands}`);
        // console.log(`unexpands:${unexpands}`);
        // console.log(`line:${line}`);
        // console.log(`index:${node.Index}`);
        // console.log(`win/total:${node.Win}/${node.Total}`);

        // let parent = node.Parent;
        // while (parent !== null) {
        //     console.log(`index:${parent.Index}`);
        //     console.log(`win/total:${parent.Win}/${parent.Total}`);
        //     parent = parent.Parent;
        // }
    }
}

module.exports = MCTS;