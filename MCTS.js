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
    get IsLeaf() { return (this._children.length + this._unExpands.length) === 0; }
    get Value() { return this._total === 0 ? 0 : this._win / this._total; }
    get ChildrenCount() { return this._children.length + this._unExpands.length; }

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

    Selection() {
        // 优先扩展
        if (this._unExpands.length !== 0) {
            return { node: this.Expansion(), isNew: true };
        }

        // 如果该节点为叶节点
        if (this._children.length === 0) {
            return { node: this, isNew: false };
        }

        // 从子节点中选择一个
        let maxUCB = 0;
        let selecNode = null;
        this._children.forEach(n => {
            let ucb = n.UCB();
            if (ucb < maxUCB) {
                return;
            }
            maxUCB = ucb;
            selecNode = n;
        });
        return { node: selecNode, isNew: false };
    }

    SelectMaxValue() {
        // 如果该节点无子节点，返回本身
        if (this._children.length === 0) {
            return this._index;
        }

        let selectNode = {};
        selectNode.Value = 0;
        selectNode.ChildrenCount = Number.MAX_VALUE;
        this._children.forEach(n => {
            if (n.Value < selectNode.Value) {
                return;
            }
            // 优先选择可扩展机会少的，意味着终局
            if (n.ChildrenCount <= selectNode.ChildrenCount) {
                selectNode = n;
            }
        });
        return selectNode.Index;
    }

    SelectNextNode(index) {
        if (index === this._index) {
            return null;
        }

        let nodes = this._children.filter(n => n.Index === index);
        if (nodes.length === 0) {
            return null;
        }
        return nodes[0];
    }

    Expansion() {
        // 采用随机扩展比较高的概率获得最优值
        let randomIndex = Math.floor(Math.random() * this._unExpands.length);
        let index = this._unExpands[randomIndex];
        this._unExpands.splice(randomIndex, 1);

        let child = new Node();
        child.Index = index;
        child.Parent = this;
        child.UnExpands = this.GetUnExpands();
        this._children.push(child);
        return child;
    }

    GetUnExpands() {
        let childrenIndex = this._children.map(c => c.Index);
        return this._unExpands.concat(childrenIndex);
    }
}

// Monte Carlo Tree Search with UCB
class MCTS {
    constructor(game) {
        this._nextWin = false;  // 隔层设置胜负
        this._game = game;
        this._root = new Node();
        for (let n = 0; n < game.BoardSize; n++) {
            //|| n === 15
            //if (n === 14 || n === 21) continue;
            this._root.UnExpands.push(n);
        }
        this._curNode = this._root;
        this._tryTimes = 36 * 36 * 36;
        this._totalNodes = 0;
    }

    SelectMaxValue() {
        return this._curNode.SelectMaxValue();
    }

    SetCurrentNode(index) {
        let nextNode = this._curNode.SelectNextNode(index);
        if (nextNode === null) {
            return false;
        }
        this._curNode = nextNode;
        return true;
    }

    Simulate() {
        for (let n = 0; n < this._tryTimes; n++) {
            let { node, isNew } = this.Selection(this._curNode);
            let actions = this.GetActions(node);
            // if (actions.length === 3) {
            //     if (actions[0] === 32 && actions[1] === 31 && actions[2] === 35) {
            //         let i = 0;
            //     }
            // }
            this.Simulation(node, actions);
            this.Backpropagation(node);

            if (isNew) {
                this._totalNodes++;
            }
        }
    }

    GetActions(node) {
        let actions = [node.Index];
        while (node.Parent !== this._root) {
            node = node.Parent;
            actions.push(node.Index);
        }
        // 按照顺序下子
        return actions.reverse();
    }

    Selection(startNode) {
        let { node, isNew } = startNode.Selection();
        // 如果不是叶子节点，继续向下寻找
        while (!node.IsLeaf && node.Total !== 0) {
            ({ node, isNew } = node.Selection());
        }
        return { node, isNew };
    }

    Simulation(node, actions) {
        // 该节点尝试总数+1
        node.Total++;
        // 模拟返回胜利类型
        let { win, end } = this._game.Simulation(actions);
        // 当前节点类型
        let current = (actions.length - 1) % 2 === 0 ? 1 : -1;
        // 模拟结果是当前节点胜利
        if (win === current) {
            this._nextWin = false;
            node.Win++;
        }
        else {
            this._nextWin = true;
        }
        // 如果游戏结束,将该节点的扩展列表清空
        if (end) {
            node.UnExpands = [];
        }
    }

    Backpropagation(node) {
        let parent = node.Parent;
        while (parent !== null) {
            parent.Total++;
            this._nextWin ? parent.Win++ : 0;
            this._nextWin = !this._nextWin;
            parent = parent.Parent;
        }
    }

    Print() {
        console.log(this._totalNodes);
        console.log(`current_index:${this._curNode.Index}`);
        console.log(`current_win/total:${this._curNode.Win}/${this._curNode.Total}`);
        let details = this._curNode.Children.map(n => `${n.Index}(${n.Win}/${n.Total})`);
        console.log(`- ${details.join(';')}`);

        // this.SetCurrentNode(31);
        // console.log(`current_index:${this._curNode.Index}`);
        // console.log(`current_win/total:${this._curNode.Win}/${this._curNode.Total}`);
        // details = this._curNode.Children.map(n => `${n.Index}(${n.Win}/${n.Total})`);
        // console.log(`- ${details.join(';')}`);

        // this.SetCurrentNode(32);
        // console.log(`current_index:${this._curNode.Index}`);
        // console.log(`current_win/total:${this._curNode.Win}/${this._curNode.Total}`);
        // details = this._curNode.Children.map(n => `${n.Index}(${n.Win}/${n.Total})`);
        // console.log(`- ${details.join(';')}`);
    }
}

module.exports = MCTS;