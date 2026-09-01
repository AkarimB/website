function writeArabicLetter(item) { 
	let input = document.conversion.saisie;
		 if (document.selection) { 
            input.focus();
			range = document.selection.createRange() ;
			range.text = item ;
            range.select(); 
		} else if (input.selectionStart || input.selectionStart == '0') {
		let startPos = input.selectionStart;
		let endPos = input.selectionEnd;
		let cursorPos = startPos;
		let scrollTop = input.scrollTop;
		let baselength = 0;
		input.value = input.value.substring(0, startPos)
            + item
            + input.value.substring(endPos, input.value.length);
		cursorPos += item.length;
		input.focus();
		input.selectionStart = cursorPos;
		input.selectionEnd = cursorPos;
		input.scrollTop = scrollTop;
		} else {
		input.value += item;
		input.focus();
	}
}

function copy() { 
	let textRange=document.conversion.saisie.createTextRange();
	textRange.execCommand("Copy"); 
	textRange="";
}

var car;
function cancel () {
	car = document.conversion.saisie.value;
 	car=car.replace(/\u200b/g, "");
	document.conversion.saisie.value=car;
}
