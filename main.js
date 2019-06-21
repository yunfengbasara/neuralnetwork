const LEARNSPEED = 0.55;
const ROUNDSIZE = 5;
const TRACETIME = 1000;
const SAVECOUNT = 10;

function SelectBestPos(policy, board) {
    policy.Inputs = board;
    let values = policy.Results;
    let bestValue = 0;
    let bestPos = 0;
    values.forEach((v, n) => {
        if (board[n] !== 0) {
            return;
        }
        if (v < bestValue) {
            return;
        }
        bestValue = v;
        bestPos = n;
    });
    return bestPos;
}

function UpdateValues(policy, { state, action }, isWin) {
    policy.Inputs = state;
    let results = policy.Results;

    if (isWin) {
        results[action] += LEARNSPEED;
    } else {
        results[action] -= LEARNSPEED;
    }

    if (results[action] > 1) {
        results[action] = 1;
    }

    if (results[action] < 0) {
        results[action] = 0;
    }

    return { x: state, y: results };
}

function GetSamples(game, policy, print) {
    game.Init();
    let black = [];
    let white = [];
    let win = "continue";
    while (win === "continue") {
        let type = game.GetType();
        let board = game.GetBoard();
        let bestPos = SelectBestPos(policy, board);
        win = game.GoStep(bestPos);

        if (type === -1) {
            black.push({ state: board, action: bestPos });
        } else {
            white.push({ state: board, action: bestPos });
        }

        if (print) {
            game.Print();
        }
    }

    // update values
    let isBlackWin = false;
    let isWhiteWin = false;
    if (win === "-1") {
        isBlackWin = true;
    } else if (win === "-2") {
        isWhiteWin = true;
    }

    let samplesblack = black.map(step => UpdateValues(policy, step, isBlackWin));
    let sampleswhite = white.map(step => UpdateValues(policy, step, isWhiteWin));

    return sampleswhite.concat(samplesblack);
}

function Training(game, policy, print) {
    let samples = [];
    for (let trace = 0; trace < ROUNDSIZE; trace++) {
        samples = samples.concat(GetSamples(game, policy, print));
    }

    for (let trace = 0; trace < TRACETIME; trace++) {
        policy.Minibatch(samples);
    }
}

function Epoch(episode, policy, game) {
    // first
    Training(game, policy, false);
    game.PrintResult();

    for (let trace = 0; trace < episode - 2; trace++) {
        Training(game, policy, false);
    }

    // last
    Training(game, policy, false);
    game.PrintResult();
}

function main() {
    let NeuralNetwork = require(`./NeuralNetwork`);
    let GobangCore = require(`./GobangCore`);

    //let policyNetwork = new NeuralNetwork(36, 16, 36);
    let policyNetwork = NeuralNetwork.Load(`gobangpolicy`);
    let gobangCore = new GobangCore();

    // Epoch(SAVECOUNT, policyNetwork, gobangCore);
    // return;

    while (new Date().getHours() !== 18) {
        Epoch(SAVECOUNT, policyNetwork, gobangCore);
        policyNetwork.Save(`gobangpolicy`);
    }
}

main();