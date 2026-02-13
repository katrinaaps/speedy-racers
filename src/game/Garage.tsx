import { useState } from "react";
import { Rocket } from "lucide-react";
import { CarUpgrades, DEFAULT_UPGRADES } from "./carUpgrades";

interface GarageProps {
  onStart: (upgrades: CarUpgrades) => void;
}

export default function Garage({ onStart }: GarageProps) {
  const [upgrades, setUpgrades] = useState<CarUpgrades>({ ...DEFAULT_UPGRADES });

  const toggleRockets = () =>
    setUpgrades((u) => ({ ...u, boosterRockets: !u.boosterRockets }));

  return (
    <div className="w-screen h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black flex flex-col items-center justify-center gap-8">
      <h1 className="text-5xl font-black text-white tracking-tight drop-shadow-lg">
        🔧 GARAGE
      </h1>
      <p className="text-white/60 text-lg">Equip upgrades before the race</p>

      <div className="grid grid-cols-1 gap-4 w-80">
        {/* Booster Rockets */}
        <button
          onClick={toggleRockets}
          className={`relative flex items-center gap-4 p-5 rounded-2xl border-2 transition-all duration-200 ${
            upgrades.boosterRockets
              ? "border-orange-500 bg-orange-500/20 shadow-[0_0_30px_rgba(249,115,22,0.3)]"
              : "border-white/20 bg-white/5 hover:border-white/40"
          }`}
        >
          <div
            className={`w-14 h-14 rounded-xl flex items-center justify-center ${
              upgrades.boosterRockets ? "bg-orange-500" : "bg-white/10"
            }`}
          >
            <Rocket className="w-7 h-7 text-white" />
          </div>
          <div className="text-left">
            <div className="text-white font-bold text-lg">Booster Rockets</div>
            <div className="text-white/50 text-sm">
              Press SPACE for a speed burst
            </div>
          </div>
          {upgrades.boosterRockets && (
            <div className="absolute top-2 right-3 text-orange-400 font-bold text-xs">
              EQUIPPED
            </div>
          )}
        </button>

        {/* Placeholder slots for future upgrades */}
        {["Big Wheels", "Wings", "Parachute"].map((name) => (
          <div
            key={name}
            className="flex items-center gap-4 p-5 rounded-2xl border-2 border-white/10 bg-white/5 opacity-40 cursor-not-allowed"
          >
            <div className="w-14 h-14 rounded-xl bg-white/10 flex items-center justify-center">
              <span className="text-white/40 text-2xl">?</span>
            </div>
            <div className="text-left">
              <div className="text-white/50 font-bold text-lg">{name}</div>
              <div className="text-white/30 text-sm">Coming soon</div>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => onStart(upgrades)}
        className="mt-4 bg-blue-600 hover:bg-blue-500 text-white font-black text-xl px-10 py-4 rounded-2xl transition-colors shadow-lg shadow-blue-600/30"
      >
        🏁 START RACE
      </button>
    </div>
  );
}
