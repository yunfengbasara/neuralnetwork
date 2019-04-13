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
            neuron.Bias -= neuron.NablaB / batchsize;
            neuron.Weights = optArray(neuron.Weights, neuron.NablaW, (a, b) => a - b / batchsize);
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
            console.log(neuron.Weights);
            console.log(neuron.Bias);
            console.log(neuron.LambdaZ);
            console.log(neuron.Activation);
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
        this._outputs = [];

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

    Cost(x, y) {
        return optArray(x, y, (a, b) => {
            let z = a - b;
            return Math.pow(z, 2); // / 2; 为了让输出更靠近1求导数的时候将/2加上方便运算
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

    Print() {
        // console.log(`neural network state:`);
        // let laycount = 0;
        // this._layers.forEach(layer => {
        //     console.log(`第${laycount++}层`);
        //     layer.Print();
        // });
        console.log(`cost value:${this.TotalCost()}`);
    }
}

module.exports = NeuralNetwork;
