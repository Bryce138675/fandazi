"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import { recipes } from "@/data/recipes";
import {
    getCloudState,
    patchCloudState,
} from "@/lib/fandaziCloud";

type FridgeItem = {
    id: number;
    name: string;
    quantity: string;
    unit: string;
    urgent: boolean;
};

const FRIDGE_KEY =
    "fandazi-fridge-items";

const DINNER_KEY =
    "fandazi-tonight-dinner";

export default function RandomPage() {
    const [fridgeItems, setFridgeItems] =
        useState<FridgeItem[]>([]);

    const [
        selectedId,
        setSelectedId,
    ] = useState<string | null>(
        null
    );

    const [loaded, setLoaded] =
        useState(false);

    const [syncStatus, setSyncStatus] =
        useState("正在连接云端...");

    useEffect(() => {
        loadFridge();
    }, []);

    async function loadFridge() {
        const saved =
            localStorage.getItem(
                FRIDGE_KEY
            );

        let localItems: FridgeItem[] =
            [];

        if (saved) {
            try {
                localItems =
                    JSON.parse(saved);

                setFridgeItems(
                    localItems
                );
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

            setFridgeItems(
                cloudItems
            );

            localStorage.setItem(
                FRIDGE_KEY,
                JSON.stringify(
                    cloudItems
                )
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

        setFridgeItems(
            cloudItems
        );

        localStorage.setItem(
            FRIDGE_KEY,
            JSON.stringify(
                cloudItems
            )
        );

        setSelectedId(null);

        setSyncStatus(
            "已读取最新冰箱 ☁️"
        );
    }

    const rankedRecipes =
        useMemo(() => {
            const fridgeNames =
                fridgeItems.map(
                    (item) =>
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
                        recipe.ingredients
                            .length === 0
                            ? 0
                            : Math.round(
                                (matched.length /
                                    recipe
                                        .ingredients
                                        .length) *
                                100
                            );

                    const urgentMatched =
                        fridgeItems.filter(
                            (item) =>
                                item.urgent &&
                                recipe.ingredients.some(
                                    (
                                        ingredient
                                    ) =>
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

    const selectedRecipe =
        rankedRecipes.find(
            (recipe) =>
                recipe.id ===
                selectedId
        );

    function pickRandom() {
        if (
            rankedRecipes.length === 0
        ) {
            return;
        }

        const topCandidates =
            rankedRecipes.slice(
                0,
                Math.min(
                    5,
                    rankedRecipes.length
                )
            );

        const randomIndex =
            Math.floor(
                Math.random() *
                topCandidates.length
            );

        setSelectedId(
            topCandidates[
                randomIndex
            ].id
        );
    }

    async function chooseDinner() {
        if (!selectedRecipe) return;

        const dinnerData = {
            recipeId:
                selectedRecipe.id,
            recipeName:
                selectedRecipe.name,
            selectedAt:
                new Date().toISOString(),
            status: "selected",
            source: "random",
        };

        localStorage.setItem(
            DINNER_KEY,
            JSON.stringify(
                dinnerData
            )
        );

        setSyncStatus(
            "正在同步今晚菜单..."
        );

        const result =
            await patchCloudState({
                tonightDinner:
                    dinnerData,
            });

        if (!result) {
            setSyncStatus(
                "云端同步失败，本机数据已保存"
            );

            return;
        }

        window.location.href =
            "/";
    }

    return (
        <main className="min-h-screen bg-[#fffaf5] px-5 py-8 pb-32 text-[#2b2b2b]">
            <div className="mx-auto max-w-md">
                <header className="mb-8">
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <p className="text-sm text-gray-500">
                                今晚吃什么
                            </p>

                            <h1 className="mt-1 text-3xl font-bold">
                                帮我们决定 🎲
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
                        从共享冰箱匹配度较高的菜里随机帮你们决定
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
                            先记录一些食材，随机结果才更靠谱
                        </p>

                        <Link
                            href="/fridge"
                            className="mt-5 inline-block rounded-2xl bg-[#ff6b57] px-5 py-3 font-medium text-white"
                        >
                            去添加食材
                        </Link>
                    </section>
                ) : !selectedRecipe ? (
                    <section className="rounded-3xl bg-white p-8 text-center shadow-sm">
                        <div className="text-6xl">
                            🎲
                        </div>

                        <h2 className="mt-5 text-2xl font-bold">
                            今天不纠结
                        </h2>

                        <p className="mt-2 text-sm text-gray-500">
                            会优先从当前共享冰箱匹配度最高的几道菜里抽
                        </p>

                        <button
                            onClick={pickRandom}
                            className="mt-6 w-full rounded-2xl bg-[#ff6b57] px-4 py-4 font-medium text-white"
                        >
                            开始抽菜
                        </button>
                    </section>
                ) : (
                    <section className="rounded-3xl bg-white p-6 shadow-sm">
                        <p className="text-sm text-gray-500">
                            今晚抽到的是
                        </p>

                        <div className="mt-5 text-center">
                            <div className="text-5xl">
                                🍳
                            </div>

                            <h2 className="mt-4 text-3xl font-bold">
                                {
                                    selectedRecipe.name
                                }
                            </h2>

                            <p className="mt-3 text-sm text-gray-500">
                                {
                                    selectedRecipe.time
                                }{" "}
                                分钟 · 难度{" "}
                                {
                                    selectedRecipe.difficulty
                                }
                            </p>

                            <div className="mt-5 inline-block rounded-full bg-[#fff0ec] px-4 py-2 text-sm font-medium text-[#ff6b57]">
                                冰箱匹配度{" "}
                                {
                                    selectedRecipe.matchRate
                                }
                                %
                            </div>
                        </div>

                        <div className="mt-6">
                            <p className="text-xs text-gray-400">
                                家里已经有
                            </p>

                            <p className="mt-1 text-sm">
                                {selectedRecipe
                                    .matched.length >
                                    0
                                    ? selectedRecipe.matched
                                        .map(
                                            (item) =>
                                                `${item.name} ${item.quantity}${item.unit}`
                                        )
                                        .join(
                                            " · "
                                        )
                                    : "暂无"}
                            </p>
                        </div>

                        {selectedRecipe
                            .missing.length >
                            0 && (
                                <div className="mt-4">
                                    <p className="text-xs text-gray-400">
                                        还缺
                                    </p>

                                    <p className="mt-1 text-sm text-orange-500">
                                        {selectedRecipe.missing
                                            .map(
                                                (item) =>
                                                    `${item.name} ${item.quantity}${item.unit}`
                                            )
                                            .join(
                                                " · "
                                            )}
                                    </p>
                                </div>
                            )}

                        <button
                            onClick={
                                chooseDinner
                            }
                            className="mt-6 w-full rounded-2xl bg-[#ff6b57] px-4 py-3 font-medium text-white"
                        >
                            今晚就吃这个 ❤️
                        </button>

                        <button
                            onClick={
                                pickRandom
                            }
                            className="mt-3 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 font-medium"
                        >
                            再来一次
                        </button>
                    </section>
                )}
            </div>

            <BottomNav />
        </main>
    );
}