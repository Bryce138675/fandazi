"use client";

import { useEffect, useMemo, useState } from "react";
import BottomNav from "@/components/BottomNav";
import {
    getCloudState,
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

export default function ReportsPage() {
    const [mealLogs, setMealLogs] = useState<MealLog[]>([]);
    const [mode, setMode] =
        useState<"week" | "month">("week");

    const [loaded, setLoaded] = useState(false);
    const [syncStatus, setSyncStatus] =
        useState("正在连接云端...");

    useEffect(() => {
        loadReports();
    }, []);

    async function loadReports() {
        const saved = localStorage.getItem(MEAL_LOG_KEY);

        if (saved) {
            try {
                setMealLogs(JSON.parse(saved));
            } catch {
                setMealLogs([]);
            }
        }

        const cloudState = await getCloudState();

        if (
            cloudState &&
            Array.isArray(cloudState.mealLogs)
        ) {
            const cloudLogs =
                cloudState.mealLogs as MealLog[];

            setMealLogs(cloudLogs);

            localStorage.setItem(
                MEAL_LOG_KEY,
                JSON.stringify(cloudLogs)
            );

            setSyncStatus("云端已同步 ☁️");
        } else {
            setSyncStatus("云端读取失败，本机仍可使用");
        }

        setLoaded(true);
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

    const filteredLogs = useMemo(() => {
        const now = Date.now();

        const days =
            mode === "week" ? 7 : 30;

        const cutoff =
            now -
            days * 24 * 60 * 60 * 1000;

        return mealLogs.filter(
            (log) =>
                new Date(
                    log.completedAt
                ).getTime() >= cutoff
        );
    }, [mealLogs, mode]);

    const stats = useMemo(() => {
        const total = filteredLogs.length;

        const averageRating =
            total === 0
                ? 0
                : filteredLogs.reduce(
                    (sum, log) =>
                        sum + log.rating,
                    0
                ) / total;

        const dishCounts: Record<
            string,
            number
        > = {};

        const cookCounts: Record<
            string,
            number
        > = {};

        let mustEatAgain = 0;
        let takeawayCount = 0;

        filteredLogs.forEach((log) => {
            dishCounts[log.recipeName] =
                (dishCounts[
                    log.recipeName
                ] || 0) + 1;

            cookCounts[log.cookedBy] =
                (cookCounts[
                    log.cookedBy
                ] || 0) + 1;

            if (
                log.eatAgain ===
                "必须再吃"
            ) {
                mustEatAgain += 1;
            }

            if (log.cookedBy === "外卖") {
                takeawayCount += 1;
            }
        });

        const favoriteDish =
            Object.entries(
                dishCounts
            ).sort(
                (a, b) =>
                    b[1] - a[1]
            )[0]?.[0] || "暂无";

        const topCook =
            Object.entries(
                cookCounts
            ).sort(
                (a, b) =>
                    b[1] - a[1]
            )[0]?.[0] || "暂无";

        return {
            total,
            averageRating,
            favoriteDish,
            topCook,
            mustEatAgain,
            takeawayCount,
        };
    }, [filteredLogs]);

    const summary = useMemo(() => {
        if (stats.total === 0) {
            return mode === "week"
                ? "这周还没有吃饭记录。完成几顿饭后，这里会自动总结。"
                : "这个月还没有吃饭记录。完成几顿饭后，这里会自动总结。";
        }

        const homemade =
            stats.total -
            stats.takeawayCount;

        const homemadeRatio =
            stats.total === 0
                ? 0
                : homemade /
                stats.total;

        const parts: string[] = [];

        if (stats.averageRating >= 4.5) {
            parts.push(
                "最近整体吃得很满意，平均评分非常高。"
            );
        } else if (
            stats.averageRating >= 3.5
        ) {
            parts.push(
                "最近整体表现不错，还有一些菜值得继续优化。"
            );
        } else {
            parts.push(
                "最近几顿的整体评分比较一般，可以多参考五星菜单。"
            );
        }

        if (
            homemadeRatio >= 0.7
        ) {
            parts.push(
                "大部分都是自己做，居家做饭频率很高。"
            );
        } else if (
            stats.takeawayCount >=
            homemade
        ) {
            parts.push(
                "外卖占比偏高，如果想控制外卖频率，可以多用一周菜单提前安排。"
            );
        }

        if (
            stats.mustEatAgain > 0
        ) {
            parts.push(
                `有 ${stats.mustEatAgain} 顿被标记为“必须再吃”，可以优先放进下一周菜单。`
            );
        }

        if (
            stats.favoriteDish !==
            "暂无"
        ) {
            parts.push(
                `最近最常出现的是「${stats.favoriteDish}」。`
            );
        }

        return parts.join(" ");
    }, [stats, mode]);

    return (
        <main className="min-h-screen bg-[#fffaf5] px-5 py-8 pb-32 text-[#2b2b2b]">
            <div className="mx-auto max-w-md">
                <header className="mb-6">
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <p className="text-sm text-gray-500">
                                我们最近吃得怎么样
                            </p>

                            <h1 className="mt-1 text-3xl font-bold">
                                饮食总结 ✨
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

                <div className="mb-6 grid grid-cols-2 rounded-2xl bg-white p-1 shadow-sm">
                    <button
                        onClick={() =>
                            setMode("week")
                        }
                        className={`rounded-xl px-4 py-3 text-sm font-medium ${mode === "week"
                                ? "bg-[#ff6b57] text-white"
                                : "text-gray-500"
                            }`}
                    >
                        本周
                    </button>

                    <button
                        onClick={() =>
                            setMode("month")
                        }
                        className={`rounded-xl px-4 py-3 text-sm font-medium ${mode === "month"
                                ? "bg-[#ff6b57] text-white"
                                : "text-gray-500"
                            }`}
                    >
                        本月
                    </button>
                </div>

                {!loaded ? (
                    <section className="rounded-3xl bg-white p-6 text-center shadow-sm">
                        <p className="text-sm text-gray-400">
                            正在读取共享记录...
                        </p>
                    </section>
                ) : (
                    <>
                        <section className="mb-6 rounded-3xl bg-white p-5 shadow-sm">
                            <p className="text-sm text-gray-500">
                                0 成本智能总结
                            </p>

                            <p className="mt-3 leading-7">
                                {summary}
                            </p>
                        </section>

                        <section className="mb-6 grid grid-cols-2 gap-3">
                            <div className="rounded-3xl bg-white p-5 shadow-sm">
                                <p className="text-sm text-gray-500">
                                    吃了
                                </p>

                                <p className="mt-2 text-3xl font-bold">
                                    {stats.total}
                                </p>

                                <p className="mt-1 text-xs text-gray-400">
                                    顿
                                </p>
                            </div>

                            <div className="rounded-3xl bg-white p-5 shadow-sm">
                                <p className="text-sm text-gray-500">
                                    平均评分
                                </p>

                                <p className="mt-2 text-3xl font-bold">
                                    {stats.averageRating
                                        ? stats.averageRating.toFixed(
                                            1
                                        )
                                        : "-"}
                                </p>

                                <p className="mt-1 text-xs text-gray-400">
                                    / 5
                                </p>
                            </div>
                        </section>

                        <section className="space-y-4">
                            <div className="rounded-3xl bg-white p-5 shadow-sm">
                                <p className="text-sm text-gray-500">
                                    最近最常吃
                                </p>

                                <p className="mt-2 text-xl font-semibold">
                                    {stats.favoriteDish}
                                </p>
                            </div>

                            <div className="rounded-3xl bg-white p-5 shadow-sm">
                                <p className="text-sm text-gray-500">
                                    最近谁最常负责
                                </p>

                                <p className="mt-2 text-xl font-semibold">
                                    {stats.topCook}
                                </p>
                            </div>

                            <div className="rounded-3xl bg-white p-5 shadow-sm">
                                <p className="text-sm text-gray-500">
                                    必须再吃
                                </p>

                                <p className="mt-2 text-xl font-semibold">
                                    {stats.mustEatAgain} 顿
                                </p>
                            </div>

                            <div className="rounded-3xl bg-white p-5 shadow-sm">
                                <p className="text-sm text-gray-500">
                                    外卖
                                </p>

                                <p className="mt-2 text-xl font-semibold">
                                    {stats.takeawayCount} 顿
                                </p>
                            </div>
                        </section>
                    </>
                )}
            </div>

            <BottomNav />
        </main>
    );
}