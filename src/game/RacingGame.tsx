import { useEffect, useCallback, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import GameScene from "./GameScene";
import HUD from "./HUD";
import TouchControls from "./TouchControls";
import Garage from "./Garage";
import { useGameState } from "./useGameState";
import { CarUpgrades } from "./carUpgrades";
import { startEngine, stopEngine, updateEngineSound, playCrowdCheer, playCountdownBeep } from "./audioEngine";

export default function RacingGame() {
  const {
    phase, setPhase, countdown, setCountdown,
    winner, setWinner,
    playerRef, ai1Ref, ai2Ref,
    reset, TOTAL_LAPS,
  } = useGameState();

  const [showGarage, setShowGarage] = useState(true);
  const [hudUpdate, setHudUpdate] = useState(0);
  const keysRef = useRef({
    up: false, down: false, left: false, right: false,
    boost: false, wings: false, parachute: false,
  });
  const [isTouchDevice] = useState(() => "ontouchstart" in window || navigator.maxTouchPoints > 0);
  const prevCountdownRef = useRef(3);

  const handleGarageStart = useCallback((upgrades: CarUpgrades) => {
    playerRef.current.hasRockets = upgrades.boosterRockets;
    playerRef.current.hasBigWheels = upgrades.bigWheels;
    playerRef.current.hasWings = upgrades.wings;
    playerRef.current.hasParachute = upgrades.parachute;
    setShowGarage(false);
  }, [playerRef]);

  // Keyboard controls
  useEffect(() => {
    const onDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp") keysRef.current.up = true;
      if (e.key === "ArrowDown") keysRef.current.down = true;
      if (e.key === "ArrowLeft") keysRef.current.left = true;
      if (e.key === "ArrowRight") keysRef.current.right = true;
      if (e.key === " ") { e.preventDefault(); keysRef.current.boost = true; }
      if (e.key === "w" || e.key === "W") keysRef.current.wings = true;
      if (e.key === "p" || e.key === "P") keysRef.current.parachute = true;
    };
    const onUp = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp") keysRef.current.up = false;
      if (e.key === "ArrowDown") keysRef.current.down = false;
      if (e.key === "ArrowLeft") keysRef.current.left = false;
      if (e.key === "ArrowRight") keysRef.current.right = false;
      if (e.key === " ") keysRef.current.boost = false;
      if (e.key === "w" || e.key === "W") keysRef.current.wings = false;
      if (e.key === "p" || e.key === "P") keysRef.current.parachute = false;
    };
    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    return () => {
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
    };
  }, []);

  // Countdown timer + beeps
  useEffect(() => {
    if (phase !== "countdown") return;
    if (countdown !== prevCountdownRef.current) {
      prevCountdownRef.current = countdown;
      if (countdown > 0) {
        playCountdownBeep(false);
      } else {
        playCountdownBeep(true);
      }
    }
    if (countdown <= 0) {
      const t = setTimeout(() => setPhase("racing"), 500);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, countdown, setPhase, setCountdown]);

  // Engine sound: start/stop with racing phase
  useEffect(() => {
    if (phase === "racing") {
      startEngine();
    } else {
      stopEngine();
    }
    return () => stopEngine();
  }, [phase]);

  // Update engine pitch based on speed
  useEffect(() => {
    if (phase !== "racing") return;
    const interval = setInterval(() => {
      updateEngineSound(playerRef.current.speed);
      setHudUpdate((n) => n + 1);
    }, 50);
    return () => clearInterval(interval);
  }, [phase, playerRef]);

  // Crowd cheer on finish
  useEffect(() => {
    if (phase === "finished" && winner) {
      playCrowdCheer();
    }
  }, [phase, winner]);

  const onLapUpdate = useCallback(() => {
    setHudUpdate((n) => n + 1);
  }, []);

  const onWin = useCallback((name: string) => {
    setWinner(name);
    setPhase("finished");
  }, [setWinner, setPhase]);

  const handleRestart = useCallback(() => {
    reset(true);
    prevCountdownRef.current = 3;
  }, [reset]);

  const handleBackToGarage = useCallback(() => {
    reset();
    prevCountdownRef.current = 3;
    setShowGarage(true);
  }, [reset]);

  if (showGarage) {
    return <Garage onStart={handleGarageStart} />;
  }

  const p = playerRef.current;

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
      <TouchControls
        keysRef={keysRef}
        visible={isTouchDevice || phase === "racing"}
        hasRockets={p.hasRockets}
        hasWings={p.hasWings}
        hasParachute={p.hasParachute}
      />
      <HUD
        phase={phase}
        countdown={countdown}
        winner={winner}
        playerRef={playerRef}
        ai1Ref={ai1Ref}
        ai2Ref={ai2Ref}
        totalLaps={TOTAL_LAPS}
        onRestart={handleRestart}
        onGarage={handleBackToGarage}
        hudUpdate={hudUpdate}
      />
    </div>
  );
}
