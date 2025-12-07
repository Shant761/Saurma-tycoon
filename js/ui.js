// ui.js — все кнопки и интерфейс Shaurma Tycoon

document.addEventListener("DOMContentLoaded", () => {

    // Ждём пока game.js создаст window.Game
    const Game = window.Game;
    if (!Game) {
        console.error("Ошибка: window.Game не найден. Проверь порядок подключения скриптов!");
        return;
    }

    // Достаём функции из Game
    const {
        renderUpgrades,
        renderQuests,
        activateBoost,
        handleCook,
        showLevelIntro,
        startCurrentLevelGameplay,
        addLog
    } = Game;


    // ================================
    // ПОЛУЧАЕМ ЭЛЕМЕНТЫ UI
    // ================================
    const btnShop = document.getElementById("btnShop");
    const btnShopBottom = document.getElementById("btnShopBottom");
    const closeShopBtn = document.getElementById("closeShop");
    const shopPopup = document.getElementById("shopPopup");

    const btnQuests = document.getElementById("btnQuests");
    const questsPopup = document.getElementById("questsPopup");
    const closeQuestsBtn = document.getElementById("closeQuests");

    const cookButton = document.getElementById("cookButton");

    const btnBoost = document.getElementById("btnBoost");

    const startSeasonBtn = document.getElementById("startSeasonBtn");
    const startLevelBtn = document.getElementById("startLevelBtn");

    const btnPiggy = document.getElementById("btnPiggy");


    // =========================================================
    // АНИМАЦИЯ НАЖАТИЯ
    // =========================================================
    function tap(btn) {
        if (!btn) return;
        btn.classList.add("button-press");
        setTimeout(() => btn.classList.remove("button-press"), 120);
    }


    // =========================================================
    // МАГАЗИН
    // =========================================================
    function openShop() {
        tap(btnShop);
        renderUpgrades();
        shopPopup.classList.remove("hidden");
    }

    function closeShop() {
        shopPopup.classList.add("hidden");
    }

    btnShop.onclick = openShop;
    btnShopBottom.onclick = openShop;
    closeShopBtn.onclick = closeShop;


    // =========================================================
    // КВЕСТЫ
    // =========================================================
    btnQuests.onclick = () => {
        tap(btnQuests);
        renderQuests();
        questsPopup.classList.remove("hidden");
    };

    closeQuestsBtn.onclick = () => {
        questsPopup.classList.add("hidden");
    };


    // =========================================================
    // БУСТ
    // =========================================================
    btnBoost.onclick = () => {
        tap(btnBoost);
        activateBoost(3, 15000);
    };


    // =========================================================
    // ГОТОВКА
    // =========================================================
    cookButton.onclick = (e) => {
        tap(cookButton);
        handleCook(e.clientX, e.clientY);
    };


    // =========================================================
    // КОПИЛКА
    // =========================================================
    btnPiggy.onclick = () => {
        tap(btnPiggy);
        addLog("Ты забрал деньги из копилки! (механика появится позже)");
    };


    // =========================================================
    // ПЕРЕКЛЮЧЕНИЕ ЭКРАНОВ
    // =========================================================
    startSeasonBtn.onclick = () => {
        tap(startSeasonBtn);
        showLevelIntro(1);
    };

    startLevelBtn.onclick = () => {
        tap(startLevelBtn);
        startCurrentLevelGameplay();
    };

});
