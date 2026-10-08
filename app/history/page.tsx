"use client";

import { useEffect, useMemo, useState } from "react";
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

export default function HistoryPage() {
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
                total: 0,
                averageRating: 0,
                favorite: "还没有",
            };
        }

        const totalRating = logs.reduce(
            (sum, log) => sum + log.rating,
            0
        );

        const countMap: Record<string, number> = {};

        logs.forEach((log) => {
            countMap[log.recipeName] =
                (countMap[log.recipeName] || 0) + 1;
        });

        const favorite = Object.entries(countMap).sort(
            (a, b) => b[1] - a[1]
        )[0]?.[0];

        return {
            total: logs.length,
            averageRating: Number(
                (totalRating / logs.length).toFixed(1)
            ),
            favorite: favorite || "还没有",
        };
    }, [logs]);

    function deleteLog(id: number) {
        const nextLogs = logs.filter((log) => log.id !== id);

        setLogs(nextLogs);

        localStorage.setItem(
            "fandazi-meal-logs",
            JSON.stringify(nextLogs)
        );
    }

    function clearAll() {
        const confirmed = window.confirm(
            "确定要清空所有吃饭记录吗？"
        );

        if (!confirmed) return;

        localStorage.removeItem("fandazi-meal-logs");
        setLogs([]);
    }

    return (
        <main className="min-h-screen bg-[#fffaf5] px-5 py-8 pb-32 text-[#2b2b2b]">
            <div className="mx-auto max-w-md">
                <header className="mb-8">
                    <p className="text-sm text-gray-500">
                        我们的吃饭记忆
                    </p>

                    <h1 className="mt-1 text-3xl font-bold">
                        吃过什么 🍽️
                    </h1>

                    <p className="mt-2 text-sm text-gray-500">
                        每一顿都会慢慢变成你们自己的饮食记录
                    </p>
                </header>

                <section className="mb-6 grid grid-cols-3 gap-3">
                    <div className="rounded-3xl bg-white p-4 text-center shadow-sm">
                        <p className="text-2xl font-bold">
                            {stats.total}
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                            一起吃过
                        </p>
                    </div>

                    <div className="rounded-3xl bg-white p-4 text-center shadow-sm">
                        <p className="text-2xl font-bold">
                            {stats.averageRating || "-"}
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                            平均评分
                        </p>
                    </div>

                    <div className="rounded-3xl bg-white p-4 text-center shadow-sm">
                        <p className="truncate text-base font-bold">
                            {stats.favorite}
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                            最常吃
                        </p>
                    </div>
                </section>

                {logs.length === 0 ? (
                    <section className="rounded-3xl bg-white p-7 text-center shadow-sm">
                        <div className="text-5xl">
                            🍳
                        </div>

                        <h2 className="mt-4 text-lg font-semibold">
                            还没有吃饭记录
                        </h2>

                        <p className="mt-2 text-sm text-gray-500">
                            完成第一顿以后，这里就会出现你们的记录
                        </p>
                    </section>
                ) : (
                    <>
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-lg font-semibold">
                                最近吃过
                            </h2>

                            <button
                                onClick={clearAll}
                                className="text-sm text-gray-400"
                            >
                                清空记录
                            </button>
                        </div>

                        <div className="space-y-4">
                            {logs.map((log) => (
                                <article
                                    key={log.id}
                                    className="rounded-3xl bg-white p-5 shadow-sm"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <h2 className="text-xl font-semibold">
                                                {log.recipeName}
                                            </h2>

                                            <p className="mt-1 text-sm text-gray-500">
                                                {new Date(
                                                    log.completedAt
                                                ).toLocaleDateString("zh-CN", {
                                                    year: "numeric",
                                                    month: "long",
                                                    day: "numeric",
                                                })}
                                            </p>
                                        </div>

                                        <div className="text-right">
                                            <div className="text-lg">
                                                {"⭐".repeat(log.rating)}
                                            </div>

                                            <p className="mt-1 text-xs text-gray-400">
                                                {log.rating}/5
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-4 grid grid-cols-2 gap-3">
                                        <div className="rounded-2xl bg-[#fffaf5] p-3">
                                            <p className="text-xs text-gray-400">
                                                谁做的
                                            </p>

                                            <p className="mt-1 text-sm font-medium">
                                                👨‍🍳 {log.cookedBy}
                                            </p>
                                        </div>

                                        <div className="rounded-2xl bg-[#fffaf5] p-3">
                                            <p className="text-xs text-gray-400">
                                                下次还吃吗
                                            </p>

                                            <p className="mt-1 text-sm font-medium">
                                                ❤️ {log.eatAgain}
                                            </p>
                                        </div>
                                    </div>

                                    {log.notes && (
                                        <div className="mt-4 rounded-2xl bg-[#fffaf5] p-4">
                                            <p className="text-xs text-gray-400">
                                                我们的备注
                                            </p>

                                            <p className="mt-1 text-sm text-gray-600">
                                                {log.notes}
                                            </p>
                                        </div>
                                    )}

                                    <button
                                        onClick={() => deleteLog(log.id)}
                                        className="mt-4 text-sm text-gray-400"
                                    >
                                        删除这条记录
                                    </button>
                                </article>
                            ))}
                        </div>
                    </>
                )}
            </div>

            <BottomNav />
        </main>
    );
}