import { useState } from "react";
import { Rocket, CircleDot, Feather, Umbrella } from "lucide-react";
import { CarUpgrades, DEFAULT_UPGRADES } from "./carUpgrades";

interface GarageProps {
  onStart: (upgrades: CarUpgrades) => void;
}

const UPGRADE_ITEMS: {
  key: keyof CarUpgrades;
  label: string;
  description: string;
  icon: React.ReactNode;
  activeColor: string;
  activeBg: string;
  activeShadow: string;
  activeText: string;
}[] = [
  {
    key: "boosterRockets",
    label: "Booster Rockets",
    description: "Press SPACE for a speed burst",
    icon: <Rocket className="w-7 h-7 text-white" />,
    activeColor: "border-orange-500",
    activeBg: "bg-orange-500/20",
    activeShadow: "shadow-[0_0_30px_rgba(249,115,22,0.3)]",
    activeText: "text-orange-400",
  },
  {
    key: "bigWheels",
    label: "Big Wheels",
    description: "1.8× faster steering & grip",
    icon: <CircleDot className="w-7 h-7 text-white" />,
    activeColor: "border-green-500",
    activeBg: "bg-green-500/20",
    activeShadow: "shadow-[0_0_30px_rgba(34,197,94,0.3)]",
    activeText: "text-green-400",
  },
  {
    key: "wings",
    label: "Wings",
    description: "Press W to fly over the track",
    icon: <Feather className="w-7 h-7 text-white" />,
    activeColor: "border-sky-500",
    activeBg: "bg-sky-500/20",
    activeShadow: "shadow-[0_0_30px_rgba(14,165,233,0.3)]",
    activeText: "text-sky-400",
  },
  {
    key: "parachute",
    label: "Parachute",
    description: "Press P for emergency braking",
    icon: <Umbrella className="w-7 h-7 text-white" />,
    activeColor: "border-red-500",
    activeBg: "bg-red-500/20",
    activeShadow: "shadow-[0_0_30px_rgba(239,68,68,0.3)]",
    activeText: "text-red-400",
  },
];

export default function Garage({ onStart }: GarageProps) {
  const [upgrades, setUpgrades] = useState<CarUpgrades>({ ...DEFAULT_UPGRADES });

  const toggle = (key: keyof CarUpgrades) =>
    setUpgrades((u) => ({ ...u, [key]: !u[key] }));

  return (
    <div className="w-screen h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black flex flex-col items-center justify-center gap-8 overflow-y-auto py-8">
      <h1 className="text-5xl font-black text-white tracking-tight drop-shadow-lg">
        🔧 GARAGE
      </h1>
      <p className="text-white/60 text-lg">Equip upgrades before the race</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-80 sm:w-[40rem]">
        {UPGRADE_ITEMS.map((item) => {
          const equipped = upgrades[item.key];
          return (
            <button
              key={item.key}
              onClick={() => toggle(item.key)}
              className={`relative flex items-center gap-4 p-5 rounded-2xl border-2 transition-all duration-200 ${
                equipped
                  ? `${item.activeColor} ${item.activeBg} ${item.activeShadow}`
                  : "border-white/20 bg-white/5 hover:border-white/40"
              }`}
            >
              <div
                className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 ${
                  equipped ? item.activeBg : "bg-white/10"
                }`}
              >
                {item.icon}
              </div>
              <div className="text-left">
                <div className="text-white font-bold text-lg">{item.label}</div>
                <div className="text-white/50 text-sm">{item.description}</div>
              </div>
              {equipped && (
                <div className={`absolute top-2 right-3 font-bold text-xs ${item.activeText}`}>
                  EQUIPPED
                </div>
              )}
            </button>
          );
        })}
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
