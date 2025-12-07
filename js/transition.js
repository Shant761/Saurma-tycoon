// =============================================================
//  transition.js — система переходов через метель
// =============================================================

const BlizzardTransition = (() => {

    const overlay = document.getElementById("blizzardOverlay");
    let isPlaying = false;

    /**
     * Запускает метель-переход.
     * 
     * @param {function} onMiddle  — вызывается, когда экран закрыт метелью
     * @param {function} onEnd     — вызывается после завершения всей анимации
     */
    function play(onMiddle = null, onEnd = null) {
        if (isPlaying) return;
        isPlaying = true;

        // Добавляем класс анимации
        overlay.classList.add("blizzard-active");

        // Длина анимации должна повторять CSS (1.3s)
        const duration = 1300;

        // Точка середины (примерно 50%)
        const middleTime = duration * 0.50;

        // === ШАГ 1: когда метель полностью закрывает экран ===
        setTimeout(() => {
            if (typeof onMiddle === "function") {
                onMiddle();
            }
        }, middleTime);

        // === ШАГ 2: когда метель ушла вправо, освобождаем переход ===
        setTimeout(() => {
            overlay.classList.remove("blizzard-active");
            isPlaying = false;

            if (typeof onEnd === "function") {
                onEnd();
            }
        }, duration);
    }

    return {
        play
    };

})();