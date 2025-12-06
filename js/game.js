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
        boostTimerId: null
    };

    // === ПОЛУЧЕНИЕ ЭЛЕМЕНТОВ ===
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

    // Кнопки
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

    // === ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ===

    function addLog(message) {
        const li = document.createElement("li");
        li.textContent = message;
        logList.prepend(li);

        if (logList.children.length > 5) {
            logList.lastChild.remove();
        }
    }

    function updateMoneyView() {
        moneyValueEl.textContent = state.money.toLocaleString("ru-RU");
    }

    function updateEnergyView() {
        energyValueEl.textContent = `${state.energy}/${state.energyMax}`;
        energyTextEl.textContent  = `${state.energy}/${state.energyMax}`;
        const percent = (state.energy / state.energyMax) * 100;
        energyFillEl.style.width = `${percent}%`;
    }

    function updateQueueView() {
        queueValueEl.textContent = `${state.queueCurrent} / ${state.queueMax}`;
        const percent = (state.queueCurrent / state.queueMax) * 100;
        queueFillEl.style.width = `${percent}%`;
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
            setTimeout(() => btn.classList.remove("button-release"), 100);
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

    function applyClickAnimation(btn, callback = null) {
        btn.addEventListener("click", (event) => {
            animateButton(btn);
            if (callback) callback(event);
        });
    }

    // === ЛОГИКА БУСТА ===

    function activateBoost(multiplier = 3, duration = 15000) {
        if (state.boostActive) {
            addLog("Буст уже активен");
            return;
        }

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

    // === ПОДКЛЮЧАЕМ АНИМАЦИИ ДЛЯ ОСТАЛЬНЫХ КНОПОК ===

    applyClickAnimation(btnShop, () => addLog("Открыт магазин"));
    applyClickAnimation(btnSuppliers, () => addLog("Поставщики"));
    applyClickAnimation(btnQuests, () => addLog("Квесты"));
    applyClickAnimation(btnOffer1, () => addLog("Оффер 1"));
    applyClickAnimation(btnOffer2, () => addLog("Оффер 2"));

    applyClickAnimation(btnBoost, () => activateBoost(3, 15000));

    applyClickAnimation(btnPiggy, () => {
        btnPiggy.classList.add("shake");
        setTimeout(() => btnPiggy.classList.remove("shake"), 400);
        state.money += 50;
        updateMoneyView();
        addLog("Копилка: +50$");
    });

    applyClickAnimation(btnMenu, () => addLog("Меню"));
    applyClickAnimation(btnShopBottom, () => addLog("Магазин (нижнее меню)"));
    applyClickAnimation(btnHearts, () => addLog("Жизни"));
    applyClickAnimation(btnHome, () => addLog("Главная"));
    applyClickAnimation(btnFriends, () => addLog("Друзья"));
    applyClickAnimation(btnTrophy, () => addLog("Турнир"));

    // === ИНИЦИАЛИЗАЦИЯ ===
    updateMoneyView();
    updateEnergyView();
    updateQueueView();
    updateBoostView();
    addLog("Игра загружена");
});