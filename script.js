
const display = document.getElementById("display");
const history = document.getElementById("history");
const keys = document.getElementById("keys");
const themeBtn = document.getElementById("themeBtn");

let current = "0";
let previous = null;
let operator = null;
let resetOnNextInput = false;
let justCalculated = false;

const symbols = {
    "+": "+",
    "-": "−",
    "*": "×",
    "/": "÷"
};

function render() {
    display.value = current;

    if (previous !== null && operator) {
        history.textContent =
            `${previous} ${symbols[operator]}`;
    } else {
        history.textContent = "";
    }
}

function inputNumber(number) {
    if (current === "Error") clearAll();

    if (resetOnNextInput || justCalculated) {
        current = number;
        resetOnNextInput = false;
        justCalculated = false;
    } else if (current === "0") {
        current = number;
    } else if (current.replace(/[-.]/g, "").length < 14) {
        current += number;
    }

    render();
}

function inputDot() {
    if (current === "Error") clearAll();

    if (resetOnNextInput || justCalculated) {
        current = "0";
        resetOnNextInput = false;
        justCalculated = false;
    }

    if (!current.includes(".")) {
        current += ".";
    }

    render();
}

function formatNumber(number) {
    if (!Number.isFinite(number)) return "Error";

    return String(
        Number.parseFloat(number.toPrecision(12))
    );
}

function compute(a, b, op) {
    switch (op) {
        case "+":
            return a + b;
        case "-":
            return a - b;
        case "*":
            return a * b;
        case "/":
            return b === 0 ? NaN : a / b;
        default:
            return b;
    }
}

function chooseOperator(op) {
    if (current === "Error") return;

    const value = Number(current);

    if (operator && previous !== null && !resetOnNextInput) {
        const result = compute(previous, value, operator);
        current = formatNumber(result);

        if (current === "Error") {
            previous = null;
            operator = null;
            resetOnNextInput = true;
            render();
            return;
        }
    } else if (!resetOnNextInput || previous === null) {
        previous = value;
    }

    operator = op;
    current = "0";
    resetOnNextInput = false;
    justCalculated = false;
    render();
}

function equals() {
    if (operator === null || previous === null ||
        current === "Error") return;

    const first = previous;
    const second = Number(current);
    const op = operator;
    const result = formatNumber(compute(first, second, op));

    history.textContent =
        `${first} ${symbols[op]} ${second} =`;

    current = result;
    previous = null;
    operator = null;
    resetOnNextInput = false;
    justCalculated = true;
    render();
}

function clearAll() {
    current = "0";
    previous = null;
    operator = null;
    resetOnNextInput = false;
    justCalculated = false;
    render();
}

function deleteLast() {
    if (current === "Error" || justCalculated) {
        clearAll();
        return;
    }

    if (resetOnNextInput) {
        current = "0";
        resetOnNextInput = false;
    } else {
        current = current.length > 1
            ? current.slice(0, -1)
            : "0";

        if (current === "-") current = "0";
    }

    render();
}

function percent() {
    if (current === "Error") return;

    current = formatNumber(Number(current) / 100);
    resetOnNextInput = false;
    justCalculated = false;
    render();
}

function toggleSign() {
    if (current === "Error" || current === "0") return;

    current = current.startsWith("-")
        ? current.slice(1)
        : "-" + current;

    justCalculated = false;
    render();
}

keys.addEventListener("click", (event) => {
    const button = event.target.closest("button");
    if (!button) return;

    if (button.dataset.num !== undefined) {
        inputNumber(button.dataset.num);
        return;
    }

    if (button.dataset.op) {
        chooseOperator(button.dataset.op);
        return;
    }

    switch (button.dataset.action) {
        case "clear":
            clearAll();
            break;
        case "delete":
            deleteLast();
            break;
        case "dot":
            inputDot();
            break;
        case "percent":
            percent();
            break;
        case "sign":
            toggleSign();
            break;
        case "equals":
            equals();
            break;
    }
});

document.addEventListener("keydown", (event) => {
    if (/^[0-9]$/.test(event.key)) {
        inputNumber(event.key);
    } else if (event.key === ".") {
        inputDot();
    } else if (["+", "-", "*", "/"].includes(event.key)) {
        chooseOperator(event.key);
    } else if (event.key === "Enter" || event.key === "=") {
        event.preventDefault();
        equals();
    } else if (event.key === "Backspace") {
        deleteLast();
    } else if (event.key === "Escape") {
        clearAll();
    } else if (event.key === "%") {
        percent();
    }
});

themeBtn.addEventListener("click", () => {
    document.body.classList.toggle("light");
    themeBtn.textContent =
        document.body.classList.contains("light") ? "☾" : "☀";
});

render();
