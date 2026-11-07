let display = document.getElementById("display");
let exprEl = document.getElementById("expr");
let history = [];
let historyVisible = false;

const historyPanel = document.getElementById("history");
const historyList = document.getElementById("historyList");
const historyEmpty = document.getElementById("historyEmpty");

/* ---------- Safe expression engine (no eval) ---------- */
function factorial(n) {
    if (!Number.isFinite(n) || n < 0 || n !== Math.floor(n)) throw new Error("Bad factorial");
    if (n > 170) throw new Error("Too large");
    let r = 1;
    for (let i = 2; i <= n; i++) r *= i;
    return r;
}

function tokenize(str) {
    const s = str.replace(/\s+/g, "");
    const tokens = [];
    let i = 0;
    while (i < s.length) {
        const c = s[i];
        if (/[0-9.]/.test(c)) {
            let num = "";
            while (i < s.length && /[0-9.]/.test(s[i])) num += s[i++];
            if ((num.match(/\./g) || []).length > 1) throw new Error("Bad number");
            tokens.push({ type: "num", value: parseFloat(num) });
        } else if (/[a-zA-Zπ]/.test(c)) {
            let id = "";
            while (i < s.length && /[a-zA-Z0-9π]/.test(s[i])) id += s[i++];
            tokens.push({ type: "id", value: id.toLowerCase() });
        } else if (c === "*" && s[i + 1] === "*") {
            tokens.push({ type: "op", value: "**" });
            i += 2;
        } else if (c === "^") {
            tokens.push({ type: "op", value: "**" });
            i++;
        } else if ("+-*/%()!".includes(c)) {
            tokens.push({ type: (c === "(" || c === ")") ? "paren" : "op", value: c });
            i++;
        } else {
            throw new Error("Unknown char: " + c);
        }
    }
    return tokens;
}

class Parser {
    constructor(tokens) { this.t = tokens; this.pos = 0; }
    parse() {
        const v = this.expr();
        if (this.pos !== this.t.length) throw new Error("Unexpected token");
        return v;
    }
    peek() { return this.t[this.pos]; }
    next() { return this.t[this.pos++]; }
    expr() {
        let v = this.term();
        while (this.peek() && this.peek().type === "op" && (this.peek().value === "+" || this.peek().value === "-")) {
            const op = this.next().value;
            const r = this.term();
            v = op === "+" ? v + r : v - r;
        }
        return v;
    }
    term() {
        let v = this.power();
        while (this.peek() && this.peek().type === "op" && (this.peek().value === "*" || this.peek().value === "/" || this.peek().value === "%")) {
            const op = this.next().value;
            const r = this.power();
            if (op === "*") v *= r;
            else if (op === "/") v /= r;
            else v %= r;
        }
        return v;
    }
    power() {
        const base = this.unary();
        if (this.peek() && this.peek().type === "op" && this.peek().value === "**") {
            this.next();
            const exp = this.power();
            return Math.pow(base, exp);
        }
        return base;
    }
    unary() {
        if (this.peek() && this.peek().type === "op" && (this.peek().value === "+" || this.peek().value === "-")) {
            const op = this.next().value;
            const v = this.unary();
            return op === "-" ? -v : v;
        }
        return this.primary();
    }
    applyFactorial(v) {
        while (this.peek() && this.peek().type === "op" && this.peek().value === "!") {
            this.next();
            v = factorial(v);
        }
        return v;
    }
    primary() {
        const tok = this.peek();
        if (!tok) throw new Error("Unexpected end");
        if (tok.type === "num") {
            this.next();
            return this.applyFactorial(tok.value);
        }
        if (tok.type === "paren" && tok.value === "(") {
            this.next();
            const v = this.expr();
            if (!this.peek() || this.peek().value !== ")") throw new Error("Missing )");
            this.next();
            return this.applyFactorial(v);
        }
        if (tok.type === "id") {
            this.next();
            const name = tok.value;
            if (name === "pi" || name === "π") return this.applyFactorial(Math.PI);
            if (name === "e") return this.applyFactorial(Math.E);
            if (this.peek() && this.peek().type === "paren" && this.peek().value === "(") {
                this.next();
                const arg = this.expr();
                if (!this.peek() || this.peek().value !== ")") throw new Error("Missing )");
                this.next();
                let v;
                switch (name) {
                    case "sin": v = Math.sin(arg * Math.PI / 180); break;
                    case "cos": v = Math.cos(arg * Math.PI / 180); break;
                    case "tan": v = Math.tan(arg * Math.PI / 180); break;
                    case "sqrt": v = Math.sqrt(arg); break;
                    case "log": case "ln": v = Math.log(arg); break;
                    case "log10": v = Math.log10(arg); break;
                    default: throw new Error("Unknown function " + name);
                }
                return this.applyFactorial(v);
            }
            throw new Error("Unknown identifier " + name);
        }
        throw new Error("Unexpected token");
    }
}

function safeEval(expr) {
    const tokens = tokenize(expr);
    if (tokens.length === 0) return 0;
    const p = new Parser(tokens);
    const v = p.parse();
    if (!Number.isFinite(v)) throw new Error("Invalid result");
    return v;
}

function formatNumber(n) {
    if (Number.isInteger(n)) return String(n);
    const s = parseFloat(n.toFixed(10));
    return String(s);
}

/* ---------- UI ---------- */
function appendValue(value) {
    if (display.value === "Error") display.value = "0";
    if (display.value === "0" && /^[0-9.]$/.test(value)) {
        display.value = value;
    } else {
        display.value += value;
    }
}

function appendFunction(func) {
    if (display.value === "Error" || display.value === "0") display.value = "";
    display.value += func + "(";
}

function clearDisplay() {
    display.value = "0";
    exprEl.textContent = "";
}

function deleteLast() {
    if (display.value.length <= 1 || display.value === "Error") {
        display.value = "0";
    } else {
        display.value = display.value.slice(0, -1);
    }
}

function toggleSign() {
    if (display.value === "0" || display.value === "Error") return;
    // wrap current display in negation
    display.value = "-(" + display.value + ")";
}

function factorialNow() {
    if (display.value === "Error") return;
    try {
        const v = safeEval(display.value);
        display.value = formatNumber(factorial(v));
        exprEl.textContent = v + "! =";
        addToHistory(v + "!", factorial(v));
    } catch {
        display.value = "Error";
    }
}

function toPercent() {
    if (display.value === "Error") return;
    try {
        const v = safeEval(display.value);
        display.value = formatNumber(v / 100);
    } catch {
        display.value = "Error";
    }
}

function calculate() {
    const original = display.value;
    try {
        const res = safeEval(original);
        exprEl.textContent = original + " =";
        display.value = formatNumber(res);
        addToHistory(original, res);
    } catch {
        display.value = "Error";
    }
}

function addToHistory(expression, result) {
    history.unshift({ expression, result: formatNumber(result) });
    if (history.length > 20) history.pop();
    renderHistory();
}

function renderHistory() {
    historyList.innerHTML = "";
    if (history.length === 0) {
        historyEmpty.style.display = "block";
        return;
    }
    historyEmpty.style.display = "none";
    history.forEach((h, idx) => {
        const li = document.createElement("li");
        li.innerHTML = '<div class="h-expr">' + escapeHtml(h.expression) + '</div><div class="h-res">' + escapeHtml(h.result) + '</div>';
        li.addEventListener("click", () => {
            display.value = h.result;
            exprEl.textContent = h.expression + " =";
        });
        historyList.appendChild(li);
    });
}

function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

/* ---------- Theme ---------- */
function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    const btn = document.getElementById("themeToggle");
    btn.textContent = theme === "dark" ? "🌙" : "☀️";
    try { localStorage.setItem("calc-theme", theme); } catch {}
}

function toggleTheme() {
    const cur = document.documentElement.getAttribute("data-theme");
    applyTheme(cur === "dark" ? "light" : "dark");
}

/* ---------- History panel ---------- */
function toggleHistory() {
    historyVisible = !historyVisible;
    historyPanel.hidden = !historyVisible;
}

/* ---------- Copy ---------- */
function copyResult() {
    const text = display.value;
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => flashCopy());
    } else {
        const ta = document.createElement("textarea");
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
        flashCopy();
    }
}

function flashCopy() {
    const btn = document.getElementById("copyBtn");
    const old = btn.textContent;
    btn.textContent = "✓";
    setTimeout(() => { btn.textContent = old; }, 900);
}

/* ---------- Keyboard ---------- */
document.addEventListener("keydown", (e) => {
    if (e.key >= "0" && e.key <= "9") { appendValue(e.key); }
    else if (e.key === ".") appendValue(".");
    else if (e.key === "+") appendValue("+");
    else if (e.key === "-") appendValue("-");
    else if (e.key === "*") appendValue("*");
    else if (e.key === "/") { e.preventDefault(); appendValue("/"); }
    else if (e.key === "%") appendValue("%");
    else if (e.key === "(") appendValue("(");
    else if (e.key === ")") appendValue(")");
    else if (e.key === "^") appendValue("^");
    else if (e.key === "Enter" || e.key === "=") { e.preventDefault(); calculate(); }
    else if (e.key === "Backspace") { e.preventDefault(); deleteLast(); }
    else if (e.key === "Escape") clearDisplay();
});

/* ---------- Init ---------- */
document.getElementById("themeToggle").addEventListener("click", toggleTheme);
document.getElementById("historyToggle").addEventListener("click", toggleHistory);
document.getElementById("copyBtn").addEventListener("click", copyResult);
document.getElementById("clearHistory").addEventListener("click", () => { history = []; renderHistory(); });

let savedTheme = "dark";
try { savedTheme = localStorage.getItem("calc-theme") || "dark"; } catch {}
applyTheme(savedTheme);
renderHistory();
