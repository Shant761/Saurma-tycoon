// ====================================================================
//  scenes.js — менеджер экранов Shaurma Tycoon
// ====================================================================

const Scenes = (() => {

    // =========================================================
    // КЭШ ЭКРАНОВ
    // =========================================================
    const screens = {
        loading:     document.getElementById("loadingScreen"),
        seasonIntro: document.getElementById("seasonIntroScreen"),
        levelIntro:  document.getElementById("levelIntroScreen"),
        game:        document.getElementById("gameScreen"),
        seasonEnd:   document.getElementById("seasonEndScreen")
    };

    // Проверка существования элемента
    function get(id) {
        const el = screens[id];
        if (!el) {
            console.warn(`Scenes: экран "${id}" не найден!`);
        }
        return el;
    }

    // =========================================================
    // ПОКАЗАТЬ ЭКРАН (с анимацией fade-in)
    // =========================================================
    function show(id) {
        const el = get(id);
        if (!el) return;

        el.classList.remove("hidden", "fade-out");
        el.classList.add("fade-in");
    }

    // =========================================================
    // ПОКАЗАТЬ МГНОВЕННО (без анимации)
    // =========================================================
    function instantShow(id) {
        const el = get(id);
        if (!el) return;

        el.classList.remove("hidden", "fade-in", "fade-out");
    }

    // =========================================================
    // СКРЫТЬ ЭКРАН (с fade-out)
    // =========================================================
    function hide(id) {
        const el = get(id);
        if (!el) return;

        el.classList.remove("fade-in");
        el.classList.add("fade-out");

        setTimeout(() => {
            el.classList.add("hidden");
        }, 350);
    }

    // =========================================================
    // ПРИНУДИТЕЛЬНО СКРЫТЬ
    // =========================================================
    function forceHide(id) {
        const el = get(id);
        if (!el) return;

        el.classList.add("hidden");
        el.classList.remove("fade-in", "fade-out");
    }

    // =========================================================
    // СМЕНА ЭКРАНА
    // =========================================================
    function switchTo(from, to) {
        hide(from);
        setTimeout(() => show(to), 150);
    }

    // =========================================================
    // ИНТРО УРОВНЯ
    // =========================================================
    function playLevelIntro(levelData) {
        const titleEl = document.getElementById("levelIntroTitle");
        const goalEl  = document.getElementById("levelIntroGoal");

        if (titleEl) titleEl.textContent = `Уровень ${levelData.number}`;
        if (goalEl)  goalEl.textContent = levelData.description;

        show("levelIntro");
    }

    // =========================================================
    // СКРЫТЬ ВСЁ
    // =========================================================
    function hideAll() {
        Object.keys(screens).forEach(id => {
            forceHide(id);
        });
    }

    return {
        show,
        hide,
        forceHide,
        switch: switchTo,
        playLevelIntro,
        hideAll,
        instantShow
    };

})();
