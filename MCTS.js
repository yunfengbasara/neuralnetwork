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
    get Parent() {return this._parent;}
    get Children() { return this._children; }
    get UnExpands() {return this._unExpands;}

    set Win(v) { this._win = v; }
    set Total(v) { this._total = v; }
    set Index(v) { this._index = v; }
    set Parent(v) {this._parent = v;}
    set Children(v) { this._children = v; }
    set UnExpands(v) {this._unExpands = v;}

    UCB() {
        if(this._total === 0 || 
            this._parent === null || 
            this._parent.Total === 0) {
            return Math.random() * 1e5;
        } 

        let winRate = this._win / this._total;
        let lambda =  Math.sqrt(this._parent.Total / this._total);
        return  winRate + Confident * lambda;
    }

    Selection() {
        if (this._unExpands.length !== 0) {
            return this.Expansion();
        }

        let maxUCB = 0;
        let selecNode = {};
        this._children.forEach(n => {
            let ucb = n.UCB();
            if ( ucb < maxUCB) {
                return;
            }
            maxUCB = ucb;
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
        this._simulationWin = 0;
    }

    Init(size) {
        this._root = new Node();
        for(let index = 0; index < size; index++) {
            this._root.UnExpands.push(index);
        }
    }

    Run() {
        let node = this.Selection();
        this.Simulation(node);
        this.Backpropagation(node);
    }

    Selection() {
        let node = this._root.Selection();
        while (node.Total !== 0) {
            node = node.Selection();
        }
        return node;
    }

    Simulation(node) {
        this._simulationWin = Math.floor(Math.random() * 2);
        node.Win += this._simulationWin;
        node.Total++;
    }

    Backpropagation(node) {
        let parent = node.Parent;
        while (parent !== null) {
            parent.Total++;
            parent.Win += this._simulationWin;
            parent = parent.Parent;
        }
    }

    Print() {
        let expands = this._root.Children.map(n => n.Index);
        let unexpands = this._root.UnExpands.slice();
        console.log(`expands:${expands}`);
        console.log(`unexpands:${unexpands}`);
    }
}

module.exports = MCTS;