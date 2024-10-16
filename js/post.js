class PostProgram {
    constructor(initialHeadPosition, tape) {
        this.initialHeadPosition = initialHeadPosition;
        this.tape = tape;
        this.lines = [];
    }

    addLine(command) {
        this.lines.push(command);
    }
}

const CommandName = {
    set: 'set',
    if: 'if',
    stop: 'stop',
    move: 'move',
    jump: 'jump'
};

const MoveType = {
    left: 'left',
    right: 'right'
};

const MarkType = {
    mark: 'mark',
    zero: 'zero'
};

class PostCommand {
    constructor(name, firstValue, secondValue, value) {
        this.name = name;
        this.secondValue = secondValue;
        this.firstValue = firstValue;
        this.value = value;
    }
}

function isSetCommand(line) {
    if (line.charAt(0) === 's' &&
        line.charAt(1) === 'e' &&
        line.charAt(2) === 't' &&
        line.charAt(3) === ' ') {
        return true;
    }
    return false;
}

function isIfCommand(line) {
    if (line.charAt(0) === 'i' &&
        line.charAt(1) === 'f' &&
        line.charAt(2) === ' ') {
        return true;
    }
    return false;
}

function isMoveCommand(line) {
    if (line.charAt(0) === 'm' &&
        line.charAt(1) === 'o' &&
        line.charAt(2) === 'v' &&
        line.charAt(3) === 'e') {
        return true;
    }
    return false;
}

function isStopCommand(line) {
    if (line.charAt(0) === 's' &&
        line.charAt(1) === 't' &&
        line.charAt(2) === 'o' &&
        line.charAt(3) === 'p') {
        return true;
    }
    return false;
}

class TuringMachine {
    constructor(program) {
        this.transitionTable = new Map(program.transitionTable);
        this.currentState = program.initialState;
        this.tape = program.tape;
        this.headPosition = 0;
        this.emptySymbol = program.emptySymbol;
        this.history = [];
    }

    moveCaret(type) {
        switch (type) {
            case MoveType.LEFT:
                this.headPosition -= 1;
                if (this.headPosition < 0) {
                    this.tape = this.emptySymbol + this.tape; // Add symbol to the left
                    this.headPosition = 0;
                }
                break;
            case MoveType.RIGHT:
                this.headPosition += 1;
                if (this.headPosition >= this.tape.length) {
                    this.tape += this.emptySymbol; // Add symbol to the right
                }
                break;
            case MoveType.STAY:
                // Do nothing
                break;
        }
    }

    commandExecute(command) {
        this.history.push(`${this.currentState} | ${this.tape.charAt(this.headPosition)}`);
        // Write the symbol
        this.tape = this.tape.substring(0, this.headPosition) + command.symbolToWrite + this.tape.substring(this.headPosition + 1);
        // Move the caret
        this.moveCaret(command.move);
        // Transition to the new state
        this.currentState = command.nextState;
    }

    getCurrentCommand(currentSymbol) {
        const commands = this.transitionTable.get(this.currentState) || new Map();
        return commands.get(currentSymbol);
    }

    run(maxSteps) {
        for (let step = 0; step < maxSteps; step++) {
            if (!this.transitionTable.has(this.currentState)) {
                break;
            }
            const currentSymbol = this.tape.charAt(this.headPosition);
            const command = this.getCurrentCommand(currentSymbol);

            if (command) {
                this.commandExecute(command);
            } else {
                break; // No suitable command
            }
        }
        return new ResultTuring(this.tape, this.history.length, this.headPosition, this.history);
    }

    step() {
        if (!this.transitionTable.has(this.currentState)) {
            return;
        }
        const currentSymbol = this.tape.charAt(this.headPosition);
        const command = this.getCurrentCommand(currentSymbol);

        if (command) {
            this.commandExecute(command);
        }
    }
}
