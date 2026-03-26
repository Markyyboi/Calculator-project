function append(value){
	const disp = document.getElementById("display");
	const current = disp.value;
	const operators = ['+','-','*','/'];

	if (operators.includes(value)) {
		if (current === '' && value !== '-') return;
		const last = current.slice(-1);
		if (operators.includes(last)) return;
	}

	if (value === '.') {
		const parts = current.split(/[[+\-*/\s]]/);
		const lastNum = parts[parts.length - 1];
		if (lastNum && lastNum.includes('.')) return;
	}

	disp.value += value;
	adjustDisplay();
}

function clearDisplay(){
	document.getElementById("display").value = "";
	adjustDisplay();
}

function calculate(){
	const disp = document.getElementById("display");
	const expr = disp.value;

	function showError() {
		disp.value = 'Error';
	}

	function isValidExpression(s) {
		if (!s || s.trim() === '') return false;
		if (/[^0-9+\-*/().\s]/.test(s)) return false;
		const compact = s.replace(/\s+/g, '');
		if (/[+\-*/]{2,}/.test(compact)) return false;
		let bal = 0;
		for (let i = 0; i < compact.length; i++) {
			const ch = compact[i];
			if (ch === '(') bal++;
			if (ch === ')') bal--;
			if (bal < 0) return false;
		}
		if (bal !== 0) return false;
		return true;
	}

	if (!isValidExpression(expr)) { showError(); return; }

	try {
		const result = Function('"use strict"; return (' + expr + ')')();
		if (typeof result !== 'number' || !isFinite(result)) { showError(); return; }
		disp.value = result;
		// record history entry (expression -> result)
		addHistory(expr, String(result));
		adjustDisplay();
	} catch (e) {
		showError();
	}
}

// --- History logic ---
let __calc_history = [];
try { __calc_history = JSON.parse(localStorage.getItem('calc_history') || '[]'); } catch(e) { __calc_history = []; }

function saveHistory() {
	try { localStorage.setItem('calc_history', JSON.stringify(__calc_history)); } catch(e) {}
}

function addHistory(expr, res) {
	if (!expr) return;
	__calc_history.unshift({ expr: String(expr), res: String(res) });
	if (__calc_history.length > 100) __calc_history.length = 100;
	saveHistory();
	renderHistory();
}

function renderHistory() {
	const list = document.getElementById('historyList');
	if (!list) return;
	list.innerHTML = '';
	__calc_history.forEach((h, idx) => {
		const li = document.createElement('li');
		const left = document.createElement('div');
		left.className = 'history-item-expr';
		left.textContent = h.expr;
		const right = document.createElement('div');
		right.className = 'history-item-res';
		right.textContent = h.res;
		li.appendChild(left);
		li.appendChild(right);
		li.addEventListener('click', () => { loadHistoryItem(idx); });
		list.appendChild(li);
	});
}

function toggleHistory() {
	const panel = document.getElementById('historyPanel');
	if (!panel) return;
	const showing = panel.style.display !== 'none';
	panel.style.display = showing ? 'none' : 'block';
	if (!showing) renderHistory();
}

function loadHistoryItem(index) {
	const item = __calc_history[index];
	if (!item) return;
	const disp = document.getElementById('display');
	disp.value = item.expr;
	adjustDisplay();
}

function clearHistory() {
	__calc_history = [];
	saveHistory();
	renderHistory();
}

function adjustDisplay() {
	const disp = document.getElementById('display');
	if (!disp) return;
	const val = String(disp.value || '');
	// reset when short
	if (val.length <= 12) {
		disp.style.fontSize = '';
		disp.scrollLeft = 0;
		return;
	}

	// reduce font size progressively for long values
	const extra = val.length - 12;
	const newSize = Math.max(12, 20 - extra * 0.6);
	disp.style.fontSize = newSize + 'px';
	// keep content anchored to the left
	disp.scrollLeft = 0;
}

async function copyToClipboard() {
	const disp = document.getElementById('display');
	const btn = document.getElementById('copyBtn');
	if (!disp) return;
	const text = String(disp.value || '');
	try {
		if (navigator.clipboard && navigator.clipboard.writeText) {
			await navigator.clipboard.writeText(text);
		} else {
			const ta = document.createElement('textarea');
			ta.value = text;
			document.body.appendChild(ta);
			ta.select();
			document.execCommand('copy');
			document.body.removeChild(ta);
		}
		if (btn) {
			const prev = btn.textContent;
			btn.textContent = 'Copied!';
			setTimeout(() => btn.textContent = prev, 900);
		}
	} catch (e) {
		if (btn) {
			const prev = btn.textContent;
			btn.textContent = 'Failed';
			setTimeout(() => btn.textContent = prev, 1200);
		}
	}
}

async function pasteFromClipboard() {
	const disp = document.getElementById('display');
	const btn = document.getElementById('pasteBtn');
	if (!disp) return;
	try {
		let text = '';
		if (navigator.clipboard && navigator.clipboard.readText) {
			text = await navigator.clipboard.readText();
		} else {
			text = prompt('Paste expression:') || '';
		}
		// sanitize: allow digits, operators, parentheses, dot and spaces
		const sanitized = (text || '').replace(/[^0-9+\-*/().\s]/g, '').trim();
		if (!sanitized) {
			if (btn) { const prev = btn.textContent; btn.textContent = 'No valid text'; setTimeout(() => btn.textContent = prev, 900); }
			return;
		}
		disp.value = sanitized;
		adjustDisplay();
		if (btn) { const prev = btn.textContent; btn.textContent = 'Pasted'; setTimeout(() => btn.textContent = prev, 900); }
	} catch (e) {
		if (btn) { const prev = btn.textContent; btn.textContent = 'Failed'; setTimeout(() => btn.textContent = prev, 1200); }
	}
}