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

        // статистика
        stats: {
            shawarmasSold: 0,   // сколько шаурм продано
            totalEarned: 0      // всего заработано за всё время (для уровней)
        },

        // сезон 1: "Голодный повар"
        season: {
            level: 1,   // 1..7
            maxLevel: 7
        },

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
                name: "Авто-повар"
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
            }
        }
    };

    // === ФОНЫ ДЛЯ УРОВНЕЙ СЕЗОНА 1 ===
    // добавь файлы в img/: season1_level1.png ... season1_level7.png
    const seasonBackgrounds = {
        1: "img/season1_level1.png",
        2: "img/season1_level2.png",
        3: "img/season1_level3.png",
        4: "img/season1_level4.png",
        5: "img/season1_level5.png",
        6: "img/season1_level6.png",
        7: "img/season1_level7.png"
    };

    // === УСЛОВИЯ ПЕРЕХОДА МЕЖДУ УРОВНЯМИ СЕЗОНА 1 ===
    // основаны на твоём лоре, цифры можно потом подправить
    const seasonLevelConditions = {
        // 1 уровень: "собрать 5000 ֏, чтобы не умереть"
        1: {
            minTotalEarned: 5000,
            description: "Ты выжил, собрав 5 000 ֏ и не умер от голода"
        },
        // 2 уровень: "отдать долги 10 000 ֏"
        2: {
            minTotalEarned: 15000, // 5k + 10k
            description: "Отдал долги на 10 000 ֏ и стал свободнее"
        },
        // 3 уровень: "собрать мангал"
        3: {
            minTotalEarned: 30000,
            description: "Собрал свой первый мангал"
        },
        // 4 уровень: "первый клиент 15 000 ֏"
        4: {
            minTotalEarned: 45000,
            description: "Поймал первого богатого клиента на 15 000 ֏"
        },
        // 5 уровень: "купить отопление"
        5: {
            minTotalEarned: 65000,
            description: "Смог позволить себе отопление в доме"
        },
        // 6 уровень: "купить генератор"
        6: {
            minTotalEarned: 90000,
            description: "Купил генератор — да здравствует свет!"
        }
        // 7 — финальный, дальше нет условий
    };

    // === ЭЛЕМЕНТЫ DOM ===
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
    const gameScreenEl   = document.querySelector(".game-screen");

    // === ВСПОМОГАТЕЛЬНЫЕ ===
    function addLog(message) {
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
        moneyValueEl.textContent = formatMoney(state.money);
    }

    function updateEnergyView() {
        energyValueEl.textContent = `${state.energy}/${state.energyMax}`;
        energyTextEl.textContent  = `${state.energy}/${state.energyMax}`;
        const percent = (state.energy / state.energyMax) * 100;
        energyFillEl.style.width = `${Math.max(0, Math.min(100, percent))}%`;
    }

    function updateQueueView() {
        queueValueEl.textContent = `${state.queueCurrent} / ${state.queueMax}`;
        const percent = (state.queueCurrent / state.queueMax) * 100;
        queueFillEl.style.width = `${Math.max(0, Math.min(100, percent))}%`;
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

    // лёгкий снег постоянно
    setInterval(spawnSnowflake, 250);

    // === БУСТ ===
    function activateBoost(multiplier = 3, duration = 15000) {
        if (state.boostActive) return;

        state.boostActive = true;
        state.boostMultiplier = multiplier;
        updateBoostView();
        addLog(`Буст x${multiplier} активирован`);

        btnBoost.classList.add("btn-glow");
        boostIndicator.classList.add("btn-glow");

        if (state.boostTimerId) clearTimeout(state.boostTimerId);

        state.boostTimerId = setTimeout(() => {
            state.boostActive = false;
            state.boostMultiplier = 1;
            updateBoostView();
            btnBoost.classList.remove("btn-glow");
            boostIndicator.classList.remove("btn-glow");
            addLog("Буст закончился");
        }, duration);
    }

    // === СНЕЖИНКИ-БОНУСЫ (опционально, пока только визуал) ===
    function tryDropSnowflakeReward(x, y) {
        if (Math.random() < 0.12) {
            spawnFloatingText("❄️", x, y - 20);
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
            addLog("Недостаточно денег (драм)");
            return;
        }

        state.money -= cost;
        up.level++;

        // эффекты улучшений
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

        updateMoneyView();
        updateEnergyView();
        updateQueueView();
        renderUpgrades();

        addLog(`Улучшено: ${up.name}`);
        checkSeasonProgress("upgrade");
    }

    // === ОТРИСОВКА МАГАЗИНА ===
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

                <button class="upgrade-buy">Купить<br>${formatMoney(cost)}</button>
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

    // === СЕЗОН 1: ФОН И ПРОГРЕСС ===

    function applySeasonBackground() {
        if (!gameScreenEl) return;

        const lvl = state.season.level;
        const url = seasonBackgrounds[lvl];

        if (url) {
            gameScreenEl.style.backgroundImage = `url("${url}")`;
            gameScreenEl.style.backgroundSize = "cover";
            gameScreenEl.style.backgroundPosition = "center";
            gameScreenEl.style.backgroundRepeat = "no-repeat";
        }
    }

    function levelUpSeason(newLevel, description) {
        state.season.level = newLevel;
        applySeasonBackground();
        addLog(`Новый уровень сезона: ${newLevel} — ${description}`);

        // мелкая награда за каждый уровень (можно менять)
        state.money += 1000 * newLevel;
        updateMoneyView();
    }

    function checkSeasonProgress(triggerSource) {
        const lvl = state.season.level;
        if (lvl >= state.season.maxLevel) return;

        const cond = seasonLevelConditions[lvl];
        if (!cond) return;

        const earned = state.stats.totalEarned;

        if (earned >= cond.minTotalEarned) {
            const nextLevel = lvl + 1;
            levelUpSeason(nextLevel, cond.description);
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
        checkSeasonProgress("cook");
    });

    // === ПРОЧИЕ КНОПКИ ===
    btnSuppliers.addEventListener("click", () => addLog("Поставщики (в разработке)"));
    btnQuests.addEventListener("click", () => addLog("Квесты (в разработке)"));
    btnOffer1.addEventListener("click", () => addLog("Оффер 1"));
    btnOffer2.addEventListener("click", () => {
        addLog("Новогодний оффер: мягкий буст x2");
        activateBoost(2, 10000);
    });
    btnBoost.addEventListener("click", () => activateBoost(3, 15000));

    btnPiggy.addEventListener("click", () => {
        animateButton(btnPiggy);
        btnPiggy.classList.add("shake");
        setTimeout(() => btnPiggy.classList.remove("shake"), 400);

        const bonus = 500;
        state.money += bonus;
        state.stats.totalEarned += bonus;
        updateMoneyView();
        addLog(`Копилка: +${formatMoney(bonus)}`);
        checkSeasonProgress("piggy");
    });

    btnMenu.addEventListener("click", () => addLog("Меню"));
    btnShopBottom.addEventListener("click", () => addLog("Магазин (нижнее меню)"));
    btnHearts.addEventListener("click", () => addLog("Жизни (декор)"));
    btnHome.addEventListener("click", () => addLog("Главная"));
    btnFriends.addEventListener("click", () => addLog("Друзья (в будущем)"));
    btnTrophy.addEventListener("click", () => addLog("Турнир (в будущем)"));

    // === ИНИЦИАЛИЗАЦИЯ ===
    applySeasonBackground();
    updateMoneyView();
    updateEnergyView();
    updateQueueView();
    updateBoostView();

    addLog("Игра загружена");
    addLog(`Сезон 1: уровень ${state.season.level}`);
});