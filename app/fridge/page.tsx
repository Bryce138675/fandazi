"use client";

import { useEffect, useState } from "react";
import BottomNav from "@/components/BottomNav";
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

const STORAGE_KEY = "fandazi-fridge-items";

const UNITS = [
    "个",
    "颗",
    "根",
    "片",
    "盒",
    "袋",
    "瓶",
    "g",
    "kg",
    "ml",
    "L",
];

export default function FridgePage() {
    const [items, setItems] = useState<FridgeItem[]>([]);
    const [loaded, setLoaded] = useState(false);

    const [name, setName] = useState("");
    const [quantity, setQuantity] = useState("1");
    const [unit, setUnit] = useState("个");
    const [urgent, setUrgent] = useState(false);

    const [syncStatus, setSyncStatus] =
        useState("正在连接云端...");

    useEffect(() => {
        loadFridge();
    }, []);

    async function loadFridge() {
        const saved = localStorage.getItem(STORAGE_KEY);

        let localItems: FridgeItem[] = [];

        if (saved) {
            try {
                localItems = JSON.parse(saved);
                setItems(localItems);
            } catch {
                localItems = [];
            }
        }

        const cloudState = await getCloudState();

        if (
            cloudState &&
            Array.isArray(cloudState.fridgeItems)
        ) {
            const cloudItems =
                cloudState.fridgeItems as FridgeItem[];

            setItems(cloudItems);

            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(cloudItems)
            );

            setSyncStatus("云端已同步 ☁️");
        } else if (localItems.length > 0) {
            await patchCloudState({
                fridgeItems: localItems,
            });

            setSyncStatus("本地数据已上传 ☁️");
        } else {
            setSyncStatus("云端已连接 ☁️");
        }

        setLoaded(true);
    }

    async function saveItems(
        nextItems: FridgeItem[]
    ) {
        setItems(nextItems);

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(nextItems)
        );

        setSyncStatus("正在同步...");

        const result = await patchCloudState({
            fridgeItems: nextItems,
        });

        if (result) {
            setSyncStatus("已同步 ☁️");
        } else {
            setSyncStatus(
                "云端同步失败，本机数据已保存"
            );
        }
    }

    async function addItem() {
        const cleanName = name.trim();

        if (!cleanName) return;

        const existing = items.find(
            (item) =>
                item.name.trim().toLowerCase() ===
                cleanName.toLowerCase() &&
                item.unit === unit
        );

        let nextItems: FridgeItem[];

        if (existing) {
            nextItems = items.map((item) =>
                item.id === existing.id
                    ? {
                        ...item,
                        quantity: String(
                            (Number(item.quantity) || 0) +
                            (Number(quantity) || 0)
                        ),
                        urgent:
                            item.urgent || urgent,
                    }
                    : item
            );
        } else {
            const newItem: FridgeItem = {
                id: Date.now(),
                name: cleanName,
                quantity: quantity || "1",
                unit,
                urgent,
            };

            nextItems = [
                newItem,
                ...items,
            ];
        }

        await saveItems(nextItems);

        setName("");
        setQuantity("1");
        setUnit("个");
        setUrgent(false);
    }

    async function updateItem(
        id: number,
        patch: Partial<FridgeItem>
    ) {
        const nextItems = items.map((item) =>
            item.id === id
                ? {
                    ...item,
                    ...patch,
                }
                : item
        );

        await saveItems(nextItems);
    }

    async function deleteItem(id: number) {
        const nextItems = items.filter(
            (item) => item.id !== id
        );

        await saveItems(nextItems);
    }

    async function refreshFromCloud() {
        setSyncStatus("正在读取云端...");

        const cloudState = await getCloudState();

        if (
            cloudState &&
            Array.isArray(cloudState.fridgeItems)
        ) {
            const cloudItems =
                cloudState.fridgeItems as FridgeItem[];

            setItems(cloudItems);

            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(cloudItems)
            );

            setSyncStatus("已读取最新数据 ☁️");
        } else {
            setSyncStatus("读取云端失败");
        }
    }

    return (
        <main className="min-h-screen bg-[#fffaf5] px-5 py-8 pb-32 text-[#2b2b2b]">
            <div className="mx-auto max-w-md">
                <header className="mb-6">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm text-gray-500">
                                家里有什么
                            </p>

                            <h1 className="mt-1 text-3xl font-bold">
                                我的冰箱 🥬
                            </h1>
                        </div>

                        <button
                            onClick={refreshFromCloud}
                            className="rounded-full bg-white px-3 py-2 text-xs text-gray-500 shadow-sm"
                        >
                            ↻ 刷新
                        </button>
                    </div>

                    <p className="mt-3 text-xs text-green-600">
                        {syncStatus}
                    </p>
                </header>

                <section className="mb-6 rounded-3xl bg-white p-5 shadow-sm">
                    <h2 className="text-lg font-semibold">
                        添加食材
                    </h2>

                    <input
                        value={name}
                        onChange={(e) =>
                            setName(e.target.value)
                        }
                        placeholder="例如：鸡蛋"
                        className="mt-4 w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none"
                    />

                    <div className="mt-3 grid grid-cols-2 gap-3">
                        <input
                            type="number"
                            min="0"
                            step="0.1"
                            value={quantity}
                            onChange={(e) =>
                                setQuantity(e.target.value)
                            }
                            className="rounded-2xl border border-gray-200 px-4 py-3 outline-none"
                        />

                        <select
                            value={unit}
                            onChange={(e) =>
                                setUnit(e.target.value)
                            }
                            className="rounded-2xl border border-gray-200 bg-white px-4 py-3"
                        >
                            {UNITS.map((item) => (
                                <option
                                    key={item}
                                    value={item}
                                >
                                    {item}
                                </option>
                            ))}
                        </select>
                    </div>

                    <label className="mt-4 flex items-center gap-3 rounded-2xl bg-[#fffaf5] p-4">
                        <input
                            type="checkbox"
                            checked={urgent}
                            onChange={(e) =>
                                setUrgent(
                                    e.target.checked
                                )
                            }
                        />

                        <div>
                            <p className="text-sm font-medium">
                                优先吃掉
                            </p>

                            <p className="text-xs text-gray-400">
                                快过期或想尽快用掉
                            </p>
                        </div>
                    </label>

                    <button
                        onClick={addItem}
                        className="mt-4 w-full rounded-2xl bg-[#ff6b57] px-4 py-3 font-medium text-white"
                    >
                        加入冰箱
                    </button>
                </section>

                {!loaded ? (
                    <section className="rounded-3xl bg-white p-6 text-center shadow-sm">
                        <p className="text-sm text-gray-400">
                            正在读取共享冰箱...
                        </p>
                    </section>
                ) : items.length === 0 ? (
                    <section className="rounded-3xl bg-white p-6 text-center shadow-sm">
                        <div className="text-4xl">
                            🧊
                        </div>

                        <p className="mt-3 font-medium">
                            冰箱还是空的
                        </p>

                        <p className="mt-1 text-sm text-gray-400">
                            添加第一样食材吧
                        </p>
                    </section>
                ) : (
                    <div className="space-y-3">
                        {items.map((item) => (
                            <section
                                key={item.id}
                                className="rounded-3xl bg-white p-4 shadow-sm"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1">
                                        <input
                                            value={item.name}
                                            onChange={(e) =>
                                                updateItem(
                                                    item.id,
                                                    {
                                                        name: e.target.value,
                                                    }
                                                )
                                            }
                                            className="w-full bg-transparent text-lg font-semibold outline-none"
                                        />

                                        <div className="mt-3 flex gap-2">
                                            <input
                                                type="number"
                                                min="0"
                                                step="0.1"
                                                value={
                                                    item.quantity
                                                }
                                                onChange={(e) =>
                                                    updateItem(
                                                        item.id,
                                                        {
                                                            quantity:
                                                                e.target
                                                                    .value,
                                                        }
                                                    )
                                                }
                                                className="w-24 rounded-xl border border-gray-200 px-3 py-2"
                                            />

                                            <select
                                                value={item.unit}
                                                onChange={(e) =>
                                                    updateItem(
                                                        item.id,
                                                        {
                                                            unit: e.target
                                                                .value,
                                                        }
                                                    )
                                                }
                                                className="rounded-xl border border-gray-200 bg-white px-3 py-2"
                                            >
                                                {UNITS.map(
                                                    (unitOption) => (
                                                        <option
                                                            key={
                                                                unitOption
                                                            }
                                                            value={
                                                                unitOption
                                                            }
                                                        >
                                                            {
                                                                unitOption
                                                            }
                                                        </option>
                                                    )
                                                )}
                                            </select>
                                        </div>

                                        <button
                                            onClick={() =>
                                                updateItem(
                                                    item.id,
                                                    {
                                                        urgent:
                                                            !item.urgent,
                                                    }
                                                )
                                            }
                                            className={`mt-3 rounded-full px-3 py-1 text-xs ${item.urgent
                                                    ? "bg-orange-50 text-orange-500"
                                                    : "bg-gray-100 text-gray-400"
                                                }`}
                                        >
                                            {item.urgent
                                                ? "🔥 优先吃掉"
                                                : "设为优先"}
                                        </button>
                                    </div>

                                    <button
                                        onClick={() =>
                                            deleteItem(item.id)
                                        }
                                        className="text-sm text-gray-400"
                                    >
                                        删除
                                    </button>
                                </div>
                            </section>
                        ))}
                    </div>
                )}
            </div>

            <BottomNav />
        </main>
    );
}