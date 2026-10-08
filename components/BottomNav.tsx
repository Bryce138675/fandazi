import Link from "next/link";

export default function BottomNav() {
    const items = [
        { href: "/", icon: "❤️", label: "今天" },
        { href: "/fridge", icon: "🥬", label: "冰箱" },
        { href: "/recipes", icon: "🍽️", label: "菜谱" },
        { href: "/plan", icon: "📅", label: "计划" },
        { href: "/us", icon: "👩‍❤️‍👨", label: "我们" },
    ];

    return (
        <nav className="fixed bottom-4 left-1/2 z-50 w-[calc(100%-32px)] max-w-md -translate-x-1/2">
            <div className="grid grid-cols-5 rounded-3xl bg-white px-2 py-3 shadow-lg">
                {items.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className="text-center"
                    >
                        <div className="text-xl">{item.icon}</div>
                        <div className="mt-1 text-xs text-gray-600">
                            {item.label}
                        </div>
                    </Link>
                ))}
            </div>
        </nav>
    );
}