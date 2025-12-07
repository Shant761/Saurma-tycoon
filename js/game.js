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

        // статистика
        stats: {
            shawarmasSold: 0,     // продано шаурм
            totalEarned: 0        // всего заработано за всё время
        },

        // сезон 1
        season: {
            level: 1,
            maxLevel: 7
        },

        // какие предметы уже куплены (для целей уровней типа "item")
        unlockedItems: [],

        // текущий уровень (данные из Levels.get)
        currentLevelData: null,

        // флаг, чтобы не срабатывать завершение уровня много раз
        levelCompleted: false,

        // улучшения
        upgrades: {
            clickIncome: {
                level: 1,
                baseCost: 50,
                icon: "💰",
                name: "Доход за клик"
            },
            autoCook: {
                level: 0,
                baseCost: 120,
                icon: "🤖",
                name: "Авто-повар (позже)"
            },
            energyMax: {
                level: 0,
                baseCost: 90,
                icon: "⚡",
                name: "Макс. энергия"
            },
            queueSize: {
                level: 0,
                baseCost: 70,
                icon: "🚶",
                name: "Очередь клиентов"
            },

            // СПЕЦИАЛЬНЫЕ ПРЕДМЕТЫ ДЛЯ УРОВНЕЙ
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
    // DOM-ЭЛЕМЕНТЫ
    // =========================================================
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
    const gameScreenEl   = document.getElementById("gameScreen");

    // экраны сцен
    const startSeasonBtn = document.getElementById("startSeasonBtn");
    const startLevelBtn  = document.getElementById("startLevelBtn");


    // =========================================================
    // ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ UI
    // =========================================================
    function addLog(message) {
        if (!logList) return;
        const li = document.createElement("li");
        li.textContent = message;
        logList.prepend(li);
        if (logList.children.length > 5) {
            logList.lastChild.remove();
        }
    }

    function formatMoney(amount) {
        return amount.toLocaleString("ru-RU") + " ֏";
    }

    function updateMoneyView() {
        if (!moneyValueEl) return;
        moneyValueEl.textContent = formatMoney(state.money);
    }

    function updateEnergyView() {
        if (!energyValueEl || !energyTextEl || !energyFillEl) return;

        energyValueEl.textContent = `${state.energy}/${state.energyMax}`;
        energyTextEl.textContent  = `${state.energy}/${state.energyMax}`;
        const percent = (state.energy / state.energyMax) * 100;
        energyFillEl.style.width = `${Math.max(0, Math.min(100, percent))}%`;
    }

    function updateQueueView() {
        if (!queueFillEl || !queueValueEl) return;
        queueValueEl.textContent = `${state.queueCurrent} / ${state.queueMax}`;
        const percent = (state.queueCurrent / state.queueMax) * 100;
        queueFillEl.style.width = `${Math.max(0, Math.min(100, percent))}%`;
    }

    function updateBoostView() {
        if (!boostLabelEl) return;
        boostLabelEl.textContent = `x${state.boostMultiplier}`;
    }

    // применить фон уровня по данным Levels
    function applyLevelBackground(levelData) {
        if (!gameScreenEl || !levelData) return;
        if (levelData.background) {
            gameScreenEl.style.backgroundImage = `url("${levelData.background}")`;
            gameScreenEl.style.backgroundSize = "cover";
            gameScreenEl.style.backgroundPosition = "center";
            gameScreenEl.style.backgroundRepeat = "no-repeat";
        }
    }

    // =========================================================
    // АНИМАЦИИ (кнопки, всплывающий текст)
    // =========================================================
    function animateButton(btn) {
        if (!btn) return;
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

    // =========================================================
    // СНЕГ (фоновые снежинки, не метель)
    // =========================================================
    function spawnSnowflake() {
        if (!snowContainer) return;

        const flake = document.createElement("div");
        flake.className = "snowflake";
        flake.textContent = "❄️";
        flake.style.left = Math.random() * 100 + "vw";
        flake.style.fontSize = (10 + Math.random() * 14) + "px";
        flake.style.animationDuration = (3 + Math.random() * 4) + "s";

        snowContainer.appendChild(flake);
        setTimeout(() => flake.remove(), 8000);
    }

    setInterval(spawnSnowflake, 250);

    function tryDropSnowflakeReward(x, y) {
        if (Math.random() < 0.12) {
            spawnFloatingText("❄️", x, y - 20);
        }
    }

    // =========================================================
    // БУСТ
    // =========================================================
    function activateBoost(multiplier = 3, duration = 15000) {
        if (state.boostActive) return;

        state.boostActive = true;
        state.boostMultiplier = multiplier;
        updateBoostView();
        addLog(`Буст x${multiplier} активирован`);

        if (btnBoost) btnBoost.classList.add("btn-glow");
        if (boostIndicator) boostIndicator.classList.add("btn-glow");

        if (state.boostTimerId) clearTimeout(state.boostTimerId);

        state.boostTimerId = setTimeout(() => {
            state.boostActive = false;
            state.boostMultiplier = 1;
            updateBoostView();
            if (btnBoost) btnBoost.classList.remove("btn-glow");
            if (boostIndicator) boostIndicator.classList.remove("btn-glow");
            addLog("Буст закончился");
        }, duration);
    }

    // =========================================================
    // УЛУЧШЕНИЯ И МАГАЗИН
    // =========================================================
    function getUpgradeCost(up) {
        return Math.floor(up.baseCost * Math.pow(1.25, up.level));
    }

    function buyUpgrade(key) {
        const up = state.upgrades[key];
        if (!up) return;

        // одноразовые предметы
        if (up.isItem && up.level >= 1) {
            addLog("Этот предмет уже куплен");
            return;
        }

        const cost = getUpgradeCost(up);

        if (state.money < cost) {
            addLog("Недостаточно денег (драм)");
            return;
        }

        state.money -= cost;
        up.level++;

        // обычные улучшения
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

        // специальные предметы (для уровней)
        if (up.isItem && up.itemKey) {
            if (!state.unlockedItems.includes(up.itemKey)) {
                state.unlockedItems.push(up.itemKey);
                addLog(`Получен предмет: ${up.name}`);
            }
        }

        updateMoneyView();
        updateEnergyView();
        updateQueueView();
        renderUpgrades();

        addLog(`Улучшено: ${up.name}`);
        checkCurrentLevelGoal("upgrade");
    }

    function renderUpgrades() {
        if (!upgradeList) return;
        upgradeList.innerHTML = "";

        for (let key in state.upgrades) {
            const up = state.upgrades[key];
            const cost = getUpgradeCost(up);

            const card = document.createElement("div");
            card.className = "upgrade-item";
            card.dataset.key = key;

            const isItem = !!up.isItem;

            card.innerHTML = `
                <div class="upgrade-icon">${up.icon}</div>

                <div class="upgrade-body">
                    <div class="upgrade-name">${up.name}</div>
                    <div class="upgrade-level">Уровень: ${up.level}</div>

                    <div class="upgrade-progress">
                        <div class="upgrade-progress-fill" style="width:${(up.level % 10) * 10}%"></div>
                    </div>
                </div>

                <button class="upgrade-buy">
                    ${isItem && up.level > 0 ? "Куплено" : `Купить<br>${formatMoney(cost)}`}
                </button>
            `;

            const btn = card.querySelector(".upgrade-buy");
            btn.addEventListener("click", () => buyUpgrade(key));

            upgradeList.appendChild(card);
        }
    }

    // POPUP МАГАЗИНА
    if (btnShop && shopPopup) {
        btnShop.addEventListener("click", () => {
            animateButton(btnShop);
            shopPopup.classList.remove("hidden");
            renderUpgrades();
        });
    }

    if (closeShopBtn && shopPopup) {
        closeShopBtn.addEventListener("click", () => {
            shopPopup.classList.add("hidden");
        });
    }

    // =========================================================
    // СЕЗОН / УРОВНИ
    // =========================================================

    function setCurrentLevel(levelNumber) {
        const levelData = Levels.get(levelNumber);
        state.season.level = levelNumber;
        state.currentLevelData = levelData;
        state.levelCompleted = false;
        return levelData;
    }

    function showSeasonIntro() {
        Scenes.hideAll();
        Scenes.show("seasonIntro");
    }

    function showLevelIntro(levelNumber) {
        const levelData = setCurrentLevel(levelNumber);
        Scenes.hideAll();
        Scenes.playLevelIntro(levelData);
    }

    function startCurrentLevelGameplay() {
        const levelData = state.currentLevelData || Levels.get(state.season.level);
        if (!levelData) return;

        // если это финальный "season_complete", просто покажем экран конца
        if (levelData.type === "season_complete") {
            BlizzardTransition.play(
                () => {
                    Scenes.hideAll();
                    // можно потом сюда добавить отдельный текст финала
                    Scenes.show("seasonEnd");
                }
            );
            return;
        }

        BlizzardTransition.play(
            () => {
                // середина метели — подменяем сцену и фон
                Scenes.hideAll();
                applyLevelBackground(levelData);
                Scenes.show("game");
                addLog(`Уровень ${levelData.number} начат: ${levelData.description}`);
            }
        );
    }

    function handleLevelComplete() {
        if (state.levelCompleted) return;
        state.levelCompleted = true;

        const levelData = state.currentLevelData;
        if (!levelData) return;

        addLog(`Уровень ${levelData.number} выполнен! 🎉`);

        // награда за уровень
        if (levelData.reward && levelData.reward > 0) {
            state.money += levelData.reward;
            state.stats.totalEarned += levelData.reward;
            updateMoneyView();
            addLog(`Награда за уровень: +${formatMoney(levelData.reward)}`);
        }

        // если это был последний уровень (6-й с геймплеем → затем 7-й финальный)
        if (Levels.isLast(levelData.number)) {
            // теоретически сюда не попадем, сезон заканчиваем через level 7 type season_complete
            BlizzardTransition.play(
                () => {
                    Scenes.hideAll();
                    Scenes.show("seasonEnd");
                }
            );
            return;
        }

        const nextLevel = Levels.next(levelData.number);
        if (!nextLevel) return;

        state.season.level = nextLevel;
        state.currentLevelData = Levels.get(nextLevel);

        BlizzardTransition.play(
            () => {
                // прячем игру, показываем заставку следующего уровня
                Scenes.hideAll();
                Scenes.playLevelIntro(state.currentLevelData);
            }
        );
    }

    function checkCurrentLevelGoal(triggerSource) {
        const levelData = state.currentLevelData;
        if (!levelData || state.levelCompleted) return;

        const isDone = Levels.checkGoal(levelData, state);
        if (isDone) {
            addLog(`Цель уровня достигнута (${triggerSource})`);
            handleLevelComplete();
        }
    }

    // =========================================================
    // КНОПКА ГОТОВКИ (ГЛАВНЫЙ КЛИК)
    // =========================================================
    if (cookButton) {
        cookButton.addEventListener("click", (event) => {
            animateButton(cookButton);

            if (state.energy <= 0) {
                addLog("Недостаточно энергии!");
                return;
            }

            const income = state.incomePerClick * state.boostMultiplier;

            spawnFloatingText(`+${formatMoney(income)}`, event.clientX, event.clientY - 20);
            tryDropSnowflakeReward(event.clientX, event.clientY - 40);

            state.money += income;
            state.stats.totalEarned += income;
            state.energy = Math.max(0, state.energy - 1);

            state.queueCurrent++;
            if (state.queueCurrent > state.queueMax) {
                state.queueCurrent = 1;
            }

            state.stats.shawarmasSold++;

            updateMoneyView();
            updateEnergyView();
            updateQueueView();

            addLog(`Продана шаурма: ${formatMoney(income)}`);
            checkCurrentLevelGoal("cook");
        });
    }

    // =========================================================
    // ПРОЧИЕ КНОПКИ (пока простые логи)
    // =========================================================
    if (btnSuppliers) btnSuppliers.addEventListener("click", () => addLog("Поставщики (в разработке)"));
    if (btnQuests)    btnQuests.addEventListener("click",    () => addLog("Квесты (в разработке)"));
    if (btnOffer1)    btnOffer1.addEventListener("click",    () => addLog("Оффер 1"));

    if (btnOffer2) {
        btnOffer2.addEventListener("click", () => {
            addLog("Новогодний оффер: мягкий буст x2");
            activateBoost(2, 10000);
        });
    }

    if (btnBoost) btnBoost.addEventListener("click", () => activateBoost(3, 15000));

    if (btnPiggy) {
        btnPiggy.addEventListener("click", () => {
            animateButton(btnPiggy);
            btnPiggy.classList.add("shake");
            setTimeout(() => btnPiggy.classList.remove("shake"), 400);

            const bonus = 500;
            state.money += bonus;
            state.stats.totalEarned += bonus;

            updateMoneyView();
            addLog(`Копилка: +${formatMoney(bonus)}`);
            checkCurrentLevelGoal("piggy");
        });
    }

    if (btnMenu)       btnMenu.addEventListener("click",       () => addLog("Меню"));
    if (btnShopBottom) btnShopBottom.addEventListener("click", () => addLog("Магазин (нижнее меню)"));
    if (btnHearts)     btnHearts.addEventListener("click",     () => addLog("Жизни (декор)"));
    if (btnHome)       btnHome.addEventListener("click",       () => addLog("Главная"));
    if (btnFriends)    btnFriends.addEventListener("click",    () => addLog("Друзья (в будущем)"));
    if (btnTrophy)     btnTrophy.addEventListener("click",     () => addLog("Турнир (в будущем)"));

    // =========================================================
    // КНОПКИ СЦЕН (СТАРТ СЕЗОНА / СТАРТ УРОВНЯ)
    // =========================================================
    if (startSeasonBtn) {
        startSeasonBtn.addEventListener("click", () => {
            animateButton(startSeasonBtn);
            BlizzardTransition.play(
                () => {
                    showLevelIntro(1);
                }
            );
        });
    }

    if (startLevelBtn) {
        startLevelBtn.addEventListener("click", () => {
            animateButton(startLevelBtn);
            startCurrentLevelGameplay();
        });
    }

    // =========================================================
    // ИНИЦИАЛИЗАЦИЯ
    // =========================================================
    function init() {
        updateMoneyView();
        updateEnergyView();
        updateQueueView();
        updateBoostView();

        // Сначала показываем экран загрузки
        Scenes.hideAll();
        Scenes.show("loading");

        addLog("Игра загружена");

        // Небольшая "задержка" загрузки, затем вступление сезона
        setTimeout(() => {
            BlizzardTransition.play(
                () => {
                    showSeasonIntro();
                    addLog("Сезон 1: Голодный повар");
                }
            );
        }, 800);
    }

    init();
});