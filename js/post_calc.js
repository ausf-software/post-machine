const tapeElement = document.getElementById('tape');
const caretElement = document.getElementById('caret');
const tapeContainerElement = document.getElementById('tape-container');
const tapeNumbersElement = document.getElementById("tape-numbers");
var emptySymbol = '0';
var tape = '0';
var headPosition = 0;
var intervalId;
var marked = '*';

var tapeWidth = tapeContainerElement.offsetWidth - 2;
const cellWidth = 40;
var countCells = tapeWidth / cellWidth;
var midCells = countCells / 2;
// 360
var isModificationAllowed = true;
var caretPosDelta = 0;

const inputTape = document.getElementById('tape-input');
const inputPostion = document.getElementById('initialPositin');
const inputMaxSteps = document.getElementById('max-steps');
const inputProgramm = document.getElementById('rules-string');
const inputName = document.getElementById('name-string');
const divProgramm = document.getElementById("programms_div");
const inputSpeed = document.getElementById("steps-interval");
const inputTapeSkin = document.getElementById("tape-skin");

var editor = CodeMirror.fromTextArea(inputProgramm, {
    lineNumbers: true,
    mode: 'text/x-perl',
    theme: 'abbott',
});

function getProgramText() {
    return editor.doc.getValue();
}

function setProgramText(str) {
    return editor.doc.setValue(str);
}

var speed = 500;

function clearAnswer() {
    const lineContainer = document.getElementById('lineContainer');
    lineContainer.innerHTML = "";
}

function setResultString(str) {
    document.getElementById('result_string').innerHTML = `Result: ${str}`;
}

function setResultSteps(str) {
    document.getElementById('result_steps').innerHTML = `Count steps: ${str}`;
}

function setTapeToInputField(str) {
    document.getElementById('tape-input').value = str;
}

function setPositionToInputField(str) {
    document.getElementById('initialPositin').value = str;
}

function renderTape(emptySymbol, tape) {
    tapeElement.innerHTML = '';
    tapeNumbersElement.innerHTML = '';
    for (let i = 0; i < midCells - 1; i++) {
        const cell = document.createElement('div');
        const num = document.createElement('div');
        cell.className = 'cell';
        cell.textContent = marked == '*' ? ' ' : emptySymbol;
        num.className = 'cell-num';
        num.textContent = -Math.floor(midCells) + i - caretPosDelta;
        cell.onclick = () => handleCellClick(-Math.floor(midCells) + i);
        tapeElement.appendChild(cell);
        tapeNumbersElement.appendChild(num);
    }
    for (let i = 0; i < tape.length; i++) {
        const cell = document.createElement('div');
        const num = document.createElement('div');
        cell.className = 'cell';
        cell.textContent = tape[i] || emptySymbol;
        if (cell.textContent == '0') {
            if (marked == '*') {
                cell.textContent = ' ';
            } else {
                cell.textContent = emptySymbol;
            }
        }
        if (cell.textContent == '1') {
            cell.textContent = marked;
            if (marked == '*') {
                cell.classList.add('marked-cell');
                cell.textContent = ' ';
                const circle = document.createElement('div');
                circle.classList.add('circle');
                cell.appendChild(circle);
            }
        }
        num.className = 'cell-num';
        num.textContent = i - caretPosDelta;
        cell.onclick = () => handleCellClick(i);
        tapeElement.appendChild(cell);
        tapeNumbersElement.appendChild(num);
    }
    for (let i = 0; i < midCells - 1; i++) {
        const cell = document.createElement('div');
        const num = document.createElement('div');
        cell.className = 'cell';
        cell.textContent = marked == '*' ? ' ' : emptySymbol;
        num.className = 'cell-num';
        num.textContent = tape.length + i - caretPosDelta;
        cell.onclick = () => handleCellClick(tape.length + i);
        tapeElement.appendChild(cell);
        tapeNumbersElement.appendChild(num);
    }
    updateCaretPosition();
}

caretElement.onclick = () => handleCellClick(headPosition);

const resizeObserver = new ResizeObserver(entries => {
    for (let entry of entries) {
        const { width, height } = entry.contentRect;
        tapeWidth = width;
        console.log("tape size:" + tapeWidth);
        countCells = tapeWidth / cellWidth;
        midCells = countCells / 2;
        renderTape(emptySymbol, tape);
    }
});
resizeObserver.observe(tapeContainerElement);

inputTapeSkin.addEventListener('change', function() {
    if (inputTapeSkin.value == "binary") {
        emptySymbol = '0';
        marked = '1';
    } else {
        marked = '*';
    }
    renderTape(emptySymbol, tape);
});

function handleCellClick(index) {
    if (isModificationAllowed) {
        if (index < 0) {
            var temp = "1";
            var j = index;
            index += 1;
            for (; index != 0; index++, headPosition++) {
                temp += "0";
            }
            headPosition++;
            tape = temp + tape;
            caretPosDelta -= j;
        } else {
            if (index >= tape.length) {
                var temp = "1";
                index -= 1;
                for (; index >= tape.length; index--) {
                    temp = "0" + temp;
                }
                tape += temp;
            } else {   
                const newValue = tape[index] === "1" ? "0" : "1";
                if (newValue !== null) {
                    tape = tape.substring(0, index) + newValue + tape.substring(index + 1);
                }
            }
        }
        setTapeToInputField(tape);
        setPositionToInputField(headPosition);
        renderTape(emptySymbol, tape);
    } else {
        alert("Изменение ячейки запрещено.");
    }
}

function updateCaretPosition() {
    const offset = headPosition * cellWidth;
    tapeElement.style.transform = `translateX(-${offset}px)`;
    tapeNumbersElement.style.transform = `translateX(-${offset}px)`;
}

function moveLeft() {
    if (headPosition > 0) {
        headPosition--;
    } else {
        tape = emptySymbol + tape;
        headPosition = 0;
        caretPosDelta++;
    }
    
    inputPostion.value = headPosition;
    inputTape.value = tape;
    renderTape(emptySymbol, tape);
}

function moveRight() {
    if (headPosition < tape.length - 1) {
        headPosition++;
    } else {
        tape += emptySymbol;
        headPosition++;
    }
    
    inputPostion.value = headPosition;
    inputTape.value = tape;
    renderTape(emptySymbol, tape);
}
inputTape.addEventListener('blur', function() {
    tape = inputTape.value;
    renderTape(emptySymbol, tape);
});

inputPostion.addEventListener('blur', function() {
    headPosition = inputPostion.value;
    renderTape(emptySymbol, tape);
});
renderTape(emptySymbol, tape);


function showErrorPopup(message) {
    const popup = document.createElement('div');
    popup.className = 'error-popup';
    popup.innerHTML = `
        <p>${message}</p>
        <button class="close-btn">Close</button>
    `;

    popup.querySelector('.close-btn').onclick = function() {
        document.body.removeChild(popup);
    };
    document.body.appendChild(popup);
}

function startExecution(program, maxSteps) {
    const machine = new PostMachine(program);
    let stepsTaken = 0;

    intervalId = setInterval(() => {
        if (stepsTaken < maxSteps) {
            const result = machine.nextStep();
            if (!result) {
                clearInterval(intervalId);
                isModificationAllowed = true;
                setResultString(tape);
                return;
            }
            stepsTaken++;
            tape = machine.tape;
            headPosition = machine.headPosition;
            renderTape(emptySymbol, tape)
            console.log(`Step: ${stepsTaken}, Tape: ${tape}, Head Position: ${headPosition}`);
            clearAnswer();
            setResultSteps(stepsTaken);
            const lineContainer = document.getElementById('lineContainer');
            addLinesToContainer(machine.history, lineContainer);
        } else {
            clearInterval(intervalId);
            isModificationAllowed = true;
            setResultString(tape);
        }
    }, speed);
}

function run() {
    clearInterval(intervalId);
    caretPosDelta = 0;
    var ms = inputMaxSteps.value;
    var t = inputTape.value;
    var hp = inputPostion.value;
    var textProgramm = getProgramText();
    var n = inputName.value;
    speed = Number(inputSpeed.value);
    tape = t;
    headPosition = hp;
    try {
        var commands = convertStringToCommand(textProgramm);
        var program = new PostMachineProgram(hp, t, n, ms);
        for (var c of commands) {
            program.addCommand(c);
        }
        isModificationAllowed = false;
        clearAnswer();
        startExecution(program, ms);
    } catch (error) {
        showErrorPopup(error.message);
    }
};

var programs = [];
var cout_p = 0;

function serializePostPrograms(programs) {
    return JSON.stringify(programs, null, 2);
}

function deserializePostPrograms(serializedData) {
    const data = JSON.parse(serializedData);
    return data.map(item => new PostMachineProgram(item.initialPosition, item.tape, item.name, item.maxSteps, item.commands));
}

function downloadProgramms() {
    const blob = new Blob([serializePostPrograms(programs)], { type: 'application/json' });
	const filename = "postMachine.post";
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || 'data.json';

    document.body.appendChild(a);
    a.click();

    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

document.getElementById('fileInput').addEventListener('change', (event) => {
	const file = event.target.files[0];

	if (file) {
		const reader = new FileReader();
		reader.onload = function(event) {
			const serializedData = event.target.result;
			const pro = deserializePostPrograms(serializedData);
			console.log(pro);
			programs = pro;
			proggramDivUpdate();
		};
		reader.readAsText(file);
	} else {
		alert('Пожалуйста, выберите файл для загрузки.');
	}
});

function addProgramm () {
	var ms = inputMaxSteps.value;
    var t = inputTape.value;
    var hp = inputPostion.value;
    var textProgramm = getProgramText();
    var n = inputName.value;
    try {
        var commands = convertStringToCommand(textProgramm);
        var program = new PostMachineProgram(hp, t, n, ms);
        for (var c of commands) {
            program.addCommand(c);
        }
        console.log(program);
        programs.push(program);
    } catch (error) {
        showErrorPopup(error.message);
    }
	proggramDivUpdate();
}

function rulesToString(rules) {
    var res = "";
    var a = false;
    for (var rule of rules) {
        if (a == false) {
            a = true;
            continue;
        }
        res += comandToString(rule);
        if (rule.type !== Command.CommandType.NO_OP)
            res += "\n";
        else if (rule.type === Command.CommandType.NO_OP && rule.alternativeCommandIndex.length > 1)
            res += "\n";
    }
    return res.trim();
}

function loadProgramm(n) {
	var p = programs[n];
	inputName.value = p.getName();
	inputTape.value = p.getTape();
	inputMaxSteps.value = p.getMaxSteps();
	setProgramText(rulesToString(p.getCommands()));
    inputPostion.value = p.getPosition();
    tape = p.getTape();
    headPosition = p.getPosition();
    renderTape(emptySymbol, tape);
}

function removeProgramm(n) {
	programs.splice(n, 1);
	proggramDivUpdate();
}

function updateProgramm(n) {
	var ms = inputMaxSteps.value;
    var t = inputTape.value;
    var hp = inputPostion.value;
    var textProgramm = getProgramText();
    var n = inputName.value;
    try {
        var commands = convertStringToCommand(textProgramm);
        var program = new PostMachineProgram(hp, t, n, ms);
        for (var c of commands) {
            program.addCommand(c);
        }
        console.log(program);
        programs[n] = program;
    } catch (error) {
        showErrorPopup(error.message);
    }
	proggramDivUpdate();
}

function proggramDivUpdate() {
	var div = divProgramm;
	div.innerHTML = "";

	var res = "";
	for (var i = 0; i < programs.length; i++) {
		res += "<div class='program'>";
		res += `<span class="program-name">${programs[i].getName()}</span>`;
		res += '<div class="programm-buttons">';
		res += `<button onclick='loadProgramm(${i})' class="btn download">Load</button>`;
		res += `<button onclick='removeProgramm(${i})' class="btn delete">Remove</button>`;
		//res += `<button onclick='updateProgramm(${i})' class="btn save">Update</button>`;
		res += '</div>';
		res += "</div>";
	}
	div.innerHTML = res;
}