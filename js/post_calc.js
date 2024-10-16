const tapeElement = document.getElementById('tape');
const caretElement = document.getElementById('caret');
var emptySymbol = '□'; // Символ пустоты
var tape = '11000000000000000000001'; // Пример содержимого ленты
var headPosition = 0; // Начальная позиция каретки

const tapeWidth = 920;
const cellWidth = 40;
const countCells = tapeWidth / cellWidth;
const midCells = countCells / 2;
const countTempCells = 2;

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

function renderTape(emptySymbol, tape) {
    tapeElement.innerHTML = '';
    for (let i = 0; i < midCells - 1; i++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.textContent = emptySymbol;
        tapeElement.appendChild(cell);
    }
    for (let i = 0; i < tape.length; i++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.textContent = tape[i] || emptySymbol;
        tapeElement.appendChild(cell);
    }
    for (let i = 0; i < midCells - 1; i++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.textContent = emptySymbol;
        tapeElement.appendChild(cell);
    }
    updateCaretPosition();
}

function updateCaretPosition() {
    const offset = headPosition * cellWidth;
    tapeElement.style.transform = `translateX(-${offset}px)`;
}

function moveLeft() {
    if (headPosition > 0) {
        headPosition--;
        renderTape();
    }
}

function moveRight() {
    if (headPosition < tape.length) {
        headPosition++;
        renderTape();
    }
}


renderTape(emptySymbol, tape);

function isStringConvertibleToNumber(str) {
    return !isNaN(Number(str));
}

function parseCommand(tr_line, commandType, commandName) {
    let temp = tr_line.split(' ');

    if (temp.length !== 4) {
        throw new Error(`Invalid syntax: Expected 4 parts but got ${temp.length}. Command: "${tr_line}"`);
    }

    if ((commandType[temp[1]] || null) == null) {
        throw new Error(`Invalid syntax: "${temp[1]}" is not a valid command type. Command: "${tr_line}"`);
    }

    if (temp[2] !== CommandName.jump) {
        throw new Error(`Invalid syntax: Expected "${CommandName.jump}" as the third part but got "${temp[2]}". Command: "${tr_line}"`);
    }

    if (!isStringConvertibleToNumber(temp[3])) {
        throw new Error(`Invalid syntax: The fourth part "${temp[3]}" is not a valid number. Command: "${tr_line}"`);
    }

    return new PostCommand(commandName, temp[1], Number(temp[3]));
}

function convertStringToCommand(inputString) {
    var commands = [];
    var lines = inputString.split("\n");

    for (let line of lines) {
        let tr_line = line.trim();
        if (tr_line.length == 0) { continue; }
        if (tr_line.charAt(0) == '/' && tr_line.charAt(1) == '/') { continue; }

        if (isStopCommand(tr_line)) {
            commands.push(new PostCommand(CommandName.stop));
            continue;
        }
        if (isSetCommand(tr_line)) {
            commands.push(parseCommand(tr_line, MarkType, CommandName.set));
            continue;
        }
        if (isMoveCommand(tr_line)) {
            commands.push(parseCommand(tr_line, MoveType, CommandName.set));
            continue;
        }
        if (isIfCommand(tr_line)) {
            var temp = tr_line.split('?');
            if (temp.length != 2) {
                throw new Error(`Invalid syntax: Expected a conditional statement in the format "condition?trueAction:falseAction". Command: "${tr_line}"`);
            }
            var mt = temp[0].split(' ')[1];
            var right = temp[1].split(':');
            if ((MarkType[mt] || null) == null) {
                throw new Error(`Invalid syntax: "${mt}" is not a valid mark type. Command: "${tr_line}"`);
            }
            if (right.length != 2) {
                throw new Error(`Invalid syntax: Expected two actions separated by a colon in the format "trueAction:falseAction". Command: "${tr_line}"`);
            }
            var right_left = right[0].trim().split(' ');
            var right_right = right[1].trim().split(' ');

            if (right_left.length != 2) {
                throw new Error(`Invalid syntax: Expected two parts for the true action but got ${right_left.length}. Command: "${tr_line}"`);
            }
            if (right_right.length != 2) {
                throw new Error(`Invalid syntax: Expected two parts for the false action but got ${right_right.length}. Command: "${tr_line}"`);
            }
            if (right_left[0] != CommandName.jump) {
                throw new Error(`Invalid syntax: Expected "${CommandName.jump}" as the first part of the true action but got "${right_left[0]}". Command: "${tr_line}"`);
            }
            if (right_right[0] != CommandName.jump) {
                throw new Error(`Invalid syntax: Expected "${CommandName.jump}" as the first part of the false action but got "${right_right[0]}". Command: "${tr_line}"`);
            }
            if (!isStringConvertibleToNumber(right_left[1])) {
                throw new Error(`Invalid syntax: The second part of the true action "${right_left[1]}" is not a valid number. Command: "${tr_line}"`);
            }
            if (!isStringConvertibleToNumber(right_right[1])) {
                throw new Error(`Invalid syntax: The second part of the false action "${right_right[1]}" is not a valid number. Command: "${tr_line}"`);
            }
            commands.push(new PostCommand(CommandName.if, Number(right_left[1]), Number(right_right[1]), mt));
            continue;
        }
        throw new Error(`Invalid syntax: The command "${tr_line}" is not recognized. Please check the command format.`);
    }
    return commands;
}

console.log(convertStringToCommand(`
    set mark jump 1
set zero jump 1
move right jump 1
move left jump 1

if mark ? jump 1 : jump 1
if zero ? jump 1 : jump 1

stop
    `));

function run() {
    
};