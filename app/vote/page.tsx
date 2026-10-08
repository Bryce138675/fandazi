"use client";

import { useEffect, useMemo, useState } from "react";
import BottomNav from "@/components/BottomNav";
import { recipes } from "@/data/recipes";

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
    ingredients: Ingredient[];
};

const CUSTOM_RECIPE_KEY = "fandazi-custom-recipes";
const MEAL_LOG_KEY = "fandazi-meal-logs";

export default function VotePage() {
    const [myChoices, setMyChoices] = useState<string[]>([]);
    const [partnerChoices, setPartnerChoices] = useState<string[]>([]);

    const [stage, setStage] =
        useState<"me" | "partner" | "result">("me");

    const [resultId, setResultId] = useState<string | null>(null);

    const [customRecipes, setCustomRecipes] = useState<CustomRecipe[]>([]);
    const [mealLogs, setMealLogs] = useState<MealLog[]>([]);

    const [showAddForm, setShowAddForm] = useState(false);

    const [newRecipeName, setNewRecipeName] = useState("");
    const [newRecipeTime, setNewRecipeTime] = useState("20");
    const [newRecipeDifficulty, setNewRecipeDifficulty] = useState("1");

    const [newIngredients, setNewIngredients] = useState<Ingredient[]>([
        {
            name: "",
            quantity: 1,
            unit: "个",
        },
    ]);

    useEffect(() => {
        const savedCustom = localStorage.getItem(CUSTOM_RECIPE_KEY);

        if (savedCustom) {
            try {
                setCustomRecipes(JSON.parse(savedCustom));
            } catch {
                setCustomRecipes([]);
            }
        }

        const savedLogs = localStorage.getItem(MEAL_LOG_KEY);

        if (savedLogs) {
            try {
                setMealLogs(JSON.parse(savedLogs));
            } catch {
                setMealLogs([]);
            }
        }
    }, []);

    const fiveStarRecipes = useMemo(() => {
        const map = new Map<string, VoteRecipe>();

        mealLogs
            .filter((log) => log.rating === 5)
            .forEach((log) => {
                const key = log.recipeName.trim().toLowerCase();

                const systemRecipe = recipes.find(
                    (recipe) => recipe.id === log.recipeId
                );

                const customRecipe = customRecipes.find(
                    (recipe) => recipe.id === log.recipeId
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
                            systemRecipe?.difficulty ??
                            customRecipe?.difficulty ??
                            2,
                        ingredients:
                            systemRecipe?.ingredients ??
                            customRecipe?.ingredients ??
                            [],
                        source: "fiveStar",
                    });
                }
            });

        return Array.from(map.values());
    }, [mealLogs, customRecipes]);

    const customVoteRecipes = useMemo<VoteRecipe[]>(() => {
        return customRecipes.map((recipe) => ({
            ...recipe,
            source: "custom",
        }));
    }, [customRecipes]);

    const systemVoteRecipes = useMemo<VoteRecipe[]>(() => {
        return recipes.map((recipe) => ({
            ...recipe,
            source: "system",
        }));
    }, []);

    const allRecipes = useMemo(() => {
        const map = new Map<string, VoteRecipe>();

        [
            ...fiveStarRecipes,
            ...customVoteRecipes,
            ...systemVoteRecipes,
        ].forEach((recipe) => {
            const key = recipe.name.trim().toLowerCase();

            if (!map.has(key)) {
                map.set(key, recipe);
            }
        });

        return Array.from(map.values());
    }, [
        fiveStarRecipes,
        customVoteRecipes,
        systemVoteRecipes,
    ]);

    const matchedRecipes = useMemo(() => {
        return myChoices.filter((id) =>
            partnerChoices.includes(id)
        );
    }, [myChoices, partnerChoices]);

    function toggleChoice(
        recipeId: string,
        current: string[],
        setter: (value: string[]) => void
    ) {
        if (current.includes(recipeId)) {
            setter(
                current.filter((id) => id !== recipeId)
            );
            return;
        }

        if (current.length >= 5) return;

        setter([...current, recipeId]);
    }

    function updateIngredient(
        index: number,
        field: keyof Ingredient,
        value: string
    ) {
        setNewIngredients((current) =>
            current.map((ingredient, i) => {
                if (i !== index) return ingredient;

                if (field === "quantity") {
                    return {
                        ...ingredient,
                        quantity: Number(value) || 0,
                    };
                }

                return {
                    ...ingredient,
                    [field]: value,
                };
            })
        );
    }

    function addIngredientRow() {
        setNewIngredients((current) => [
            ...current,
            {
                name: "",
                quantity: 1,
                unit: "个",
            },
        ]);
    }

    function removeIngredientRow(index: number) {
        setNewIngredients((current) =>
            current.filter((_, i) => i !== index)
        );
    }

    function addCustomRecipe() {
        const name = newRecipeName.trim();

        if (!name) return;

        const exists = allRecipes.some(
            (recipe) =>
                recipe.name.trim().toLowerCase() ===
                name.toLowerCase()
        );

        if (exists) {
            alert("这个菜已经在菜单里了");
            return;
        }

        const cleanedIngredients = newIngredients
            .map((ingredient) => ({
                ...ingredient,
                name: ingredient.name.trim(),
            }))
            .filter(
                (ingredient) =>
                    ingredient.name &&
                    ingredient.quantity > 0
            );

        const newRecipe: CustomRecipe = {
            id: `custom-${Date.now()}`,
            name,
            time: Number(newRecipeTime) || 20,
            difficulty:
                Number(newRecipeDifficulty) || 1,
            ingredients: cleanedIngredients,
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

        setNewRecipeName("");
        setNewRecipeTime("20");
        setNewRecipeDifficulty("1");

        setNewIngredients([
            {
                name: "",
                quantity: 1,
                unit: "个",
            },
        ]);

        setShowAddForm(false);
    }

    function deleteCustomRecipe(id: string) {
        const next = customRecipes.filter(
            (recipe) => recipe.id !== id
        );

        setCustomRecipes(next);

        localStorage.setItem(
            CUSTOM_RECIPE_KEY,
            JSON.stringify(next)
        );

        setMyChoices((current) =>
            current.filter(
                (choice) => choice !== id
            )
        );

        setPartnerChoices((current) =>
            current.filter(
                (choice) => choice !== id
            )
        );
    }

    function finishPartnerVote() {
        if (partnerChoices.length === 0) return;

        const matches = myChoices.filter((id) =>
            partnerChoices.includes(id)
        );

        if (matches.length > 0) {
            const randomIndex = Math.floor(
                Math.random() * matches.length
            );

            setResultId(matches[randomIndex]);
        } else {
            const combined = [
                ...new Set([
                    ...myChoices,
                    ...partnerChoices,
                ]),
            ];

            const randomIndex = Math.floor(
                Math.random() * combined.length
            );

            setResultId(
                combined[randomIndex]
            );
        }

        setStage("result");
    }

    function chooseTonight() {
        if (!resultId) return;

        const recipe = allRecipes.find(
            (item) => item.id === resultId
        );

        if (!recipe) return;

        localStorage.setItem(
            "fandazi-tonight-dinner",
            JSON.stringify({
                recipeId: recipe.id,
                recipeName: recipe.name,
                selectedAt:
                    new Date().toISOString(),
                status: "selected",
                source: "vote",
            })
        );

        window.location.href = "/";
    }

    function restart() {
        setMyChoices([]);
        setPartnerChoices([]);
        setResultId(null);
        setStage("me");
    }

    const resultRecipe =
        allRecipes.find(
            (recipe) => recipe.id === resultId
        );

    function renderRecipeCard(
        recipe: VoteRecipe,
        currentChoices: string[],
        setter: (value: string[]) => void
    ) {
        const selected =
            currentChoices.includes(recipe.id);

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
                                {recipe.time} 分钟 · 难度{" "}
                                {recipe.difficulty}
                            </p>

                            {recipe.ingredients.length > 0 && (
                                <p className="mt-2 text-xs text-gray-400">
                                    {recipe.ingredients
                                        .slice(0, 4)
                                        .map(
                                            (item) =>
                                                `${item.name} ${item.quantity}${item.unit}`
                                        )
                                        .join(" · ")}
                                </p>
                            )}
                        </div>

                        <div className="text-xl">
                            {selected ? "❤️" : "○"}
                        </div>
                    </div>
                </button>

                {recipe.source === "custom" && (
                    <button
                        onClick={() =>
                            deleteCustomRecipe(recipe.id)
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
        setter: (value: string[]) => void
    ) {
        return (
            <>
                {fiveStarRecipes.length > 0 && (
                    <section className="mb-6">
                        <div className="mb-3">
                            <h2 className="text-lg font-semibold">
                                五星菜单 ⭐
                            </h2>

                            <p className="mt-1 text-xs text-gray-500">
                                你们历史里评过 5 星的菜
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
                    <p className="text-sm text-gray-500">
                        今晚吃什么
                    </p>

                    <h1 className="mt-1 text-3xl font-bold">
                        情侣投票 💘
                    </h1>

                    <p className="mt-2 text-sm text-gray-500">
                        两个人分别选想吃的菜，看看今晚能不能 Match
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

                                <div className="mt-4">
                                    <label className="text-sm text-gray-500">
                                        菜名
                                    </label>

                                    <input
                                        value={newRecipeName}
                                        onChange={(e) =>
                                            setNewRecipeName(
                                                e.target.value
                                            )
                                        }
                                        placeholder="例如：寿喜烧"
                                        className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none"
                                    />
                                </div>

                                <div className="mt-4 grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-sm text-gray-500">
                                            时间
                                        </label>

                                        <select
                                            value={newRecipeTime}
                                            onChange={(e) =>
                                                setNewRecipeTime(
                                                    e.target.value
                                                )
                                            }
                                            className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3"
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
                                    </div>

                                    <div>
                                        <label className="text-sm text-gray-500">
                                            难度
                                        </label>

                                        <select
                                            value={
                                                newRecipeDifficulty
                                            }
                                            onChange={(e) =>
                                                setNewRecipeDifficulty(
                                                    e.target.value
                                                )
                                            }
                                            className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3"
                                        >
                                            <option value="1">
                                                1 · 简单
                                            </option>
                                            <option value="2">
                                                2 · 普通
                                            </option>
                                            <option value="3">
                                                3 · 复杂
                                            </option>
                                        </select>
                                    </div>
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
                                            className="text-sm font-medium text-[#ff6b57]"
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
                                                    key={index}
                                                    className="rounded-2xl bg-[#fffaf5] p-4"
                                                >
                                                    <input
                                                        value={
                                                            ingredient.name
                                                        }
                                                        onChange={(e) =>
                                                            updateIngredient(
                                                                index,
                                                                "name",
                                                                e.target
                                                                    .value
                                                            )
                                                        }
                                                        placeholder="食材名称，例如：牛肉"
                                                        className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 outline-none"
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
                                                            className="rounded-xl border border-gray-200 bg-white px-3 py-2 outline-none"
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
                                                            <option value="个">
                                                                个
                                                            </option>
                                                            <option value="颗">
                                                                颗
                                                            </option>
                                                            <option value="根">
                                                                根
                                                            </option>
                                                            <option value="片">
                                                                片
                                                            </option>
                                                            <option value="盒">
                                                                盒
                                                            </option>
                                                            <option value="袋">
                                                                袋
                                                            </option>
                                                            <option value="g">
                                                                g
                                                            </option>
                                                            <option value="kg">
                                                                kg
                                                            </option>
                                                            <option value="ml">
                                                                ml
                                                            </option>
                                                            <option value="L">
                                                                L
                                                            </option>
                                                            <option value="勺">
                                                                勺
                                                            </option>
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
                                    onClick={addCustomRecipe}
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

                            <p className="mt-2 text-sm text-gray-500">
                                最多选 5 道，选完以后交给 TA
                            </p>

                            <p className="mt-3 text-sm font-medium text-[#ff6b57]">
                                已选 {myChoices.length}/5
                            </p>
                        </section>

                        {renderMenu(
                            myChoices,
                            setMyChoices
                        )}

                        <button
                            onClick={() =>
                                setStage("partner")
                            }
                            disabled={
                                myChoices.length === 0
                            }
                            className="w-full rounded-2xl bg-[#ff6b57] px-4 py-3 font-medium text-white disabled:opacity-40"
                        >
                            我选好了，交给 TA
                        </button>
                    </>
                )}

                {stage === "partner" && (
                    <>
                        <section className="mb-5 rounded-3xl bg-white p-5 text-center shadow-sm">
                            <div className="text-4xl">
                                🙈
                            </div>

                            <h2 className="mt-3 text-xl font-semibold">
                                现在轮到 TA
                            </h2>

                            <p className="mt-2 text-sm text-gray-500">
                                前一个人的选择已经隐藏
                            </p>

                            <p className="mt-3 text-sm font-medium text-[#ff6b57]">
                                已选{" "}
                                {partnerChoices.length}/5
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
                            {matchedRecipes.length >
                                0 ? (
                                <>
                                    <div className="text-6xl">
                                        💘
                                    </div>

                                    <p className="mt-4 text-sm font-medium text-[#ff6b57]">
                                        MATCH!
                                    </p>

                                    <h2 className="mt-2 text-3xl font-bold">
                                        {
                                            resultRecipe.name
                                        }
                                    </h2>

                                    <p className="mt-3 text-sm text-gray-500">
                                        你们两个都想吃这个
                                    </p>
                                </>
                            ) : (
                                <>
                                    <div className="text-6xl">
                                        🎲
                                    </div>

                                    <p className="mt-4 text-sm text-gray-500">
                                        今晚没有 Match
                                    </p>

                                    <h2 className="mt-2 text-3xl font-bold">
                                        {
                                            resultRecipe.name
                                        }
                                    </h2>

                                    <p className="mt-3 text-sm text-gray-500">
                                        那就让命运帮你们决定
                                    </p>
                                </>
                            )}

                            <div className="mt-5 rounded-2xl bg-[#fffaf5] p-4">
                                <p className="text-sm text-gray-500">
                                    {resultRecipe.time} 分钟
                                    · 难度{" "}
                                    {
                                        resultRecipe.difficulty
                                    }
                                </p>

                                {resultRecipe
                                    .ingredients.length >
                                    0 && (
                                        <p className="mt-2 text-xs text-gray-400">
                                            {resultRecipe.ingredients
                                                .map(
                                                    (item) =>
                                                        `${item.name} ${item.quantity}${item.unit}`
                                                )
                                                .join(" · ")}
                                        </p>
                                    )}
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