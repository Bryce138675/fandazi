"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";

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

export default function UsPage() {
    const [logs, setLogs] = useState<MealLog[]>([]);

    useEffect(() => {
        const saved = localStorage.getItem("fandazi-meal-logs");

        if (saved) {
            try {
                setLogs(JSON.parse(saved));
            } catch {
                setLogs([]);
            }
        }
    }, []);

    const stats = useMemo(() => {
        if (logs.length === 0) {
            return {
                totalMeals: 0,
                averageRating: 0,
                favoriteDish: "还没有",
                topCook: "还没有",
                mustEatAgain: 0,
            };
        }

        const dishCount: Record<string, number> = {};
        const cookCount: Record<string, number> = {};

        let totalRating = 0;
        let mustEatAgain = 0;

        logs.forEach((log) => {
            totalRating += log.rating;

            dishCount[log.recipeName] =
                (dishCount[log.recipeName] || 0) + 1;

            cookCount[log.cookedBy] =
                (cookCount[log.cookedBy] || 0) + 1;

            if (log.eatAgain === "必须再吃") {
                mustEatAgain += 1;
            }
        });

        const favoriteDish =
            Object.entries(dishCount).sort(
                (a, b) => b[1] - a[1]
            )[0]?.[0] || "还没有";

        const topCook =
            Object.entries(cookCount).sort(
                (a, b) => b[1] - a[1]
            )[0]?.[0] || "还没有";

        return {
            totalMeals: logs.length,
            averageRating: Number(
                (totalRating / logs.length).toFixed(1)
            ),
            favoriteDish,
            topCook,
            mustEatAgain,
        };
    }, [logs]);

    const recentLogs = logs.slice(0, 3);

    return (
        <main className="min-h-screen bg-[#fffaf5] px-5 py-8 pb-32 text-[#2b2b2b]">
            <div className="mx-auto max-w-md">
                <header className="mb-8">
                    <p className="text-sm text-gray-500">
                        我们的饭搭子空间 ❤️
                    </p>

                    <h1 className="mt-1 text-3xl font-bold">
                        我们
                    </h1>

                    <p className="mt-2 text-sm text-gray-500">
                        两个人一起吃过的每一顿，都会慢慢留在这里
                    </p>
                </header>

                <section className="mb-6 rounded-3xl bg-white p-5 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#fff0ec] text-2xl">
                            🧑🏻
                        </div>

                        <div className="flex-1 text-center text-gray-300">
                            ❤️
                        </div>

                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#fff0ec] text-2xl">
                            🧑🏻‍🍳
                        </div>
                    </div>

                    <p className="mt-4 text-center text-sm text-gray-500">
                        两个人的共享厨房
                    </p>
                </section>

                <section className="mb-6 grid grid-cols-2 gap-3">
                    <div className="rounded-3xl bg-white p-4 shadow-sm">
                        <p className="text-sm text-gray-500">
                            一起吃过
                        </p>

                        <p className="mt-2 text-3xl font-bold">
                            {stats.totalMeals}
                        </p>

                        <p className="mt-1 text-xs text-gray-400">
                            顿
                        </p>
                    </div>

                    <div className="rounded-3xl bg-white p-4 shadow-sm">
                        <p className="text-sm text-gray-500">
                            平均评分
                        </p>

                        <p className="mt-2 text-3xl font-bold">
                            {stats.averageRating || "-"}
                        </p>

                        <p className="mt-1 text-xs text-gray-400">
                            / 5
                        </p>
                    </div>

                    <div className="rounded-3xl bg-white p-4 shadow-sm">
                        <p className="text-sm text-gray-500">
                            最常吃
                        </p>

                        <p className="mt-2 truncate text-lg font-bold">
                            {stats.favoriteDish}
                        </p>
                    </div>

                    <div className="rounded-3xl bg-white p-4 shadow-sm">
                        <p className="text-sm text-gray-500">
                            做饭担当
                        </p>

                        <p className="mt-2 truncate text-lg font-bold">
                            {stats.topCook}
                        </p>
                    </div>
                </section>

                <section className="mb-6 rounded-3xl bg-[#fff0ec] p-5">
                    <p className="text-sm text-[#ff6b57]">
                        ❤️ 必须再吃
                    </p>

                    <p className="mt-2 text-3xl font-bold">
                        {stats.mustEatAgain}
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                        顿饭被你们标记为“必须再吃”
                    </p>
                </section>

                <section className="mb-6">
                    <div className="mb-3 flex items-center justify-between">
                        <h2 className="text-lg font-semibold">
                            最近一起吃过
                        </h2>

                        <Link
                            href="/history"
                            className="text-sm text-[#ff6b57]"
                        >
                            查看全部
                        </Link>
                    </div>

                    {recentLogs.length === 0 ? (
                        <div className="rounded-3xl bg-white p-5 text-center shadow-sm">
                            <p className="text-sm text-gray-500">
                                还没有记录
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {recentLogs.map((log) => (
                                <div
                                    key={log.id}
                                    className="rounded-3xl bg-white p-4 shadow-sm"
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-semibold">
                                                {log.recipeName}
                                            </p>

                                            <p className="mt-1 text-xs text-gray-400">
                                                {new Date(
                                                    log.completedAt
                                                ).toLocaleDateString("zh-CN")}
                                            </p>
                                        </div>

                                        <div className="text-sm">
                                            {"⭐".repeat(log.rating)}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                <section className="mb-6 grid grid-cols-2 gap-3">
                    <Link
                        href="/history"
                        className="rounded-3xl bg-white p-5 shadow-sm"
                    >
                        <div className="text-2xl">📖</div>

                        <p className="mt-3 font-semibold">
                            吃饭历史
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                            看看我们吃过什么
                        </p>
                    </Link>

                    <Link
                        href="/reports"
                        className="rounded-3xl bg-white p-5 shadow-sm"
                    >
                        <div className="text-2xl">✨</div>

                        <p className="mt-3 font-semibold">
                            我们的总结
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                            周报 · 月报 · AI 总结
                        </p>
                    </Link>
                </section>
            </div>

            <BottomNav />
        </main>
    );
}