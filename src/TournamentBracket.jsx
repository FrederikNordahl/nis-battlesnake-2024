import React from "react";

const MATCH_WIDTH = 300;
const PLAYER_HEIGHT = 100;
const HORIZONTAL_GAP = 100;
const BASE_PADDING = 20;
const DEFAULT_HEIGHT = 200;

const SNAKE_COLORS = [
  "bg-yellow-200",
  "bg-green-200",
  "bg-blue-200",
  "bg-red-200",
  "bg-purple-200",
  "bg-pink-200",
  "bg-cyan-200",
  "bg-orange-200",
];

export default function TournamentBracket({ tournament }) {
  if (!tournament?.rounds) {
    return null;
  }

  const rounds = tournament.rounds;
  const totalWidth = rounds.length * (MATCH_WIDTH + HORIZONTAL_GAP);

  function getMatchHeight(match) {
    const playerCount = match?.players?.length || 0;
    return playerCount === 0 ? DEFAULT_HEIGHT : playerCount * PLAYER_HEIGHT;
  }

  function getVerticalGap(match) {
    return getMatchHeight(match) + BASE_PADDING;
  }

  const firstRoundMatches = rounds[0]?.matches || [];
  const totalHeight = firstRoundMatches.reduce((acc, match) => {
    return acc + getVerticalGap(match);
  }, 0);

  function getMatchPosition(roundIndex, matchIndex) {
    const x = roundIndex * (MATCH_WIDTH + HORIZONTAL_GAP);
    const matchesInThisRound = rounds[roundIndex]?.matches || [];
    const totalSpaceForRound = totalHeight;
    const spaceBetweenMatches = totalSpaceForRound / matchesInThisRound.length;
    const y = matchIndex * spaceBetweenMatches;
    return { x, y };
  }

  function getSnakeColor(playerId) {
    return SNAKE_COLORS[playerId % SNAKE_COLORS.length];
  }

  function renderSnake(player, match) {
    if (!player) return null;

    const isWinner = player.id === match.winnerPlayerId;
    const isSecond = player.id === match.secondPlacePlayerId;
    const snakeColor = getSnakeColor(player.id);

    return (
      <div
        key={player.id}
        className={`p-4 rounded-lg transition-colors ${snakeColor} ${
          isWinner
            ? "ring-2 ring-yellow-300"
            : isSecond
            ? "ring-2 ring-cyan-300"
            : ""
        }`}
      >
        <div className="text-xs text-black font-mono opacity-75 break-words">
          {player.name}
        </div>
        <div
          className={`font-mono text-sm ${isWinner && "font-bold text-xl"} ${
            isSecond && "font-bold"
          } text-black leading-tight break-words mt-1`}
        >
          {player.snakeName}
          {isWinner && " 🏆"}
          {isSecond && " 🥈"}
        </div>
      </div>
    );
  }

  function renderMatch(match, roundIndex, matchIndex) {
    if (!match?.players) return null;

    const { x, y } = getMatchPosition(roundIndex, matchIndex);
    const matchHeight = getMatchHeight(match);
    const isInProgress = match.players.length > 0 && !match.winnerPlayerId;

    return (
      <foreignObject
        key={match.id}
        x={x}
        y={y}
        width={MATCH_WIDTH}
        height={matchHeight}
      >
        <div className="border-2 border-pink-500 rounded-lg bg-purple-900/80 backdrop-blur p-4 w-full h-full shadow-lg shadow-cyan-500/30">
          {isInProgress && (
            <div className="text-cyan-300 font-mono text-sm mb-2 animate-pulse">
              Matches in progress...
            </div>
          )}
          <div className="space-y-3">
            {match.players.map((player) => renderSnake(player, match))}
          </div>
        </div>
      </foreignObject>
    );
  }

  function renderConnectingLines(roundIndex, matchIndex) {
    if (roundIndex === rounds.length - 1) return null;

    const startMatch = getMatchPosition(roundIndex, matchIndex);
    const endMatch = getMatchPosition(
      roundIndex + 1,
      Math.floor(matchIndex / 2)
    );

    const currentMatch = rounds[roundIndex].matches[matchIndex];
    const matchHeight = getMatchHeight(currentMatch);

    const startX = startMatch.x + MATCH_WIDTH;
    const startY = startMatch.y + matchHeight / 2;
    const endX = endMatch.x;
    const endY =
      endMatch.y +
      getMatchHeight(
        rounds[roundIndex + 1].matches[Math.floor(matchIndex / 2)]
      ) /
        2;

    const midX = startX + (endX - startX) / 2;

    return (
      <path
        key={`line-${roundIndex}-${matchIndex}`}
        d={`M ${startX} ${startY} L ${midX} ${startY} L ${midX} ${endY} L ${endX} ${endY}`}
        stroke="rgba(139, 92, 246, 0.5)"
        strokeWidth="3"
        fill="none"
      />
    );
  }

  return (
    <div className="relative mt-16">
      <div className="overflow-x-auto">
        <div className="min-w-max px-4">
          <svg width={totalWidth} height={totalHeight}>
            <defs>
              <filter id="glow">
                <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            {rounds.map((round, roundIndex) =>
              round.matches?.map((_, matchIndex) =>
                renderConnectingLines(roundIndex, matchIndex)
              )
            )}
            {rounds.map((round, roundIndex) =>
              round.matches?.map((match, matchIndex) =>
                renderMatch(match, roundIndex, matchIndex)
              )
            )}
          </svg>
        </div>
      </div>
    </div>
  );
}
