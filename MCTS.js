// weight param
const Confident = 1 / 1.41;

// Monte Carlo Tree Search Node Desc
class Node {
    constructor(index, parent) {
        this._win = 0;
        this._simulations = 0;
        this._index = index;
        this._parent = parent;
        this._children = [];
        this._finish = false;
    }

    get Win() { return this._win; }
    get Simulations() { return this._simulations; }
    get Index() { return this._index; }
    get Parent() { return this._parent; }
    get Children() { return this._children; }
    get Finish() { return this._finish; }

    get WinRate() {
        if (this._simulations === 0) {
            return 0;
        }
        return this._win / this._simulations;
    }

    get UCB() {
        // 如果是未扩展的节点,返回随机数值
        if (this._simulations === 0) {
            return Math.random() * 1e5;
        }

        let winRate = this._win / this._simulations;
        let lambda = Math.sqrt(Math.log(this._parent.Simulations) / this._simulations);
        return winRate + Confident * lambda;
    }

    set Win(v) { this._win = v; }
    set Simulations(v) { this._simulations = v; }
    set Index(v) { this._index = v; }
    set Parent(v) { this._parent = v; }
    set Children(v) { this._children = v; }
    set Finish(v) { this._finish = v; }

    SetChildren(indexarray) {
        this._children = indexarray.map(n => new Node(n, this));
    }

    BrotherHaveFinish() {
        if (this._parent === null) {
            return false;
        }
        let finishinode = this._parent.Children.find(n => n.Finish);
        if (finishinode !== undefined) {
            return true;
        }
        return false;
    }

    Selection() {
        // 如果该节点没有模拟
        if (this._simulations === 0) {
            return this;
        }

        // 如果该节点是finish节点
        if (this._finish) {
            return this;
        }

        // 如果该节点没有子节点,扩展阶段
        if (this._children.length === 0) {
            // 如果该节点的兄弟节点有finish
            // 不用扩展,优化mcts剪枝
            if (this.BrotherHaveFinish()) {
                return this;
            }
            this.Expand();
            return this.Selection();
        }

        // 如果该节点模拟过并且有子节点,递归寻找
        let selectNode = {};
        selectNode.UCB = 0;
        this._children.forEach(n => {
            if (n.UCB > selectNode.UCB) {
                selectNode = n;
            }
        });
        return selectNode.Selection();
    }

    Expand() {
        // 获取父节点的所有子节点序号
        let childrenIndex = this._parent.Children.map(c => c.Index);

        // 删除本节点序号
        let index = childrenIndex.indexOf(this._index);
        childrenIndex.splice(index, 1);

        this.SetChildren(childrenIndex);
    }

    SelectBestNode() {
        let bestNode = {};
        bestNode.WinRate = 0;
        bestNode.Simulations = 0;
        this._children.forEach(n => {
            if (n.Simulations < bestNode.Simulations) {
                return;
            }
            // if (n.WinRate < bestNode.WinRate) {
            //     return;
            // }
            bestNode = n;
        });
        return bestNode;
    }
}

// Monte Carlo Tree Search with UCB
class MCTS {
    constructor(game) {
        this._nextWin = false;  // 隔层设置胜负
        this._game = game;

        let childrenindex = [];
        for (let n = 0; n < game.BoardSize; n++) {
            //if (n === 14 || n === 21) continue;
            childrenindex.push(n);
        }

        this._root = new Node(-1, null);
        this._root.SetChildren(childrenindex);
        this._root.Simulations = 1;     // 设置根节点模拟次数

        this._curNode = this._root;
        this._tryTimes = 36 * 36 * 36;
    }

    SelectBestNode() {
        return this._curNode.SelectBestNode();
    }

    SetCurrentNode(node) {
        this._curNode = node;
    }

    SetCurrentIndex(index) {
        let node = this._curNode.Children.find(n => n.Index === index);
        if (node !== undefined) {
            this._curNode = node;
        }
    }

    Simulate() {
        for (let n = 0; n < this._tryTimes; n++) {
            let node = this._curNode.Selection();
            let actions = this.GetActions(node);
            this.Simulation(node, actions);
            this.Backpropagation(node);
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

    Simulation(node, actions) {
        // 模拟返回胜利类型
        let { win, end } = this._game.Simulation(actions);
        node.Finish = end;
        node.Simulations++;

        // 当前节点类型
        let current = (actions.length - 1) % 2 === 0 ? 1 : -1;
        if (win === current) {
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
            parent.Simulations++;
            this._nextWin ? parent.Win++ : 0;
            this._nextWin = !this._nextWin;
            parent = parent.Parent;
        }
    }

    Print() {
        console.log(`current_index:${this._curNode.Index}`);
        console.log(`current_win/total:${this._curNode.Win}/${this._curNode.Simulations}`);
        let details = this._curNode.Children.map(n => `${n.Index}(${n.Win}/${n.Simulations})`);
        console.log(`- ${details.join(';')}`);

        // this.SetCurrentNode(31);
        // console.log(`current_index:${this._curNode.Index}`);
        // console.log(`current_win/total:${this._curNode.Win}/${this._curNode.Simulations}`);
        // details = this._curNode.Children.map(n => `${n.Index}(${n.Win}/${n.Simulations})`);
        // console.log(`- ${details.join(';')}`);

        // this.SetCurrentNode(32);
        // console.log(`current_index:${this._curNode.Index}`);
        // console.log(`current_win/total:${this._curNode.Win}/${this._curNode.Simulations}`);
        // details = this._curNode.Children.map(n => `${n.Index}(${n.Win}/${n.Simulations})`);
        // console.log(`- ${details.join(';')}`);
    }
}

module.exports = MCTS;