export type RecipeIngredient = {
    name: string;
    quantity: number;
    unit: string;
};

export type Recipe = {
    id: string;
    name: string;
    time: number;
    difficulty: number;
    ingredients: RecipeIngredient[];
};

export const recipes: Recipe[] = [
    {
        id: "tomato-egg",
        name: "番茄炒蛋",
        time: 15,
        difficulty: 1,
        ingredients: [
            { name: "番茄", quantity: 2, unit: "个" },
            { name: "鸡蛋", quantity: 3, unit: "个" },
        ],
    },
    {
        id: "fried-rice",
        name: "蛋炒饭",
        time: 15,
        difficulty: 1,
        ingredients: [
            { name: "米饭", quantity: 300, unit: "g" },
            { name: "鸡蛋", quantity: 2, unit: "个" },
            { name: "葱", quantity: 1, unit: "根" },
        ],
    },
    {
        id: "pork-lettuce",
        name: "辣肉生菜包",
        time: 20,
        difficulty: 2,
        ingredients: [
            { name: "猪肉", quantity: 300, unit: "g" },
            { name: "生菜", quantity: 1, unit: "颗" },
            { name: "辣椒酱", quantity: 2, unit: "勺" },
        ],
    },
    {
        id: "spicy-pasta",
        name: "韩式辣肉拌面",
        time: 25,
        difficulty: 2,
        ingredients: [
            { name: "猪肉", quantity: 250, unit: "g" },
            { name: "鸡蛋", quantity: 2, unit: "个" },
            { name: "生菜", quantity: 1, unit: "颗" },
            { name: "意面", quantity: 200, unit: "g" },
            { name: "辣椒酱", quantity: 2, unit: "勺" },
        ],
    },
    {
        id: "carbonara",
        name: "Carbonara",
        time: 25,
        difficulty: 2,
        ingredients: [
            { name: "意面", quantity: 200, unit: "g" },
            { name: "鸡蛋", quantity: 2, unit: "个" },
            { name: "培根", quantity: 150, unit: "g" },
            { name: "芝士", quantity: 50, unit: "g" },
        ],
    },
    {
        id: "curry-chicken",
        name: "咖喱鸡",
        time: 35,
        difficulty: 2,
        ingredients: [
            { name: "鸡肉", quantity: 400, unit: "g" },
            { name: "土豆", quantity: 2, unit: "个" },
            { name: "洋葱", quantity: 1, unit: "个" },
            { name: "咖喱", quantity: 1, unit: "盒" },
        ],
    },
    {
        id: "beef-tomato",
        name: "番茄牛腩",
        time: 90,
        difficulty: 3,
        ingredients: [
            { name: "牛腩", quantity: 500, unit: "g" },
            { name: "番茄", quantity: 4, unit: "个" },
            { name: "洋葱", quantity: 1, unit: "个" },
        ],
    },
    {
        id: "mapo-tofu",
        name: "麻婆豆腐",
        time: 25,
        difficulty: 2,
        ingredients: [
            { name: "豆腐", quantity: 1, unit: "盒" },
            { name: "猪肉", quantity: 150, unit: "g" },
            { name: "辣椒酱", quantity: 2, unit: "勺" },
        ],
    },
];