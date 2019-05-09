let MCTS = require(`./MCTS`);
let mcts = new MCTS();
mcts.Init(36);
for (let n = 0; n < 36; n++) {
    mcts.Run();
}
mcts.Print();
return;

let NeuralNetwork = require(`./NeuralNetwork`);
//let neuralNetwork = new NeuralNetwork(36, 36, 36);
let neuralNetwork = NeuralNetwork.Load(`gobang6-6`);

let Agent = require(`./QLearning`);
let agent = new Agent(neuralNetwork);
//let agent = Agent.Load(neuralNetwork);

let Game = require(`./Gobang`);
let game = new Game(agent, neuralNetwork);

function Epoch(count) {
    for (let n = 0; n < count; n++) {
        //let { gameStep, winType } = game.GenerateRandom();
        //let { gameStep, winType } = game.GenerateNeural();
        let { gameStep, winType } = game.GenerateAgent();

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

        // 平局
        if (winType === 0) {
            steps[steps.length - 1].reward = -0.1;
        }
        // 有一方获胜
        else {
            // 最后一步得分1，其他步得分0
            steps[steps.length - 1].reward = 1;
            // 整场比赛每一步得分
            // let winReward = 1;
            // let loseReward = -1;
            // for (let reidx = steps.length - 1, bWin = true;
            //     reidx >= 0; reidx-- , bWin = !bWin) {
            //     if (bWin) {
            //         steps[reidx].reward = winReward;
            //         winReward *= 0.45;
            //     } else {
            //         steps[reidx].reward = loseReward;
            //         loseReward *= 0.45;
            //     }
            // }
        }

        // 更新Qtable
        steps.forEach(step => agent.Update(step));

        // 打印最后一步
        // if (n % 100 === 0) {
        //     console.log(`step:${n} count:${steps.length}`);
        //     game.Print(steps[steps.length - 1]);
        // }

        // 打印整个棋局
        // steps.forEach((step, idx) => {
        //     console.log(`step:${idx}`);
        //     game.Print(step);
        // });

        // agent.Print();
        // agent.Save();
    }
}

let saveTime = 100;
for (let epoch = 0; epoch < 100000; epoch++) {
    // 产生样本
    Epoch(100);

    // 训练
    neuralNetwork.Minibatch(agent.GetBatchs());
    neuralNetwork.SimplePrint();

    // 保存
    if (epoch % saveTime === 0) {
        neuralNetwork.Save(`gobang6-6`);
    }
}

////////////////////////////////////////////////////
// 命令行人机对战部分
// const readline = require('readline');
// const rl = readline.createInterface({
//     input: process.stdin,
//     output: process.stdout
// });

// function GameStart() {
//     let gameStartInfo = `1.your first\r\n2.computer first\r\n3.roll game\r\n4.exit game\r\ninput 1-4:`;
//     rl.question(gameStartInfo, turn => {
//         switch (turn.trim()) {
//             case '1':
//             case '2':
//             case '3':
//                 game.NewGame(turn.trim());
//                 break;
//             case '4':
//             default:
//                 rl.close();
//                 break;
//         }
//         rl.prompt();
//     });
// }

// function GameLoop() {
//     rl.on('line', action => {
//         let result = game.HumanInput(action);
//         if (result === `human`) {
//             console.log("human win");
//             GameStart();
//             return;
//         }

//         result = game.ComputerInput();
//         if (result === `nowin`) {
//             rl.prompt();
//             return;
//         }

//         if (result === `computer`) {
//             console.log("computer win");
//             GameStart();
//             return;
//         }

//         if (result === `draw game`) {
//             console.log("draw game");
//             GameStart();
//             return;
//         }
//     });

//     rl.on('close', function () {
//         console.log(`exit game`);
//         process.exit(0);
//     });
// }

// GameStart();
// GameLoop();

////////////////////////////////////////////////////
// 神经网络测试
// let NeuralNetwork = require(`./NeuralNetwork`);
// //let Gobang = NeuralNetwork.Load(`gobang`);
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
// Gobang.Save(`gobang`);

////////////////////////////////////////////////////
// 精确控制神经网络参数测试
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