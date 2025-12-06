// js/game.js

document.addEventListener("DOMContentLoaded", () => {

    // === СОСТОЯНИЕ ИГРЫ ===
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

        // --- НОВОГОДНИЙ ИВЕНТ ---
        event: {
            newYear: true,
            snowflakes: 0
        },

        // --- СЕЗОН 1: ГОЛОДНЫЙ ПОВАР ---
        season: {
            currentLevel: 1,   // 1..7
            maxLevel: 7
        },

        // --- СТАТИСТИКА ---
        stats: {
            shawarmasSold: 0
        },

        // --- УЛУЧШЕНИЯ ---
        upgrades: {
            clickIncome: { level: 1, baseCost: 50, icon: "💰", name: "Доход за клик" },
            autoCook:    { level: 0, baseCost: 120, icon: "🤖", name: "Авто-повар" },
            energyMax:   { level: 0, baseCost: 90,  icon: "⚡", name: "Макс. энергия" },
            queueSize:   { level: 0, baseCost: 70,  icon: "🚶", name: "Очередь клиентов" }
        }
    };

    // === ПУТИ К ФОНАМ СЕЗОНА 1 ===
    const seasonBackgrounds = {
        1: "img/season1_level1.png",
        2: "img/season1_level2.png",
        3: "img/season1_level3.png",
        4: "img/season1_level4.png",
        5: "img/season1_level5.png",
        6: "img/season1_level6.png",
        7: "img/season1_level7.png"
    };

    // === ЭЛЕМЕНТЫ ===
    const moneyValueEl   = document.getElementById("moneyValue");
    const energyValueEl  = document.getElementById("energyValue");
    const energyTextEl   = document.getElementById("energyText");
    const energyFillEl   = document.getElementById("energyFill");
    const queueFillEl    = document.getElementById("queueFill");
    const queueValueEl   = document.getElementById("queueValue");
    const cookButton     = document.getElementById("cookButton");
    const boostLabelEl   = document.getElementById("boostLabel");
    const boostIndicator = document.getElementById("boostIndicator");
    const logList        = document.getElementById("logList");

    const shopPopup      = document.getElementById("shopPopup");
    const upgradeList    = document.getElementById("upgradeList");
    const closeShopBtn   = document.getElementById("closeShop");

    const btnShop        = document.getElementById("btnShop");
    const btnSuppliers   = document.getElementById("btnSuppliers");
    const btnQuests      = document.getElementById("btnQuests");
    const btnOffer1      = document.getElementById("btnOffer1");
    const btnOffer2      = document.getElementById("btnOffer2");
    const btnBoost       = document.getElementById("btnBoost");
    const btnPiggy       = document.getElementById("btnPiggy");
    const btnMenu        = document.getElementById("btnMenu");
    const btnShopBottom  = document.getElementById("btnShopBottom");
    const btnHearts      = document.getElementById("btnHearts");
    const btnHome        = document.getElementById("btnHome");
    const btnFriends     = document.getElementById("btnFriends");
    const btnTrophy      = document.getElementById("btnTrophy");

    const snowContainer  = document.getElementById("snowContainer");
    const sceneRoot      = document.querySelector(".scene");
    const sceneBgEl      = document.querySelector(".scene-bg");
    const kebabShopEl    = document.querySelector(".kebab-shop"); // старый CSS-домик

    // === ВСПОМОГАТЕЛЬНЫЕ ===
    function addLog(message) {
        const li = document.createElement("li");
        li.textContent = message;
        logList.prepend(li);
        if (logList.children.length > 5) logList.lastChild.remove();
    }

    function updateMoneyView() {
        moneyValueEl.textContent = state.money.toLocaleString("ru-RU");
    }

    function updateEnergyView() {
        energyValueEl.textContent = `${state.energy}/${state.energyMax}`;
        energyTextEl.textContent  = `${state.energy}/${state.energyMax}`;
        energyFillEl.style.width = `${(state.energy / state.energyMax) * 100}%`;
    }

    function updateQueueView() {
        queueValueEl.textContent = `${state.queueCurrent} / ${state.queueMax}`;
        queueFillEl.style.width = `${(state.queueCurrent / state.queueMax) * 100}%`;
    }

    function updateBoostView() {
        boostLabelEl.textContent = `x${state.boostMultiplier}`;
    }

    // === АНИМАЦИИ ===
    function animateButton(btn) {
        btn.classList.add("button-press");
        setTimeout(() => {
            btn.classList.remove("button-press");
            btn.classList.add("button-release");
            setTimeout(() => btn.classList.remove("button-release"), 120);
        }, 80);
    }

    function spawnFloatingText(text, x, y) {
        const el = document.createElement("div");
        el.className = "floating-text";
        el.textContent = text;
        el.style.left = x + "px";
        el.style.top = y + "px";
        document.body.appendChild(el);
        setTimeout(() => el.remove(), 900);
    }

    // === НОВОГОДНИЙ СНЕГ ===
    function spawnSnowflake() {
        if (!state.event.newYear) return;
        const flake = document.createElement("div");
        flake.className = "snowflake";
        flake.textContent = "❄️";
        flake.style.left = Math.random() * 100 + "vw";
        flake.style.fontSize = 12 + Math.random() * 14 + "px";
        flake.style.animationDuration = 3 + Math.random() * 4 + "s";

        snowContainer.appendChild(flake);
        setTimeout(() => flake.remove(), 7000);
    }

    if (state.event.newYear) {
        setInterval(spawnSnowflake, 250);
        sceneRoot.classList.add("winter-scene");
        addLog("Новогодний ивент активен!");
    }

    // === БУСТ ===
    function activateBoost(multiplier = 3, duration = 15000) {
        if (state.boostActive) return;

        state.boostActive = true;
        state.boostMultiplier = multiplier;
        updateBoostView();
        addLog(`Буст x${multiplier} активирован`);

        btnBoost.classList.add("btn-glow");
        boostIndicator.classList.add("btn-glow");

        state.boostTimerId = setTimeout(() => {
            state.boostActive = false;
            state.boostMultiplier = 1;
            updateBoostView();
            btnBoost.classList.remove("btn-glow");
            boostIndicator.classList.remove("btn-glow");
            addLog("Буст закончился");
        }, duration);
    }

    // Новый год: оффер 2 = мягкий буст x2
    btnOffer2.addEventListener("click", () => {
        animateButton(btnOffer2);
        activateBoost(2, 10000);
        addLog("🎄 Новогодний буст x2!");
    });

    // === ИВЕНТОВАЯ ВАЛЮТА — СНЕЖИНКИ ===
    function tryDropSnowflakeReward(x, y) {
        if (!state.event.newYear) return;
        if (Math.random() < 0.15) {
            state.event.snowflakes++;
            spawnFloatingText("❄️ +1", x, y);
        }
    }

    // === РАСЧЁТ СТОИМОСТИ УЛУЧШЕНИЙ ===
    function getUpgradeCost(up) {
        return Math.floor(up.baseCost * Math.pow(1.25, up.level));
    }

    // === ПОКУПКА УЛУЧШЕНИЯ ===
    function buyUpgrade(key) {
        const up = state.upgrades[key];
        const cost = getUpgradeCost(up);

        if (state.money < cost) {
            addLog("Недостаточно денег");
            return;
        }

        state.money -= cost;
        up.level++;

        if (key === "clickIncome") state.incomePerClick += 2;
        if (key === "energyMax") {
            state.energyMax += 5;
            state.energy = state.energyMax;
        }
        if (key === "queueSize") state.queueMax += 2;

        updateMoneyView();
        updateEnergyView();
        updateQueueView();
        renderUpgrades();
        checkSeasonProgress("upgrade");

        addLog(`Улучшено: ${up.name}`);
    }

    // === МАГАЗИН УЛУЧШЕНИЙ ===
    function renderUpgrades() {
        upgradeList.innerHTML = "";

        for (let key in state.upgrades) {
            const up = state.upgrades[key];
            const cost = getUpgradeCost(up);

            const card = document.createElement("div");
            card.className = "upgrade-item";
            card.dataset.key = key;

            card.innerHTML = `
                <div class="upgrade-icon">${up.icon}</div>

                <div class="upgrade-body">
                    <div class="upgrade-name">${up.name}</div>
                    <div class="upgrade-level">Уровень: ${up.level}</div>

                    <div class="upgrade-progress">
                        <div class="upgrade-progress-fill" style="width:${(up.level % 10) * 10}%"></div>
                    </div>
                </div>

                <button class="upgrade-buy">Купить<br>${cost}$</button>
            `;

            card.querySelector(".upgrade-buy").addEventListener("click", () => buyUpgrade(key));
            upgradeList.appendChild(card);
        }
    }

    // === POPUP МАГАЗИНА ===
    btnShop.addEventListener("click", () => {
        animateButton(btnShop);
        shopPopup.classList.remove("hidden");
        renderUpgrades();
    });

    closeShopBtn.addEventListener("click", () => {
        shopPopup.classList.add("hidden");
    });

    // === СЕЗОН 1: ФОНЫ И ПРОГРЕСС ===

    // применяем фон по текущему уровню
    function applySeasonBackground() {
        if (!sceneBgEl) return;

        // прячем старый CSS-домик, фон теперь картинка
        if (kebabShopEl) {
            kebabShopEl.style.display = "none";
        }

        const lvl = state.season.currentLevel;
        const url = seasonBackgrounds[lvl];

        if (url) {
            sceneBgEl.style.backgroundImage = `url("${url}")`;
            sceneBgEl.style.backgroundSize = "cover";
            sceneBgEl.style.backgroundPosition = "center";
        }
    }

    // награда за новый уровень сезона
    function giveSeasonReward(level) {
        let msg = "";

        switch (level) {
            case 2:
                state.money += 100;
                msg = "Уровень 2: Отдаём долги. Бонус: +100$";
                break;
            case 3:
                state.incomePerClick += 3;
                msg = "Уровень 3: Первый мангал. Доход за клик увеличен!";
                break;
            case 4:
                state.queueMax += 3;
                msg = "Уровень 4: Первый клиент. Очередь клиентов увеличена!";
                break;
            case 5:
                state.energyMax += 15;
                state.energy = state.energyMax;
                msg = "Уровень 5: В доме тепло. Энергия увеличена и восстановлена!";
                break;
            case 6:
                activateBoost(2, 20000);
                msg = "Уровень 6: Да здравствует свет! Временный буст x2!";
                break;
            case 7:
                state.money += 5000;
                msg = "Уровень 7: Мы выкарабкались! Праздничный бонус +5000$";
                break;
        }

        updateMoneyView();
        updateEnergyView();
        updateQueueView();

        if (msg) addLog(msg);
    }

    // проверка условий перехода на следующий уровень
    function checkSeasonProgress(triggerSource) {
        const lvl = state.season.currentLevel;
        if (lvl >= state.season.maxLevel) return;

        const money = state.money;
        const sold  = state.stats.shawarmasSold;

        let canLevelUp = false;

        switch (lvl) {
            case 1: // → 2: первые деньги
                if (money >= 100) canLevelUp = true;
                break;
            case 2: // → 3: чуть больше денег
                if (money >= 300) canLevelUp = true;
                break;
            case 3: // → 4: достаточно продали
                if (sold >= 30) canLevelUp = true;
                break;
            case 4: // → 5: ещё улучшения и деньги
                if (money >= 1000) canLevelUp = true;
                break;
            case 5: // → 6: много продаж
                if (sold >= 100) canLevelUp = true;
                break;
            case 6: // → 7: финальный капитал
                if (money >= 5000) canLevelUp = true;
                break;
        }

        if (!canLevelUp) return;

        state.season.currentLevel++;
        addLog(`Открыт новый уровень сезона: ${state.season.currentLevel}`);
        giveSeasonReward(state.season.currentLevel);
        applySeasonBackground();
        saveGame();
    }

    // === АВТОСОХРАНЕНИЕ ===
    function saveGame() {
        try {
            const data = {
                money: state.money,
                incomePerClick: state.incomePerClick,
                queueCurrent: state.queueCurrent,
                queueMax: state.queueMax,
                energy: state.energy,
                energyMax: state.energyMax,
                boostMultiplier: state.boostMultiplier,
                upgrades: {
                    clickIncome: state.upgrades.clickIncome.level,
                    autoCook: state.upgrades.autoCook.level,
                    energyMax: state.upgrades.energyMax.level,
                    queueSize: state.upgrades.queueSize.level
                },
                seasonLevel: state.season.currentLevel,
                stats: {
                    shawarmasSold: state.stats.shawarmasSold
                },
                eventSnowflakes: state.event.snowflakes
            };
            localStorage.setItem("shaurmaSave", JSON.stringify(data));
        } catch (e) {
            console.warn("Не удалось сохранить игру", e);
        }
    }

    function loadGame() {
        try {
            const raw = localStorage.getItem("shaurmaSave");
            if (!raw) return;
            const data = JSON.parse(raw);

            if (typeof data.money === "number") state.money = data.money;
            if (typeof data.incomePerClick === "number") state.incomePerClick = data.incomePerClick;
            if (typeof data.queueCurrent === "number") state.queueCurrent = data.queueCurrent;
            if (typeof data.queueMax === "number") state.queueMax = data.queueMax;
            if (typeof data.energy === "number") state.energy = data.energy;
            if (typeof data.energyMax === "number") state.energyMax = data.energyMax;
            if (typeof data.boostMultiplier === "number") state.boostMultiplier = data.boostMultiplier;

            if (data.upgrades) {
                state.upgrades.clickIncome.level = data.upgrades.clickIncome ?? state.upgrades.clickIncome.level;
                state.upgrades.autoCook.level    = data.upgrades.autoCook ?? state.upgrades.autoCook.level;
                state.upgrades.energyMax.level   = data.upgrades.energyMax ?? state.upgrades.energyMax.level;
                state.upgrades.queueSize.level   = data.upgrades.queueSize ?? state.upgrades.queueSize.level;
            }

            if (typeof data.seasonLevel === "number") {
                state.season.currentLevel = Math.min(
                    state.season.maxLevel,
                    Math.max(1, data.seasonLevel)
                );
            }

            if (data.stats && typeof data.stats.shawarmasSold === "number") {
                state.stats.shawarmasSold = data.stats.shawarmasSold;
            }

            if (typeof data.eventSnowflakes === "number") {
                state.event.snowflakes = data.eventSnowflakes;
            }

            addLog("Прогресс загружен");
        } catch (e) {
            console.warn("Не удалось загрузить сохранение", e);
        }
    }

    // === КНОПКА ГОТОВКИ ===
    cookButton.addEventListener("click", (event) => {
        animateButton(cookButton);

        if (state.energy <= 0) {
            addLog("Недостаточно энергии!");
            return;
        }

        const income = state.incomePerClick * state.boostMultiplier;

        spawnFloatingText(`+${income}$`, event.clientX, event.clientY - 20);
        tryDropSnowflakeReward(event.clientX, event.clientY - 40);

        state.money += income;
        state.energy = Math.max(0, state.energy - 1);

        state.queueCurrent++;
        if (state.queueCurrent > state.queueMax) state.queueCurrent = 1;

        state.stats.shawarmasSold++;

        updateMoneyView();
        updateEnergyView();
        updateQueueView();

        addLog(`+${income}$ — продана шаурма`);
        checkSeasonProgress("cook");
        saveGame();
    });

    // === ПРОЧИЕ КНОПКИ ===
    btnSuppliers.addEventListener("click", () => addLog("Поставщики"));
    btnQuests.addEventListener("click", () => addLog("Квесты"));
    btnOffer1.addEventListener("click", () => addLog("Оффер 1"));
    btnBoost.addEventListener("click", () => activateBoost(3, 15000));

    btnPiggy.addEventListener("click", () => {
        btnPiggy.classList.add("shake");
        setTimeout(() => btnPiggy.classList.remove("shake"), 400);
        state.money += 50;
        updateMoneyView();
        addLog("Копилка: +50$");
        checkSeasonProgress("piggy");
        saveGame();
    });

    btnMenu.addEventListener("click", () => addLog("Меню"));
    btnShopBottom.addEventListener("click", () => addLog("Магазин (нижнее меню)"));
    btnHearts.addEventListener("click", () => addLog("Жизни"));
    btnHome.addEventListener("click", () => addLog("Главная"));
    btnFriends.addEventListener("click", () => addLog("Друзья"));
    btnTrophy.addEventListener("click", () => addLog("Турнир"));

    // === ИНИЦИАЛИЗАЦИЯ ===
    loadGame();
    applySeasonBackground();

    updateMoneyView();
    updateEnergyView();
    updateQueueView();
    updateBoostView();

    addLog(`Сезон 1 • Уровень ${state.season.currentLevel}`);
    addLog("Игра загружена");

    // Автосохранение раз в 10 секунд
    setInterval(saveGame, 10000);
});