let NeuralNetwork = require(`./NeuralNetwork.js`);
let Gomoku = new NeuralNetwork(2, 4, 1);

let samples = [
    { x: [0.1, 0.2], y: [0] },
    { x: [1.5, 3.0], y: [0] },
    { x: [1.6, 3.2], y: [0] },
    { x: [2.3, 4.6], y: [0] },
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
    { x: [0.1, 0.2], y: [0] },
    { x: [1.5, 3.0], y: [1] },
    { x: [4.1, 8.2], y: [0] },
    { x: [4e5, 8e5], y: [0] },
    { x: [1e-5, 2e-5], y: [0] },
];

function testNetwork(samples) {
    console.log("test samples:");
    samples.forEach(sample => {
        Gomoku.Inputs = sample.x;
        Gomoku.Outputs = sample.y;
        Gomoku.FeedForward();
        Gomoku.Print();
    });
}

testNetwork(testsamples);
for (let n = 0; n < 10000; n++) {
    minibatch(samples);
}
testNetwork(testsamples);
