"use client";

import { useState } from "react";
import Link from "next/link";

import {
    FANDAZI_SHARE_CODE,
    getCloudState,
    saveCloudState,
    type FandaziCloudState,
} from "@/lib/fandaziCloud";

const LOCAL_KEYS = {
    fridgeItems: "fandazi-fridge-items",
    customRecipes: "fandazi-custom-recipes",
    weekPlan: "fandazi-week-plan",
    shoppingChecks: "fandazi-shopping-checks",
    mealLogs: "fandazi-meal-logs",
    tonightDinner: "fandazi-tonight-dinner",
};

function readJSON(key: string) {
    const saved = localStorage.getItem(key);

    if (!saved) {
        return null;
    }

    try {
        return JSON.parse(saved);
    } catch {
        return null;
    }
}

export default function SyncPage() {
    const [status, setStatus] = useState("");
    const [cloudPreview, setCloudPreview] =
        useState<FandaziCloudState | null>(null);

    const [loading, setLoading] = useState(false);

    async function uploadLocalToCloud() {
        setLoading(true);
        setStatus("正在读取这台设备的数据...");

        const localState: FandaziCloudState = {
            fridgeItems:
                readJSON(LOCAL_KEYS.fridgeItems) ?? [],
            customRecipes:
                readJSON(LOCAL_KEYS.customRecipes) ?? [],
            weekPlan:
                readJSON(LOCAL_KEYS.weekPlan) ?? [],
            shoppingChecks:
                readJSON(LOCAL_KEYS.shoppingChecks) ?? {},
            mealLogs:
                readJSON(LOCAL_KEYS.mealLogs) ?? [],
            tonightDinner:
                readJSON(LOCAL_KEYS.tonightDinner) ?? null,
        };

        setStatus("正在上传到 Supabase...");

        const success =
            await saveCloudState(localState);

        if (!success) {
            setStatus(
                "上传失败。请打开浏览器 Console 查看错误。"
            );

            setLoading(false);
            return;
        }

        setStatus(
            "上传成功 ✅ 这台设备的数据已经进入共享空间 180317。"
        );

        setCloudPreview(localState);
        setLoading(false);
    }

    async function readCloud() {
        setLoading(true);
        setStatus("正在读取云端数据...");

        const cloudState =
            await getCloudState();

        if (!cloudState) {
            setStatus(
                "没有读取到云端数据，或者请求失败。"
            );

            setCloudPreview(null);
            setLoading(false);
            return;
        }

        setCloudPreview(cloudState);

        setStatus(
            "读取成功 ✅ 已经连接到共享空间 180317。"
        );

        setLoading(false);
    }

    async function downloadCloudToThisDevice() {
        setLoading(true);
        setStatus("正在从云端读取数据...");

        const cloudState =
            await getCloudState();

        if (!cloudState) {
            setStatus(
                "读取失败，没有拿到云端数据。"
            );

            setLoading(false);
            return;
        }

        if (cloudState.fridgeItems) {
            localStorage.setItem(
                LOCAL_KEYS.fridgeItems,
                JSON.stringify(
                    cloudState.fridgeItems
                )
            );
        }

        if (cloudState.customRecipes) {
            localStorage.setItem(
                LOCAL_KEYS.customRecipes,
                JSON.stringify(
                    cloudState.customRecipes
                )
            );
        }

        if (cloudState.weekPlan) {
            localStorage.setItem(
                LOCAL_KEYS.weekPlan,
                JSON.stringify(
                    cloudState.weekPlan
                )
            );
        }

        if (cloudState.shoppingChecks) {
            localStorage.setItem(
                LOCAL_KEYS.shoppingChecks,
                JSON.stringify(
                    cloudState.shoppingChecks
                )
            );
        }

        if (cloudState.mealLogs) {
            localStorage.setItem(
                LOCAL_KEYS.mealLogs,
                JSON.stringify(
                    cloudState.mealLogs
                )
            );
        }

        if (cloudState.tonightDinner) {
            localStorage.setItem(
                LOCAL_KEYS.tonightDinner,
                JSON.stringify(
                    cloudState.tonightDinner
                )
            );
        } else {
            localStorage.removeItem(
                LOCAL_KEYS.tonightDinner
            );
        }

        setCloudPreview(cloudState);

        setStatus(
            "下载成功 ✅ 云端数据已经写进当前设备。刷新首页即可看到。"
        );

        setLoading(false);
    }

    return (
        <main className="min-h-screen bg-[#fffaf5] px-5 py-8 text-[#2b2b2b]">
            <div className="mx-auto max-w-md">
                <header className="mb-6">
                    <p className="text-sm text-gray-500">
                        云端同步测试
                    </p>

                    <h1 className="mt-1 text-3xl font-bold">
                        饭搭子 Cloud ☁️
                    </h1>

                    <p className="mt-2 text-sm text-gray-500">
                        共享空间：
                        <span className="font-semibold text-[#ff6b57]">
                            {" "}
                            {FANDAZI_SHARE_CODE}
                        </span>
                    </p>
                </header>

                <section className="rounded-3xl bg-white p-5 shadow-sm">
                    <h2 className="text-lg font-semibold">
                        第一次迁移
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-gray-500">
                        如果这台 Mac 里已经有你的冰箱、历史记录和一周计划，
                        先把它们上传到云端。
                    </p>

                    <button
                        onClick={uploadLocalToCloud}
                        disabled={loading}
                        className="mt-5 w-full rounded-2xl bg-[#ff6b57] px-4 py-3 font-medium text-white disabled:opacity-50"
                    >
                        ↑ 把这台设备的数据上传到云端
                    </button>
                </section>

                <section className="mt-5 rounded-3xl bg-white p-5 shadow-sm">
                    <h2 className="text-lg font-semibold">
                        测试读取
                    </h2>

                    <p className="mt-2 text-sm text-gray-500">
                        看 Supabase 里现在保存了什么。
                    </p>

                    <button
                        onClick={readCloud}
                        disabled={loading}
                        className="mt-5 w-full rounded-2xl border border-gray-200 px-4 py-3 font-medium disabled:opacity-50"
                    >
                        ↓ 读取云端数据
                    </button>
                </section>

                <section className="mt-5 rounded-3xl bg-white p-5 shadow-sm">
                    <h2 className="text-lg font-semibold">
                        新设备同步测试
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-gray-500">
                        以后 iPhone、Android 或另一台电脑第一次打开时，
                        本质上就是做这一步。
                    </p>

                    <button
                        onClick={
                            downloadCloudToThisDevice
                        }
                        disabled={loading}
                        className="mt-5 w-full rounded-2xl border border-gray-200 px-4 py-3 font-medium disabled:opacity-50"
                    >
                        ↓ 把云端数据下载到当前设备
                    </button>
                </section>

                {status && (
                    <div className="mt-5 rounded-2xl bg-white p-4 text-sm shadow-sm">
                        {status}
                    </div>
                )}

                {cloudPreview && (
                    <section className="mt-5 rounded-3xl bg-white p-5 shadow-sm">
                        <h2 className="font-semibold">
                            云端数据预览
                        </h2>

                        <div className="mt-4 space-y-2 text-sm text-gray-600">
                            <p>
                                冰箱：
                                {cloudPreview.fridgeItems
                                    ?.length ?? 0}{" "}
                                项
                            </p>

                            <p>
                                自定义菜：
                                {cloudPreview.customRecipes
                                    ?.length ?? 0}{" "}
                                道
                            </p>

                            <p>
                                一周计划：
                                {cloudPreview.weekPlan
                                    ?.length ?? 0}{" "}
                                天
                            </p>

                            <p>
                                历史记录：
                                {cloudPreview.mealLogs
                                    ?.length ?? 0}{" "}
                                条
                            </p>

                            <p>
                                今晚菜单：
                                {cloudPreview.tonightDinner
                                    ? "有"
                                    : "无"}
                            </p>
                        </div>
                    </section>
                )}

                <Link
                    href="/"
                    className="mt-6 block text-center text-sm text-gray-500"
                >
                    ← 回到首页
                </Link>
            </div>
        </main>
    );
}