// ====================================================================
//  levels.js — структура уровней сезона 1
// ====================================================================

const Levels = (() => {

    const data = {

        1: {
            number: 1,
            type: "money",                 // нужно заработать 5 000 ֏ (totalEarned)
            goal: 5000,
            description: "Собрать 5 000 ֏ чтобы не умереть",
            reward: 1000,
            background: "img/season1_level1.png"
        },

        2: {
            number: 2,
            type: "money",                 // нужно заработать 10 000 ֏ (totalEarned)
            goal: 10000,
            description: "Отдать долги 10 000 ֏",
            reward: 1500,
            background: "img/season1_level2.png"
        },

        3: {
            number: 3,
            type: "item",                  // нужно купить item_mangal
            goal: "item_mangal",
            description: "Собрать мангал",
            reward: 2000,
            background: "img/season1_level3.png"
        },

        4: {
            number: 4,
            type: "money",                 // нужно заработать 15 000 ֏ (totalEarned)
            goal: 15000,
            description: "Получить 15 000 ֏ от первого богатого клиента",
            reward: 2500,
            background: "img/season1_level4.png"
        },

        5: {
            number: 5,
            type: "item",                  // нужно купить item_heating
            goal: "item_heating",
            description: "Купить отопление",
            reward: 3000,
            background: "img/season1_level5.png"
        },

        6: {
            number: 6,
            type: "item",                  // нужно купить item_generator
            goal: "item_generator",
            description: "Купить генератор",
            reward: 3500,
            background: "img/season1_level6.png"
        },

        7: {
            number: 7,
            type: "season_complete",       // финал сезона
            goal: "end",
            description: "Ты выбрался! Сезон завершён!",
            reward: 5000,
            background: "img/season1_level7.png"
        }
    };

    function get(levelNumber) {
        return data[levelNumber] || null;
    }

    function next(levelNumber) {
        return data[levelNumber + 1] ? levelNumber + 1 : null;
    }

    function isLast(levelNumber) {
        return levelNumber === 7;
    }

    /**
     * Проверка выполнения цели уровня
     *  - money: по state.stats.totalEarned
     *  - item:  по state.unlockedItems
     *  - season_complete: всегда true
     */
    function checkGoal(levelData, state) {
        if (!levelData) return false;

        switch (levelData.type) {

            case "money":
                return state.stats.totalEarned >= levelData.goal;

            case "item":
                return Array.isArray(state.unlockedItems) &&
                       state.unlockedItems.includes(levelData.goal);

            case "season_complete":
                return true;

            default:
                return false;
        }
    }

    return {
        get,
        next,
        isLast,
        checkGoal
    };

})();