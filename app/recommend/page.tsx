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

export default function RecommendPage() {
    const [fridgeItems, setFridgeItems] = useState<FridgeItem[]>([]);

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

    return (
        <main className="min-h-screen bg-[#fffaf5] px-5 py-8 pb-32 text-[#2b2b2b]">
            <div className="mx-auto max-w-md">
                <header className="mb-6">
                    <p className="text-sm text-gray-500">
                        今晚吃什么
                    </p>

                    <h1 className="mt-1 text-3xl font-bold">
                        冰箱能做什么 🍳
                    </h1>

                    <p className="mt-2 text-sm text-gray-500">
                        根据你现在已有的食材自动排序
                    </p>
                </header>

                {fridgeItems.length === 0 ? (
                    <section className="rounded-3xl bg-white p-6 text-center shadow-sm">
                        <div className="text-4xl">🥬</div>

                        <h2 className="mt-3 text-lg font-semibold">
                            冰箱还是空的
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
                        {rankedRecipes.map((recipe) => {
                            const canCookNow =
                                recipe.missing.length === 0;

                            return (
                                <article
                                    key={recipe.id}
                                    className="rounded-3xl bg-white p-5 shadow-sm"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h2 className="text-xl font-semibold">
                                                    {recipe.name}
                                                </h2>

                                                {canCookNow ? (
                                                    <span className="rounded-full bg-green-50 px-2 py-1 text-xs text-green-600">
                                                        现在就能做
                                                    </span>
                                                ) : (
                                                    <span className="rounded-full bg-orange-50 px-2 py-1 text-xs text-orange-500">
                                                        缺 {recipe.missing.length} 样
                                                    </span>
                                                )}
                                            </div>

                                            <p className="mt-2 text-sm text-gray-500">
                                                {recipe.time} 分钟 · 难度{" "}
                                                {recipe.difficulty}
                                            </p>
                                        </div>

                                        <div className="text-right">
                                            <div className="text-2xl font-bold text-[#ff6b57]">
                                                {recipe.matchRate}%
                                            </div>

                                            <div className="text-xs text-gray-400">
                                                匹配度
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-4">
                                        <p className="text-xs text-gray-400">
                                            你已经有
                                        </p>

                                        <p className="mt-1 text-sm">
                                            {recipe.matched.length > 0
                                                ? recipe.matched
                                                    .map(
                                                        (item) =>
                                                            `${item.name} ${item.quantity}${item.unit}`
                                                    )
                                                    .join(" · ")
                                                : "暂无"}
                                        </p>
                                    </div>

                                    {recipe.missing.length > 0 && (
                                        <div className="mt-3">
                                            <p className="text-xs text-gray-400">
                                                还缺
                                            </p>

                                            <p className="mt-1 text-sm text-orange-500">
                                                {recipe.missing
                                                    .map(
                                                        (item) =>
                                                            `${item.name} ${item.quantity}${item.unit}`
                                                    )
                                                    .join(" · ")}
                                            </p>
                                        </div>
                                    )}
                                </article>
                            );
                        })}
                    </div>
                )}
            </div>

            <BottomNav />
        </main>
    );
}