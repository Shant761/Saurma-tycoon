// ====================================================================
//  scenes.js — менеджер экранов Shaurma Tycoon
// ====================================================================

const Scenes = (() => {

    const screens = {
        loading: document.getElementById("loadingScreen"),
        seasonIntro: document.getElementById("seasonIntroScreen"),
        levelIntro: document.getElementById("levelIntroScreen"),
        game: document.getElementById("gameScreen"),
        seasonEnd: document.getElementById("seasonEndScreen")
    };

    function show(id) {
        const el = screens[id];
        if (!el) return;

        el.classList.remove("hidden");
        el.classList.remove("fade-out");
        el.classList.add("fade-in");
    }

    function instantShow(id) {
        const el = screens[id];
        if (!el) return;

        el.classList.remove("hidden");
        el.classList.remove("fade-in");
        el.classList.remove("fade-out");
    }

    function hide(id) {
        const el = screens[id];
        if (!el) return;

        el.classList.remove("fade-in");
        el.classList.add("fade-out");

        setTimeout(() => {
            el.classList.add("hidden");
        }, 350);
    }

    function forceHide(id) {
        const el = screens[id];
        if (!el) return;

        el.classList.add("hidden");
        el.classList.remove("fade-in");
        el.classList.remove("fade-out");
    }

    function switchTo(from, to) {
        hide(from);
        setTimeout(() => show(to), 120);
    }

    function playLevelIntro(levelData) {
        const titleEl = document.getElementById("levelIntroTitle");
        const goalEl = document.getElementById("levelIntroGoal");

        titleEl.textContent = `Уровень ${levelData.number}`;
        goalEl.textContent = levelData.description;

        show("levelIntro");
    }

    function hideAll() {
        Object.keys(screens).forEach(k => forceHide(k));
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