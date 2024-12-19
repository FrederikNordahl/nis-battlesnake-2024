import React, { useState, useEffect, useRef } from "react";
import { Play, ChevronRight, Plus, ChevronDown, ChevronUp } from "lucide-react";
import TournamentBracket from "./TournamentBracket";

const API_BASE = "http://85.90.245.193:8080/api";
const POLL_INTERVAL = 5000; // 5 seconds

export default function App() {
  const [tournament, setTournament] = useState(null);
  const [players, setPlayers] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isPlayerFormOpen, setIsPlayerFormOpen] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const [tournamentIdInput, setTournamentIdInput] = useState("");
  const [isOneVsOne, setIsOneVsOne] = useState(true);
  const pollingInterval = useRef(null);
  const [newPlayer, setNewPlayer] = useState({
    name: "",
    snakeName: "",
    snakeUrl: "",
  });

  useEffect(() => {
    fetchPlayers();
    return () => {
      stopPolling();
    };
  }, []);

  const startPolling = (tournamentId) => {
    setIsPolling(true);
    pollingInterval.current = setInterval(() => {
      fetchTournament(tournamentId);
    }, POLL_INTERVAL);
  };

  const stopPolling = () => {
    if (pollingInterval.current) {
      clearInterval(pollingInterval.current);
      setIsPolling(false);
    }
  };

  const fetchTournament = async (tournamentId) => {
    try {
      const response = await fetch(`${API_BASE}/tournament/${tournamentId}`);
      if (!response.ok) throw new Error("Failed to fetch tournament");
      const data = await response.json();
      setTournament(data);

      // Find active round (first round without all winners)
      const activeRoundIndex = data.rounds.findIndex((round) =>
        round.matches.some(
          (match) => match.players.length > 0 && !match.winnerPlayerId
        )
      );

      // If no active round found, all matches are complete
      if (activeRoundIndex === -1) {
        stopPolling();
      }
    } catch (err) {
      setError("Failed to fetch tournament updates");
      stopPolling();
    }
  };

  const fetchPlayers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/players`);
      if (!response.ok) throw new Error("Failed to fetch players");
      const data = await response.json();
      setPlayers(data);
    } catch (err) {
      setError("Failed to fetch players. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const loadTournament = async (e) => {
    e.preventDefault();
    if (!tournamentIdInput) return;

    try {
      setLoading(true);
      await fetchTournament(tournamentIdInput);
    } catch (err) {
      setError("Failed to load tournament");
    } finally {
      setLoading(false);
    }
  };

  const addPlayer = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/player`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPlayer),
      });
      if (!response.ok) throw new Error("Failed to add player");
      setNewPlayer({ name: "", snakeName: "", snakeUrl: "" });
      await fetchPlayers();
      setIsPlayerFormOpen(false);
    } catch (err) {
      setError("Failed to add player. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const createTournament = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/tournament`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerIds: players.map((p) => p.id) }),
      });
      if (!response.ok) throw new Error("Failed to create tournament");
      const data = await response.json();
      setTournament(data);
      setTournamentIdInput(data.id.toString());
      await generateMatches(data.id);
    } catch (err) {
      setError("Failed to create tournament. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const generateMatches = async (tournamentId) => {
    try {
      const response = await fetch(
        `${API_BASE}/tournament/${tournamentId}/generate-matches/${isOneVsOne}`,
        { method: "POST" }
      );
      if (!response.ok) throw new Error("Failed to generate matches");
      const data = await response.json();
      setTournament(data);
    } catch (err) {
      setError("Failed to generate matches. Please try again.");
    }
  };

  const startGame = async () => {
    if (!tournament) return;
    setLoading(true);
    try {
      const startResponse = await fetch(
        `${API_BASE}/tournament/${tournament.id}/start-game`,
        { method: "POST" }
      );
      if (!startResponse.ok) throw new Error("Failed to start games");
      startPolling(tournament.id);
    } catch (err) {
      setError("Failed to start game. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const advanceRound = async () => {
    if (!tournament) return;
    setLoading(true);
    try {
      const response = await fetch(
        `${API_BASE}/tournament/${tournament.id}/advance-round/${isOneVsOne}`,
        { method: "POST" }
      );
      if (!response.ok) throw new Error("Failed to advance round");
      const data = await response.json();
      setTournament(data);
      stopPolling(); // Stop polling when advancing to next round
    } catch (err) {
      setError("Failed to advance round. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 overflow-auto bg-gradient-to-br from-purple-900 to-indigo-900 min-h-screen">
      <h1 className="text-4xl font-bold mb-8 text-cyan-300 font-mono text-center sticky top-0 z-10 bg-gradient-to-r from-purple-900 to-indigo-900 py-4">
        NIS Battlesnake Tournament 2024
      </h1>

      {error && (
        <div className="border-2 border-pink-500 p-4 mb-6 bg-pink-500/10 text-pink-500 font-mono">
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Tournament Bracket */}
      {tournament && <TournamentBracket tournament={tournament} />}

      {/* Tournament Controls */}
      <div className="mt-8 mb-8">
        <div className="p-6 border-2 border-pink-500 bg-purple-900/80 backdrop-blur rounded-lg">
          <h2 className="text-lg font-mono text-pink-500 mb-6">
            Tournament Controls
            {tournament && (
              <span className="text-sm ml-2 opacity-75">
                (ID: {tournament.id})
              </span>
            )}
          </h2>

          {/* Mode Toggle */}
          <div className="mb-6">
            <label className="flex items-center space-x-3 text-pink-500 font-mono cursor-pointer">
              <input
                type="checkbox"
                checked={isOneVsOne}
                onChange={(e) => setIsOneVsOne(e.target.checked)}
                className="form-checkbox h-5 w-5 text-pink-500 border-pink-500 rounded focus:ring-pink-500"
              />
              <span>1v1 Mode</span>
            </label>
          </div>

          {/* Tournament ID Input */}
          <form onSubmit={loadTournament} className="mb-6 flex gap-4">
            <input
              type="number"
              value={tournamentIdInput}
              onChange={(e) => setTournamentIdInput(e.target.value)}
              placeholder="Enter Tournament ID"
              className="px-3 py-2 bg-purple-900/80 border-2 border-pink-500 text-pink-500 focus:border-pink-400 font-mono rounded-lg flex-1"
            />
            <button
              type="submit"
              disabled={loading || !tournamentIdInput}
              className="px-6 py-2 border-2 border-pink-500 text-pink-500 hover:bg-pink-500/20 disabled:opacity-50 font-mono rounded-lg whitespace-nowrap"
            >
              Load Tournament
            </button>
          </form>

          <div className="flex space-x-4">
            {!tournament ? (
              <button
                onClick={createTournament}
                disabled={loading || players.length < 2}
                className="flex items-center px-6 py-2 border-2 border-pink-500 text-pink-500 hover:bg-pink-500/20 disabled:opacity-50 font-mono rounded-lg"
              >
                {loading ? "CREATING..." : "START TOURNAMENT"}
              </button>
            ) : (
              <>
                <button
                  onClick={startGame}
                  disabled={loading || isPolling}
                  className="flex items-center px-6 py-2 border-2 border-pink-500 text-pink-500 hover:bg-pink-500/20 disabled:opacity-50 font-mono rounded-lg"
                >
                  <Play className="h-4 w-4 mr-2" />
                  {loading
                    ? "STARTING..."
                    : isPolling
                    ? "IN PROGRESS..."
                    : "START GAMES"}
                </button>
                <button
                  onClick={advanceRound}
                  disabled={loading || isPolling}
                  className="flex items-center px-6 py-2 border-2 border-pink-500 text-pink-500 hover:bg-pink-500/20 disabled:opacity-50 font-mono rounded-lg"
                >
                  <ChevronRight className="h-4 w-4 mr-2" />
                  ADVANCE ROUND
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Available Snakes */}
      <div className="mb-8">
        <div className="p-6 border-2 border-pink-500 bg-purple-900/80 backdrop-blur rounded-lg">
          <h2 className="text-lg font-mono text-pink-500 mb-6">
            Available Snakes ({players.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {players.map((player) => (
              <div
                key={player.id}
                className="border-2 border-pink-500 p-4 rounded-lg hover:bg-pink-500/10 transition-colors"
              >
                <div className="font-mono text-pink-500 text-lg">
                  {player.name}
                </div>
                <div className="text-sm text-pink-400 font-mono mt-1">
                  {player.snakeName}
                </div>
                <div className="text-xs text-pink-300 font-mono mt-1 truncate">
                  {player.snakeUrl}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add New Snake */}
      <div>
        <button
          onClick={() => setIsPlayerFormOpen(!isPlayerFormOpen)}
          className="w-full flex items-center justify-between p-4 bg-pink-500/10 border-2 border-pink-500 text-pink-500 hover:bg-pink-500/20 transition-colors font-mono rounded-lg"
        >
          <span className="flex items-center">Add New Snake</span>
          {isPlayerFormOpen ? <ChevronUp /> : <ChevronDown />}
        </button>

        {isPlayerFormOpen && (
          <div className="mt-2 p-6 border-2 border-pink-500 bg-purple-900/80 backdrop-blur rounded-lg">
            <form onSubmit={addPlayer} className="space-y-4">
              <div>
                <label className="block text-pink-500 font-mono mb-1">
                  Player Name
                </label>
                <input
                  className="w-full px-3 py-2 bg-purple-900/80 border-2 border-pink-500 text-pink-500 focus:border-pink-400 font-mono rounded-lg"
                  value={newPlayer.name}
                  onChange={(e) =>
                    setNewPlayer((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  required
                />
              </div>
              <div>
                <label className="block text-pink-500 font-mono mb-1">
                  Snake Name
                </label>
                <input
                  className="w-full px-3 py-2 bg-purple-900/80 border-2 border-pink-500 text-pink-500 focus:border-pink-400 font-mono rounded-lg"
                  value={newPlayer.snakeName}
                  onChange={(e) =>
                    setNewPlayer((prev) => ({
                      ...prev,
                      snakeName: e.target.value,
                    }))
                  }
                  required
                />
              </div>
              <div>
                <label className="block text-pink-500 font-mono mb-1">
                  Snake URL
                </label>
                <input
                  className="w-full px-3 py-2 bg-purple-900/80 border-2 border-pink-500 text-pink-500 focus:border-pink-400 font-mono rounded-lg"
                  value={newPlayer.snakeUrl}
                  onChange={(e) =>
                    setNewPlayer((prev) => ({
                      ...prev,
                      snakeUrl: e.target.value,
                    }))
                  }
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center px-6 py-2 border-2 border-pink-500 text-pink-500 hover:bg-pink-500/20 disabled:opacity-50 font-mono rounded-lg"
              >
                <Plus className="h-4 w-4 mr-2" />
                {loading ? "LOADING..." : "ADD SNAKE"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
