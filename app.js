let NeuralNetwork = require(`./NeuralNetwork.js`);
let Gomoku = new NeuralNetwork(2, 16, 1);
let samples = [
    { x: [1.0e-1, 2.0e-1], y: [0] },
    { x: [1.5e-1, 3.0e-1], y: [0] },
    { x: [1.6e-1, 3.2e-1], y: [0] },
    { x: [2.3e-1, 4.6e-1], y: [0] },
    { x: [3.0e-1, 6.0e-1], y: [0] },
    { x: [3.1e-1, 6.2e-1], y: [0] },
    { x: [3.2e-1, 6.4e-1], y: [0] },
    { x: [3.3e-1, 6.6e-1], y: [0] },
    { x: [3.4e-1, 6.8e-1], y: [0] },
    { x: [3.6e-1, 7.2e-1], y: [0] },
    { x: [3.7e-1, 7.4e-1], y: [0] },
    { x: [3.8e-1, 7.6e-1], y: [0] },
    { x: [3.9e-1, 7.8e-1], y: [0] },
    { x: [1.0e-2, 2.0e-2], y: [0] },
    { x: [1.0e-3, 2.0e-3], y: [0] },
    { x: [1.0e-4, 2.0e-4], y: [0] },
    { x: [5.00e-1, 10.0e-1], y: [0] },
    { x: [1.55e-1, 3.10e-1], y: [0] },
    { x: [2.32e-1, 4.64e-1], y: [0] },
];

function minibatch(samples) {
    samples.forEach(sample => {
        Gomoku.Inputs = sample.x;
        Gomoku.Outputs = sample.y;
        Gomoku.FeedForward();
        Gomoku.Backprop();
    });
    let batchsize = samples.length;
    Gomoku.UpdateNabla(batchsize);
}

let testsamples = [
    { x: [1.0e-1, 2.0e-1], y: [0] },
    { x: [1.5e-1, 3.0e-1], y: [1] },
    { x: [4.1e-1, 8.2e-1], y: [0] },
    { x: [1.1e-5, 2.2e-5], y: [0] },
    { x: [3.5e-1, 7.0e-1], y: [0] },
    { x: [3.5e-1, 7.1e-1], y: [0] },
    { x: [3.5e-1, 7.2e-1], y: [0] },
    { x: [3.5e-1, 7.0e-1], y: [0.1] },
];

function testNetwork(samples) {
    console.log("test samples:");
    samples.forEach(sample => {
        Gomoku.Inputs = sample.x;
        Gomoku.Outputs = sample.y;
        Gomoku.FeedForward();
        Gomoku.SimplePrint();
    });
}

// SGD
testNetwork(testsamples);
for (let n = 0; n < 10000; n++) {
    let temps = [];
    for (let s = 0; s < 4; s++) {
        let randomIdx = Math.floor(Math.random() * samples.length);
        temps.push(samples[randomIdx]);
    }
    //minibatch(samples);
    minibatch(temps);
}
testNetwork(testsamples);

// sometest
// 精确控制神经网络参数，便于测试
// let Gomoku = new NeuralNetwork(2, 2, 2);
// let neurons = Gomoku.Neurons(0);
// neurons[0].Weights = [0.15, 0.20];
// neurons[0].Bias = 0.35;
// neurons[1].Weights = [0.25, 0.30];
// neurons[1].Bias = 0.35;
// neurons = Gomoku.Neurons(1);
// neurons[0].Weights = [0.40, 0.45];
// neurons[0].Bias = 0.6;
// neurons[1].Weights = [0.50, 0.55];
// neurons[1].Bias = 0.6;

// Gomoku.Inputs = [0.05, 0.1];
// Gomoku.Outputs = [0.01, 0.99];
// Gomoku.FeedForward();
// Gomoku.Backprop();
// Gomoku.DebugPrint();

// Gomoku.UpdateNabla();
// Gomoku.FeedForward();
// Gomoku.DebugPrint();