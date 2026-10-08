"use client";

import { useEffect, useMemo, useState } from "react";
import BottomNav from "@/components/BottomNav";
import {
    getCloudState,
    patchCloudState,
} from "@/lib/fandaziCloud";

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

const MEAL_LOG_KEY = "fandazi-meal-logs";

export default function HistoryPage() {
    const [mealLogs, setMealLogs] = useState<MealLog[]>([]);
    const [loaded, setLoaded] = useState(false);
    const [syncStatus, setSyncStatus] =
        useState("正在连接云端...");

    useEffect(() => {
        loadHistory();
    }, []);

    async function loadHistory() {
        const saved = localStorage.getItem(MEAL_LOG_KEY);

        let localLogs: MealLog[] = [];

        if (saved) {
            try {
                localLogs = JSON.parse(saved);
                setMealLogs(localLogs);
            } catch {
                localLogs = [];
            }
        }

        const cloudState = await getCloudState();

        if (!cloudState) {
            setLoaded(true);
            setSyncStatus("云端读取失败，本机仍可使用");
            return;
        }

        if (Array.isArray(cloudState.mealLogs)) {
            const cloudLogs =
                cloudState.mealLogs as MealLog[];

            setMealLogs(cloudLogs);

            localStorage.setItem(
                MEAL_LOG_KEY,
                JSON.stringify(cloudLogs)
            );
        } else if (localLogs.length > 0) {
            await patchCloudState({
                mealLogs: localLogs,
            });
        }

        setLoaded(true);
        setSyncStatus("云端已同步 ☁️");
    }

    async function refreshFromCloud() {
        setSyncStatus("正在读取云端...");

        const cloudState = await getCloudState();

        if (
            !cloudState ||
            !Array.isArray(cloudState.mealLogs)
        ) {
            setSyncStatus("读取云端失败");
            return;
        }

        const cloudLogs =
            cloudState.mealLogs as MealLog[];

        setMealLogs(cloudLogs);

        localStorage.setItem(
            MEAL_LOG_KEY,
            JSON.stringify(cloudLogs)
        );

        setSyncStatus("已读取最新数据 ☁️");
    }

    async function deleteLog(id: number) {
        const next = mealLogs.filter(
            (log) => log.id !== id
        );

        setMealLogs(next);

        localStorage.setItem(
            MEAL_LOG_KEY,
            JSON.stringify(next)
        );

        setSyncStatus("正在同步...");

        const result = await patchCloudState({
            mealLogs: next,
        });

        setSyncStatus(
            result
                ? "已同步 ☁️"
                : "同步失败，本机数据已保存"
        );
    }

    async function clearAll() {
        const confirmed = window.confirm(
            "确定要清空所有吃饭记录吗？"
        );

        if (!confirmed) return;

        setMealLogs([]);
        localStorage.setItem(
            MEAL_LOG_KEY,
            JSON.stringify([])
        );

        setSyncStatus("正在同步...");

        const result = await patchCloudState({
            mealLogs: [],
        });

        setSyncStatus(
            result
                ? "已同步 ☁️"
                : "同步失败"
        );
    }

    const totalMeals = mealLogs.length;

    const averageRating = useMemo(() => {
        if (mealLogs.length === 0) return 0;

        const total = mealLogs.reduce(
            (sum, log) => sum + log.rating,
            0
        );

        return total / mealLogs.length;
    }, [mealLogs]);

    const favoriteDish = useMemo(() => {
        if (mealLogs.length === 0) return "暂无";

        const counts: Record<string, number> = {};

        mealLogs.forEach((log) => {
            counts[log.recipeName] =
                (counts[log.recipeName] || 0) + 1;
        });

        const sorted = Object.entries(counts).sort(
            (a, b) => b[1] - a[1]
        );

        return sorted[0]?.[0] || "暂无";
    }, [mealLogs]);

    function formatDate(dateString: string) {
        return new Date(dateString).toLocaleDateString(
            "zh-CN",
            {
                year: "numeric",
                month: "short",
                day: "numeric",
            }
        );
    }

    return (
        <main className="min-h-screen bg-[#fffaf5] px-5 py-8 pb-32 text-[#2b2b2b]">
            <div className="mx-auto max-w-md">
                <header className="mb-6">
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <p className="text-sm text-gray-500">
                                我们吃过什么
                            </p>

                            <h1 className="mt-1 text-3xl font-bold">
                                吃饭记录 📖
                            </h1>
                        </div>

                        <button
                            onClick={refreshFromCloud}
                            className="rounded-full bg-white px-3 py-2 text-xs text-gray-500 shadow-sm"
                        >
                            ↻ 刷新
                        </button>
                    </div>

                    <p className="mt-2 text-xs text-green-600">
                        {syncStatus}
                    </p>
                </header>

                {!loaded ? (
                    <section className="rounded-3xl bg-white p-6 text-center shadow-sm">
                        <p className="text-sm text-gray-400">
                            正在读取共享历史...
                        </p>
                    </section>
                ) : (
                    <>
                        <section className="mb-6 grid grid-cols-3 gap-3">
                            <div className="rounded-3xl bg-white p-4 text-center shadow-sm">
                                <p className="text-2xl font-bold">
                                    {totalMeals}
                                </p>

                                <p className="mt-1 text-xs text-gray-400">
                                    顿饭
                                </p>
                            </div>

                            <div className="rounded-3xl bg-white p-4 text-center shadow-sm">
                                <p className="text-2xl font-bold">
                                    {averageRating
                                        ? averageRating.toFixed(1)
                                        : "-"}
                                </p>

                                <p className="mt-1 text-xs text-gray-400">
                                    平均评分
                                </p>
                            </div>

                            <div className="rounded-3xl bg-white p-4 text-center shadow-sm">
                                <p className="truncate text-sm font-semibold">
                                    {favoriteDish}
                                </p>

                                <p className="mt-1 text-xs text-gray-400">
                                    最常吃
                                </p>
                            </div>
                        </section>

                        {mealLogs.length > 0 && (
                            <button
                                onClick={clearAll}
                                className="mb-5 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-500"
                            >
                                清空全部历史
                            </button>
                        )}

                        {mealLogs.length === 0 ? (
                            <section className="rounded-3xl bg-white p-6 text-center shadow-sm">
                                <div className="text-4xl">🍽️</div>

                                <p className="mt-3 font-medium">
                                    还没有吃饭记录
                                </p>

                                <p className="mt-1 text-sm text-gray-400">
                                    完成一顿饭以后会自动出现在这里
                                </p>
                            </section>
                        ) : (
                            <div className="space-y-4">
                                {mealLogs.map((log) => (
                                    <section
                                        key={log.id}
                                        className="rounded-3xl bg-white p-5 shadow-sm"
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <p className="text-xs text-gray-400">
                                                    {formatDate(log.completedAt)}
                                                </p>

                                                <h2 className="mt-1 text-xl font-semibold">
                                                    {log.recipeName}
                                                </h2>

                                                <p className="mt-2 text-sm text-gray-500">
                                                    {log.cookedBy}
                                                </p>
                                            </div>

                                            <button
                                                onClick={() =>
                                                    deleteLog(log.id)
                                                }
                                                className="text-xs text-gray-400"
                                            >
                                                删除
                                            </button>
                                        </div>

                                        <div className="mt-4 flex items-center gap-1">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <span
                                                    key={star}
                                                    className="text-xl"
                                                >
                                                    {star <= log.rating
                                                        ? "⭐"
                                                        : "☆"}
                                                </span>
                                            ))}
                                        </div>

                                        <div className="mt-4 rounded-2xl bg-[#fffaf5] p-4">
                                            <p className="text-sm">
                                                下次还吃：
                                                <span className="font-medium">
                                                    {log.eatAgain}
                                                </span>
                                            </p>

                                            {log.notes && (
                                                <p className="mt-2 text-sm text-gray-500">
                                                    {log.notes}
                                                </p>
                                            )}
                                        </div>
                                    </section>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>

            <BottomNav />
        </main>
    );
}