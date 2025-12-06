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
        if (!logList) return;
        const li = document.createElement("li");
        li.textContent = message;
        logList.prepend(li);

        // Ограничим количество записей в логе
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

    // === ЛОГИКА БУСТА ===
    function activateBoost(multiplier = 3, durationMs = 15000) {
        if (state.boostActive) {
            addLog("Буст уже активен");
            return;
        }

        state.boostActive = true;
        state.boostMultiplier = multiplier;
        updateBoostView();
        addLog(`Буст x${multiplier} активирован на ${durationMs / 1000} секунд`);

        // Визуально подсветим кнопку
        btnBoost.classList.add("boost-active");

        state.boostTimerId = setTimeout(() => {
            state.boostActive = false;
            state.boostMultiplier = 1;
            updateBoostView();
            btnBoost.classList.remove("boost-active");
            addLog("Буст закончился");
        }, durationMs);
    }

    // === НАЖАТИЕ НА ОСНОВНУЮ КНОПКУ ГОТОВКИ ===
    cookButton.addEventListener("click", () => {
        if (state.energy <= 0) {
            addLog("Недостаточно энергии!");
            return;
        }

        const income = state.incomePerClick * state.boostMultiplier;
        state.money += income;
        state.energy = Math.max(0, state.energy - 1);

        // Имитация движения очереди
        state.queueCurrent++;
        if (state.queueCurrent > state.queueMax) {
            state.queueCurrent = 1;
        }

        updateMoneyView();
        updateEnergyView();
        updateQueueView();

        addLog(`+${income}$ — продана шаурма`);
    });

    // === ЛОГИКА КНОПОК ИНТЕРФЕЙСА ===
    btnShop.addEventListener("click", () => {
        addLog("Открыт магазин улучшений (заглушка)");
        alert("Тут будет магазин улучшений");
    });

    btnSuppliers.addEventListener("click", () => {
        addLog("Открыто меню поставщиков (заглушка)");
        alert("Тут будет система поставщиков");
    });

    btnQuests.addEventListener("click", () => {
        addLog("Открыты квесты (заглушка)");
        alert("Тут будут квесты");
    });

    btnOffer1.addEventListener("click", () => {
        addLog("Выбран горячий оффер (-75%)");
    });

    btnOffer2.addEventListener("click", () => {
        addLog("Открыта 'Шаурма дня'");
    });

    btnBoost.addEventListener("click", () => {
        activateBoost(3, 15000);
    });

    btnPiggy.addEventListener("click", () => {
        const reward = 50;
        state.money += reward;
        updateMoneyView();
        addLog(`Копилка: +${reward}$`);
    });

    // Нижнее меню
    btnMenu.addEventListener("click", () => addLog("Открыто меню настроек (заглушка)"));
    btnShopBottom.addEventListener("click", () => addLog("Переход в магазин (заглушка)"));
    btnHearts.addEventListener("click", () => addLog("Открыто меню жизней/лайков (заглушка)"));
    btnHome.addEventListener("click", () => addLog("Ты уже на главном экране"));
    btnFriends.addEventListener("click", () => addLog("Открыто меню друзей (заглушка)"));
    btnTrophy.addEventListener("click", () => addLog("Открыт турнир/достижения (заглушка)"));

    // === ИНИЦИАЛИЗАЦИЯ ===
    updateMoneyView();
    updateEnergyView();
    updateQueueView();
    updateBoostView();
    addLog("Игра загружена");
});
// === АНИМАЦИИ ДЛЯ КНОПОК ===

function animateButton(btn) {
    if (!btn) return;
    btn.classList.add("button-press");
    setTimeout(() => {
        btn.classList.remove("button-press");
        btn.classList.add("button-release");
        setTimeout(() => btn.classList.remove("button-release"), 120);
    }, 80);
}

// === ВСПЛЫВАЮЩИЙ ТЕКСТ (+$) ===

function spawnFloatingText(text, x, y) {
    const el = document.createElement("div");
    el.className = "floating-text";
    el.style.left = x + "px";
    el.style.top = y + "px";
    el.textContent = text;

    document.body.appendChild(el);

    setTimeout(() => el.remove(), 900);
}