"use client";

import { use, useState } from "react";
import { ChevronLeft, ChevronRight, Edit3, Save, Star, UtensilsCrossed } from "lucide-react";
import { Button, RatingStars } from "@/components/ui";

type MealType = "breakfast" | "lunch" | "dinner";

interface MealEntry {
  items: string[];
  rating?: number;
  feedback?: string;
}

type DayMenu = Record<MealType, MealEntry>;

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const FULL_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const DEFAULT_MENU: Record<string, DayMenu> = {
  Mon: {
    breakfast: { items: ["Idli", "Sambar", "Coconut chutney", "Tea/Coffee"] },
    lunch: { items: ["Rice", "Dal tadka", "Aloo sabzi", "Roti x2", "Papad"] },
    dinner: { items: ["Roti x3", "Paneer butter masala", "Rice", "Dal", "Salad"] },
  },
  Tue: {
    breakfast: { items: ["Poha", "Banana", "Tea/Coffee"] },
    lunch: { items: ["Rice", "Rajma", "Jeera aloo", "Roti x2", "Curd"] },
    dinner: { items: ["Roti x3", "Egg curry", "Rice", "Dal", "Salad"] },
  },
  Wed: {
    breakfast: { items: ["Upma", "Green chutney", "Tea/Coffee"] },
    lunch: { items: ["Rice", "Sambhar", "Beans curry", "Roti x2", "Pickle"] },
    dinner: { items: ["Roti x3", "Chicken curry", "Rice", "Dal fry", "Raita"] },
  },
  Thu: {
    breakfast: { items: ["Bread butter jam", "Boiled egg", "Cornflakes", "Milk"] },
    lunch: { items: ["Rice", "Dal makhani", "Mix veg", "Roti x2", "Papad"] },
    dinner: { items: ["Roti x3", "Paneer masala", "Fried rice", "Dal", "Salad"] },
  },
  Fri: {
    breakfast: { items: ["Dosa", "Sambhar", "Chutney x2", "Tea/Coffee"] },
    lunch: { items: ["Rice", "Chana masala", "Gobi sabzi", "Roti x2", "Curd"] },
    dinner: { items: ["Roti x3", "Mutton curry", "Rice", "Dal", "Salad"] },
  },
  Sat: {
    breakfast: { items: ["Puri", "Aloo sabzi", "Tea/Coffee"], rating: 4 },
    lunch: { items: ["Biryani", "Raita", "Salad", "Pickle"], rating: 5, feedback: "Best biryani this month!" },
    dinner: { items: ["Roti x3", "Matar paneer", "Dal tadka", "Rice"] },
  },
  Sun: {
    breakfast: { items: ["Chole bhature", "Tea/Coffee"] },
    lunch: { items: ["Special thali — Roti x4, Rice, Dal, Sabzi x2, Dessert", "Kheer"] },
    dinner: { items: ["Roti x3", "Butter chicken", "Naan", "Rice", "Salad"] },
  },
};

const MEAL_COLORS: Record<MealType, string> = {
  breakfast: "bg-amber-50 border-amber-200",
  lunch: "bg-emerald-50 border-emerald-200",
  dinner: "bg-blue-50 border-blue-200",
};

const MEAL_LABELS: Record<MealType, string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
};

export default function FoodMenuPage({ params }: { params: Promise<{ propertyId: string }> }) {
  const { propertyId } = use(params);
  const [dayIndex, setDayIndex] = useState(6); // Sunday = today
  const [menu, setMenu] = useState(DEFAULT_MENU);
  const [editing, setEditing] = useState<{ day: string; meal: MealType } | null>(null);
  const [editText, setEditText] = useState("");

  const currentDay = DAYS[dayIndex]!;
  const currentMenu = menu[currentDay]!;

  function startEdit(meal: MealType) {
    setEditing({ day: currentDay, meal });
    setEditText((menu[currentDay]?.[meal]?.items ?? []).join("\n"));
  }

  function saveEdit() {
    if (!editing) return;
    setMenu((prev) => ({
      ...prev,
      [editing.day]: {
        ...prev[editing.day],
        [editing.meal]: {
          ...prev[editing.day]?.[editing.meal],
          items: editText.split("\n").map((s) => s.trim()).filter(Boolean),
        },
      },
    }));
    setEditing(null);
  }

  const todayRatings = (["breakfast", "lunch", "dinner"] as MealType[])
    .map((m) => currentMenu[m]?.rating)
    .filter((r): r is number => r !== undefined);
  const avgRating = todayRatings.length > 0
    ? (todayRatings.reduce((s, r) => s + r, 0) / todayRatings.length).toFixed(1)
    : null;

  return (
    <div className="grid gap-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <UtensilsCrossed className="h-6 w-6 text-primary" />
        <h1 className="text-xl font-black">Food Menu</h1>
      </div>

      {/* Day selector */}
      <div className="flex items-center justify-between gap-2">
        <button
          onClick={() => setDayIndex((i) => (i - 1 + 7) % 7)}
          className="grid h-9 w-9 place-items-center rounded-xl border border-border hover:bg-slate-50"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <div className="flex gap-1.5 overflow-x-auto">
          {DAYS.map((d, i) => (
            <button
              key={d}
              onClick={() => setDayIndex(i)}
              className={`shrink-0 rounded-xl px-3 py-2 text-sm font-semibold transition ${
                i === dayIndex ? "bg-primary text-white" : "border border-border bg-white text-text-secondary"
              }`}
            >
              {d}
            </button>
          ))}
        </div>

        <button
          onClick={() => setDayIndex((i) => (i + 1) % 7)}
          className="grid h-9 w-9 place-items-center rounded-xl border border-border hover:bg-slate-50"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Day header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-lg font-black">{FULL_DAYS[dayIndex]}</p>
          {avgRating && (
            <div className="flex items-center gap-1 mt-0.5">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              <span className="text-xs font-semibold text-amber-600">{avgRating} avg rating today</span>
            </div>
          )}
        </div>
      </div>

      {/* Meal cards */}
      {(["breakfast", "lunch", "dinner"] as MealType[]).map((meal) => {
        const entry = currentMenu[meal];
        const isEditing = editing?.day === currentDay && editing?.meal === meal;

        return (
          <div key={meal} className={`rounded-2xl border p-4 ${MEAL_COLORS[meal]}`}>
            <div className="flex items-center justify-between mb-3">
              <p className="font-bold">{MEAL_LABELS[meal]}</p>
              <div className="flex items-center gap-2">
                {entry?.rating && (
                  <div className="flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    <span className="text-xs font-bold text-amber-600">{entry.rating}/5</span>
                  </div>
                )}
                <button
                  onClick={() => isEditing ? saveEdit() : startEdit(meal)}
                  className="flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-semibold border border-white/50 hover:bg-white/80 transition"
                >
                  {isEditing ? <><Save className="h-3.5 w-3.5" /> Save</> : <><Edit3 className="h-3.5 w-3.5" /> Edit</>}
                </button>
              </div>
            </div>

            {isEditing ? (
              <textarea
                className="w-full rounded-xl border border-white/60 bg-white/80 p-3 text-sm outline-none focus:border-primary"
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                rows={4}
                placeholder="One item per line..."
              />
            ) : (
              <ul className="grid gap-1.5">
                {entry?.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-current opacity-50" />
                    {item}
                  </li>
                ))}
              </ul>
            )}

            {entry?.feedback && (
              <p className="mt-2 rounded-xl bg-white/60 px-3 py-2 text-xs italic text-text-secondary">
                💬 "{entry.feedback}"
              </p>
            )}
          </div>
        );
      })}

      {/* Weekly summary */}
      <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
        <p className="font-bold mb-3">This week's ratings</p>
        <div className="grid gap-2">
          {DAYS.map((d, i) => {
            const dayMenu = menu[d];
            if (!dayMenu) return null;
            const ratings = (["breakfast", "lunch", "dinner"] as MealType[])
              .map((m) => dayMenu[m]?.rating)
              .filter((r): r is number => r !== undefined);
            if (ratings.length === 0) return null;
            const avg = ratings.reduce((s, r) => s + r, 0) / ratings.length;
            return (
              <div key={d} className="flex items-center gap-3">
                <span className={`w-8 text-xs font-bold ${i === dayIndex ? "text-primary" : "text-text-secondary"}`}>{d}</span>
                <div className="flex-1 h-2 rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-amber-400" style={{ width: `${(avg / 5) * 100}%` }} />
                </div>
                <span className="text-xs font-bold text-amber-600 w-8 text-right">{avg.toFixed(1)}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
