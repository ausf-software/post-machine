function comandToString (rule){
    var res = "";
    switch (rule.type) {
        case Command.CommandType.SET_MARK:
            res += `V ${rule.nextCommandIndex}`;
            break;
        case Command.CommandType.REMOVE_MARK:
            res += `X ${rule.nextCommandIndex}`;
            break;
        case Command.CommandType.MOVE_RIGHT:
            res += `-> ${rule.nextCommandIndex}`;
            break;
        case Command.CommandType.MOVE_LEFT:
            res += `<- ${rule.nextCommandIndex}`;
            break;
        case Command.CommandType.CHECK_MARK:
            res += `?  ${rule.nextCommandIndex} ; ${rule.alternativeCommandIndex}`;
            break;
        case Command.CommandType.STOP:
            res += `!`;
            break;
        case Command.CommandType.NO_OP:
            res += `${rule.alternativeCommandIndex}`;
            break;
        default:
            res += `unknown command`;
    }
    return res;
}

class Command {
    static CommandType = {
        SET_MARK: 'SET_MARK',
        REMOVE_MARK: 'REMOVE_MARK',
        MOVE_LEFT: 'MOVE_LEFT',
        MOVE_RIGHT: 'MOVE_RIGHT',
        CHECK_MARK: 'CHECK_MARK',
        STOP: 'STOP',
        NO_OP: 'NO_OP'
    };

    constructor(type, nextCommandIndex, alternativeCommandIndex = 0) {
        this.type = type;
        this.nextCommandIndex = nextCommandIndex;
        this.alternativeCommandIndex = alternativeCommandIndex;
    }

    getType() {
        return this.type;
    }

    getNextCommandIndex() {
        return this.nextCommandIndex;
    }

    getAlternativeCommandIndex() {
        return this.alternativeCommandIndex;
    }
}

class PostMachineProgram {
    constructor(initialPosition, initialTape, name, maxSteps, commands) {
        this.initialPosition = initialPosition;
        this.tape = initialTape;
        this.name = name;
        this.maxSteps = maxSteps;
        this.commands = commands || [];
    }

    addCommand(command) {
        this.commands.push(command);
    }

    getTape() {
        return this.tape;
    }

    getName() {
        return this.name;
    }

    getMaxSteps() {
        return this.maxSteps;
    }

    getPosition() {
        return this.initialPosition;
    }

    getCommands() {
        return this.commands;
    }
}

class PostResult {
    constructor(headPosition, steps, tape, history) {
        this.headPosition = headPosition;
        this.steps = steps;
        this.tape = tape;
        this.history = history;
    }
}

class PostMachine {
    constructor(program) {
        this.tape = program.getTape();
        this.headPosition = program.getPosition();
        this.commands = [...program.getCommands()];
        this.currentCommandIndex = 0;
        this.history = [];
    }

    run(maxSteps) {
        let stepsTaken = 0;

        for (let step = 0; step < maxSteps; step++) {
            if (!this.nextStep()) {
                break;
            }
            stepsTaken++;
        }

        return new PostResult(this.headPosition, stepsTaken, this.tape, this.history);
    }

    nextStep() {
        if (this.currentCommandIndex >= this.commands.length) {
            return false;
        }

        const command = this.commands[this.currentCommandIndex];
        this.history.push(comandToString(command));
        switch (command.getType()) {
            case Command.CommandType.SET_MARK:
                this.setMark();
                break;
            case Command.CommandType.REMOVE_MARK:
                this.removeMark();
                break;
            case Command.CommandType.MOVE_LEFT:
                this.moveLeft();
                break;
            case Command.CommandType.MOVE_RIGHT:
                this.moveRight();
                break;
            case Command.CommandType.CHECK_MARK:
                this.checkMark();
                break;
            case Command.CommandType.STOP:
                return false;
            case Command.CommandType.NO_OP:
                this.currentCommandIndex = command.getNextCommandIndex();
                break;
        }
        return true;
    }

    setMark() {
        if (this.tape.charAt(this.headPosition) === '1') {
            throw new Error("Метка уже установлена.");
        }
        this.tape = this.tape.substring(0, this.headPosition) + '1' + this.tape.substring(this.headPosition + 1);
        this.currentCommandIndex = this.commands[this.currentCommandIndex].getNextCommandIndex();
    }

    removeMark() {
        if (this.tape.charAt(this.headPosition) === '0') {
            throw new Error("Нет метки для удаления.");
        }
        this.tape = this.tape.substring(0, this.headPosition) + '0' + this.tape.substring(this.headPosition + 1);
        this.currentCommandIndex = this.commands[this.currentCommandIndex].getNextCommandIndex();
    }

    moveLeft() {
        this.headPosition--;
        if (this.headPosition < 0) {
            this.headPosition = 0;
            this.tape = '0' + this.tape;
        }
        this.currentCommandIndex = this.commands[this.currentCommandIndex].getNextCommandIndex();
    }

    moveRight() {
        this.headPosition++;
        if (this.headPosition >= this.tape.length) {
            this.tape += '0';
        }
        this.currentCommandIndex = this.commands[this.currentCommandIndex].getNextCommandIndex();
    }

    checkMark() {
        if (this.tape.charAt(this.headPosition) === '0') {
            this.currentCommandIndex = this.commands[this.currentCommandIndex].getNextCommandIndex();
        } else {
            this.currentCommandIndex = this.commands[this.currentCommandIndex].getAlternativeCommandIndex();
        }
    }
}