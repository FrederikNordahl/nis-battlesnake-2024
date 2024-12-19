export const mockTournament = {
  id: "mock-tournament-1",
  matches: [
    {
      id: "m1",
      roundIndex: 0,
      players: [
        { id: 1, name: "Python Warrior", snakeName: "Warrior" },
        { id: 2, name: "Cobra Strike", snakeName: "Cobra" },
      ],
      winnerPlayerId: 1,
    },
    {
      id: "m2",
      roundIndex: 0,
      players: [
        { id: 3, name: "Viper Elite", snakeName: "Viper" },
        { id: 4, name: "Anaconda", snakeName: "Ana" },
      ],
      winnerPlayerId: 3,
    },
    {
      id: "m3",
      roundIndex: 0,
      players: [
        { id: 5, name: "Mamba", snakeName: "Black Mamba" },
        { id: 6, name: "Python X", snakeName: "PythonX" },
      ],
      winnerPlayerId: 5,
    },
    {
      id: "m4",
      roundIndex: 0,
      players: [
        { id: 7, name: "Boa Master", snakeName: "Boa" },
        { id: 8, name: "Snake Pro", snakeName: "Pro" },
      ],
      winnerPlayerId: 7,
    },
    {
      id: "m5",
      roundIndex: 1,
      players: [
        { id: 1, name: "Python Warrior", snakeName: "Warrior" },
        { id: 3, name: "Viper Elite", snakeName: "Viper" },
      ],
      winnerPlayerId: 1,
    },
    {
      id: "m6",
      roundIndex: 1,
      players: [
        { id: 5, name: "Mamba", snakeName: "Black Mamba" },
        { id: 7, name: "Boa Master", snakeName: "Boa" },
      ],
      winnerPlayerId: 5,
    },
    {
      id: "m7",
      roundIndex: 2,
      players: [
        { id: 1, name: "Python Warrior", snakeName: "Warrior" },
        { id: 5, name: "Mamba", snakeName: "Black Mamba" },
      ],
      winnerPlayerId: 1,
    },
  ],
};

export const mockPlayers = mockTournament.matches[0].players.map((player) => ({
  ...player,
  snakeUrl: `http://localhost:8000/snake${player.id}`,
}));
