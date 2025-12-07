// =============================================================
//  transition.js — ГОТОВАЯ ИСПРАВЛЕННАЯ ВЕРСИЯ С МЕТЕЛЬЮ
// =============================================================

const BlizzardTransition = (() => {

    const overlay = document.getElementById("blizzardOverlay");
    let isPlaying = false;

    function play(onMiddle = null, onEnd = null) {
        if (isPlaying) return;
        isPlaying = true;

        if (!overlay) {
            console.warn("blizzardOverlay не найден!");
            onMiddle?.();
            onEnd?.();
            isPlaying = false;
            return;
        }

        // Сбрасываем анимацию — без этого она НЕ перезапускается
        overlay.classList.remove("blizzard-active");
        void overlay.offsetWidth; // хак для перезапуска CSS-анимации

        // Запускаем метель
        overlay.classList.add("blizzard-active");

        const duration = 1300;      // соответствует CSS
        const middleTime = 650;     // 50% = закрытие экрана

        // === СЕРЕДИНА МЕТЕЛИ: экран полностью закрыт ===
        setTimeout(() => {
            if (typeof onMiddle === "function") onMiddle();
        }, middleTime);

        // === КОНЕЦ АНИМАЦИИ ===
        setTimeout(() => {
            overlay.classList.remove("blizzard-active");
            isPlaying = false;

            if (typeof onEnd === "function") onEnd();
        }, duration);
    }

    return { play };

})();