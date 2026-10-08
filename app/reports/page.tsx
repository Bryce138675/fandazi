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

export default function ReportsPage() {
    const [logs, setLogs] = useState<MealLog[]>([]);
    const [mode, setMode] = useState<"week" | "month">("week");

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

    const filteredLogs = useMemo(() => {
        const now = new Date();

        return logs.filter((log) => {
            const date = new Date(log.completedAt);
            const diff = now.getTime() - date.getTime();
            const days = diff / (1000 * 60 * 60 * 24);

            if (mode === "week") {
                return days <= 7;
            }

            return days <= 30;
        });
    }, [logs, mode]);

    const stats = useMemo(() => {
        if (filteredLogs.length === 0) {
            return {
                total: 0,
                averageRating: 0,
                favoriteDish: "还没有",
                topCook: "还没有",
                mustEatAgain: 0,
                takeawayCount: 0,
            };
        }

        const dishCount: Record<string, number> = {};
        const cookCount: Record<string, number> = {};

        let totalRating = 0;
        let mustEatAgain = 0;
        let takeawayCount = 0;

        filteredLogs.forEach((log) => {
            totalRating += log.rating;

            dishCount[log.recipeName] =
                (dishCount[log.recipeName] || 0) + 1;

            cookCount[log.cookedBy] =
                (cookCount[log.cookedBy] || 0) + 1;

            if (log.eatAgain === "必须再吃") {
                mustEatAgain += 1;
            }

            if (log.cookedBy === "外卖") {
                takeawayCount += 1;
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
            total: filteredLogs.length,
            averageRating: Number(
                (totalRating / filteredLogs.length).toFixed(1)
            ),
            favoriteDish,
            topCook,
            mustEatAgain,
            takeawayCount,
        };
    }, [filteredLogs]);

    const homemadeCount =
        stats.total - stats.takeawayCount;

    const summary = useMemo(() => {
        if (stats.total === 0) {
            return "还没有足够的数据生成总结。先一起吃几顿饭吧。";
        }

        const periodText =
            mode === "week" ? "这周" : "这个月";

        const homemadeRatio =
            stats.total === 0
                ? 0
                : Math.round(
                    (homemadeCount / stats.total) * 100
                );

        let cookingComment = "";

        if (homemadeRatio >= 80) {
            cookingComment =
                "你们最近自己做饭的比例很高，已经很有家庭厨房的感觉了。";
        } else if (homemadeRatio >= 50) {
            cookingComment =
                "自己做和外卖之间保持得比较平衡，既有仪式感也不会太累。";
        } else {
            cookingComment =
                "最近外卖稍微多了一点，如果有空，可以安排几顿简单快手菜。";
        }

        let ratingComment = "";

        if (stats.averageRating >= 4.5) {
            ratingComment =
                "整体满意度很高，最近选菜基本没怎么踩雷。";
        } else if (stats.averageRating >= 3.5) {
            ratingComment =
                "整体表现不错，但还有一些菜值得继续调整。";
        } else {
            ratingComment =
                "最近有几顿可能不太合胃口，可以多参考高评分菜。";
        }

        let repeatComment = "";

        if (stats.mustEatAgain >= 3) {
            repeatComment = `有 ${stats.mustEatAgain} 顿被标记为“必须再吃”，已经开始形成你们自己的固定菜单了。`;
        } else if (stats.mustEatAgain > 0) {
            repeatComment = `已经有 ${stats.mustEatAgain} 顿进入“必须再吃”名单。`;
        } else {
            repeatComment =
                "目前还没有“必须再吃”的菜，可以继续多尝试几种。";
        }

        return `${periodText}你们一共记录了 ${stats.total} 顿饭，其中自己做了 ${homemadeCount} 顿，外卖 ${stats.takeawayCount} 顿。最常出现的是「${stats.favoriteDish}」，平均评分 ${stats.averageRating} 分。${cookingComment}${ratingComment}${repeatComment}`;
    }, [stats, homemadeCount, mode]);

    return (
        <main className="min-h-screen bg-[#fffaf5] px-5 py-8 pb-32 text-[#2b2b2b]">
            <div className="mx-auto max-w-md">
                <header className="mb-8">
                    <p className="text-sm text-gray-500">
                        我们的饮食报告 ✨
                    </p>

                    <h1 className="mt-1 text-3xl font-bold">
                        吃饭总结
                    </h1>

                    <p className="mt-2 text-sm text-gray-500">
                        看看最近你们都吃了什么
                    </p>
                </header>

                <div className="mb-6 grid grid-cols-2 rounded-2xl bg-white p-1 shadow-sm">
                    <button
                        onClick={() => setMode("week")}
                        className={`rounded-xl px-4 py-3 text-sm font-medium ${mode === "week"
                                ? "bg-[#ff6b57] text-white"
                                : "text-gray-500"
                            }`}
                    >
                        本周
                    </button>

                    <button
                        onClick={() => setMode("month")}
                        className={`rounded-xl px-4 py-3 text-sm font-medium ${mode === "month"
                                ? "bg-[#ff6b57] text-white"
                                : "text-gray-500"
                            }`}
                    >
                        本月
                    </button>
                </div>

                <section className="mb-6 rounded-3xl bg-white p-5 shadow-sm">
                    <p className="text-sm text-gray-500">
                        {mode === "week" ? "本周" : "本月"}一起吃了
                    </p>

                    <div className="mt-2 flex items-end gap-2">
                        <p className="text-5xl font-bold">
                            {stats.total}
                        </p>

                        <p className="pb-1 text-sm text-gray-400">
                            顿
                        </p>
                    </div>
                </section>

                <section className="mb-6 grid grid-cols-2 gap-3">
                    <div className="rounded-3xl bg-white p-4 shadow-sm">
                        <p className="text-sm text-gray-500">
                            自己做
                        </p>

                        <p className="mt-2 text-3xl font-bold">
                            {homemadeCount}
                        </p>
                    </div>

                    <div className="rounded-3xl bg-white p-4 shadow-sm">
                        <p className="text-sm text-gray-500">
                            外卖
                        </p>

                        <p className="mt-2 text-3xl font-bold">
                            {stats.takeawayCount}
                        </p>
                    </div>

                    <div className="rounded-3xl bg-white p-4 shadow-sm">
                        <p className="text-sm text-gray-500">
                            平均评分
                        </p>

                        <p className="mt-2 text-3xl font-bold">
                            {stats.averageRating || "-"}
                        </p>
                    </div>

                    <div className="rounded-3xl bg-white p-4 shadow-sm">
                        <p className="text-sm text-gray-500">
                            必须再吃
                        </p>

                        <p className="mt-2 text-3xl font-bold">
                            {stats.mustEatAgain}
                        </p>
                    </div>
                </section>

                <section className="mb-6 rounded-3xl bg-white p-5 shadow-sm">
                    <p className="text-sm text-gray-500">
                        最常吃
                    </p>

                    <p className="mt-2 text-2xl font-bold">
                        {stats.favoriteDish}
                    </p>

                    <div className="mt-4 border-t border-gray-100 pt-4">
                        <p className="text-sm text-gray-500">
                            做饭担当
                        </p>

                        <p className="mt-1 text-lg font-semibold">
                            {stats.topCook}
                        </p>
                    </div>
                </section>

                <section className="mb-6 rounded-3xl bg-[#fff0ec] p-5">
                    <p className="text-sm font-medium text-[#ff6b57]">
                        ✨ 饭搭子智能总结
                    </p>

                    <p className="mt-3 leading-7 text-gray-700">
                        {summary}
                    </p>
                </section>

                <section className="rounded-3xl bg-white p-5 shadow-sm">
                    <p className="text-sm text-gray-500">
                        当前模式
                    </p>

                    <h2 className="mt-2 text-lg font-semibold">
                        0 成本智能总结
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-gray-500">
                        目前总结完全根据你们的真实吃饭记录在本地生成，不调用任何付费 AI API。
                    </p>
                </section>
            </div>

            <BottomNav />
        </main>
    );
}