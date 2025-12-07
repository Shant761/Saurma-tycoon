// ui.js — все кнопки и интерфейс Shaurma Tycoon

document.addEventListener("DOMContentLoaded", () => {

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
    // UNIVERSAL BUTTON ANIMATION
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
        handleCook(e.clientX, e.clientY);
    };


    // =========================================================
    // КОПИЛКА
    // =========================================================
    btnPiggy.onclick = () => {
        tap(btnPiggy);
        addLog("Ты забрал деньги из копилки!");
        // TODO: Добавить механику копилки
    };


    // =========================================================
    // ЭКРАНЫ
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
