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

        // --- УЛУЧШЕНИЯ ---
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

    // Магазин
    const shopPopup      = document.getElementById("shopPopup");
    const upgradeList    = document.getElementById("upgradeList");
    const closeShopBtn   = document.getElementById("closeShop");

    // Кнопки интерфейса
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

        // применение эффектов:
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

        addLog(`Улучшено: ${up.name}`);
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

                <button class="upgrade-buy">Купить<br>${cost}$</button>
            `;

            card.querySelector(".upgrade-buy").addEventListener("click", () => buyUpgrade(key));

            upgradeList.appendChild(card);
        }
    }

    // === ОТКРЫТИЕ И ЗАКРЫТИЕ МАГАЗИНА ===
    btnShop.addEventListener("click", () => {
        animateButton(btnShop);
        shopPopup.classList.remove("hidden");
        renderUpgrades();
    });

    closeShopBtn.addEventListener("click", () => {
        shopPopup.classList.add("hidden");
    });

    // === КНОПКА ГОТОВКИ ===
    cookButton.addEventListener("click", (event) => {
        animateButton(cookButton);

        spawnFloatingText(
            `+${state.incomePerClick * state.boostMultiplier}$`,
            event.clientX,
            event.clientY - 20
        );

        if (state.energy <= 0) {
            addLog("Недостаточно энергии!");
            return;
        }

        const income = state.incomePerClick * state.boostMultiplier;
        state.money += income;
        state.energy = Math.max(0, state.energy - 1);

        state.queueCurrent++;
        if (state.queueCurrent > state.queueMax) state.queueCurrent = 1;

        updateMoneyView();
        updateEnergyView();
        updateQueueView();

        addLog(`+${income}$ — продана шаурма`);
    });

    // === КНОПКИ МЕНЮ (ЛОГИ) ===
    btnSuppliers.addEventListener("click", () => addLog("Поставщики"));
    btnQuests.addEventListener("click", () => addLog("Квесты"));
    btnOffer1.addEventListener("click", () => addLog("Оффер 1"));
    btnOffer2.addEventListener("click", () => addLog("Оффер 2"));
    btnBoost.addEventListener("click", () => activateBoost(3, 15000));
    btnPiggy.addEventListener("click", () => {
        btnPiggy.classList.add("shake");
        setTimeout(() => btnPiggy.classList.remove("shake"), 400);
        state.money += 50;
        updateMoneyView();
        addLog("Копилка: +50$");
    });

    btnMenu.addEventListener("click", () => addLog("Меню"));
    btnShopBottom.addEventListener("click", () => addLog("Магазин (нижнее меню)"));
    btnHearts.addEventListener("click", () => addLog("Жизни"));
    btnHome.addEventListener("click", () => addLog("Главная"));
    btnFriends.addEventListener("click", () => addLog("Друзья"));
    btnTrophy.addEventListener("click", () => addLog("Турнир"));

    // === ИНИЦИАЛИЗАЦИЯ ===
    updateMoneyView();
    updateEnergyView();
    updateQueueView();
    updateBoostView();
    addLog("Игра загружена");
});