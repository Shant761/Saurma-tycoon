// ====================================================================
//  transition.js — МЕТЕЛЬ ДЛЯ ПЕРЕХОДОВ (BlizzardTransition)
// ====================================================================

const BlizzardTransition = (() => {

    const overlay = document.getElementById("blizzardOverlay");
    let isPlaying = false;

    function play(onMiddle = null, onEnd = null) {
        if (isPlaying) return; // блокируем двойные вызовы
        isPlaying = true;

        if (!overlay) {
            console.warn("⚠ blizzardOverlay не найден!");
            onMiddle?.();
            onEnd?.();
            isPlaying = false;
            return;
        }

        // Полный сброс предыдущей анимации
        overlay.classList.remove("blizzard-active");
        overlay.style.animation = "none";
        void overlay.offsetHeight; // перезапуск CSS-анимации
        overlay.style.animation = "";

        // Запускаем метель
        overlay.classList.add("blizzard-active");

        const duration = 1300;  // как в CSS
        const middle = 650;      // точное время закрытия экрана

        // === СЕРЕДИНА АНИМАЦИИ ===
        const midTimer = setTimeout(() => {
            if (typeof onMiddle === "function") {
                try { onMiddle(); }
                catch (err) { console.error("Ошибка onMiddle:", err); }
            }
        }, middle);

        // === КОНЕЦ АНИМАЦИИ ===
        const endTimer = setTimeout(() => {
            overlay.classList.remove("blizzard-active");
            isPlaying = false;

            if (typeof onEnd === "function") {
                try { onEnd(); }
                catch (err) { console.error("Ошибка onEnd:", err); }
            }
        }, duration);

        // Чтобы GC не держал ссылки
        return { midTimer, endTimer };
    }

    return { play };

})();
