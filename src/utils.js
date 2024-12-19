// utils.js
const API_BASE = "https://bs-api.desperate.dk/api";
const POLL_INTERVAL = 5000; // 5 seconds

// LocalStorage key
export const STORAGE_KEYS = {
  TOURNAMENT_ID: "battlesnake_tournament_id",
};

// Konami code sequence
export const KONAMI_CODE = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "KeyB",
  "KeyA",
];

export const saveTournamentId = (id) => {
  localStorage.setItem(STORAGE_KEYS.TOURNAMENT_ID, id.toString());
};

export const getSavedTournamentId = () => {
  return localStorage.getItem(STORAGE_KEYS.TOURNAMENT_ID);
};

export const clearSavedTournamentId = () => {
  localStorage.removeItem(STORAGE_KEYS.TOURNAMENT_ID);
};

export const fetchTournament = async (tournamentId) => {
  const response = await fetch(`${API_BASE}/tournament/${tournamentId}`);
  if (!response.ok) throw new Error("Failed to fetch tournament");
  return await response.json();
};

export const fetchPlayers = async () => {
  const response = await fetch(`${API_BASE}/players`);
  if (!response.ok) throw new Error("Failed to fetch players");
  return await response.json();
};

export const addPlayer = async (playerData) => {
  const response = await fetch(`${API_BASE}/player`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(playerData),
  });
  if (!response.ok) throw new Error("Failed to add player");
};

export const createTournament = async (playerIds) => {
  const response = await fetch(`${API_BASE}/tournament`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ playerIds }),
  });
  if (!response.ok) throw new Error("Failed to create tournament");
  return await response.json();
};

export const generateMatches = async (tournamentId, isOneVsOne) => {
  const response = await fetch(
    `${API_BASE}/tournament/${tournamentId}/generate-matches/${isOneVsOne}`,
    { method: "POST" }
  );
  if (!response.ok) throw new Error("Failed to generate matches");
  return await response.json();
};

export const startGame = async (tournamentId) => {
  const response = await fetch(
    `${API_BASE}/tournament/${tournamentId}/start-game`,
    { method: "POST" }
  );
  if (!response.ok) throw new Error("Failed to start games");
};

export const advanceRound = async (tournamentId, isOneVsOne) => {
  const response = await fetch(
    `${API_BASE}/tournament/${tournamentId}/advance-round/${isOneVsOne}`,
    { method: "POST" }
  );
  if (!response.ok) throw new Error("Failed to advance round");
  return await response.json();
};

export const checkForActiveRound = (tournament) => {
  return tournament.rounds.findIndex((round) =>
    round.matches.some(
      (match) => match.players.length > 0 && !match.winnerPlayerId
    )
  );
};

export const getInitialPlayerState = () => ({
  name: "",
  snakeName: "",
  snakeUrl: "",
});

export const isValidTournamentId = (id) => {
  return id !== "" && !isNaN(id);
};
