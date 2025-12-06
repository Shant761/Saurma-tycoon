document.addEventListener('DOMContentLoaded', () => {
  const cookButton = document.getElementById('cookButton');
  const moneyValue = document.getElementById('moneyValue');
  const logList = document.getElementById('logList');

  let money = 0;
  let incomePerClick = 5;

  function updateMoneyView() {
    moneyValue.textContent = money.toLocaleString('ru-RU');
  }

  function addLog(message) {
    const li = document.createElement('li');
    li.textContent = message;
    logList.prepend(li);

    // ограничиваем количество строк
    if (logList.children.length > 5) {
      logList.lastChild.remove();
    }
  }

  cookButton.addEventListener('click', () => {
    money += incomePerClick;
    updateMoneyView();
    addLog(`+${incomePerClick}$ Продана шаурма`);
  });

  updateMoneyView();
});