"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import { recipes } from "@/data/recipes";
import { getCloudState } from "@/lib/fandaziCloud";

type FridgeItem = {
    id: number;
    name: string;
    quantity: string;
    unit: string;
    urgent: boolean;
};

const STORAGE_KEY = "fandazi-fridge-items";

export default function RecommendPage() {
    const [fridgeItems, setFridgeItems] =
        useState<FridgeItem[]>([]);

    const [loaded, setLoaded] = useState(false);

    const [syncStatus, setSyncStatus] =
        useState("正在连接云端...");

    useEffect(() => {
        loadFridge();
    }, []);

    async function loadFridge() {
        const saved =
            localStorage.getItem(STORAGE_KEY);

        let localItems: FridgeItem[] = [];

        if (saved) {
            try {
                localItems = JSON.parse(saved);
                setFridgeItems(localItems);
            } catch {
                localItems = [];
            }
        }

        const cloudState =
            await getCloudState();

        if (
            cloudState &&
            Array.isArray(
                cloudState.fridgeItems
            )
        ) {
            const cloudItems =
                cloudState.fridgeItems as FridgeItem[];

            setFridgeItems(cloudItems);

            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(cloudItems)
            );

            setSyncStatus(
                "共享冰箱已同步 ☁️"
            );
        } else {
            setSyncStatus(
                localItems.length > 0
                    ? "云端读取失败，正在使用本机冰箱"
                    : "云端读取失败"
            );
        }

        setLoaded(true);
    }

    async function refreshFromCloud() {
        setSyncStatus(
            "正在读取共享冰箱..."
        );

        const cloudState =
            await getCloudState();

        if (
            !cloudState ||
            !Array.isArray(
                cloudState.fridgeItems
            )
        ) {
            setSyncStatus(
                "读取共享冰箱失败"
            );
            return;
        }

        const cloudItems =
            cloudState.fridgeItems as FridgeItem[];

        setFridgeItems(cloudItems);

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(cloudItems)
        );

        setSyncStatus(
            "已读取最新冰箱 ☁️"
        );
    }

    const rankedRecipes =
        useMemo(() => {
            const fridgeNames =
                fridgeItems.map((item) =>
                    item.name
                        .trim()
                        .toLowerCase()
                );

            return recipes
                .map((recipe) => {
                    const matched =
                        recipe.ingredients.filter(
                            (ingredient) =>
                                fridgeNames.includes(
                                    ingredient.name
                                        .trim()
                                        .toLowerCase()
                                )
                        );

                    const missing =
                        recipe.ingredients.filter(
                            (ingredient) =>
                                !fridgeNames.includes(
                                    ingredient.name
                                        .trim()
                                        .toLowerCase()
                                )
                        );

                    const matchRate =
                        recipe.ingredients.length ===
                            0
                            ? 0
                            : Math.round(
                                (matched.length /
                                    recipe.ingredients
                                        .length) *
                                100
                            );

                    const urgentMatched =
                        fridgeItems.filter(
                            (item) =>
                                item.urgent &&
                                recipe.ingredients.some(
                                    (ingredient) =>
                                        ingredient.name
                                            .trim()
                                            .toLowerCase() ===
                                        item.name
                                            .trim()
                                            .toLowerCase()
                                )
                        ).length;

                    const score =
                        matchRate +
                        urgentMatched * 10;

                    return {
                        ...recipe,
                        matched,
                        missing,
                        matchRate,
                        score,
                    };
                })
                .sort(
                    (a, b) =>
                        b.score - a.score
                );
        }, [fridgeItems]);

    return (
        <main className="min-h-screen bg-[#fffaf5] px-5 py-8 pb-32 text-[#2b2b2b]">
            <div className="mx-auto max-w-md">
                <header className="mb-6">
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <p className="text-sm text-gray-500">
                                今晚吃什么
                            </p>

                            <h1 className="mt-1 text-3xl font-bold">
                                冰箱能做什么 🍳
                            </h1>
                        </div>

                        <button
                            onClick={
                                refreshFromCloud
                            }
                            className="rounded-full bg-white px-3 py-2 text-xs text-gray-500 shadow-sm"
                        >
                            ↻ 刷新
                        </button>
                    </div>

                    <p className="mt-2 text-sm text-gray-500">
                        根据共享冰箱里的食材自动排序
                    </p>

                    <p className="mt-2 text-xs text-green-600">
                        {syncStatus}
                    </p>
                </header>

                {!loaded ? (
                    <section className="rounded-3xl bg-white p-6 text-center shadow-sm">
                        <p className="text-sm text-gray-400">
                            正在读取共享冰箱...
                        </p>
                    </section>
                ) : fridgeItems.length ===
                    0 ? (
                    <section className="rounded-3xl bg-white p-6 text-center shadow-sm">
                        <div className="text-4xl">
                            🥬
                        </div>

                        <h2 className="mt-3 text-lg font-semibold">
                            共享冰箱还是空的
                        </h2>

                        <p className="mt-2 text-sm text-gray-500">
                            先添加一些食材，我们才能开始推荐
                        </p>

                        <Link
                            href="/fridge"
                            className="mt-5 inline-block rounded-2xl bg-[#ff6b57] px-5 py-3 font-medium text-white"
                        >
                            去添加食材
                        </Link>
                    </section>
                ) : (
                    <div className="space-y-4">
                        {rankedRecipes.map(
                            (recipe, index) => {
                                const canCookNow =
                                    recipe.missing
                                        .length === 0;

                                return (
                                    <article
                                        key={recipe.id}
                                        className="rounded-3xl bg-white p-5 shadow-sm"
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <h2 className="text-xl font-semibold">
                                                        {
                                                            recipe.name
                                                        }
                                                    </h2>

                                                    {index ===
                                                        0 && (
                                                            <span className="rounded-full bg-[#fff0ec] px-2 py-1 text-xs text-[#ff6b57]">
                                                                最推荐
                                                            </span>
                                                        )}

                                                    {canCookNow ? (
                                                        <span className="rounded-full bg-green-50 px-2 py-1 text-xs text-green-600">
                                                            现在就能做
                                                        </span>
                                                    ) : (
                                                        <span className="rounded-full bg-orange-50 px-2 py-1 text-xs text-orange-500">
                                                            缺{" "}
                                                            {
                                                                recipe
                                                                    .missing
                                                                    .length
                                                            }{" "}
                                                            样
                                                        </span>
                                                    )}
                                                </div>

                                                <p className="mt-2 text-sm text-gray-500">
                                                    {
                                                        recipe.time
                                                    }{" "}
                                                    分钟 · 难度{" "}
                                                    {
                                                        recipe.difficulty
                                                    }
                                                </p>
                                            </div>

                                            <div className="text-right">
                                                <div className="text-2xl font-bold text-[#ff6b57]">
                                                    {
                                                        recipe.matchRate
                                                    }
                                                    %
                                                </div>

                                                <div className="text-xs text-gray-400">
                                                    匹配度
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-4">
                                            <p className="text-xs text-gray-400">
                                                家里已经有
                                            </p>

                                            <p className="mt-1 text-sm">
                                                {recipe.matched
                                                    .length >
                                                    0
                                                    ? recipe.matched
                                                        .map(
                                                            (
                                                                item
                                                            ) =>
                                                                `${item.name} ${item.quantity}${item.unit}`
                                                        )
                                                        .join(
                                                            " · "
                                                        )
                                                    : "暂无"}
                                            </p>
                                        </div>

                                        {recipe.missing
                                            .length >
                                            0 && (
                                                <div className="mt-3">
                                                    <p className="text-xs text-gray-400">
                                                        还缺
                                                    </p>

                                                    <p className="mt-1 text-sm text-orange-500">
                                                        {recipe.missing
                                                            .map(
                                                                (
                                                                    item
                                                                ) =>
                                                                    `${item.name} ${item.quantity}${item.unit}`
                                                            )
                                                            .join(
                                                                " · "
                                                            )}
                                                    </p>
                                                </div>
                                            )}
                                    </article>
                                );
                            }
                        )}
                    </div>
                )}
            </div>

            <BottomNav />
        </main>
    );
}