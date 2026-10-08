"use client";

import { useEffect, useMemo, useState } from "react";
import BottomNav from "@/components/BottomNav";
import { recipes } from "@/data/recipes";

type Ingredient = {
    name: string;
    quantity: number;
    unit: string;
};

type FridgeItem = {
    id: number;
    name: string;
    quantity: string;
    unit: string;
    urgent: boolean;
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

type PlanRecipe = {
    id: string;
    name: string;
    ingredients: Ingredient[];
    source: "system" | "custom" | "fiveStar";
};

type DayPlan = {
    day: string;
    recipes: PlanRecipe[];
};

type ShoppingCheckState = Record<string, boolean>;

const PLAN_KEY = "fandazi-week-plan";
const CUSTOM_RECIPE_KEY = "fandazi-custom-recipes";
const MEAL_LOG_KEY = "fandazi-meal-logs";
const FRIDGE_KEY = "fandazi-fridge-items";
const SHOPPING_CHECK_KEY = "fandazi-shopping-checks";

const DAYS = [
    "周一",
    "周二",
    "周三",
    "周四",
    "周五",
    "周六",
    "周日",
];

function makeEmptyPlan(): DayPlan[] {
    return DAYS.map((day) => ({
        day,
        recipes: [],
    }));
}

export default function PlanPage() {
    const [weekPlan, setWeekPlan] =
        useState<DayPlan[]>(makeEmptyPlan());

    const [customRecipes, setCustomRecipes] =
        useState<CustomRecipe[]>([]);

    const [mealLogs, setMealLogs] =
        useState<MealLog[]>([]);

    const [fridgeItems, setFridgeItems] =
        useState<FridgeItem[]>([]);

    const [activeDay, setActiveDay] =
        useState<string | null>(null);

    const [shoppingChecks, setShoppingChecks] =
        useState<ShoppingCheckState>({});

    const [loaded, setLoaded] = useState(false);

    const [fridgeMessage, setFridgeMessage] =
        useState("");

    useEffect(() => {
        const savedPlan =
            localStorage.getItem(PLAN_KEY);

        if (savedPlan) {
            try {
                setWeekPlan(JSON.parse(savedPlan));
            } catch {
                setWeekPlan(makeEmptyPlan());
            }
        }

        const savedCustom =
            localStorage.getItem(
                CUSTOM_RECIPE_KEY
            );

        if (savedCustom) {
            try {
                setCustomRecipes(
                    JSON.parse(savedCustom)
                );
            } catch {
                setCustomRecipes([]);
            }
        }

        const savedLogs =
            localStorage.getItem(MEAL_LOG_KEY);

        if (savedLogs) {
            try {
                setMealLogs(
                    JSON.parse(savedLogs)
                );
            } catch {
                setMealLogs([]);
            }
        }

        const savedFridge =
            localStorage.getItem(FRIDGE_KEY);

        if (savedFridge) {
            try {
                setFridgeItems(
                    JSON.parse(savedFridge)
                );
            } catch {
                setFridgeItems([]);
            }
        }

        const savedChecks =
            localStorage.getItem(
                SHOPPING_CHECK_KEY
            );

        if (savedChecks) {
            try {
                setShoppingChecks(
                    JSON.parse(savedChecks)
                );
            } catch {
                setShoppingChecks({});
            }
        }

        setLoaded(true);
    }, []);

    useEffect(() => {
        if (!loaded) return;

        localStorage.setItem(
            PLAN_KEY,
            JSON.stringify(weekPlan)
        );
    }, [weekPlan, loaded]);

    useEffect(() => {
        if (!loaded) return;

        localStorage.setItem(
            SHOPPING_CHECK_KEY,
            JSON.stringify(shoppingChecks)
        );
    }, [shoppingChecks, loaded]);

    const fiveStarRecipes =
        useMemo<PlanRecipe[]>(() => {
            const map =
                new Map<string, PlanRecipe>();

            mealLogs
                .filter(
                    (log) => log.rating === 5
                )
                .forEach((log) => {
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

                    const key =
                        log.recipeName
                            .trim()
                            .toLowerCase();

                    if (!map.has(key)) {
                        map.set(key, {
                            id: `five-${key}`,
                            name: log.recipeName,
                            ingredients:
                                systemRecipe
                                    ?.ingredients ??
                                customRecipe
                                    ?.ingredients ??
                                [],
                            source: "fiveStar",
                        });
                    }
                });

            return Array.from(
                map.values()
            );
        }, [mealLogs, customRecipes]);

    const customPlanRecipes =
        useMemo<PlanRecipe[]>(() => {
            return customRecipes.map(
                (recipe) => ({
                    id: recipe.id,
                    name: recipe.name,
                    ingredients:
                        recipe.ingredients || [],
                    source: "custom",
                })
            );
        }, [customRecipes]);

    const systemPlanRecipes =
        useMemo<PlanRecipe[]>(() => {
            return recipes.map(
                (recipe) => ({
                    id: recipe.id,
                    name: recipe.name,
                    ingredients:
                        recipe.ingredients,
                    source: "system",
                })
            );
        }, []);

    function addRecipeToDay(
        day: string,
        recipe: PlanRecipe
    ) {
        setWeekPlan((current) =>
            current.map((item) =>
                item.day === day
                    ? {
                        ...item,
                        recipes: [
                            ...item.recipes,
                            {
                                ...recipe,
                                id: `${recipe.id
                                    }-${Date.now()}-${Math.random()}`,
                            },
                        ],
                    }
                    : item
            )
        );

        setActiveDay(null);
    }

    function removeRecipeFromDay(
        day: string,
        recipeId: string
    ) {
        setWeekPlan((current) =>
            current.map((item) =>
                item.day === day
                    ? {
                        ...item,
                        recipes:
                            item.recipes.filter(
                                (recipe) =>
                                    recipe.id !==
                                    recipeId
                            ),
                    }
                    : item
            )
        );
    }

    function clearWeekPlan() {
        const confirmed =
            window.confirm(
                "确定要清空这一周的菜单吗？"
            );

        if (!confirmed) return;

        setWeekPlan(
            makeEmptyPlan()
        );

        setShoppingChecks({});
    }

    const shoppingList =
        useMemo(() => {
            const ingredientMap: Record<
                string,
                {
                    name: string;
                    quantity: number;
                    unit: string;
                }
            > = {};

            weekPlan.forEach((day) => {
                day.recipes.forEach(
                    (recipe) => {
                        recipe.ingredients.forEach(
                            (ingredient) => {
                                const key = `${ingredient.name
                                    }-${ingredient.unit}`;

                                if (
                                    !ingredientMap[key]
                                ) {
                                    ingredientMap[key] = {
                                        name:
                                            ingredient.name,
                                        quantity: 0,
                                        unit:
                                            ingredient.unit,
                                    };
                                }

                                ingredientMap[
                                    key
                                ].quantity +=
                                    Number(
                                        ingredient.quantity
                                    ) || 0;
                            }
                        );
                    }
                );
            });

            return Object.values(
                ingredientMap
            )
                .map((ingredient) => {
                    const fridgeItem =
                        fridgeItems.find(
                            (item) =>
                                item.name
                                    .trim()
                                    .toLowerCase() ===
                                ingredient.name
                                    .trim()
                                    .toLowerCase() &&
                                item.unit ===
                                ingredient.unit
                        );

                    const fridgeQuantity =
                        fridgeItem
                            ? Number(
                                fridgeItem.quantity
                            ) || 0
                            : 0;

                    const needToBuy =
                        Math.max(
                            ingredient.quantity -
                            fridgeQuantity,
                            0
                        );

                    const checkKey = `${ingredient.name
                        }-${ingredient.unit}`;

                    return {
                        ...ingredient,
                        fridgeQuantity,
                        needToBuy,
                        checkKey,
                        checked:
                            shoppingChecks[
                            checkKey
                            ] || false,
                    };
                })
                .sort((a, b) => {
                    if (
                        (a.needToBuy > 0) ===
                        (b.needToBuy > 0)
                    ) {
                        return a.name.localeCompare(
                            b.name
                        );
                    }

                    return a.needToBuy > 0
                        ? -1
                        : 1;
                });
        }, [
            weekPlan,
            fridgeItems,
            shoppingChecks,
        ]);

    const actualShoppingList =
        shoppingList.filter(
            (item) =>
                item.needToBuy > 0
        );

    const pendingShopping =
        actualShoppingList.filter(
            (item) => !item.checked
        );

    const completedShopping =
        actualShoppingList.filter(
            (item) => item.checked
        );

    const totalPlannedDishes =
        weekPlan.reduce(
            (sum, day) =>
                sum +
                day.recipes.length,
            0
        );

    const needToBuyCount =
        pendingShopping.length;

    function toggleShoppingItem(
        key: string
    ) {
        setShoppingChecks(
            (current) => ({
                ...current,
                [key]:
                    !current[key],
            })
        );

        setFridgeMessage("");
    }

    function clearCompletedChecks() {
        if (
            completedShopping.length === 0
        )
            return;

        setShoppingChecks(
            (current) => {
                const next = {
                    ...current,
                };

                completedShopping.forEach(
                    (item) => {
                        delete next[
                            item.checkKey
                        ];
                    }
                );

                return next;
            }
        );
    }

    function addPurchasedToFridge() {
        if (
            completedShopping.length === 0
        )
            return;

        const updatedFridge = [
            ...fridgeItems,
        ];

        completedShopping.forEach(
            (shoppingItem, index) => {
                const existingIndex =
                    updatedFridge.findIndex(
                        (fridgeItem) =>
                            fridgeItem.name
                                .trim()
                                .toLowerCase() ===
                            shoppingItem.name
                                .trim()
                                .toLowerCase() &&
                            fridgeItem.unit ===
                            shoppingItem.unit
                    );

                if (
                    existingIndex >= 0
                ) {
                    const currentQuantity =
                        Number(
                            updatedFridge[
                                existingIndex
                            ].quantity
                        ) || 0;

                    updatedFridge[
                        existingIndex
                    ] = {
                        ...updatedFridge[
                        existingIndex
                        ],
                        quantity: String(
                            currentQuantity +
                            shoppingItem.needToBuy
                        ),
                        urgent: false,
                    };
                } else {
                    updatedFridge.push({
                        id:
                            Date.now() +
                            index,
                        name:
                            shoppingItem.name,
                        quantity: String(
                            shoppingItem.needToBuy
                        ),
                        unit:
                            shoppingItem.unit,
                        urgent: false,
                    });
                }
            }
        );

        setFridgeItems(
            updatedFridge
        );

        localStorage.setItem(
            FRIDGE_KEY,
            JSON.stringify(
                updatedFridge
            )
        );

        setShoppingChecks(
            (current) => {
                const next = {
                    ...current,
                };

                completedShopping.forEach(
                    (item) => {
                        delete next[
                            item.checkKey
                        ];
                    }
                );

                return next;
            }
        );

        setFridgeMessage(
            `已把 ${completedShopping.length} 种食材加入冰箱 🎉`
        );
    }

    return (
        <main className="min-h-screen bg-[#fffaf5] px-5 py-8 pb-32 text-[#2b2b2b]">
            <div className="mx-auto max-w-md">
                <header className="mb-8">
                    <p className="text-sm text-gray-500">
                        这周吃什么
                    </p>

                    <h1 className="mt-1 text-3xl font-bold">
                        一周菜单 📅
                    </h1>

                    <p className="mt-2 text-sm text-gray-500">
                        安排菜单、买菜，再把买好的食材直接加入冰箱
                    </p>
                </header>

                <section className="mb-6 grid grid-cols-2 gap-3">
                    <div className="rounded-3xl bg-white p-5 shadow-sm">
                        <p className="text-sm text-gray-500">
                            本周安排
                        </p>

                        <p className="mt-2 text-4xl font-bold">
                            {
                                totalPlannedDishes
                            }
                        </p>

                        <p className="mt-1 text-xs text-gray-400">
                            道菜
                        </p>
                    </div>

                    <div className="rounded-3xl bg-white p-5 shadow-sm">
                        <p className="text-sm text-gray-500">
                            还没买
                        </p>

                        <p className="mt-2 text-4xl font-bold">
                            {
                                needToBuyCount
                            }
                        </p>

                        <p className="mt-1 text-xs text-gray-400">
                            种食材
                        </p>
                    </div>
                </section>

                {totalPlannedDishes >
                    0 && (
                        <button
                            onClick={
                                clearWeekPlan
                            }
                            className="mb-5 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-500"
                        >
                            清空本周菜单
                        </button>
                    )}

                <div className="space-y-5">
                    {weekPlan.map(
                        (day) => (
                            <section
                                key={day.day}
                                className="rounded-3xl bg-white p-5 shadow-sm"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-xl font-semibold">
                                            {day.day}
                                        </h2>

                                        <p className="mt-1 text-sm text-gray-500">
                                            {
                                                day.recipes
                                                    .length
                                            }{" "}
                                            道菜
                                        </p>
                                    </div>

                                    <button
                                        onClick={() =>
                                            setActiveDay(
                                                day.day
                                            )
                                        }
                                        className="rounded-2xl bg-[#fff0ec] px-4 py-2 text-sm font-medium text-[#ff6b57]"
                                    >
                                        + 添加菜
                                    </button>
                                </div>

                                {day.recipes
                                    .length === 0 ? (
                                    <div className="mt-4 rounded-2xl bg-[#fffaf5] p-4 text-center">
                                        <p className="text-sm text-gray-400">
                                            还没有安排
                                        </p>
                                    </div>
                                ) : (
                                    <div className="mt-4 space-y-3">
                                        {day.recipes.map(
                                            (recipe) => (
                                                <div
                                                    key={
                                                        recipe.id
                                                    }
                                                    className="rounded-2xl bg-[#fffaf5] p-4"
                                                >
                                                    <div className="flex items-start justify-between gap-4">
                                                        <div>
                                                            <p className="font-medium">
                                                                {
                                                                    recipe.name
                                                                }
                                                            </p>

                                                            <p className="mt-1 text-xs text-gray-400">
                                                                {recipe.source ===
                                                                    "fiveStar"
                                                                    ? "⭐ 五星菜单"
                                                                    : recipe.source ===
                                                                        "custom"
                                                                        ? "我们的菜单"
                                                                        : "系统菜单"}
                                                            </p>

                                                            {recipe
                                                                .ingredients
                                                                .length >
                                                                0 && (
                                                                    <p className="mt-2 text-xs leading-5 text-gray-500">
                                                                        {recipe.ingredients
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
                                                                )}
                                                        </div>

                                                        <button
                                                            onClick={() =>
                                                                removeRecipeFromDay(
                                                                    day.day,
                                                                    recipe.id
                                                                )
                                                            }
                                                            className="shrink-0 text-sm text-gray-400"
                                                        >
                                                            删除
                                                        </button>
                                                    </div>
                                                </div>
                                            )
                                        )}
                                    </div>
                                )}
                            </section>
                        )
                    )}
                </div>

                <section className="mt-8 rounded-3xl bg-white p-5 shadow-sm">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <p className="text-sm text-gray-500">
                                自动汇总
                            </p>

                            <h2 className="mt-1 text-xl font-semibold">
                                本周采购清单 🛒
                            </h2>

                            <p className="mt-2 text-xs text-gray-400">
                                已自动减掉冰箱里的现有库存
                            </p>
                        </div>

                        <div className="text-3xl">
                            🧺
                        </div>
                    </div>

                    {fridgeMessage && (
                        <div className="mt-5 rounded-2xl bg-green-50 p-4 text-sm text-green-700">
                            {fridgeMessage}
                        </div>
                    )}

                    {actualShoppingList
                        .length === 0 ? (
                        <div className="mt-5 rounded-2xl bg-[#fffaf5] p-5 text-center">
                            <div className="text-3xl">
                                ✅
                            </div>

                            <p className="mt-2 font-medium">
                                暂时不用买东西
                            </p>

                            <p className="mt-1 text-sm text-gray-400">
                                冰箱库存已经够，或者还没有安排菜单
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="mt-6">
                                <div className="mb-3 flex items-center justify-between">
                                    <h3 className="font-semibold">
                                        还没买
                                    </h3>

                                    <span className="text-sm text-gray-400">
                                        {
                                            pendingShopping.length
                                        }{" "}
                                        项
                                    </span>
                                </div>

                                {pendingShopping
                                    .length === 0 ? (
                                    <div className="rounded-2xl bg-[#fffaf5] p-4 text-center">
                                        <p className="text-sm text-green-600">
                                            全部买完啦 🎉
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {pendingShopping.map(
                                            (item) => (
                                                <button
                                                    key={
                                                        item.checkKey
                                                    }
                                                    onClick={() =>
                                                        toggleShoppingItem(
                                                            item.checkKey
                                                        )
                                                    }
                                                    className="flex w-full items-center gap-3 rounded-2xl bg-[#fffaf5] p-4 text-left"
                                                >
                                                    <div className="h-6 w-6 shrink-0 rounded-full border-2 border-gray-300 bg-white" />

                                                    <div className="flex-1">
                                                        <p className="font-medium">
                                                            {
                                                                item.name
                                                            }
                                                        </p>

                                                        <p className="mt-1 text-xs text-gray-400">
                                                            需要{" "}
                                                            {
                                                                item.quantity
                                                            }
                                                            {
                                                                item.unit
                                                            }
                                                        </p>

                                                        {item.fridgeQuantity >
                                                            0 && (
                                                                <p className="mt-1 text-xs text-green-600">
                                                                    家里已有{" "}
                                                                    {
                                                                        item.fridgeQuantity
                                                                    }
                                                                    {
                                                                        item.unit
                                                                    }
                                                                </p>
                                                            )}
                                                    </div>

                                                    <span className="rounded-full bg-orange-50 px-3 py-1 text-xs text-orange-500">
                                                        买{" "}
                                                        {
                                                            item.needToBuy
                                                        }
                                                        {
                                                            item.unit
                                                        }
                                                    </span>
                                                </button>
                                            )
                                        )}
                                    </div>
                                )}
                            </div>

                            {completedShopping
                                .length > 0 && (
                                    <div className="mt-7">
                                        <div className="mb-3 flex items-center justify-between">
                                            <div>
                                                <h3 className="font-semibold">
                                                    已买
                                                </h3>

                                                <p className="mt-1 text-xs text-gray-400">
                                                    {
                                                        completedShopping.length
                                                    }{" "}
                                                    种食材
                                                </p>
                                            </div>

                                            <button
                                                onClick={
                                                    clearCompletedChecks
                                                }
                                                className="text-xs text-gray-400"
                                            >
                                                取消全部勾选
                                            </button>
                                        </div>

                                        <div className="space-y-3">
                                            {completedShopping.map(
                                                (item) => (
                                                    <button
                                                        key={
                                                            item.checkKey
                                                        }
                                                        onClick={() =>
                                                            toggleShoppingItem(
                                                                item.checkKey
                                                            )
                                                        }
                                                        className="flex w-full items-center gap-3 rounded-2xl bg-gray-50 p-4 text-left opacity-60"
                                                    >
                                                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-500 text-xs text-white">
                                                            ✓
                                                        </div>

                                                        <div className="flex-1">
                                                            <p className="font-medium line-through">
                                                                {
                                                                    item.name
                                                                }
                                                            </p>

                                                            <p className="mt-1 text-xs text-gray-400">
                                                                买{" "}
                                                                {
                                                                    item.needToBuy
                                                                }
                                                                {
                                                                    item.unit
                                                                }
                                                            </p>
                                                        </div>

                                                        <span className="text-xs text-green-600">
                                                            已买
                                                        </span>
                                                    </button>
                                                )
                                            )}
                                        </div>

                                        <button
                                            onClick={
                                                addPurchasedToFridge
                                            }
                                            className="mt-4 w-full rounded-2xl bg-[#ff6b57] px-4 py-3 font-medium text-white"
                                        >
                                            🥬 全部加入冰箱
                                        </button>

                                        <p className="mt-2 text-center text-xs text-gray-400">
                                            会按照已购买数量自动增加冰箱库存
                                        </p>
                                    </div>
                                )}

                            <div className="mt-7 border-t border-gray-100 pt-5">
                                <p className="text-sm font-medium">
                                    冰箱已经够的食材
                                </p>

                                <div className="mt-3 flex flex-wrap gap-2">
                                    {shoppingList
                                        .filter(
                                            (item) =>
                                                item.needToBuy ===
                                                0
                                        )
                                        .map(
                                            (item) => (
                                                <span
                                                    key={
                                                        item.checkKey
                                                    }
                                                    className="rounded-full bg-green-50 px-3 py-2 text-xs text-green-600"
                                                >
                                                    {
                                                        item.name
                                                    }{" "}
                                                    ✓
                                                </span>
                                            )
                                        )}

                                    {shoppingList.filter(
                                        (item) =>
                                            item.needToBuy ===
                                            0
                                    ).length ===
                                        0 && (
                                            <span className="text-xs text-gray-400">
                                                暂无
                                            </span>
                                        )}
                                </div>
                            </div>
                        </>
                    )}
                </section>
            </div>

            {activeDay && (
                <div className="fixed inset-0 z-[60] flex items-end bg-black/30">
                    <div className="max-h-[75vh] w-full overflow-y-auto rounded-t-3xl bg-[#fffaf5] p-5">
                        <div className="mx-auto max-w-md">
                            <div className="mb-5 flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">
                                        给 {activeDay}
                                    </p>

                                    <h2 className="text-2xl font-bold">
                                        添加菜
                                    </h2>
                                </div>

                                <button
                                    onClick={() =>
                                        setActiveDay(
                                            null
                                        )
                                    }
                                    className="rounded-full bg-white px-4 py-2 text-sm shadow-sm"
                                >
                                    关闭
                                </button>
                            </div>

                            {fiveStarRecipes.length >
                                0 && (
                                    <section className="mb-6">
                                        <h3 className="mb-3 text-lg font-semibold">
                                            五星菜单 ⭐
                                        </h3>

                                        <div className="space-y-3">
                                            {fiveStarRecipes.map(
                                                (recipe) => (
                                                    <button
                                                        key={
                                                            recipe.id
                                                        }
                                                        onClick={() =>
                                                            addRecipeToDay(
                                                                activeDay,
                                                                recipe
                                                            )
                                                        }
                                                        className="w-full rounded-2xl bg-white p-4 text-left shadow-sm"
                                                    >
                                                        <p className="font-medium">
                                                            {
                                                                recipe.name
                                                            }
                                                        </p>

                                                        {recipe
                                                            .ingredients
                                                            .length >
                                                            0 && (
                                                                <p className="mt-2 text-xs text-gray-400">
                                                                    {recipe.ingredients
                                                                        .slice(
                                                                            0,
                                                                            4
                                                                        )
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
                                                            )}
                                                    </button>
                                                )
                                            )}
                                        </div>
                                    </section>
                                )}

                            {customPlanRecipes.length >
                                0 && (
                                    <section className="mb-6">
                                        <h3 className="mb-3 text-lg font-semibold">
                                            我们的菜单
                                        </h3>

                                        <div className="space-y-3">
                                            {customPlanRecipes.map(
                                                (recipe) => (
                                                    <button
                                                        key={
                                                            recipe.id
                                                        }
                                                        onClick={() =>
                                                            addRecipeToDay(
                                                                activeDay,
                                                                recipe
                                                            )
                                                        }
                                                        className="w-full rounded-2xl bg-white p-4 text-left shadow-sm"
                                                    >
                                                        <p className="font-medium">
                                                            {
                                                                recipe.name
                                                            }
                                                        </p>

                                                        {recipe
                                                            .ingredients
                                                            .length >
                                                            0 ? (
                                                            <p className="mt-2 text-xs text-gray-400">
                                                                {recipe.ingredients
                                                                    .slice(
                                                                        0,
                                                                        4
                                                                    )
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
                                                        ) : (
                                                            <p className="mt-2 text-xs text-orange-400">
                                                                暂未填写食材
                                                            </p>
                                                        )}
                                                    </button>
                                                )
                                            )}
                                        </div>
                                    </section>
                                )}

                            <section>
                                <h3 className="mb-3 text-lg font-semibold">
                                    系统菜单
                                </h3>

                                <div className="space-y-3">
                                    {systemPlanRecipes.map(
                                        (recipe) => (
                                            <button
                                                key={
                                                    recipe.id
                                                }
                                                onClick={() =>
                                                    addRecipeToDay(
                                                        activeDay,
                                                        recipe
                                                    )
                                                }
                                                className="w-full rounded-2xl bg-white p-4 text-left shadow-sm"
                                            >
                                                <p className="font-medium">
                                                    {
                                                        recipe.name
                                                    }
                                                </p>

                                                <p className="mt-2 text-xs text-gray-400">
                                                    {recipe.ingredients
                                                        .slice(
                                                            0,
                                                            4
                                                        )
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
                                            </button>
                                        )
                                    )}
                                </div>
                            </section>
                        </div>
                    </div>
                </div>
            )}

            <BottomNav />
        </main>
    );
}