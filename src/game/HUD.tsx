import { CarState } from "./useGameState";
import { BOOST_COOLDOWN, BOOST_DURATION } from "./carUpgrades";

interface HUDProps {
  phase: "countdown" | "racing" | "finished";
  countdown: number;
  winner: string | null;
  playerRef: React.MutableRefObject<CarState>;
  ai1Ref: React.MutableRefObject<CarState>;
  ai2Ref: React.MutableRefObject<CarState>;
  totalLaps: number;
  onRestart: () => void;
  onGarage: () => void;
  hudUpdate: number;
}

function getPosition(player: CarState, ai1: CarState, ai2: CarState): string {
  const pProgress = player.laps * 1000 + player.angle;
  const a1Progress = ai1.laps * 1000 + ai1.angle;
  const a2Progress = ai2.laps * 1000 + ai2.angle;
  let pos = 1;
  if (a1Progress > pProgress) pos++;
  if (a2Progress > pProgress) pos++;
  if (pos === 1) return "1st";
  if (pos === 2) return "2nd";
  return "3rd";
}

export default function HUD({
  phase, countdown, winner, playerRef, ai1Ref, ai2Ref, totalLaps, onRestart, onGarage, hudUpdate,
}: HUDProps) {
  const player = playerRef.current;
  const speedDisplay = Math.round(player.speed * 6000);
  const lap = Math.min(player.laps + 1, totalLaps);
  const position = getPosition(player, ai1Ref.current, ai2Ref.current);

  const boostReady = player.hasRockets && !player.boostActive && player.boostCooldown <= 0;
  const boostActive = player.boostActive;
  const boostCooldownPct = player.boostCooldown > 0 ? player.boostCooldown / BOOST_COOLDOWN : 0;
  const boostTimerPct = player.boostActive ? player.boostTimer / BOOST_DURATION : 0;

  return (
    <div className="absolute inset-0 pointer-events-none" style={{ fontFamily: "'Segoe UI', sans-serif" }}>
      {/* Countdown */}
      {phase === "countdown" && (
        <div className="flex items-center justify-center h-full">
          <div className="text-8xl font-black text-white drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)]">
            {countdown > 0 ? countdown : "GO!"}
          </div>
        </div>
      )}

      {/* Racing HUD */}
      {phase === "racing" && (
        <>
          <div className="absolute top-6 left-6 bg-black/60 backdrop-blur-sm rounded-xl px-5 py-3">
            <div className="text-white/70 text-sm font-medium">LAP</div>
            <div className="text-white text-3xl font-bold">{lap}/{totalLaps}</div>
          </div>

          <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm rounded-xl px-6 py-3">
            <div className="text-white/70 text-sm font-medium text-center">POSITION</div>
            <div className="text-yellow-400 text-4xl font-black text-center">{position}</div>
          </div>

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm rounded-xl px-6 py-3">
            <div className="text-white text-3xl font-bold text-center">{speedDisplay}</div>
            <div className="text-white/70 text-sm font-medium text-center">KM/H</div>
          </div>

          {/* Boost indicator */}
          {player.hasRockets && (
            <div className="absolute top-6 right-6 bg-black/60 backdrop-blur-sm rounded-xl px-5 py-3 w-40">
              <div className="text-white/70 text-sm font-medium">🚀 BOOST</div>
              {boostActive && (
                <div className="mt-1 h-3 rounded-full bg-white/20 overflow-hidden">
                  <div className="h-full bg-orange-500 transition-all" style={{ width: `${boostTimerPct * 100}%` }} />
                </div>
              )}
              {boostReady && (
                <div className="text-green-400 text-sm font-bold mt-1">READY [SPACE]</div>
              )}
              {!boostActive && player.boostCooldown > 0 && (
                <div className="mt-1 h-3 rounded-full bg-white/20 overflow-hidden">
                  <div className="h-full bg-white/40 transition-all" style={{ width: `${(1 - boostCooldownPct) * 100}%` }} />
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Winner screen */}
      {phase === "finished" && winner && (
        <div className="flex items-center justify-center h-full">
          <div className="bg-black/80 backdrop-blur-md rounded-2xl p-10 text-center pointer-events-auto">
            <div className="text-5xl font-black text-white mb-2">🏁 RACE OVER</div>
            <div className="text-3xl font-bold text-yellow-400 mb-6">
              {winner === "You" ? "YOU WIN! 🎉" : `${winner} wins!`}
            </div>
            <div className="flex gap-4">
              <button
                onClick={onRestart}
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xl px-8 py-4 rounded-xl transition-colors"
              >
                Race Again
              </button>
              <button
                onClick={onGarage}
                className="bg-gray-700 hover:bg-gray-600 text-white font-bold text-xl px-8 py-4 rounded-xl transition-colors"
              >
                🔧 Garage
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
