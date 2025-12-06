let state = {
    money: 0,
    perClick: 1,
    perSecond: 0,
    clickPrice: 50,
    autoPrice: 120
};

function saveGame() {
    localStorage.setItem("shaurmaGame", JSON.stringify(state));
}

function loadGame() {
    const data = localStorage.getItem("shaurmaGame");
    if (data) state = JSON.parse(data);
}

loadGame();
updateUI();

function updateUI() {
    document.getElementById("money").textContent = state.money + " ₽";
    document.getElementById("perClick").textContent = "+" + state.perClick + " ₽";
    document.getElementById("perSecond").textContent = state.perSecond + " ₽";
    document.getElementById("clickPrice").textContent = state.clickPrice;
    document.getElementById("autoPrice").textContent = state.autoPrice;
}

function log(text) {
    const el = document.getElementById("log");
    el.innerHTML = `<div>• ${text}</div>` + el.innerHTML;
}

document.getElementById("shawarma").onclick = () => {
    state.money += state.perClick;
    log("Продано шаурмы + " + state.perClick + " ₽");
    updateUI();
    saveGame();
};

document.getElementById("buyClick").onclick = () => {
    if (state.money < state.clickPrice) return;
    state.money -= state.clickPrice;
    state.perClick += 1;
    state.clickPrice = Math.floor(state.clickPrice * 1.7);
    log("Доход за клик увеличен!");
    updateUI();
    saveGame();
};

document.getElementById("buyAuto").onclick = () => {
    if (state.money < state.autoPrice) return;
    state.money -= state.autoPrice;
    state.perSecond += 1;
    state.autoPrice = Math.floor(state.autoPrice * 1.8);
    log("Ночной повар нанят!");
    updateUI();
    saveGame();
};

setInterval(() => {
    state.money += state.perSecond;
    updateUI();
    saveGame();
}, 1000);

document.getElementById("resetGame").onclick = () => {
    localStorage.removeItem("shaurmaGame");
    location.reload();
};