export const getLevel = (xp: number): number => {
    if (xp < 100) return 1;
    if (xp < 500) return 2;
    if (xp < 1000) return 3;
    if (xp < 2500) return 4;
    return Math.floor((xp - 2500) / 2000) + 5;
};

export const getNextLevelXP = (level: number): number => {
    switch (level) {
        case 1: return 100;
        case 2: return 500;
        case 3: return 1000;
        case 4: return 2500;
        default: return 2500 + (level - 4) * 2000;
    }
};

export const GAME_SCORING = {
    puck: (score: number) => score * 2,
    quiz: (score: number) => score * 10,
    fantasy: (score: number) => score,
};
