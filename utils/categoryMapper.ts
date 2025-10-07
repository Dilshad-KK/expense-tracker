export const categoryIcons: Record<string, { keywords: string[]; icon: string; label?: string }> = {
    beverage: {
        keywords: ["tea", "juice", "coffee", "milk", "soda", "water"],
        icon: "/assets/icons/beverage.png",
        label: 'Beverage',
    },
    grocery: {
        keywords: ["rice", "oil", "flour", "salt", "sugar", "wheat", "home","egg"],
        icon: "/assets/icons/grocery.png",
        label: 'Grocery',
    },
    electronics: {
        keywords: ["charger", "cable", "adapter", "mouse", "keyboard"],
        icon: "/assets/icons/electronics.png",
        label: 'Electronics',
    },
    cleaning: {
        keywords: ["detergent", "soap", "cleaner", "bleach"],
        icon: "/assets/icons/cleaning.png",
        label: 'Cleaning',
    },
    gasoline: {
        keywords: ["petrol", "diesel"],
        icon: "/assets/icons/petrol.png",
        label: 'Fuel',
    },
    topup: {
        keywords: ["topup", "recharge"],
        icon: "/assets/icons/topup.png",
        label: 'Topup',
    },
    food: {
        keywords: ["fish", "meals", "sadya", "chicken","lunch","breakfast","dinner","snacks"],
        icon: "/assets/icons/food.png",
        label: 'Food',
    },
    dress: {
        keywords: ["dress", "pants", "top", "shirt"],
        icon: "/assets/icons/dress.png",
        label: 'Clothing',
    },
    medicine:{
        keywords: ["medicine", "pharmacy", "doctor", "clinic"],
        icon: "/assets/icons/pharmacy.png",
        label: 'Medical',
    }
};

const USER_MAP_KEY = 'category_user_map_v1';
type UserCategoryMap = Record<string, string>; // token -> category key

function loadUserMap(): UserCategoryMap {
    try {
        const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(USER_MAP_KEY) : null;
        if (!raw) return {};
        const parsed = JSON.parse(raw);
        return parsed && typeof parsed === 'object' ? parsed : {};
    } catch { return {}; }
}

function saveUserMap(map: UserCategoryMap) {
    try { if (typeof localStorage !== 'undefined') localStorage.setItem(USER_MAP_KEY, JSON.stringify(map)); } catch {}
}

let USER_MAP_CACHE: UserCategoryMap | null = null;
function getUserMap(): UserCategoryMap {
    if (!USER_MAP_CACHE) USER_MAP_CACHE = loadUserMap();
    return USER_MAP_CACHE;
}

export function trainCategoryForToken(token: string, categoryKey: string) {
    const map = getUserMap();
    map[token.toLowerCase()] = categoryKey;
    USER_MAP_CACHE = map;
    saveUserMap(map);
}

export function getSuggestedCategory(itemName: string): { key: string; icon: string; label: string } {
    const lowerName = (itemName || '').toLowerCase();
    const userMap = getUserMap();
    // Check user-learned tokens (split by non-word)
    const tokens = lowerName.split(/[^a-z0-9]+/g).filter(Boolean);
    for (const t of tokens) {
        const mapped = userMap[t];
        if (mapped && categoryIcons[mapped]) {
            const { icon, label = mapped } = categoryIcons[mapped];
            return { key: mapped, icon, label };
        }
    }
    // Fallback to static keyword mapping
    for (const [key, { keywords, icon, label }] of Object.entries(categoryIcons)) {
        if (keywords.some(keyword => lowerName.includes(keyword))) {
            return { key, icon, label: label || key };
        }
    }
    return { key: 'other', icon: "/assets/icons/other.png", label: 'Other' };
}

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

export function getAllCategories(): { key: string; label: string }[] {
    return Object.entries(categoryIcons).map(([key, v]) => ({ key, label: v.label || key }));
}
