const tapeElement = document.getElementById('tape');
const caretElement = document.getElementById('caret');
var emptySymbol = '0'; // Символ пустоты
var tape = '0'; // Пример содержимого ленты
var headPosition = 0; // Начальная позиция каретки

const tapeWidth = 920;
const cellWidth = 40;
const countCells = tapeWidth / cellWidth;
const midCells = countCells / 2;
console.log(midCells)

var isModificationAllowed = true;

const inputTape = document.getElementById('tape-input');
const inputPostion = document.getElementById('initialPositin');
const inputMaxSteps = document.getElementById('max-steps');
const inputProgramm = document.getElementById('rules-string');
const inputName = document.getElementById('name-string');
const divProgramm = document.getElementById("programms_div");

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
    for (let i = 0; i < midCells - 1; i++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.textContent = emptySymbol;
        cell.onclick = () => handleCellClick(-Math.floor(midCells) + i);
        tapeElement.appendChild(cell);
    }
    for (let i = 0; i < tape.length; i++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.textContent = tape[i] || emptySymbol;
        cell.onclick = () => handleCellClick(i); // Добавляем обработчик клика
        tapeElement.appendChild(cell);
    }
    for (let i = 0; i < midCells - 1; i++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.textContent = emptySymbol;
        cell.onclick = () => handleCellClick(tape.length + i);
        tapeElement.appendChild(cell);
    }
    updateCaretPosition();
}

function handleCellClick(index) {
    if (isModificationAllowed) {
        if (index < 0) {
            var temp = "1";
            index += 1;
            for (; index != 0; index++, headPosition++) {
                temp += "0";
            }
            headPosition++;
            tape = temp + tape;
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
}

function moveLeft() {
    if (headPosition > 0) {
        headPosition--;
        renderTape(emptySymbol, tape);
    }
}

function moveRight() {
    if (headPosition < tape.length) {
        headPosition++;
        renderTape(emptySymbol, tape);
    }
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
        <button class="close-btn">Закрыть</button>
    `;

    popup.querySelector('.close-btn').onclick = function() {
        document.body.removeChild(popup);
    };
    console.log(message);
    document.body.appendChild(popup);
}

try {
    var cccc = convertStringToCommand(
        `<-
        ? 3 ; 4
        V 4
        <- 5
        ? 6 ; 2
        !`);
        console.log(cccc);
        var p = new PostMachineProgram(4, "10101");
        for (var ppp of cccc) {
            p.addCommand(ppp);
        }

        var a = new PostMachine(p);
        console.log(a.run(50));
} catch (error) {
    showErrorPopup(error.message);
}

function run() {
    var ms = inputMaxSteps.value;
    var t = inputTape.value;
    var hp = inputPostion.value;
    var textProgramm = inputProgramm.value;
    var n = inputName.value;
    try {
        var commands = convertStringToCommand(textProgramm);
        var program = new PostMachineProgram(hp, t, n, ms);
        for (var c of commands) {
            program.addCommand(c);
        }
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
    var textProgramm = inputProgramm.value;
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
        switch (rule.type) {
            case Command.CommandType.SET_MARK:
                res += `set mark jump ${rule.nextCommandIndex}\n`;
                break;
            case Command.CommandType.REMOVE_MARK:
                res += `set zero jump ${rule.nextCommandIndex}\n`;
                break;
            case Command.CommandType.MOVE_RIGHT:
                res += `move right jump ${rule.nextCommandIndex}\n`;
                break;
            case Command.CommandType.MOVE_LEFT:
                res += `move left jump ${rule.nextCommandIndex}\n`;
                break;
            case Command.CommandType.CHECK_MARK:
                res += `if mark ? jump ${rule.alternativeCommandIndex} : jump ${rule.nextCommandIndex}\n`;
                break;
            case Command.CommandType.STOP:
                res += `stop\n`;
                break;
            case Command.CommandType.NO_OP:
                res += `${rule.alternativeCommandIndex}\n`;
                break;
            default:
                res += `unknown command\n`;
        }
    }
    return res.trim();
}

function loadProgramm(n) {
	var p = programs[n];
	inputName.value = p.getName();
	inputTape.value = p.getTape();
	inputMaxSteps.value = p.getMaxSteps();
	inputProgramm.value = rulesToString(p.getCommands());
    inputPostion.value = p.getPosition();
}

function removeProgramm(n) {
	programs.splice(n, 1);
	proggramDivUpdate();
}

function updateProgramm(n) {
	var ms = inputMaxSteps.value;
    var t = inputTape.value;
    var hp = inputPostion.value;
    var textProgramm = inputProgramm.value;
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
		res += `<button onclick='loadProgramm(${i})' class="btn download">Upload</button>`;
		res += `<button onclick='removeProgramm(${i})' class="btn delete">Remove</button>`;
		//res += `<button onclick='updateProgramm(${i})' class="btn save">Update</button>`;
		res += '</div>';
		res += "</div>";
	}
	div.innerHTML = res;
}