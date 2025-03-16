exports.name = "custom";

const shots = ["rock", "paper", "scissors"];

const histories = {};

// if opponent plays key, what is move to win
const winningMoves = {
  rock: "paper",
  paper: "scissors",
  scissors: "rock",
};

const winningMove = (opponentMove) => winningMoves[opponentMove];

const getIsConstantStrategy = (playerId) => {
  /* wait for 10 moves to determine if opponent is playing the same move each time
    probability of randomly picking the same move 10 times is (1/3) ^ 10 ~= 0 
    so we can be pretty confident if each move is the same after 10 rounds, 
    they are playing the constant strategy */
  if (histories[playerId] && histories[playerId].length > 10) {
    const firstMove = histories[playerId][0];
    return histories[playerId].every((move) => move === firstMove);
  } else return;
};

const getAreBothRandomStrategy = () => {
  /* wait for 10 moves to determine if both opponent is playing the same move each time,
    if not, they can */
  let playerStrategies = {};
  // if there has not been 10 plays yet
  if (Object.values(histories)[0] < 10) return;
  Object.keys(histories).forEach((playerId) => {
    const firstMove = histories[playerId][0];
    playerStrategies[playerId] = histories[playerId].every(
      (move) => move === firstMove
    )
      ? "constant"
      : "random";
  });
  return Object.values(playerStrategies).every(
    (strategy) => strategy === "random"
  );
};

const getIsMostFrequentMove = (playerId) => {
  // determine what move occurs most often and play that counter move
  const frequencyMap = { rock: 0, paper: 0, scissors: 0 };
  if (histories[playerId]) {
    histories[playerId].forEach((move) => {
      frequencyMap[move] += 1;
    });
    return Object.keys(frequencyMap).reduce((a, b) =>
      frequencyMap[a] > frequencyMap[b] ? a : b
    );
    // return random move because they haven't recorded any histories yet
  } else return shots[Math.floor(Math.random() * shots.length)];
};

const getBiasedMove = () => {
  let randomNum = Math.random();
  if (randomNum < 0.44) return "paper";
  else if (randomNum < 0.77) return "rock";
  else return "scissors";
};

exports.recordShot = (playerId, shot) => {
  if (!histories[playerId]) histories[playerId] = [];
  histories[playerId].push(shot);
};

exports.makeShot = (playerId) => {
  const areBothRandomStrategy = getAreBothRandomStrategy();
  const isConstantStrategy = getIsConstantStrategy(playerId);
  // if constant strategy, return counter move to the consistenly played opponent move
  if (isConstantStrategy) return winningMove(histories[playerId][0]);

  //if both random strategy, return biased move
  if (areBothRandomStrategy) return getBiasedMove();

  // if only one has random strategy, determine most frequently played and return counter move
  const mostFrequentMove = getIsMostFrequentMove(playerId);
  return winningMove(mostFrequentMove);
};

/*

SCENARIO 1: 1 player is using random strategy and 1 player is using constant strategy
----------------
to win against constant strategy:
    1) identify the move they always play 
    2) play the counter move

to win against random strategy:


If you choose random choice each time:
3 scenarios - win, lose, or draw
3 cases to win: rock beats scissors (1/3 * 1/3) * paper covers rock (1/3 * 1/3) * scissors cuts paper(1/3 * 1/3) = 1/3
3 cases to lose: rock beats scissors (1/3 * 1/3) * paper covers rock (1/3 * 1/3) * scissors cuts paper(1/3 * 1/3) = 1/3
3 cases to draw: rock  (1/3 * 1/3) * paper (1/3 * 1/3) * scissors (1/3 * 1/3) = 1/3
-- therefore, winning probability is 33.33%, losing probability is 33.33% and drawing probability is 33%
so not the best strategy

better strategy:
    1) identify the most frequent choice move
    2) play the counter move


SCENARIO 2: Both other plays are using random strategy
---------------
probability of each move being played 1/3 (opponent 1) * 1/3 (opponent 2) = 1/9
probability of winning if you play ...
    [opponent 1][opponent 2][you]

    you play rock:
    [rock] [rock] [rock] -  draw
    [rock] [paper] [rock] -  lose
    [rock] [scissors] [rock] -  win
    [paper] [rock] [rock] -  win
    [paper] [paper] [rock] -  lose
    [paper] [scissors] [rock] -  draw
    [scissors] [rock] [rock] -  lose
    [scissors] [paper] [rock] -  win
    [scissors] [scissors] [rock] -  draw

    win 3 * 1/9 = 1/3
    lose 3 * 1/9 = 1/3
    draw 3 * 1/9 = 1/3
-------
    you play paper:
    [rock] [rock] [paper] -  win
    [rock] [paper] [paper] -  win
    [rock] [scissors] [paper] -  draw
    [paper] [rock] [paper] -  win
    [paper] [paper] [paper] -  draw
    [paper] [scissors] [paper] -  lose
    [scissors] [rock] [paper] -  lose
    [scissors] [paper] [paper] -  win
    [scissors] [scissors] [paper] -  draw

    win 4 * 1/9 = 4/9
    lose 2 * 1/9 = 2/9
    draw 3 * 1/9 = 1/3
-------
    you play scissors:
    [rock] [rock] [scissors] -  lose
    [rock] [paper] [scissors] -  win
    [rock] [scissors] [scissors] -  lose
    [paper] [rock] [scissors] -  lose
    [paper] [paper] [scissors] -  win
    [paper] [scissors] [scissors] -  win
    [scissors] [rock] [scissors] -  lose
    [scissors] [paper] [scissors] -  win
    [scissors] [scissors] [scissors] -  draw

    win 2 * 1/9 = 2/9
    lose 4 * 1/9 = 4/9
    draw 3 * 1/9 = 1/3

    Paper wins 4/9 = 44% of the time
    scissors wins 2/9 = 22% of the time
    rock wins 3/9= 33% of the time

*/
