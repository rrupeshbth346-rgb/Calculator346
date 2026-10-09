const displayEl = document.getElementById('display');
  const historyEl = document.getElementById('history');
  const symbols = { '+': '+', '-': '−', '*': '×', '/': '÷' };

  let current = '0';     // number being typed
  let previous = null;   // stored first number
  let operator = null;   // pending operator
  let justEvaluated = false;

  function render() {
    displayEl.textContent = current;
    historyEl.textContent = previous !== null && operator
      ? previous + ' ' + symbols[operator] : '';
  }

  function inputNumber(n) {
    if (justEvaluated) { current = '0'; justEvaluated = false; }
    if (current === 'Error') current = '0';
    if (current.replace(/[-.]/g, '').length >= 12) return;
    current = current === '0' ? n : current + n;
    render();
  }

  function inputDot() {
    if (justEvaluated) { current = '0'; justEvaluated = false; }
    if (current === 'Error') current = '0';
    if (!current.includes('.')) current += '.';
    render();
  }

  function compute(a, b, op) {
    a = parseFloat(a); b = parseFloat(b);
    switch (op) {
      case '+': return a + b;
      case '-': return a - b;
      case '*': return a * b;
      case '/': return b === 0 ? null : a / b;
    }
  }

  function format(n) {
    if (n === null || !isFinite(n)) return 'Error';
    return String(parseFloat(n.toPrecision(12)));
  }

  function chooseOperator(op) {
    if (current === 'Error') return;
    if (operator && previous !== null && !justEvaluated) {
      current = format(compute(previous, current, operator));
      if (current === 'Error') { previous = null; operator = null; render(); return; }
    }
    previous = current;
    operator = op;
    justEvaluated = false;
    current = '0';
    render();
  }

  function equals() {
    if (operator === null || previous === null) return;
    const result = format(compute(previous, current, operator));
    historyEl.textContent = previous + ' ' + symbols[operator] + ' ' + current + ' =';
    current = result;
    displayEl.textContent = current;
    previous = null;
    operator = null;
    justEvaluated = true;
  }

  function clearAll() { current = '0'; previous = null; operator = null; justEvaluated = false; render(); }

  function del() {
    if (justEvaluated || current === 'Error') { clearAll(); return; }
    current = current.length > 1 ? current.slice(0, -1) : '0';
    render();
  }

  function percent() {
    if (current === 'Error') return;
    current = format(parseFloat(current) / 100);
    render();
  }

  document.getElementById('keys').addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    if (btn.dataset.num !== undefined) return inputNumber(btn.dataset.num);
    switch (btn.dataset.action) {
      case 'op': chooseOperator(btn.dataset.op); break;
      case 'equals': equals(); break;
      case 'clear': clearAll(); break;
      case 'delete': del(); break;
      case 'dot': inputDot(); break;
      case 'percent': percent(); break;
    }
  });

  // Keyboard support
  document.addEventListener('keydown', (e) => {
    if (e.key >= '0' && e.key <= '9') inputNumber(e.key);
    else if (e.key === '.') inputDot();
    else if ('+-*/'.includes(e.key)) chooseOperator(e.key);
    else if (e.key === 'Enter' || e.key === '=') { e.preventDefault(); equals(); }
    else if (e.key === 'Backspace') del();
    else if (e.key === 'Escape') clearAll();
    else if (e.key === '%') percent();
  });

  render();
