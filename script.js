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
}

function clearDisplay(){
document.getElementById("display").value = "";
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
	} catch (e) {
		showError();
	}
}