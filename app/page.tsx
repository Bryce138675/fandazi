"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import BottomNav from "@/components/BottomNav";

type FridgeItem = {
  id: number;
  name: string;
  quantity: string;
  unit: string;
  urgent: boolean;
};

type TonightDinner = {
  recipeId: string;
  recipeName: string;
  selectedAt: string;
  status: string;
  source?: string;
};

type MealLog = {
  id: number;
  recipeId: string;
  recipeName: string;
  cookedBy: string;
  rating: number;
  eatAgain: string;
  notes: string;
  completedAt: string;
};

export default function Home() {
  const [fridgeItems, setFridgeItems] = useState<FridgeItem[]>([]);

  const [tonightDinner, setTonightDinner] =
    useState<TonightDinner | null>(null);

  const [showCompleteForm, setShowCompleteForm] =
    useState(false);

  const [cookedBy, setCookedBy] = useState("一起做");

  const [rating, setRating] = useState(5);

  const [eatAgain, setEatAgain] =
    useState("必须再吃");

  const [notes, setNotes] = useState("");

  useEffect(() => {
    const savedFridge = localStorage.getItem(
      "fandazi-fridge-items"
    );

    if (savedFridge) {
      try {
        setFridgeItems(JSON.parse(savedFridge));
      } catch {
        setFridgeItems([]);
      }
    }

    const savedDinner = localStorage.getItem(
      "fandazi-tonight-dinner"
    );

    if (savedDinner) {
      try {
        setTonightDinner(JSON.parse(savedDinner));
      } catch {
        setTonightDinner(null);
      }
    }
  }, []);

  function completeDinner() {
    if (!tonightDinner) return;

    const savedLogs = localStorage.getItem(
      "fandazi-meal-logs"
    );

    let mealLogs: MealLog[] = [];

    if (savedLogs) {
      try {
        mealLogs = JSON.parse(savedLogs);
      } catch {
        mealLogs = [];
      }
    }

    const newLog: MealLog = {
      id: Date.now(),
      recipeId: tonightDinner.recipeId,
      recipeName: tonightDinner.recipeName,
      cookedBy,
      rating,
      eatAgain,
      notes,
      completedAt: new Date().toISOString(),
    };

    localStorage.setItem(
      "fandazi-meal-logs",
      JSON.stringify([newLog, ...mealLogs])
    );

    localStorage.removeItem(
      "fandazi-tonight-dinner"
    );

    setTonightDinner(null);
    setShowCompleteForm(false);
    setCookedBy("一起做");
    setRating(5);
    setEatAgain("必须再吃");
    setNotes("");
  }

  return (
    <main className="min-h-screen bg-[#fffaf5] pb-32 text-[#2b2b2b]">
      <div className="mx-auto flex min-h-screen max-w-md flex-col px-5 py-8">
        <header className="mb-8">
          <p className="mb-2 text-sm text-gray-500">
            Hola
          </p>

          <h1 className="text-3xl font-bold">
            一二&布布
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            小笨吃饭助手
          </p>
        </header>

        <section className="mb-5 rounded-3xl bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            今天吃什么？
          </p>

          <h2 className="mt-2 text-2xl font-semibold">
            不知道的话，先看看小笨冰箱
          </h2>

          <Link
            href="/recommend"
            className="mt-5 block w-full rounded-2xl bg-[#ff6b57] px-4 py-3 text-center font-medium text-white"
          >
            看看小笨冰箱能做什么
          </Link>
        </section>

        {tonightDinner && (
          <section className="mb-5 rounded-3xl bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  今晚已经决定 ❤️
                </p>

                <h2 className="mt-2 text-xl font-semibold">
                  {tonightDinner.recipeName}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  已加入今晚菜单
                </p>

                {tonightDinner.source === "vote" && (
                  <p className="mt-2 text-xs text-[#ff6b57]">
                    💘 来自一二&布布投票
                  </p>
                )}
              </div>

              <div className="text-3xl">
                🍽️
              </div>
            </div>

            <div className="mt-4 flex gap-3">
              <button
                onClick={() =>
                  setShowCompleteForm(true)
                }
                className="flex-1 rounded-2xl bg-[#ff6b57] px-4 py-3 text-sm font-medium text-white"
              >
                吃完啦
              </button>

              <Link
                href="/random"
                className="flex-1 rounded-2xl border border-gray-200 px-4 py-3 text-center text-sm font-medium"
              >
                换一道
              </Link>
            </div>
          </section>
        )}

        {showCompleteForm && tonightDinner && (
          <section className="mb-5 rounded-3xl bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold">
              记录这一顿 🍽️
            </h2>

            <div className="mt-4">
              <p className="text-sm text-gray-500">
                今天谁做的？
              </p>

              <div className="mt-2 grid grid-cols-2 gap-2">
                {[
                  "一二做的",
                  "布布做的",
                  "一起做",
                  "外卖",
                ].map((option) => (
                  <button
                    key={option}
                    onClick={() =>
                      setCookedBy(option)
                    }
                    className={`rounded-2xl px-3 py-2 text-sm ${cookedBy === option
                      ? "bg-[#ff6b57] text-white"
                      : "bg-gray-100 text-gray-600"
                      }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5">
              <p className="text-sm text-gray-500">
                这顿几分？
              </p>

              <div className="mt-2 flex gap-2">
                {[1, 2, 3, 4, 5].map(
                  (star) => (
                    <button
                      key={star}
                      onClick={() =>
                        setRating(star)
                      }
                      className="text-3xl"
                    >
                      {star <= rating
                        ? "⭐"
                        : "☆"}
                    </button>
                  )
                )}
              </div>
            </div>

            <div className="mt-5">
              <p className="text-sm text-gray-500">
                下次还吃吗？
              </p>

              <select
                value={eatAgain}
                onChange={(e) =>
                  setEatAgain(
                    e.target.value
                  )
                }
                className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3"
              >
                <option value="必须再吃">
                  必须再吃 ❤️
                </option>

                <option value="可以">
                  可以 🙂
                </option>

                <option value="一般">
                  一般 😐
                </option>

                <option value="不要了">
                  不要了 ❌
                </option>
              </select>
            </div>

            <div className="mt-5">
              <p className="text-sm text-gray-500">
                备注
              </p>

              <textarea
                value={notes}
                onChange={(e) =>
                  setNotes(
                    e.target.value
                  )
                }
                placeholder="例如：下次少放一点辣椒"
                className="mt-2 min-h-24 w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none"
              />
            </div>

            <div className="mt-5 flex gap-3">
              <button
                onClick={() =>
                  setShowCompleteForm(false)
                }
                className="flex-1 rounded-2xl border border-gray-200 px-4 py-3 font-medium"
              >
                取消
              </button>

              <button
                onClick={completeDinner}
                className="flex-1 rounded-2xl bg-[#ff6b57] px-4 py-3 font-medium text-white"
              >
                保存这顿饭
              </button>
            </div>
          </section>
        )}

        <section className="mb-5 grid grid-cols-2 gap-4">
          <Link
            href="/random"
            className="rounded-3xl bg-white p-5 text-left shadow-sm"
          >
            <div className="text-2xl">
              🎲
            </div>

            <div className="mt-3 font-semibold">
              帮我们决定
            </div>

            <div className="mt-1 text-xs text-gray-500">
              随机选一道
            </div>
          </Link>

          <Link
            href="/vote"
            className="rounded-3xl bg-white p-5 text-left shadow-sm"
          >
            <div className="text-2xl">
              💘
            </div>

            <div className="mt-3 font-semibold">
              熊熊投票
            </div>

            <div className="mt-1 text-xs text-gray-500">
              看看今晚能不能 Match
            </div>
          </Link>
        </section>

        <section className="mb-5 rounded-3xl bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            小笨冰箱状态
          </p>

          <div className="mt-4 flex items-center justify-between">
            <div>
              <p className="text-lg font-semibold">
                还有 {fridgeItems.length} 种食材
              </p>

              <p className="mt-1 text-sm text-gray-500">
                {fridgeItems.length > 0
                  ? fridgeItems
                    .slice(0, 4)
                    .map(
                      (item) => item.name
                    )
                    .join(" · ")
                  : "冰箱还是空的"}
              </p>
            </div>

            <div className="text-3xl">
              🥬
            </div>
          </div>
        </section>

        <Link
          href="/history"
          className="mb-5 rounded-3xl bg-white p-5 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                一二&布布的记录
              </p>

              <p className="mt-2 text-lg font-semibold">
                看看最近吃过什么
              </p>
            </div>

            <div className="text-3xl">
              📖
            </div>
          </div>
        </Link>

        <Link
          href="/reports"
          className="mb-5 rounded-3xl bg-white p-5 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                饮食总结
              </p>

              <p className="mt-2 text-lg font-semibold">
                看看本周和本月吃得怎么样
              </p>
            </div>

            <div className="text-3xl">
              ✨
            </div>
          </div>
        </Link>
      </div>

      <BottomNav />
    </main>
  );
}