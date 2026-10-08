"use client";

import { useEffect, useState } from "react";
import BottomNav from "@/components/BottomNav";

type FridgeItem = {
    id: number;
    name: string;
    quantity: string;
    unit: string;
    urgent: boolean;
};

const STORAGE_KEY = "fandazi-fridge-items";

export default function FridgePage() {
    const [items, setItems] = useState<FridgeItem[]>([]);
    const [loaded, setLoaded] = useState(false);

    const [name, setName] = useState("");
    const [quantity, setQuantity] = useState("");
    const [unit, setUnit] = useState("个");
    const [urgent, setUrgent] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY);

        if (saved) {
            try {
                setItems(JSON.parse(saved));
            } catch {
                setItems([]);
            }
        } else {
            setItems([
                {
                    id: 1,
                    name: "鸡蛋",
                    quantity: "6",
                    unit: "个",
                    urgent: false,
                },
                {
                    id: 2,
                    name: "生菜",
                    quantity: "1",
                    unit: "颗",
                    urgent: true,
                },
                {
                    id: 3,
                    name: "猪肉",
                    quantity: "500",
                    unit: "g",
                    urgent: false,
                },
            ]);
        }

        setLoaded(true);
    }, []);

    useEffect(() => {
        if (!loaded) return;

        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }, [items, loaded]);

    function addItem() {
        if (!name.trim() || !quantity.trim()) return;

        const newItem: FridgeItem = {
            id: Date.now(),
            name: name.trim(),
            quantity,
            unit,
            urgent,
        };

        setItems((current) => [...current, newItem]);

        setName("");
        setQuantity("");
        setUnit("个");
        setUrgent(false);
    }

    function deleteItem(id: number) {
        setItems((current) => current.filter((item) => item.id !== id));
    }

    return (
        <main className="min-h-screen bg-[#fffaf5] px-5 py-8 pb-32 text-[#2b2b2b]">
            <div className="mx-auto max-w-md">
                <header className="mb-8">
                    <p className="text-sm text-gray-500">共享冰箱</p>
                    <h1 className="mt-1 text-3xl font-bold">冰箱里有什么 🥬</h1>
                    <p className="mt-2 text-sm text-gray-500">
                        先记录现有食材，之后我们会根据这些推荐今晚吃什么
                    </p>
                </header>

                <section className="mb-6 rounded-3xl bg-white p-5 shadow-sm">
                    <h2 className="text-lg font-semibold">添加食材</h2>

                    <div className="mt-4">
                        <label className="text-sm text-gray-500">食材名称</label>
                        <input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="例如：番茄"
                            className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none"
                        />
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-sm text-gray-500">数量</label>
                            <input
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                                placeholder="例如：3"
                                className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none"
                            />
                        </div>

                        <div>
                            <label className="text-sm text-gray-500">单位</label>
                            <select
                                value={unit}
                                onChange={(e) => setUnit(e.target.value)}
                                className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 outline-none"
                            >
                                <option value="个">个</option>
                                <option value="颗">颗</option>
                                <option value="盒">盒</option>
                                <option value="袋">袋</option>
                                <option value="g">g</option>
                                <option value="kg">kg</option>
                                <option value="ml">ml</option>
                            </select>
                        </div>
                    </div>

                    <label className="mt-4 flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={urgent}
                            onChange={(e) => setUrgent(e.target.checked)}
                        />
                        <span className="text-sm">这个食材需要优先吃掉</span>
                    </label>

                    <button
                        onClick={addItem}
                        className="mt-5 w-full rounded-2xl bg-[#ff6b57] px-4 py-3 font-medium text-white"
                    >
                        + 加入冰箱
                    </button>
                </section>

                <section>
                    <div className="mb-3 flex items-center justify-between">
                        <h2 className="text-lg font-semibold">现有食材</h2>

                        <span className="text-sm text-gray-500">
                            {items.length} 种
                        </span>
                    </div>

                    <div className="space-y-3">
                        {items.map((item) => (
                            <div
                                key={item.id}
                                className="flex items-center justify-between rounded-3xl bg-white p-4 shadow-sm"
                            >
                                <div>
                                    <div className="flex items-center gap-2">
                                        <p className="font-semibold">{item.name}</p>

                                        {item.urgent && (
                                            <span className="rounded-full bg-red-50 px-2 py-1 text-xs text-red-500">
                                                快吃掉
                                            </span>
                                        )}
                                    </div>

                                    <p className="mt-1 text-sm text-gray-500">
                                        {item.quantity} {item.unit}
                                    </p>
                                </div>

                                <button
                                    onClick={() => deleteItem(item.id)}
                                    className="rounded-xl px-3 py-2 text-sm text-gray-400 hover:bg-gray-100"
                                >
                                    删除
                                </button>
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            <BottomNav />
        </main>
    );
}