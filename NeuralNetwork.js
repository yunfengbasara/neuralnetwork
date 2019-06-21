// 学习速度
const learnSpeed = 0.57;

// 数组操作
function optArray(a, b, opt) {
    if (a.length != b.length) {
        console.log("optArray error: a.length != b.length");
        return [];
    }

    let result = [];
    let len = a.length;
    for (let n = 0; n < len; n++) {
        let res = opt(a[n], b[n]);
        result.push(res);
    }
    return result;
}

class Nabla {
    constructor() {
        this._nabla_e = 0.0;
        this._nabla_b = 0.0;
        this._nabla_w = [];
    }
}

// neuron node
class Neuron {
    constructor() {
        this._weights = [];
        this._bias = 0.0;
        this._lambdaZ = 0.0;
        this._activation = 0.0;
        this._nabla = new Nabla;
    }

    get NablaE() { return this._nabla._nabla_e; }
    get NablaW() { return this._nabla._nabla_w; }
    get NablaB() { return this._nabla._nabla_b; }
    get LambdaZ() { return this._lambdaZ; }
    get Activation() { return this._activation; }
    get Weights() { return this._weights; }
    get Bias() { return this._bias; }
    set NablaE(v) { this._nabla._nabla_e = v; }
    set NablaW(v) { this._nabla._nabla_w = v; }
    set NablaB(v) { this._nabla._nabla_b = v; }
    set Weights(v) { this._weights = v; }
    set Bias(v) { this._bias = v; }

    CalcZ(activations) {
        let sumarray = optArray(this._weights, activations, (a, b) => a * b);
        this._lambdaZ = sumarray.reduce((prev, curr) => prev + curr, 0);
        this._lambdaZ += this._bias;
    }

    Sigmoid() {
        this._activation = 1 / (1 + Math.exp(-this._lambdaZ));
    }

    DerivativeSigmoid() {
        // Sigmoid() * (1 - Sigmoid())
        return this._activation * (1 - this._activation);
    }
}

// neuron layer
class Layer {
    constructor(size) {
        this._layer = [];
        for (let n = 0; n < size; n++) {
            this._layer.push(new Neuron);
        }
    }

    Init(w) {
        this._layer.forEach(neuron => {
            neuron.Bias = Math.random();
            neuron.NablaB = 0.0;
            for (let n = 0; n < w; n++) {
                neuron.Weights.push(Math.random());
                neuron.NablaW.push(0.0);
            }
        });
    }

    FeedForward(activations) {
        this._layer.forEach(neuron => {
            neuron.CalcZ(activations);
            neuron.Sigmoid();
        });
    }

    // last layer
    UpdateLastError(dCost, preActivations) {
        optArray(this._layer, dCost, (neuron, DerivativeCost) => {
            neuron.NablaE = DerivativeCost * neuron.DerivativeSigmoid();
            neuron.NablaB += neuron.NablaE;
            let nablaW = preActivations.map(a => a * neuron.NablaE);
            neuron.NablaW = optArray(neuron.NablaW, nablaW, (a, b) => a + b);
        });
    }

    UpdateError(nablaError, preActivations, nextWeights) {
        for (let n = 0; n < this._layer.length; n++) {
            let neuron = this._layer[n];
            // 合并nablaError
            let weights = nextWeights[n];
            let totalE = optArray(weights, nablaError, (a, b) => a * b);
            let error = totalE.reduce((prev, curr) => prev + curr, 0);
            neuron.NablaE = error * neuron.DerivativeSigmoid();
            // update nablab nablaw
            neuron.NablaB += neuron.NablaE;
            let nablaW = preActivations.map(a => a * neuron.NablaE);
            neuron.NablaW = optArray(neuron.NablaW, nablaW, (a, b) => a + b);
        }
    }

    UpdateNabla(batchsize = 1) {
        this._layer.forEach(neuron => {
            neuron.Bias -= learnSpeed * neuron.NablaB / batchsize;
            neuron.Weights = optArray(neuron.Weights, neuron.NablaW, (a, b) => a - learnSpeed * b / batchsize);
            neuron.NablaB = 0.0;
            neuron.NablaW = neuron.NablaW.map(() => 0);
        });
    }

    get Size() { return this._layer.length; }
    get Neurons() { return this._layer; }
    get Activations() { return this._layer.map(neuron => neuron.Activation); }
    get NablaError() { return this._layer.map(neuron => neuron.NablaE); }

    Print() {
        this._layer.forEach(neuron => {
            console.log(`weights: ${neuron.Weights}`);
            console.log(`bias: ${neuron.Bias}`);
            console.log(`lambdaz: ${neuron.LambdaZ}`);
            console.log(`activation: ${neuron.Activation}`);
            console.log(`nablaw: ${neuron.NablaW}`);
            console.log(`nablab: ${neuron.NablaB}`);
            console.log(`nablae: ${neuron.NablaE}`);
        });
    }
}

class NeuralNetwork {
    constructor(...args) {
        if (args.length < 3) {
            console.log("NeuralNetwork constructor error: wrong parameter");
            return;
        }

        this._inputs = [];
        for (let n = 0; n < args[0]; n++) {
            this._inputs.push(0);
        }

        this._outputs = [];
        for (let n = 0; n < args[args.length - 1]; n++) {
            this._outputs.push(0);
        }

        this._layers = [];
        for (let n = 1; n < args.length; n++) {
            this._layers.push(new Layer(args[n]));
        }

        let w = args[0];
        this._layers.forEach(layer => {
            layer.Init(w);
            w = layer.Size;
        });
    }

    set Inputs(value) {
        this._inputs = value;
    }

    set Outputs(value) {
        this._outputs = value;
    }

    get Results() {
        this.FeedForward();
        let lastLayer = this._layers[this._layers.length - 1];
        return lastLayer.Activations;
    }

    Cost(x, y) {
        return optArray(x, y, (a, b) => {
            let z = a - b;
            return Math.pow(z, 2); /// 2; //为了让输出更靠近1求导数的时候将/2加上方便运算
        });
    }

    DerivativeCost(x, y) {
        return optArray(x, y, (a, b) => a - b);
    }

    FeedForward() {
        let activations = this._inputs;
        this._layers.forEach(layer => {
            layer.FeedForward(activations);
            activations = layer.Activations;
        });
    }

    Backprop() {
        // last layer nabla error
        let lastLayer = this._layers[this._layers.length - 1];
        let DerivativeCost = this.DerivativeCost(lastLayer.Activations, this._outputs);
        let lastSecLayer = this._layers[this._layers.length - 2];
        let lastSecActivations = lastSecLayer.Activations;
        lastLayer.UpdateLastError(DerivativeCost, lastSecActivations);

        // backprop
        let nablaError = lastLayer.NablaError;
        for (let n = this._layers.length - 2; n >= 0; n--) {
            // 上层的输出
            let preActivations = this._inputs;
            if (n - 1 >= 0) {
                preActivations = this._layers[n - 1].Activations;
            }

            // 本层节点
            let curLayer = this._layers[n];

            // 下层的权重,和本层一一对应
            let nextWeights = [];
            let nextLayer = this._layers[n + 1].Neurons;
            for (let n = 0; n < curLayer.Size; n++) {
                let weights = [];
                nextLayer.forEach(neuron => weights.push(neuron.Weights[n]));
                nextWeights.push(weights);
            }

            curLayer.UpdateError(nablaError, preActivations, nextWeights);
            nablaError = curLayer.NablaError;
        }
    }

    UpdateNabla(batchsize) {
        this._layers.forEach(layer => {
            layer.UpdateNabla(batchsize);
        });
    }

    TotalCost() {
        let lastLayer = this._layers[this._layers.length - 1];
        let costList = this.Cost(lastLayer.Activations, this._outputs);
        return costList.reduce((prev, cur) => prev + cur, 0);
    }

    Minibatch(samples) {
        samples.forEach(sample => {
            this.Inputs = sample.x;
            this.Outputs = sample.y;
            this.FeedForward();
            this.Backprop();
        });
        let batchsize = samples.length;
        this.UpdateNabla(batchsize);
    }

    DebugPrint() {
        console.log(`neural network state:`);
        let laycount = 0;
        this._layers.forEach(layer => {
            console.log(`第${laycount++}层`);
            layer.Print();
        });
        console.log(`cost value:${this.TotalCost()}`);
    }

    SimplePrint() {
        console.log(`cost value:${this.TotalCost()}`);
    }

    // 精确控制神经网络初始参数(方便测试验证)
    Neurons(lay) {
        return this._layers[lay].Neurons;
    }

    Save(name) {
        let fs = require("fs");
        let file = fs.openSync(name, 'w+');

        let layers = [this._inputs.length];
        this._layers.forEach(l => layers.push(l.Size));

        // [[{weights:[],bias:},...], [{weights:[],bias:},...]]
        let layersParam = [];
        this._layers.forEach(l => {
            let p = [];
            l.Neurons.forEach(neuron => {
                let d = { weights: [], bias: 0 };
                d.weights = neuron.Weights;
                d.bias = neuron.Bias;
                p.push(d);
            });
            layersParam.push(p);
        });

        let desc = {
            layer: layers,
            params: layersParam,
        };

        fs.writeSync(file, JSON.stringify(desc));
        fs.closeSync(file);
    }

    static Load(name) {
        var fs = require("fs");
        let stats = fs.statSync(name);
        let file = fs.openSync(name, 'r');
        let buffer = new Buffer.alloc(stats.size);
        fs.readSync(file, buffer, 0, stats.size);
        let desc = JSON.parse(buffer);
        fs.closeSync(file);

        let netWork = new NeuralNetwork(...desc.layer);
        desc.params.forEach((layerparam, layer) => {
            let neurons = netWork.Neurons(layer);
            neurons.forEach((neuron, index) => {
                neuron.Weights = layerparam[index].weights;
                neuron.Bias = layerparam[index].bias;
            });
        });
        return netWork;
    }
}

module.exports = NeuralNetwork;