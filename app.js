let NeuralNetwork = require(`./NeuralNetwork`);
let neuralNetwork = new NeuralNetwork(36, 256, 36);
// let Gobang = new NeuralNetwork(2, 16, 1);
// let samples = [
//     { x: [1.0e-1, 2.0e-1], y: [0] },
//     { x: [1.5e-1, 3.0e-1], y: [0] },
//     { x: [1.6e-1, 3.2e-1], y: [0] },
//     { x: [2.3e-1, 4.6e-1], y: [0] },
//     { x: [3.0e-1, 6.0e-1], y: [0] },
//     { x: [3.1e-1, 6.2e-1], y: [0] },
//     { x: [3.2e-1, 6.4e-1], y: [0] },
//     { x: [3.3e-1, 6.6e-1], y: [0] },
//     { x: [3.4e-1, 6.8e-1], y: [0] },
//     { x: [3.6e-1, 7.2e-1], y: [0] },
//     { x: [3.7e-1, 7.4e-1], y: [0] },
//     { x: [3.8e-1, 7.6e-1], y: [0] },
//     { x: [3.9e-1, 7.8e-1], y: [0] },
//     { x: [1.0e-2, 2.0e-2], y: [0] },
//     { x: [1.0e-3, 2.0e-3], y: [0] },
//     { x: [1.0e-4, 2.0e-4], y: [0] },
//     { x: [5.00e-1, 10.0e-1], y: [0] },
//     { x: [1.55e-1, 3.10e-1], y: [0] },
//     { x: [2.32e-1, 4.64e-1], y: [0] },
// ];

// let testsamples = [
//     { x: [1.0e-1, 2.0e-1], y: [0] },
//     { x: [1.5e-1, 3.0e-1], y: [1] },
//     { x: [4.1e-1, 8.2e-1], y: [0] },
//     { x: [1.1e-5, 2.2e-5], y: [0] },
//     { x: [3.5e-1, 7.0e-1], y: [0] },
//     { x: [3.5e-1, 7.1e-1], y: [0] },
//     { x: [3.5e-1, 7.2e-1], y: [0] },
//     { x: [3.5e-1, 7.0e-1], y: [0.1] },
// ];

// function testNetwork(samples) {
//     console.log("test samples:");
//     samples.forEach(sample => {
//         Gobang.Inputs = sample.x;
//         Gobang.Outputs = sample.y;
//         Gobang.FeedForward();
//         Gobang.SimplePrint();
//     });
// }

// // using mini-batch stochastic gradient descent
// testNetwork(testsamples);
// for (let n = 0; n < 10000; n++) {
//     let temps = [];
//     for (let s = 0; s < 4; s++) {
//         let randomIdx = Math.floor(Math.random() * samples.length);
//         temps.push(samples[randomIdx]);
//     }
//     //Gobang.Minibatch(samples);
//     Gobang.Minibatch(temps);
// }
// testNetwork(testsamples);

let Agent = require(`./QLearning`);
let agent = new Agent;

let Game = require(`./Gobang`);
let game = new Game;

let learnStep = 0;
for (let n = 0; n < 100000; n++) {
    let { gameStep, winType } = game.Generate();

    // 单边化处理
    let steps = gameStep.map(item => {
        if (item.type === 1) {
            return { state: item.state, action: item.action, reward: 0 };
        }
        let reverseState = item.state.map(s => {
            if (s === 1) return -1;
            if (s === -1) return 1;
            return 0;
        });
        return { state: reverseState, action: item.action, reward: 0 };
    });

    // steps.forEach((step, idx) => {
    //     console.log(`step:${idx}`);
    //     game.Print(step);
    // });

    // 单边化处理后，最后一步赢，倒数第二步输
    if (winType !== 0) {
        steps[steps.length - 1].reward = 1;
        steps[steps.length - 2].reward = -1;
    }

    steps.forEach(item => {
        agent.Update(item);
    });

    // sgd
    learnStep++;
    if (learnStep === 1000) {
        learnStep = 0;
        let samples = agent.GetBatchs();

    }
}

agent.Print();

// sometest
// 精确控制神经网络参数，便于测试
// let Gobang = new NeuralNetwork(2, 2, 2);
// let neurons = Gobang.Neurons(0);
// neurons[0].Weights = [0.15, 0.20];
// neurons[0].Bias = 0.35;
// neurons[1].Weights = [0.25, 0.30];
// neurons[1].Bias = 0.35;
// neurons = Gobang.Neurons(1);
// neurons[0].Weights = [0.40, 0.45];
// neurons[0].Bias = 0.6;
// neurons[1].Weights = [0.50, 0.55];
// neurons[1].Bias = 0.6;

// Gobang.Inputs = [0.05, 0.1];
// Gobang.Outputs = [0.01, 0.99];
// Gobang.FeedForward();
// Gobang.Backprop();
// Gobang.DebugPrint();

// Gobang.UpdateNabla();
// Gobang.FeedForward();
// Gobang.DebugPrint();