"use client";

import { useEffect, useMemo, useState } from "react";
import BottomNav from "@/components/BottomNav";
import { recipes } from "@/data/recipes";
import {
    getCloudState,
    patchCloudState,
} from "@/lib/fandaziCloud";

type Ingredient = {
    name: string;
    quantity: number;
    unit: string;
};

type VoteRecipe = {
    id: string;
    name: string;
    time: number;
    difficulty: number;
    ingredients: Ingredient[];
    source: "system" | "custom" | "fiveStar";
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

type CustomRecipe = {
    id: string;
    name: string;
    time: number;
    difficulty: number;
    ingredients?: Ingredient[];
};

const CUSTOM_RECIPE_KEY = "fandazi-custom-recipes";
const MEAL_LOG_KEY = "fandazi-meal-logs";
const DINNER_KEY = "fandazi-tonight-dinner";

export default function VotePage() {
    const [myChoices, setMyChoices] =
        useState<string[]>([]);

    const [partnerChoices, setPartnerChoices] =
        useState<string[]>([]);

    const [stage, setStage] =
        useState<"me" | "partner" | "result">("me");

    const [resultId, setResultId] =
        useState<string | null>(null);

    const [customRecipes, setCustomRecipes] =
        useState<CustomRecipe[]>([]);

    const [mealLogs, setMealLogs] =
        useState<MealLog[]>([]);

    const [showAddForm, setShowAddForm] =
        useState(false);

    const [newRecipeName, setNewRecipeName] =
        useState("");

    const [newRecipeTime, setNewRecipeTime] =
        useState("20");

    const [
        newRecipeDifficulty,
        setNewRecipeDifficulty,
    ] = useState("1");

    const [newIngredients, setNewIngredients] =
        useState<Ingredient[]>([
            {
                name: "",
                quantity: 1,
                unit: "个",
            },
        ]);

    const [syncStatus, setSyncStatus] =
        useState("正在连接云端...");

    useEffect(() => {
        loadSharedData();
    }, []);

    async function loadSharedData() {
        const localCustom =
            localStorage.getItem(CUSTOM_RECIPE_KEY);

        const localLogs =
            localStorage.getItem(MEAL_LOG_KEY);

        let localCustomRecipes: CustomRecipe[] = [];
        let localMealLogs: MealLog[] = [];

        if (localCustom) {
            try {
                localCustomRecipes =
                    JSON.parse(localCustom);

                setCustomRecipes(
                    localCustomRecipes
                );
            } catch {
                localCustomRecipes = [];
            }
        }

        if (localLogs) {
            try {
                localMealLogs =
                    JSON.parse(localLogs);

                setMealLogs(localMealLogs);
            } catch {
                localMealLogs = [];
            }
        }

        const cloudState =
            await getCloudState();

        if (cloudState) {
            if (
                Array.isArray(
                    cloudState.customRecipes
                )
            ) {
                const cloudRecipes =
                    cloudState.customRecipes as CustomRecipe[];

                setCustomRecipes(
                    cloudRecipes
                );

                localStorage.setItem(
                    CUSTOM_RECIPE_KEY,
                    JSON.stringify(
                        cloudRecipes
                    )
                );
            } else if (
                localCustomRecipes.length > 0
            ) {
                await patchCloudState({
                    customRecipes:
                        localCustomRecipes,
                });
            }

            if (
                Array.isArray(
                    cloudState.mealLogs
                )
            ) {
                const cloudLogs =
                    cloudState.mealLogs as MealLog[];

                setMealLogs(cloudLogs);

                localStorage.setItem(
                    MEAL_LOG_KEY,
                    JSON.stringify(cloudLogs)
                );
            } else if (
                localMealLogs.length > 0
            ) {
                await patchCloudState({
                    mealLogs: localMealLogs,
                });
            }

            setSyncStatus(
                "云端已同步 ☁️"
            );
        } else {
            setSyncStatus(
                "云端读取失败，本机仍可使用"
            );
        }
    }

    const fiveStarRecipes =
        useMemo<VoteRecipe[]>(() => {
            const map =
                new Map<string, VoteRecipe>();

            mealLogs
                .filter(
                    (log) => log.rating === 5
                )
                .forEach((log) => {
                    const key =
                        log.recipeName
                            .trim()
                            .toLowerCase();

                    const systemRecipe =
                        recipes.find(
                            (recipe) =>
                                recipe.id ===
                                log.recipeId
                        );

                    const customRecipe =
                        customRecipes.find(
                            (recipe) =>
                                recipe.id ===
                                log.recipeId
                        );

                    if (!map.has(key)) {
                        map.set(key, {
                            id: `five-${key}`,
                            name: log.recipeName,
                            time:
                                systemRecipe?.time ??
                                customRecipe?.time ??
                                25,
                            difficulty:
                                systemRecipe
                                    ?.difficulty ??
                                customRecipe
                                    ?.difficulty ??
                                2,
                            ingredients:
                                systemRecipe
                                    ?.ingredients ??
                                customRecipe
                                    ?.ingredients ??
                                [],
                            source:
                                "fiveStar",
                        });
                    }
                });

            return Array.from(
                map.values()
            );
        }, [
            mealLogs,
            customRecipes,
        ]);

    const fiveStarNames =
        useMemo(() => {
            return new Set(
                fiveStarRecipes.map(
                    (recipe) =>
                        recipe.name
                            .trim()
                            .toLowerCase()
                )
            );
        }, [fiveStarRecipes]);

    const customVoteRecipes =
        useMemo<VoteRecipe[]>(() => {
            return customRecipes
                .filter(
                    (recipe) =>
                        !fiveStarNames.has(
                            recipe.name
                                .trim()
                                .toLowerCase()
                        )
                )
                .map((recipe) => ({
                    id: recipe.id,
                    name: recipe.name,
                    time: recipe.time,
                    difficulty:
                        recipe.difficulty,
                    ingredients:
                        recipe.ingredients ?? [],
                    source: "custom",
                }));
        }, [
            customRecipes,
            fiveStarNames,
        ]);

    const customNames =
        useMemo(() => {
            return new Set(
                customRecipes.map(
                    (recipe) =>
                        recipe.name
                            .trim()
                            .toLowerCase()
                )
            );
        }, [customRecipes]);

    const systemVoteRecipes =
        useMemo<VoteRecipe[]>(() => {
            return recipes
                .filter((recipe) => {
                    const key =
                        recipe.name
                            .trim()
                            .toLowerCase();

                    return (
                        !fiveStarNames.has(
                            key
                        ) &&
                        !customNames.has(key)
                    );
                })
                .map((recipe) => ({
                    ...recipe,
                    source: "system",
                }));
        }, [
            fiveStarNames,
            customNames,
        ]);

    const allRecipes =
        useMemo(() => {
            return [
                ...fiveStarRecipes,
                ...customVoteRecipes,
                ...systemVoteRecipes,
            ];
        }, [
            fiveStarRecipes,
            customVoteRecipes,
            systemVoteRecipes,
        ]);

    const matchedRecipes =
        useMemo(() => {
            return myChoices.filter(
                (id) =>
                    partnerChoices.includes(
                        id
                    )
            );
        }, [
            myChoices,
            partnerChoices,
        ]);

    function toggleChoice(
        recipeId: string,
        current: string[],
        setter: (
            value: string[]
        ) => void
    ) {
        if (
            current.includes(recipeId)
        ) {
            setter(
                current.filter(
                    (id) =>
                        id !== recipeId
                )
            );

            return;
        }

        if (current.length >= 5)
            return;

        setter([
            ...current,
            recipeId,
        ]);
    }

    function updateIngredient(
        index: number,
        field: keyof Ingredient,
        value: string
    ) {
        setNewIngredients(
            (current) =>
                current.map(
                    (ingredient, i) => {
                        if (i !== index)
                            return ingredient;

                        if (
                            field === "quantity"
                        ) {
                            return {
                                ...ingredient,
                                quantity:
                                    Number(value) ||
                                    0,
                            };
                        }

                        return {
                            ...ingredient,
                            [field]: value,
                        };
                    }
                )
        );
    }

    function addIngredientRow() {
        setNewIngredients(
            (current) => [
                ...current,
                {
                    name: "",
                    quantity: 1,
                    unit: "个",
                },
            ]
        );
    }

    function removeIngredientRow(
        index: number
    ) {
        setNewIngredients(
            (current) =>
                current.filter(
                    (_, i) =>
                        i !== index
                )
        );
    }

    async function addCustomRecipe() {
        const name =
            newRecipeName.trim();

        if (!name) return;

        const exists =
            allRecipes.some(
                (recipe) =>
                    recipe.name
                        .trim()
                        .toLowerCase() ===
                    name.toLowerCase()
            );

        if (exists) {
            window.alert(
                "这个菜已经在菜单里了"
            );

            return;
        }

        const cleanedIngredients =
            newIngredients
                .map(
                    (ingredient) => ({
                        ...ingredient,
                        name:
                            ingredient.name.trim(),
                    })
                )
                .filter(
                    (ingredient) =>
                        ingredient.name &&
                        ingredient.quantity >
                        0
                );

        const newRecipe: CustomRecipe =
        {
            id: `custom-${Date.now()}`,
            name,
            time:
                Number(
                    newRecipeTime
                ) || 20,
            difficulty:
                Number(
                    newRecipeDifficulty
                ) || 1,
            ingredients:
                cleanedIngredients,
        };

        const next = [
            newRecipe,
            ...customRecipes,
        ];

        setCustomRecipes(next);

        localStorage.setItem(
            CUSTOM_RECIPE_KEY,
            JSON.stringify(next)
        );

        setSyncStatus(
            "正在同步..."
        );

        const result =
            await patchCloudState({
                customRecipes: next,
            });

        setSyncStatus(
            result
                ? "已同步 ☁️"
                : "云端同步失败，本机数据已保存"
        );

        setNewRecipeName("");
        setNewRecipeTime("20");
        setNewRecipeDifficulty(
            "1"
        );

        setNewIngredients([
            {
                name: "",
                quantity: 1,
                unit: "个",
            },
        ]);

        setShowAddForm(false);
    }

    async function deleteCustomRecipe(
        id: string
    ) {
        const next =
            customRecipes.filter(
                (recipe) =>
                    recipe.id !== id
            );

        setCustomRecipes(next);

        localStorage.setItem(
            CUSTOM_RECIPE_KEY,
            JSON.stringify(next)
        );

        setMyChoices(
            (current) =>
                current.filter(
                    (choice) =>
                        choice !== id
                )
        );

        setPartnerChoices(
            (current) =>
                current.filter(
                    (choice) =>
                        choice !== id
                )
        );

        setSyncStatus(
            "正在同步..."
        );

        const result =
            await patchCloudState({
                customRecipes: next,
            });

        setSyncStatus(
            result
                ? "已同步 ☁️"
                : "云端同步失败"
        );
    }

    function finishPartnerVote() {
        if (
            partnerChoices.length === 0
        )
            return;

        const matches =
            myChoices.filter((id) =>
                partnerChoices.includes(id)
            );

        if (matches.length > 0) {
            const randomIndex =
                Math.floor(
                    Math.random() *
                    matches.length
                );

            setResultId(
                matches[randomIndex]
            );
        } else {
            const combined = [
                ...new Set([
                    ...myChoices,
                    ...partnerChoices,
                ]),
            ];

            const randomIndex =
                Math.floor(
                    Math.random() *
                    combined.length
                );

            setResultId(
                combined[randomIndex]
            );
        }

        setStage("result");
    }

    async function chooseTonight() {
        if (!resultId) return;

        const recipe =
            allRecipes.find(
                (item) =>
                    item.id === resultId
            );

        if (!recipe) return;

        const dinnerData = {
            recipeId: recipe.id,
            recipeName:
                recipe.name,
            selectedAt:
                new Date().toISOString(),
            status: "selected",
            source: "vote",
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

        await patchCloudState({
            tonightDinner:
                dinnerData,
        });

        window.location.href =
            "/";
    }

    async function refreshFromCloud() {
        setSyncStatus(
            "正在读取云端..."
        );

        const cloudState =
            await getCloudState();

        if (!cloudState) {
            setSyncStatus(
                "读取云端失败"
            );

            return;
        }

        if (
            Array.isArray(
                cloudState.customRecipes
            )
        ) {
            const cloudRecipes =
                cloudState.customRecipes as CustomRecipe[];

            setCustomRecipes(
                cloudRecipes
            );

            localStorage.setItem(
                CUSTOM_RECIPE_KEY,
                JSON.stringify(
                    cloudRecipes
                )
            );
        }

        if (
            Array.isArray(
                cloudState.mealLogs
            )
        ) {
            const cloudLogs =
                cloudState.mealLogs as MealLog[];

            setMealLogs(cloudLogs);

            localStorage.setItem(
                MEAL_LOG_KEY,
                JSON.stringify(cloudLogs)
            );
        }

        setSyncStatus(
            "已读取最新数据 ☁️"
        );
    }

    function restart() {
        setMyChoices([]);
        setPartnerChoices([]);
        setResultId(null);
        setStage("me");
    }

    const resultRecipe =
        allRecipes.find(
            (recipe) =>
                recipe.id === resultId
        );

    function renderRecipeCard(
        recipe: VoteRecipe,
        currentChoices: string[],
        setter: (
            value: string[]
        ) => void
    ) {
        const selected =
            currentChoices.includes(
                recipe.id
            );

        return (
            <div
                key={recipe.id}
                className={`rounded-3xl p-4 shadow-sm ${selected
                        ? "bg-[#fff0ec] ring-2 ring-[#ff6b57]"
                        : "bg-white"
                    }`}
            >
                <button
                    onClick={() =>
                        toggleChoice(
                            recipe.id,
                            currentChoices,
                            setter
                        )
                    }
                    className="w-full text-left"
                >
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <p className="font-semibold">
                                {recipe.name}
                            </p>

                            <p className="mt-1 text-sm text-gray-500">
                                {recipe.time} 分钟 ·
                                难度{" "}
                                {
                                    recipe.difficulty
                                }
                            </p>

                            {recipe.ingredients
                                .length > 0 && (
                                    <p className="mt-2 text-xs text-gray-400">
                                        {recipe.ingredients
                                            .slice(0, 4)
                                            .map(
                                                (item) =>
                                                    `${item.name} ${item.quantity}${item.unit}`
                                            )
                                            .join(
                                                " · "
                                            )}
                                    </p>
                                )}
                        </div>

                        <div className="text-xl">
                            {selected
                                ? "❤️"
                                : "○"}
                        </div>
                    </div>
                </button>

                {recipe.source ===
                    "custom" && (
                        <button
                            onClick={() =>
                                deleteCustomRecipe(
                                    recipe.id
                                )
                            }
                            className="mt-3 text-xs text-gray-400"
                        >
                            删除自定义菜
                        </button>
                    )}
            </div>
        );
    }

    function renderMenu(
        currentChoices: string[],
        setter: (
            value: string[]
        ) => void
    ) {
        return (
            <>
                {fiveStarRecipes.length >
                    0 && (
                        <section className="mb-6">
                            <div className="mb-3">
                                <h2 className="text-lg font-semibold">
                                    五星菜单 ⭐
                                </h2>

                                <p className="mt-1 text-xs text-gray-500">
                                    你们历史里评过 5
                                    星的菜
                                </p>
                            </div>

                            <div className="space-y-3">
                                {fiveStarRecipes.map(
                                    (recipe) =>
                                        renderRecipeCard(
                                            recipe,
                                            currentChoices,
                                            setter
                                        )
                                )}
                            </div>
                        </section>
                    )}

                {customVoteRecipes.length >
                    0 && (
                        <section className="mb-6">
                            <h2 className="mb-3 text-lg font-semibold">
                                我们自己加的
                            </h2>

                            <div className="space-y-3">
                                {customVoteRecipes.map(
                                    (recipe) =>
                                        renderRecipeCard(
                                            recipe,
                                            currentChoices,
                                            setter
                                        )
                                )}
                            </div>
                        </section>
                    )}

                <section className="mb-6">
                    <h2 className="mb-3 text-lg font-semibold">
                        系统菜单
                    </h2>

                    <div className="space-y-3">
                        {systemVoteRecipes.map(
                            (recipe) =>
                                renderRecipeCard(
                                    recipe,
                                    currentChoices,
                                    setter
                                )
                        )}
                    </div>
                </section>
            </>
        );
    }

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
                                情侣投票 💘
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
                        两个人分别选想吃的菜，看看今晚能不能
                        Match
                    </p>

                    <p className="mt-2 text-xs text-green-600">
                        {syncStatus}
                    </p>
                </header>

                {stage !== "result" && (
                    <>
                        <button
                            onClick={() =>
                                setShowAddForm(
                                    (current) =>
                                        !current
                                )
                            }
                            className="mb-5 w-full rounded-2xl border border-dashed border-[#ff6b57] bg-white px-4 py-3 font-medium text-[#ff6b57]"
                        >
                            + 自己加一道
                        </button>

                        {showAddForm && (
                            <section className="mb-6 rounded-3xl bg-white p-5 shadow-sm">
                                <h2 className="text-lg font-semibold">
                                    添加到我们的菜单
                                </h2>

                                <input
                                    value={
                                        newRecipeName
                                    }
                                    onChange={(e) =>
                                        setNewRecipeName(
                                            e.target.value
                                        )
                                    }
                                    placeholder="菜名，例如：寿喜烧"
                                    className="mt-4 w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none"
                                />

                                <div className="mt-4 grid grid-cols-2 gap-3">
                                    <select
                                        value={
                                            newRecipeTime
                                        }
                                        onChange={(e) =>
                                            setNewRecipeTime(
                                                e.target.value
                                            )
                                        }
                                        className="rounded-2xl border border-gray-200 bg-white px-4 py-3"
                                    >
                                        <option value="10">
                                            10 分钟
                                        </option>
                                        <option value="20">
                                            20 分钟
                                        </option>
                                        <option value="30">
                                            30 分钟
                                        </option>
                                        <option value="45">
                                            45 分钟
                                        </option>
                                        <option value="60">
                                            60 分钟
                                        </option>
                                    </select>

                                    <select
                                        value={
                                            newRecipeDifficulty
                                        }
                                        onChange={(e) =>
                                            setNewRecipeDifficulty(
                                                e.target.value
                                            )
                                        }
                                        className="rounded-2xl border border-gray-200 bg-white px-4 py-3"
                                    >
                                        <option value="1">
                                            难度 1
                                        </option>
                                        <option value="2">
                                            难度 2
                                        </option>
                                        <option value="3">
                                            难度 3
                                        </option>
                                    </select>
                                </div>

                                <div className="mt-6">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-semibold">
                                            食材
                                        </h3>

                                        <button
                                            onClick={
                                                addIngredientRow
                                            }
                                            className="text-sm text-[#ff6b57]"
                                        >
                                            + 添加食材
                                        </button>
                                    </div>

                                    <div className="mt-3 space-y-3">
                                        {newIngredients.map(
                                            (
                                                ingredient,
                                                index
                                            ) => (
                                                <div
                                                    key={
                                                        index
                                                    }
                                                    className="rounded-2xl bg-[#fffaf5] p-4"
                                                >
                                                    <input
                                                        value={
                                                            ingredient.name
                                                        }
                                                        onChange={(
                                                            e
                                                        ) =>
                                                            updateIngredient(
                                                                index,
                                                                "name",
                                                                e
                                                                    .target
                                                                    .value
                                                            )
                                                        }
                                                        placeholder="食材名称"
                                                        className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2"
                                                    />

                                                    <div className="mt-3 grid grid-cols-2 gap-2">
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            step="0.1"
                                                            value={
                                                                ingredient.quantity
                                                            }
                                                            onChange={(
                                                                e
                                                            ) =>
                                                                updateIngredient(
                                                                    index,
                                                                    "quantity",
                                                                    e
                                                                        .target
                                                                        .value
                                                                )
                                                            }
                                                            className="rounded-xl border border-gray-200 bg-white px-3 py-2"
                                                        />

                                                        <select
                                                            value={
                                                                ingredient.unit
                                                            }
                                                            onChange={(
                                                                e
                                                            ) =>
                                                                updateIngredient(
                                                                    index,
                                                                    "unit",
                                                                    e
                                                                        .target
                                                                        .value
                                                                )
                                                            }
                                                            className="rounded-xl border border-gray-200 bg-white px-3 py-2"
                                                        >
                                                            {[
                                                                "个",
                                                                "颗",
                                                                "根",
                                                                "片",
                                                                "盒",
                                                                "袋",
                                                                "g",
                                                                "kg",
                                                                "ml",
                                                                "L",
                                                                "勺",
                                                            ].map(
                                                                (
                                                                    unit
                                                                ) => (
                                                                    <option
                                                                        key={
                                                                            unit
                                                                        }
                                                                        value={
                                                                            unit
                                                                        }
                                                                    >
                                                                        {
                                                                            unit
                                                                        }
                                                                    </option>
                                                                )
                                                            )}
                                                        </select>
                                                    </div>

                                                    {newIngredients.length >
                                                        1 && (
                                                            <button
                                                                onClick={() =>
                                                                    removeIngredientRow(
                                                                        index
                                                                    )
                                                                }
                                                                className="mt-3 text-xs text-gray-400"
                                                            >
                                                                删除这个食材
                                                            </button>
                                                        )}
                                                </div>
                                            )
                                        )}
                                    </div>
                                </div>

                                <button
                                    onClick={
                                        addCustomRecipe
                                    }
                                    className="mt-5 w-full rounded-2xl bg-[#ff6b57] px-4 py-3 font-medium text-white"
                                >
                                    加入菜单
                                </button>
                            </section>
                        )}
                    </>
                )}

                {stage === "me" && (
                    <>
                        <section className="mb-5 rounded-3xl bg-white p-5 shadow-sm">
                            <p className="text-sm text-gray-500">
                                第一步
                            </p>

                            <h2 className="mt-1 text-xl font-semibold">
                                你先选
                            </h2>

                            <p className="mt-3 text-sm font-medium text-[#ff6b57]">
                                已选{" "}
                                {myChoices.length}
                                /5
                            </p>
                        </section>

                        {renderMenu(
                            myChoices,
                            setMyChoices
                        )}

                        <button
                            onClick={() =>
                                setStage(
                                    "partner"
                                )
                            }
                            disabled={
                                myChoices.length ===
                                0
                            }
                            className="w-full rounded-2xl bg-[#ff6b57] px-4 py-3 font-medium text-white disabled:opacity-40"
                        >
                            我选好了，交给 TA
                        </button>
                    </>
                )}

                {stage ===
                    "partner" && (
                        <>
                            <section className="mb-5 rounded-3xl bg-white p-5 text-center shadow-sm">
                                <div className="text-4xl">
                                    🙈
                                </div>

                                <h2 className="mt-3 text-xl font-semibold">
                                    现在轮到 TA
                                </h2>

                                <p className="mt-3 text-sm font-medium text-[#ff6b57]">
                                    已选{" "}
                                    {
                                        partnerChoices.length
                                    }
                                    /5
                                </p>
                            </section>

                            {renderMenu(
                                partnerChoices,
                                setPartnerChoices
                            )}

                            <button
                                onClick={
                                    finishPartnerVote
                                }
                                disabled={
                                    partnerChoices.length ===
                                    0
                                }
                                className="w-full rounded-2xl bg-[#ff6b57] px-4 py-3 font-medium text-white disabled:opacity-40"
                            >
                                看结果 💘
                            </button>
                        </>
                    )}

                {stage === "result" &&
                    resultRecipe && (
                        <section className="rounded-3xl bg-white p-6 text-center shadow-sm">
                            <div className="text-6xl">
                                {matchedRecipes.length >
                                    0
                                    ? "💘"
                                    : "🎲"}
                            </div>

                            <p className="mt-4 text-sm text-[#ff6b57]">
                                {matchedRecipes.length >
                                    0
                                    ? "MATCH!"
                                    : "命运决定"}
                            </p>

                            <h2 className="mt-2 text-3xl font-bold">
                                {
                                    resultRecipe.name
                                }
                            </h2>

                            <div className="mt-5 rounded-2xl bg-[#fffaf5] p-4">
                                <p className="text-sm text-gray-500">
                                    {
                                        resultRecipe.time
                                    }{" "}
                                    分钟 · 难度{" "}
                                    {
                                        resultRecipe.difficulty
                                    }
                                </p>
                            </div>

                            <button
                                onClick={
                                    chooseTonight
                                }
                                className="mt-6 w-full rounded-2xl bg-[#ff6b57] px-4 py-3 font-medium text-white"
                            >
                                今晚就吃这个 ❤️
                            </button>

                            <button
                                onClick={restart}
                                className="mt-3 w-full rounded-2xl border border-gray-200 px-4 py-3 font-medium"
                            >
                                再投一次
                            </button>
                        </section>
                    )}
            </div>

            <BottomNav />
        </main>
    );
}