const categoryIcons: Record<string, { keywords: string[]; icon: string }> = {
    beverage: {
        keywords: ["tea", "juice", "coffee", "milk", "soda", "water"],
        icon: "/assets/icons/beverage.png",
    },
    grocery: {
        keywords: ["rice", "oil", "flour", "salt", "sugar", "wheat", "home","egg"],
        icon: "/assets/icons/grocery.png",
    },
    electronics: {
        keywords: ["charger", "cable", "adapter", "mouse", "keyboard"],
        icon: "/assets/icons/electronics.png",
    },
    cleaning: {
        keywords: ["detergent", "soap", "cleaner", "bleach"],
        icon: "/assets/icons/cleaning.png",
    },
    gasoline: {
        keywords: ["petrol", "diesel"],
        icon: "/assets/icons/petrol.png",
    },
    topup: {
        keywords: ["topup", "recharge"],
        icon: "/assets/icons/topup.png",
    },
    food: {
        keywords: ["fish", "meals", "sadya", "chicken"],
        icon: "/assets/icons/food.png",
    },
    dress: {
        keywords: ["dress", "pants", "top", "shirt"],
        icon: "/assets/icons/dress.png",
    }
};

export function getCategoryIcon(itemName: string): string {
    const lowerName = itemName.toLowerCase();

    for (const { keywords, icon } of Object.values(categoryIcons)) {
        if (keywords.some(keyword => lowerName.includes(keyword))) {
            return icon;
        }
    }

    return "/assets/icons/other.png"; // fallback icon
}