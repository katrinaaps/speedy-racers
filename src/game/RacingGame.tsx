import { useEffect, useCallback, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import GameScene from "./GameScene";
import HUD from "./HUD";
import TouchControls from "./TouchControls";
import { useGameState } from "./useGameState";

export default function RacingGame() {
  const {
    phase, setPhase, countdown, setCountdown,
    winner, setWinner,
    playerRef, ai1Ref, ai2Ref,
    reset, TOTAL_LAPS,
  } = useGameState();

  const [hudUpdate, setHudUpdate] = useState(0);
  const keysRef = useRef({ up: false, down: false, left: false, right: false });
  const [isTouchDevice] = useState(() => "ontouchstart" in window || navigator.maxTouchPoints > 0);

  // Keyboard controls
  useEffect(() => {
    const onDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp") keysRef.current.up = true;
      if (e.key === "ArrowDown") keysRef.current.down = true;
      if (e.key === "ArrowLeft") keysRef.current.left = true;
      if (e.key === "ArrowRight") keysRef.current.right = true;
    };
    const onUp = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp") keysRef.current.up = false;
      if (e.key === "ArrowDown") keysRef.current.down = false;
      if (e.key === "ArrowLeft") keysRef.current.left = false;
      if (e.key === "ArrowRight") keysRef.current.right = false;
    };
    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    return () => {
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
    };
  }, []);

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
          keysRef={keysRef}
          onLapUpdate={onLapUpdate}
          onWin={onWin}
          totalLaps={TOTAL_LAPS}
        />
      </Canvas>
      <TouchControls keysRef={keysRef} visible={isTouchDevice || phase === "racing"} />
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