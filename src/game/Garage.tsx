import { useState } from "react";
import { Rocket, CircleDot, Feather, Umbrella, Car, Paintbrush, Wrench } from "lucide-react";
import { CarUpgrades, DEFAULT_UPGRADES, BODY_STYLES, PAINT_COLORS, BodyStyle } from "./carUpgrades";

interface GarageProps {
  onStart: (upgrades: CarUpgrades) => void;
  onCancel?: () => void;
  midRace?: boolean;
}

type GarageTab = "upgrades" | "body" | "paint";

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

export default function Garage({ onStart, onCancel, midRace }: GarageProps) {
  const [upgrades, setUpgrades] = useState<CarUpgrades>({ ...DEFAULT_UPGRADES });
  const [tab, setTab] = useState<GarageTab>("upgrades");

  const toggle = (key: keyof CarUpgrades) => {
    if (key === "bodyStyle" || key === "paintColor") return;
    setUpgrades((u) => ({ ...u, [key]: !u[key] }));
  };

  const TABS: { key: GarageTab; label: string; icon: React.ReactNode }[] = [
    { key: "upgrades", label: "Upgrades", icon: <Wrench className="w-5 h-5" /> },
    { key: "body", label: "Body", icon: <Car className="w-5 h-5" /> },
    { key: "paint", label: "Paint", icon: <Paintbrush className="w-5 h-5" /> },
  ];

  return (
    <div className="w-screen h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black flex flex-col items-center justify-center gap-6 overflow-y-auto py-8">
      <h1 className="text-5xl font-black text-white tracking-tight drop-shadow-lg">
        🔧 GARAGE
      </h1>

      {/* Tab bar */}
      <div className="flex gap-2 bg-white/5 p-1 rounded-xl">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-bold text-sm transition-all ${
              tab === t.key
                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                : "text-white/60 hover:text-white hover:bg-white/10"
            }`}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === "upgrades" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-80 sm:w-[40rem]">
          {UPGRADE_ITEMS.map((item) => {
            const equipped = upgrades[item.key] as boolean;
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
      )}

      {tab === "body" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-80 sm:w-[40rem]">
          {BODY_STYLES.map((body) => {
            const selected = upgrades.bodyStyle === body.key;
            return (
              <button
                key={body.key}
                onClick={() => setUpgrades((u) => ({ ...u, bodyStyle: body.key }))}
                className={`relative flex items-center gap-4 p-5 rounded-2xl border-2 transition-all duration-200 ${
                  selected
                    ? "border-blue-500 bg-blue-500/20 shadow-[0_0_30px_rgba(59,130,246,0.3)]"
                    : "border-white/20 bg-white/5 hover:border-white/40"
                }`}
              >
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 ${selected ? "bg-blue-500/20" : "bg-white/10"}`}>
                  <Car className="w-7 h-7 text-white" />
                </div>
                <div className="text-left">
                  <div className="text-white font-bold text-lg">{body.label}</div>
                  <div className="text-white/50 text-sm">{body.description}</div>
                </div>
                {selected && (
                  <div className="absolute top-2 right-3 font-bold text-xs text-blue-400">
                    SELECTED
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}

      {tab === "paint" && (
        <div className="flex flex-col items-center gap-6 w-80 sm:w-[40rem]">
          <div className="grid grid-cols-5 gap-3">
            {PAINT_COLORS.map((p) => {
              const selected = upgrades.paintColor === p.color;
              return (
                <button
                  key={p.color}
                  onClick={() => setUpgrades((u) => ({ ...u, paintColor: p.color }))}
                  className={`w-16 h-16 rounded-2xl border-4 transition-all duration-200 ${
                    selected
                      ? "border-white scale-110 shadow-[0_0_20px_rgba(255,255,255,0.4)]"
                      : "border-white/20 hover:border-white/50 hover:scale-105"
                  }`}
                  style={{ backgroundColor: p.color }}
                  title={p.label}
                />
              );
            })}
          </div>
          {/* Preview */}
          <div className="flex items-center gap-3">
            <div
              className="w-20 h-10 rounded-xl border-2 border-white/30"
              style={{ backgroundColor: upgrades.paintColor }}
            />
            <span className="text-white/70 font-medium">
              {PAINT_COLORS.find((p) => p.color === upgrades.paintColor)?.label ?? "Custom"}
            </span>
          </div>
        </div>
      )}

      <div className="flex gap-4 mt-4">
        {midRace && onCancel && (
          <button
            onClick={onCancel}
            className="bg-gray-700 hover:bg-gray-600 text-white font-black text-xl px-10 py-4 rounded-2xl transition-colors"
          >
            ✕ Back to Race
          </button>
        )}
        <button
          onClick={() => onStart(upgrades)}
          className="bg-blue-600 hover:bg-blue-500 text-white font-black text-xl px-10 py-4 rounded-2xl transition-colors shadow-lg shadow-blue-600/30"
        >
          {midRace ? "✅ Apply & Resume" : "🏁 START RACE"}
        </button>
      </div>
    </div>
  );
}
