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
		adjustDisplay();
	} catch (e) {
		showError();
	}
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