// js/game.js

document.addEventListener("DOMContentLoaded", () => {

    // =========================================================
    // СОСТОЯНИЕ ИГРЫ
    // =========================================================
    const state = {
        money: 0,
        incomePerClick: 5,
        queueCurrent: 5,
        queueMax: 11,
        energy: 50,
        energyMax: 50,
        boostMultiplier: 1,
        boostActive: false,
        boostTimerId: null,
        autoCookTimerId: null,

        stats: {
            shawarmasSold: 0,
            totalEarned: 0
        },

        season: {
            level: 1,
            maxLevel: 7
        },

        unlockedItems: [],
        currentLevelData: null,
        levelCompleted: false,

        upgrades: {
            clickIncome: { level: 1, baseCost: 50,  icon: "💰", name: "Доход за клик" },
            autoCook:   { level: 0, baseCost: 120, icon: "🤖", name: "Авто-повар" },
            energyMax:  { level: 0, baseCost: 90,  icon: "⚡", name: "Макс. энергия" },
            queueSize:  { level: 0, baseCost: 70,  icon: "🚶", name: "Очередь клиентов" },

            item_mangal: {
                level: 0,
                baseCost: 20000,
                icon: "🔥",
                name: "Мангал",
                isItem: true,
                itemKey: "item_mangal"
            },
            item_heating: {
                level: 0,
                baseCost: 30000,
                icon: "🔥",
                name: "Отопление",
                isItem: true,
                itemKey: "item_heating"
            },
            item_generator: {
                level: 0,
                baseCost: 40000,
                icon: "🔌",
                name: "Генератор",
                isItem: true,
                itemKey: "item_generator"
            }
        }
    };

    // =========================================================
    // DOM-ЭЛЕМЕНТЫ (Только то, что нужно логике)
    // =========================================================
    const moneyValueEl = document.getElementById("moneyValue");
    const energyValueEl = document.getElementById("energyValue");
    const energyTextEl = document.getElementById("energyText");
    const energyFillEl = document.getElementById("energyFill");
    const queueFillEl = document.getElementById("queueFill");
    const queueValueEl = document.getElementById("queueValue");
    const boostLabelEl = document.getElementById("boostLabel");
    const boostIndicator = document.getElementById("boostIndicator");
    const logList = document.getElementById("logList");

    const shopPopup = document.getElementById("shopPopup");
    const upgradeList = document.getElementById("upgradeList");

    const questsPopup = document.getElementById("questsPopup");
    const questsList = document.getElementById("questsList");

    const snowContainer = document.getElementById("snowContainer");
    const gameScreenEl = document.getElementById("gameScreen");

    // =========================================================
    // UI
    // =========================================================
    function addLog(msg) {
        if (!logList) return;
        const li = document.createElement("li");
        li.textContent = msg;
        logList.prepend(li);
        if (logList.children.length > 5) logList.lastChild.remove();
    }

    function formatMoney(a) {
        return a.toLocaleString("ru-RU") + " ֏";
    }

    function updateMoneyView() {
        moneyValueEl.textContent = formatMoney(state.money);
    }

    function updateEnergyView() {
        energyValueEl.textContent = `${state.energy}/${state.energyMax}`;
        energyTextEl.textContent = `${state.energy}/${state.energyMax}`;
        energyFillEl.style.width = (state.energy / state.energyMax) * 100 + "%";
    }

    function updateQueueView() {
        queueValueEl.textContent = `${state.queueCurrent} / ${state.queueMax}`;
        queueFillEl.style.width = (state.queueCurrent / state.queueMax) * 100 + "%";
    }

    function updateBoostView() {
        boostLabelEl.textContent = `x${state.boostMultiplier}`;
    }

    function applyLevelBackground(data) {
        if (!data) return;
        gameScreenEl.style.backgroundImage = `url("${data.background}")`;
    }

    // =========================================================
    // АНИМАЦИИ ТЕКСТА
    // =========================================================
    function spawnFloatingText(text, x, y) {
        const el = document.createElement("div");
        el.className = "floating-text";
        el.textContent = text;
        el.style.left = x + "px";
        el.style.top = y + "px";
        document.body.appendChild(el);
        setTimeout(() => el.remove(), 900);
    }

    // =========================================================
    // СНЕГ
    // =========================================================
    function spawnSnowflake() {
        const flake = document.createElement("div");
        flake.className = "snowflake";
        flake.textContent = "❄️";
        flake.style.left = Math.random() * 100 + "vw";
        flake.style.animationDuration = 3 + Math.random() * 4 + "s";
        snowContainer.appendChild(flake);
        setTimeout(() => flake.remove(), 7000);
    }
    setInterval(spawnSnowflake, 250);

    // =========================================================
    // БУСТ
    // =========================================================
    function activateBoost(mult = 3, dur = 15000) {
        if (state.boostActive) return;
        state.boostActive = true;
        state.boostMultiplier = mult;
        updateBoostView();

        if (boostIndicator) {
            boostIndicator.classList.add("active");
        }

        clearTimeout(state.boostTimerId);
        state.boostTimerId = setTimeout(() => {
            state.boostActive = false;
            state.boostMultiplier = 1;
            updateBoostView();
            if (boostIndicator) {
                boostIndicator.classList.remove("active");
            }
        }, dur);
    }

    // =========================================================
    // МАГАЗИН
    // =========================================================
    function getUpgradeCost(up) {
        return Math.floor(up.baseCost * Math.pow(1.25, up.level));
    }

    function startAutoCook() {
        if (state.autoCookTimerId) {
            clearInterval(state.autoCookTimerId);
        }

        state.autoCookTimerId = setInterval(() => {
            // Авто-повар без анимации
            handleCook();
        }, 1000);
    }

    function buyUpgrade(key) {
        const up = state.upgrades[key];
        const cost = getUpgradeCost(up);

        if (state.money < cost) {
            return addLog("Недостаточно денег!");
        }

        state.money -= cost;
        up.level++;

        if (key === "clickIncome") {
            state.incomePerClick += 2;
        }

        if (key === "energyMax") {
            state.energyMax += 5;
            state.energy = state.energyMax;
        }

        if (key === "queueSize") {
            state.queueMax += 2;
        }

        if (key === "autoCook" && up.level === 1) {
            startAutoCook();
            addLog("Авто-повар вышел на смену!");
        }

        if (up.isItem) {
            if (!state.unlockedItems.includes(up.itemKey)) {
                state.unlockedItems.push(up.itemKey);
            }
            addLog(`Получен предмет: ${up.name}`);
        }

        updateMoneyView();
        updateEnergyView();
        updateQueueView();
        renderUpgrades();
        checkCurrentLevelGoal();
    }

    function renderUpgrades() {
        upgradeList.innerHTML = "";
        for (let key in state.upgrades) {
            const up = state.upgrades[key];
            const cost = getUpgradeCost(up);

            const div = document.createElement("div");
            div.className = "upgrade-item";

            const isBoughtItem = up.isItem && up.level > 0;

            div.innerHTML = `
                <div class="upgrade-icon">${up.icon}</div>
                <div class="upgrade-body">
                    <div class="upgrade-name">${up.name}</div>
                    <div class="upgrade-level">Уровень: ${up.level}</div>
                </div>
                <button class="upgrade-buy" ${isBoughtItem ? "disabled" : ""}>
                    ${isBoughtItem ? "Куплено" : formatMoney(cost)}
                </button>
            `;

            const btn = div.querySelector(".upgrade-buy");
            btn.onclick = () => {
                if (!isBoughtItem) buyUpgrade(key);
            };

            upgradeList.appendChild(div);
        }
    }

    // =========================================================
    // УРОВНИ
    // =========================================================
    function setCurrentLevel(lvl) {
        const data = Levels.get(lvl);
        state.currentLevelData = data;
        state.season.level = lvl;
        state.levelCompleted = false;
        // можно обнулять статистику дохода по уровню:
        state.stats.totalEarned = 0;
        return data;
    }

    function showLevelIntro(lvl) {
        const data = setCurrentLevel(lvl);
        Scenes.hideAll();
        Scenes.playLevelIntro(data);
    }

    function startCurrentLevelGameplay() {
        const data = state.currentLevelData;

        BlizzardTransition.play(
            () => { applyLevelBackground(data); },
            () => {
                Scenes.hideAll();
                Scenes.show("game");
            }
        );
    }

    // =========================================================
    // ПРОВЕРКА ЦЕЛИ УРОВНЯ
    // =========================================================
    function checkCurrentLevelGoal() {
        const data = state.currentLevelData;
        if (!data || state.levelCompleted) return;

        if (Levels.checkGoal(data, state)) {
            addLog("Цель уровня достигнута!");
            handleLevelComplete();
        }
    }

    // =========================================================
    // ЗАВЕРШЕНИЕ УРОВНЯ
    // =========================================================
    function handleLevelComplete() {
        if (state.levelCompleted) return;
        state.levelCompleted = true;

        const data = state.currentLevelData;

        if (data.reward) {
            state.money += data.reward;
            updateMoneyView();
        }

        const next = Levels.next(data.number);

        if (!next) {
            Scenes.hideAll();
            Scenes.show("seasonEnd");
            return;
        }

        BlizzardTransition.play(
            null,
            () => showLevelIntro(next)
        );
    }

    // =========================================================
    // КВЕСТЫ
    // =========================================================
    function handlePayDebt(data) {
        if (state.money < data.goal) return addLog("Недостаточно денег!");

        state.money -= data.goal;
        updateMoneyView();
        addLog("Долг погашен!");

        questsPopup.classList.add("hidden");
        handleLevelComplete();
    }

    function renderQuests() {
        questsList.innerHTML = "";

        for (let lvl = 1; lvl <= state.season.maxLevel; lvl++) {
            const data = Levels.get(lvl);

            const div = document.createElement("div");
            div.className = "quest-item";

            let extra = "";

            if (lvl === 2 && lvl === state.season.level && !state.levelCompleted) {
                extra = `<button class="quest-button" data-action="pay">
                            Отдать долг (${formatMoney(data.goal)})
                         </button>`;
            }

            div.innerHTML = `
                <div class="quest-title">Уровень ${lvl}</div>
                <div class="quest-desc">${data.description}</div>
                <div class="quest-status">${
                    lvl < state.season.level
                        ? "✔ Выполнено"
                        : lvl === state.season.level
                        ? (state.levelCompleted ? "✔ Завершено" : "Текущий уровень")
                        : "🔒 Закрыто"
                }</div>
                ${extra}
            `;

            questsList.appendChild(div);
        }

        questsList.querySelectorAll(".quest-button").forEach(btn => {
            btn.onclick = () => handlePayDebt(state.currentLevelData);
        });
    }

    // =========================================================
    // ГОТОВКА
    // =========================================================
    function handleCook(x, y) {
        if (state.energy <= 0) return;
        if (state.queueCurrent <= 0) {
            addLog("Клиенты кончились, подожди новых!");
            return;
        }

        const inc = state.incomePerClick * state.boostMultiplier;

        state.money += inc;
        state.energy--;
        state.queueCurrent--;
        state.stats.totalEarned += inc;
        state.stats.shawarmasSold++;

        updateMoneyView();
        updateEnergyView();
        updateQueueView();

        if (typeof x === "number" && typeof y === "number") {
            spawnFloatingText(`+${inc}`, x, y - 20);
        }

        checkCurrentLevelGoal();
    }

    // =========================================================
    // ПАССИВНАЯ РЕГЕНЕРАЦИЯ
    // =========================================================
    setInterval(() => {
        if (state.energy < state.energyMax) {
            state.energy++;
            updateEnergyView();
        }
    }, 200);

    setInterval(() => {
        if (state.queueCurrent < state.queueMax) {
            state.queueCurrent++;
            updateQueueView();
        }
    }, 300);

    // =========================================================
    // ИНИЦИАЛИЗАЦИЯ
    // =========================================================
    function init() {
        updateMoneyView();
        updateEnergyView();
        updateQueueView();
        updateBoostView();
        renderUpgrades();

        Scenes.hideAll();
        Scenes.show("loading");

        setTimeout(() => {
            Scenes.hideAll();
            Scenes.show("seasonIntro");
        }, 900);
    }

    // =========================================================
    // ЭКСПОРТ В ГЛОБАЛЬНЫЙ ОБЪЕКТ Game ДЛЯ ui.js
    // =========================================================
    window.Game = {
        state,
        addLog,
        formatMoney,
        updateMoneyView,
        updateEnergyView,
        updateQueueView,
        updateBoostView,
        applyLevelBackground,
        activateBoost,
        getUpgradeCost,
        startAutoCook,
        buyUpgrade,
        renderUpgrades,
        setCurrentLevel,
        showLevelIntro,
        startCurrentLevelGameplay,
        checkCurrentLevelGoal,
        handleLevelComplete,
        handlePayDebt,
        renderQuests,
        handleCook
    };

    init();
});
