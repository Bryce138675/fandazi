"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import { recipes } from "@/data/recipes";

type FridgeItem = {
    id: number;
    name: string;
    quantity: string;
    unit: string;
    urgent: boolean;
};

const STORAGE_KEY = "fandazi-fridge-items";

export default function RandomPage() {
    const [fridgeItems, setFridgeItems] = useState<FridgeItem[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);

    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY);

        if (saved) {
            try {
                setFridgeItems(JSON.parse(saved));
            } catch {
                setFridgeItems([]);
            }
        }
    }, []);

    const rankedRecipes = useMemo(() => {
        const fridgeNames = fridgeItems.map((item) =>
            item.name.trim()
        );

        return recipes
            .map((recipe) => {
                const matched = recipe.ingredients.filter(
                    (ingredient) =>
                        fridgeNames.includes(ingredient.name)
                );

                const missing = recipe.ingredients.filter(
                    (ingredient) =>
                        !fridgeNames.includes(ingredient.name)
                );

                const matchRate =
                    recipe.ingredients.length === 0
                        ? 0
                        : Math.round(
                            (matched.length /
                                recipe.ingredients.length) *
                            100
                        );

                const urgentMatched = fridgeItems.filter(
                    (item) =>
                        item.urgent &&
                        recipe.ingredients.some(
                            (ingredient) =>
                                ingredient.name === item.name.trim()
                        )
                ).length;

                const score = matchRate + urgentMatched * 10;

                return {
                    ...recipe,
                    matched,
                    missing,
                    matchRate,
                    score,
                };
            })
            .sort((a, b) => b.score - a.score);
    }, [fridgeItems]);

    const selectedRecipe = rankedRecipes.find(
        (recipe) => recipe.id === selectedId
    );

    function pickRandom() {
        if (rankedRecipes.length === 0) return;

        const topCandidates = rankedRecipes.slice(
            0,
            Math.min(5, rankedRecipes.length)
        );

        const randomIndex = Math.floor(
            Math.random() * topCandidates.length
        );

        setSelectedId(topCandidates[randomIndex].id);
    }

    function chooseDinner() {
        if (!selectedRecipe) return;

        const dinnerData = {
            recipeId: selectedRecipe.id,
            recipeName: selectedRecipe.name,
            selectedAt: new Date().toISOString(),
            status: "selected",
        };

        localStorage.setItem(
            "fandazi-tonight-dinner",
            JSON.stringify(dinnerData)
        );

        window.location.href = "/";
    }

    return (
        <main className="min-h-screen bg-[#fffaf5] px-5 py-8 pb-32 text-[#2b2b2b]">
            <div className="mx-auto max-w-md">
                <header className="mb-8">
                    <p className="text-sm text-gray-500">
                        今晚吃什么
                    </p>

                    <h1 className="mt-1 text-3xl font-bold">
                        帮我们决定 🎲
                    </h1>

                    <p className="mt-2 text-sm text-gray-500">
                        会优先从和冰箱匹配度较高的菜里帮你们抽
                    </p>
                </header>

                {fridgeItems.length === 0 ? (
                    <section className="rounded-3xl bg-white p-6 text-center shadow-sm">
                        <div className="text-4xl">🥬</div>

                        <h2 className="mt-3 text-lg font-semibold">
                            冰箱还是空的
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
                        <div className="text-6xl">🎲</div>

                        <h2 className="mt-5 text-2xl font-bold">
                            今天不纠结
                        </h2>

                        <p className="mt-2 text-sm text-gray-500">
                            点击下面，让饭搭子帮你们决定
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
                            <div className="text-5xl">🍳</div>

                            <h2 className="mt-4 text-3xl font-bold">
                                {selectedRecipe.name}
                            </h2>

                            <p className="mt-3 text-sm text-gray-500">
                                {selectedRecipe.time} 分钟 · 难度{" "}
                                {selectedRecipe.difficulty}
                            </p>

                            <div className="mt-5 inline-block rounded-full bg-[#fff0ec] px-4 py-2 text-sm font-medium text-[#ff6b57]">
                                冰箱匹配度 {selectedRecipe.matchRate}%
                            </div>
                        </div>

                        <div className="mt-6">
                            <p className="text-xs text-gray-400">
                                你已经有
                            </p>

                            <p className="mt-1 text-sm">
                                {selectedRecipe.matched.length > 0
                                    ? selectedRecipe.matched
                                        .map(
                                            (item) =>
                                                `${item.name} ${item.quantity}${item.unit}`
                                        )
                                        .join(" · ")
                                    : "暂无"}
                            </p>
                        </div>

                        {selectedRecipe.missing.length > 0 && (
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
                                        .join(" · ")}
                                </p>
                            </div>
                        )}

                        <button
                            onClick={chooseDinner}
                            className="mt-6 w-full rounded-2xl bg-[#ff6b57] px-4 py-3 font-medium text-white"
                        >
                            今晚就吃这个 ❤️
                        </button>

                        <button
                            onClick={pickRandom}
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