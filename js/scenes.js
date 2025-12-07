// ====================================================================
//  scenes.js — менеджер экранов Shaurma Tycoon
// ====================================================================

const Scenes = (() => {

    // Список доступных экранов
    const screens = {
        loading: document.getElementById("loadingScreen"),
        seasonIntro: document.getElementById("seasonIntroScreen"),
        levelIntro: document.getElementById("levelIntroScreen"),
        game: document.getElementById("gameScreen"),
        seasonEnd: document.getElementById("seasonEndScreen")
    };

    /**
     * Вспомогательная функция плавного показа экрана
     */
    function show(id) {
        const el = screens[id];
        if (!el) return;

        el.classList.remove("hidden");
        el.classList.remove("fade-out");
        el.classList.add("fade-in");
    }

    /**
     * Вспомогательная функция скрытия экрана
     */
    function hide(id) {
        const el = screens[id];
        if (!el) return;

        el.classList.remove("fade-in");
        el.classList.add("fade-out");

        // после анимации скрываем насовсем
        setTimeout(() => {
            el.classList.add("hidden");
        }, 350);
    }

    /**
     * Мгновенно скрывает экран (без анимации)
     */
    function forceHide(id) {
        const el = screens[id];
        if (!el) return;
        el.classList.add("hidden");
    }

    /**
     * Переключение экрана A → B
     */
    function switchTo(from, to) {
        hide(from);
        setTimeout(() => show(to), 120);
    }

    /**
     * Показывает заставку уровня с подстановкой данных
     */
    function playLevelIntro(levelData) {
        const titleEl = document.getElementById("levelIntroTitle");
        const goalEl = document.getElementById("levelIntroGoal");

        titleEl.textContent = `Уровень ${levelData.number}`;
        goalEl.textContent = levelData.description;

        show("levelIntro");
    }

    /**
     * Прячем ВСЕ экраны (например, перед стартом сезона)
     */
    function hideAll() {
        Object.keys(screens).forEach(k => forceHide(k));
    }

    return {
        show,
        hide,
        switch: switchTo,
        playLevelIntro,
        hideAll
    };

})();