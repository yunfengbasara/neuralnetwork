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
    get IsLeaf() { return this._children.length === 0; }    // 是否叶子节点

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
        // 优先扩展
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
        // 如果该节点为叶节点，返回本身
        if (this._children.length === 0) {
            return this;
        }

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
    constructor(game) {
        this._root = new Node();
        this._nextWin = false;  // 隔层设置胜负
        this._game = game;
        for (let index = 0; index < game.BoardSize; index++) {
            this._root.UnExpands.push(index);
        }
    }

    get Root() { return this._root; }

    Run() {
        let node = this.Selection();
        let actions = this.GetActions(node);
        this.Simulation(node, actions);
        this.Backpropagation(node);
    }

    GetActions(node) {
        let actions = [node.Index];
        while (node.Parent !== this._root) {
            node = node.Parent;
            actions.push(node.Index);
        }
        return actions;
    }

    Selection() {
        let node = this._root.Selection();
        while (node.Total !== 0) {
            node = node.Selection();
        }
        return node;
    }

    Simulation(node, actions) {
        // 该节点尝试总数+1
        node.Total++;
        // 模拟返回胜利类型
        let winType = this._game.Simulation(actions);
        // 当前节点类型
        let curType = [1, -1][actions.length - 1 % 2];
        // 模拟结果是当前节点胜利
        if (winType === curType) {
            this._nextWin = false;
            node.Win++;
        }
        else {
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
        // let node = this._root.SelectMaxValue();
        // while (!node.IsLeaf) {
        //     node = node.SelectMaxValue();
        // }
        // console.log(`index:${node.Index}`);
        // console.log(`win/total:${node.Win}/${node.Total}`);

        // let line = this.GetLine(node);
        // console.log(`line:${line}`);
        this._game.PrintResult();
    }
}

module.exports = MCTS;