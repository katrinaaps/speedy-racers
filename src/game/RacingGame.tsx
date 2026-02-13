import { useEffect, useCallback, useState } from "react";
import { Canvas } from "@react-three/fiber";
import GameScene from "./GameScene";
import HUD from "./HUD";
import { useGameState } from "./useGameState";

export default function RacingGame() {
  const {
    phase, setPhase, countdown, setCountdown,
    winner, setWinner,
    playerRef, ai1Ref, ai2Ref,
    reset, TOTAL_LAPS,
  } = useGameState();

  const [hudUpdate, setHudUpdate] = useState(0);

  // Countdown timer
  useEffect(() => {
    if (phase !== "countdown") return;
    if (countdown <= 0) {
      const t = setTimeout(() => setPhase("racing"), 500);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, countdown, setPhase, setCountdown]);

  // HUD refresh during racing
  useEffect(() => {
    if (phase !== "racing") return;
    const interval = setInterval(() => setHudUpdate((n) => n + 1), 100);
    return () => clearInterval(interval);
  }, [phase]);

  const onLapUpdate = useCallback(() => {
    setHudUpdate((n) => n + 1);
  }, []);

  const onWin = useCallback((name: string) => {
    setWinner(name);
    setPhase("finished");
  }, [setWinner, setPhase]);

  const handleRestart = useCallback(() => {
    reset();
  }, [reset]);

  return (
    <div className="w-screen h-screen bg-black relative overflow-hidden">
      <Canvas
        camera={{ position: [0, 50, 80], fov: 60 }}
        style={{ width: "100%", height: "100%" }}
      >
        <GameScene
          phase={phase}
          playerRef={playerRef}
          ai1Ref={ai1Ref}
          ai2Ref={ai2Ref}
          onLapUpdate={onLapUpdate}
          onWin={onWin}
          totalLaps={TOTAL_LAPS}
        />
      </Canvas>
      <HUD
        phase={phase}
        countdown={countdown}
        winner={winner}
        playerRef={playerRef}
        ai1Ref={ai1Ref}
        ai2Ref={ai2Ref}
        totalLaps={TOTAL_LAPS}
        onRestart={handleRestart}
        hudUpdate={hudUpdate}
      />
    </div>
  );
}
