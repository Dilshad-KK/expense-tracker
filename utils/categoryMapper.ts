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
        keywords: ["fish", "meals", "sadya", "chicken","lunch","breakfast","dinner","snacks"],
        icon: "/assets/icons/food.png",
    },
    dress: {
        keywords: ["dress", "pants", "top", "shirt"],
        icon: "/assets/icons/dress.png",
    },
    medicine:{
        keywords: ["medicine", "pharmacy", "doctor", "clinic"],
        icon: "/assets/icons/pharmacy.png",
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

// Return a large hero image URL from Unsplash based on detected category keyword.
export function getCategoryHeroImage(itemName: string): string {
    const lowerName = (itemName || '').toLowerCase();
    const q = (keywords: string, fallback: string) => encodeURIComponent(keywords || fallback);

    if (categoryIcons.beverage.keywords.some(k => lowerName.includes(k))) {
        return `https://source.unsplash.com/800x400/?${q('coffee,beverage,tea', 'beverage')}`;
    }
    if (categoryIcons.grocery.keywords.some(k => lowerName.includes(k))) {
        return `https://source.unsplash.com/800x400/?${q('groceries,supermarket,shopping-cart', 'groceries')}`;
    }
    if (categoryIcons.electronics.keywords.some(k => lowerName.includes(k))) {
        return `https://source.unsplash.com/800x400/?${q('electronics,gadgets', 'electronics')}`;
    }
    if (categoryIcons.cleaning.keywords.some(k => lowerName.includes(k))) {
        return `https://source.unsplash.com/800x400/?${q('cleaning,supplies', 'cleaning')}`;
    }
    if (categoryIcons.gasoline.keywords.some(k => lowerName.includes(k))) {
        return `https://source.unsplash.com/800x400/?${q('fuel,gas,pump', 'fuel')}`;
    }
    if (categoryIcons.topup.keywords.some(k => lowerName.includes(k))) {
        return `https://source.unsplash.com/800x400/?${q('mobile,topup,recharge', 'mobile')}`;
    }
    if (categoryIcons.food.keywords.some(k => lowerName.includes(k))) {
        return `https://source.unsplash.com/800x400/?${q('food,meal,restaurant', 'food')}`;
    }
    if (categoryIcons.dress.keywords.some(k => lowerName.includes(k))) {
        return `https://source.unsplash.com/800x400/?${q('clothes,fashion,boutique', 'fashion')}`;
    }
    if (categoryIcons.medicine.keywords.some(k => lowerName.includes(k))) {
        return `https://source.unsplash.com/800x400/?${q('pharmacy,medicine,health', 'pharmacy')}`;
    }
    return `https://source.unsplash.com/800x400/?${q('shopping,finance', 'shopping')}`;
}
