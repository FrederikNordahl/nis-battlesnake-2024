// App.jsx
import React, { useState, useEffect, useRef } from "react";
import { Play, ChevronRight, Plus, ChevronDown, ChevronUp } from "lucide-react";
import TournamentBracket from "./TournamentBracket";
import {
  KONAMI_CODE,
  fetchTournament,
  fetchPlayers,
  addPlayer,
  createTournament,
  generateMatches,
  startGame,
  advanceRound,
  checkForActiveRound,
  getInitialPlayerState,
  isValidTournamentId,
  saveTournamentId,
  getSavedTournamentId,
  clearSavedTournamentId,
} from "./utils";

const POLL_INTERVAL = 5000;

export default function App() {
  const [tournament, setTournament] = useState(null);
  const [players, setPlayers] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isPlayerFormOpen, setIsPlayerFormOpen] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const [tournamentIdInput, setTournamentIdInput] = useState("");
  const [isOneVsOne, setIsOneVsOne] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const pollingInterval = useRef(null);
  const [newPlayer, setNewPlayer] = useState(getInitialPlayerState());
  const [keySequence, setKeySequence] = useState([]);

  useEffect(() => {
    const handleKeyUp = (event) => {
      setKeySequence((prev) => {
        const newSequence = [...prev, event.code].slice(-KONAMI_CODE.length);

        if (JSON.stringify(newSequence) === JSON.stringify(KONAMI_CODE)) {
          setIsAdmin(true);
          return [];
        }

        return newSequence;
      });
    };

    window.addEventListener("keyup", handleKeyUp);
    return () => window.removeEventListener("keyup", handleKeyUp);
  }, []);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Load players first
        await initializePlayers();

        // Check for saved tournament
        const savedId = getSavedTournamentId();
        if (savedId) {
          setTournamentIdInput(savedId);
          try {
            const data = await fetchTournament(savedId);
            setTournament(data);
          } catch (err) {
            // If the tournament can't be loaded, clear the saved ID
            clearSavedTournamentId();
            setError("Saved tournament could not be loaded");
          }
        }
      } catch (err) {
        setError("Failed to initialize application");
      } finally {
        setInitializing(false);
      }
    };

    initializeApp();
    return () => stopPolling();
  }, []);

  const initializePlayers = async () => {
    try {
      setLoading(true);
      const playersData = await fetchPlayers();
      setPlayers(playersData);
    } catch (err) {
      setError("Failed to fetch players. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const startPolling = (tournamentId) => {
    setIsPolling(true);
    pollingInterval.current = setInterval(() => {
      pollTournament(tournamentId);
    }, POLL_INTERVAL);
  };

  const stopPolling = () => {
    if (pollingInterval.current) {
      clearInterval(pollingInterval.current);
      setIsPolling(false);
    }
  };

  const pollTournament = async (tournamentId) => {
    try {
      const data = await fetchTournament(tournamentId);
      setTournament(data);

      const activeRoundIndex = checkForActiveRound(data);
      if (activeRoundIndex === -1) {
        stopPolling();
      }
    } catch (err) {
      setError("Failed to fetch tournament updates");
      stopPolling();
    }
  };

  const handleLoadTournament = async (e) => {
    e.preventDefault();
    if (!isValidTournamentId(tournamentIdInput)) return;

    try {
      setLoading(true);
      const data = await fetchTournament(tournamentIdInput);
      setTournament(data);
      saveTournamentId(tournamentIdInput);
    } catch (err) {
      setError("Failed to load tournament");
      clearSavedTournamentId();
    } finally {
      setLoading(false);
    }
  };

  const handleAddPlayer = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addPlayer(newPlayer);
      setNewPlayer(getInitialPlayerState());
      await initializePlayers();
      setIsPlayerFormOpen(false);
    } catch (err) {
      setError("Failed to add player. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTournament = async () => {
    setLoading(true);
    try {
      const tournamentData = await createTournament(players.map((p) => p.id));
      setTournament(tournamentData);
      setTournamentIdInput(tournamentData.id.toString());
      saveTournamentId(tournamentData.id);
      await handleGenerateMatches(tournamentData.id);
    } catch (err) {
      setError("Failed to create tournament. Please try again.");
      clearSavedTournamentId();
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateMatches = async (tournamentId) => {
    try {
      const data = await generateMatches(tournamentId, isOneVsOne);
      setTournament(data);
    } catch (err) {
      setError("Failed to generate matches. Please try again.");
    }
  };

  const handleStartGame = async () => {
    if (!tournament) return;
    setLoading(true);
    try {
      await startGame(tournament.id);
      startPolling(tournament.id);
    } catch (err) {
      setError("Failed to start game. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAdvanceRound = async () => {
    if (!tournament) return;
    setLoading(true);
    try {
      const data = await advanceRound(tournament.id, isOneVsOne);
      setTournament(data);
      stopPolling();
    } catch (err) {
      setError("Failed to advance round. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (initializing) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-900 to-indigo-900">
        <div className="text-cyan-300 font-mono text-xl">
          Loading tournament...
        </div>
      </div>
    );
  }

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

      {tournament && (
        <TournamentBracket isPolling={isPolling} tournament={tournament} />
      )}

      {isAdmin && (
        <>
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

              <form onSubmit={handleLoadTournament} className="mb-6 flex gap-4">
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
                    onClick={handleCreateTournament}
                    disabled={loading || players.length < 2}
                    className="flex items-center px-6 py-2 border-2 border-pink-500 text-pink-500 hover:bg-pink-500/20 disabled:opacity-50 font-mono rounded-lg"
                  >
                    {loading ? "CREATING..." : "START TOURNAMENT"}
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleStartGame}
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
                      onClick={handleAdvanceRound}
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
                <form onSubmit={handleAddPlayer} className="space-y-4">
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
        </>
      )}
    </div>
  );
}
