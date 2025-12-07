// ====================================================================
//  levels.js — структура уровней сезона 1
// ====================================================================

const Levels = (() => {

    const data = {

        1: {
            number: 1,
            type: "money",
            goal: 5000,
            description: "Собрать 5 000 ֏ чтобы не умереть",
            reward: 1000,
            background: "img/season1_level1.png"
        },

        2: {
            number: 2,
            type: "pay_debt",
            goal: 10000,
            description: "Отдать долги 10 000 ֏",
            reward: 1500,
            background: "img/season1_level2.png"
        },

        3: {
            number: 3,
            type: "item",
            goal: "item_mangal",
            description: "Собрать мангал",
            reward: 2000,
            background: "img/season1_level3.png"
        },

        4: {
            number: 4,
            type: "money",
            goal: 15000,
            description: "Получить 15 000 ֏ от первого богатого клиента",
            reward: 2500,
            background: "img/season1_level4.png"
        },

        5: {
            number: 5,
            type: "item",
            goal: "item_heating",
            description: "Купить отопление",
            reward: 3000,
            background: "img/season1_level5.png"
        },

        6: {
            number: 6,
            type: "item",
            goal: "item_generator",
            description: "Купить генератор",
            reward: 3500,
            background: "img/season1_level6.png"
        },

        7: {
            number: 7,
            type: "season_complete",
            goal: "end",
            description: "Ты выбрался! Сезон завершён!",
            reward: 5000,
            background: "img/season1_level7.png"
        }
    };

    function get(level) {
        return data[level] || null;
    }

    function next(level) {
        return data[level + 1] ? level + 1 : null;
    }

    function isLast(level) {
        return level === 7;
    }

    function checkGoal(levelData, state) {

        switch (levelData.type) {

            case "money":
                return state.stats.totalEarned >= levelData.goal;

            case "item":
                return state.unlockedItems.includes(levelData.goal);

            case "pay_debt":
                return false; // НЕ выполняется автоматически!

            case "season_complete":
                return true;

            default:
                return false;
        }
    }

    return { get, next, isLast, checkGoal };

})();