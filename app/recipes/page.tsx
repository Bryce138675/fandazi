import BottomNav from "@/components/BottomNav";
export default function RecipesPage() {
    return (
        <main className="min-h-screen bg-[#fffaf5] p-6">
            <h1 className="text-3xl font-bold">菜谱</h1>
            <p className="mt-2 text-gray-500">找到今晚想吃的菜</p>
            <BottomNav />
        </main>
    );
}