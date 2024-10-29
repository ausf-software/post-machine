function isStringConvertibleToNumber(str) {
    return !isNaN(Number(str));
}

function isString(value) {
    return typeof value === 'string';
}

const CommandName = {
    set: 'set',
    if: 'if',
    stop: 'stop',
    move: 'move',
    jump: 'jump',
    empty: 'empty'
};

const MoveType = {
    left: 'left',
    right: 'right'
};

const MarkType = {
    mark: '1',
    zero: '0'
};

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

function isMoveLeftAlternative(line) {
    if (line.charAt(0) === '<' &&
        line.charAt(1) === '-') {
        return true;
    }
    return false;
}

function isMoveRightAlternative(line) {
    if (line.charAt(0) === '-' &&
        line.charAt(1) === '>') {
        return true;
    }
    return false;
}

function isSetMarkAlternative(line) {
    if (line.charAt(0) === 'V') {
        return true;
    }
    return false;
}

function isDeleteMarkAlternative(line) {
    if (line.charAt(0) === 'X') {
        return true;
    }
    return false;
}

function isStopAlternative(line) {
    if (line.charAt(0) === '!') {
        return true;
    }
    return false;
}

function isIfAlternative(line) {
    if (line.charAt(0) === '?') {
        return true;
    }
    return false;
}

class PostCommand {
    constructor(name, firstValue, secondValue, value) {
        this.name = name;
        this.secondValue = secondValue;
        this.firstValue = firstValue;
        this.value = value;
    }
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

function convertPostCommandsToCommands(postCommands) {
    return postCommands.map(postCommand => {
        let commandType;
        let nextCommandIndex = postCommand.firstValue;
        let alternativeCommandIndex = postCommand.secondValue || 0;

        switch (postCommand.name) {
            case CommandName.set:
                commandType = postCommand.firstValue === MarkType.zero ? Command.CommandType.REMOVE_MARK : Command.CommandType.SET_MARK;
                nextCommandIndex = postCommand.secondValue;
                alternativeCommandIndex = 0;
                break;
            case CommandName.stop:
                commandType = Command.CommandType.STOP;
                break;
            case CommandName.move:
                commandType = postCommand.firstValue === MoveType.left ? Command.CommandType.MOVE_LEFT : Command.CommandType.MOVE_RIGHT;
                nextCommandIndex = postCommand.secondValue;
                alternativeCommandIndex = 0;
                break;
            case CommandName.empty:
                commandType = Command.CommandType.NO_OP;
                alternativeCommandIndex = postCommand.secondValue;
                break;
            case CommandName.if:
                commandType = Command.CommandType.CHECK_MARK;
                nextCommandIndex = postCommand.firstValue;
                alternativeCommandIndex = postCommand.secondValue;
                break;
            default:
                commandType = Command.CommandType.NO_OP;
                alternativeCommandIndex = postCommand.secondValue;
        }

        return new Command(commandType, nextCommandIndex, alternativeCommandIndex);
    });
}

function convertStringToCommand(inputString) {
    var commands = [];
    var lines = inputString.split("\n");
    commands.push(new PostCommand(CommandName.empty, commands.length + 1, "\n"));

    for (let line of lines) {
        let tr_line = line.trim();
        if (tr_line.length == 0) {
            commands.push(new PostCommand(CommandName.empty, commands.length + 1, "\n"));
            continue; 
        }
        if (tr_line.charAt(0) == '/' && tr_line.charAt(1) == '/') {
            commands.push(new PostCommand(CommandName.empty, commands.length + 1, tr_line));
            continue; 
        }

        if (isStopCommand(tr_line)) {
            commands.push(new PostCommand(CommandName.stop));
            continue;
        }
        if (isSetCommand(tr_line)) {
            commands.push(parseCommand(tr_line, MarkType, CommandName.set));
            continue;
        }
        if (isMoveCommand(tr_line)) {
            commands.push(parseCommand(tr_line, MoveType, CommandName.move));
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
            if (mt === "zero")
                commands.push(new PostCommand(CommandName.if, Number(right_left[1]), Number(right_right[1]), MarkType.zero));
            else
                commands.push(new PostCommand(CommandName.if, Number(right_right[1]), Number(right_left[1]), MarkType.zero));
            continue;
        }
        if (isMoveLeftAlternative(tr_line)) {
            var v = tr_line.slice(2).trim();
            if (v.length > 0 && !isStringConvertibleToNumber(v)) {
                throw new Error(`Invalid syntax: The part "${v}" is not a valid number. Command: "${tr_line}"`);
            }
            var j = v.length > 0 ? Number(v) : commands.length + 1;
            commands.push(new PostCommand(CommandName.move, MoveType.left, j));
            continue;
        }
        if (isMoveRightAlternative(tr_line)) {
            var v = tr_line.slice(2).trim();
            if (v.length > 0 && !isStringConvertibleToNumber(v)) {
                throw new Error(`Invalid syntax: The part "${v}" is not a valid number. Command: "${tr_line}"`);
            }
            var j = v.length > 0 ? Number(v) : commands.length + 1;
            commands.push(new PostCommand(CommandName.move, MoveType.right, j));
            continue;
        }
        if (isSetMarkAlternative(tr_line)) {
            var v = tr_line.slice(1).trim();
            if (v.length > 0 && !isStringConvertibleToNumber(v)) {
                throw new Error(`Invalid syntax: The part "${v}" is not a valid number. Command: "${tr_line}"`);
            }
            var j = v.length > 0 ? Number(v) : commands.length + 1;
            commands.push(new PostCommand(CommandName.set, MarkType.mark, j));
            continue;
        }
        if (isDeleteMarkAlternative(tr_line)) {
            var v = tr_line.slice(1).trim();
            if (v.length > 0 && !isStringConvertibleToNumber(v)) {
                throw new Error(`Invalid syntax: The part "${v}" is not a valid number. Command: "${tr_line}"`);
            }
            var j = v.length > 0 ? Number(v) : commands.length + 1;
            commands.push(new PostCommand(CommandName.set, MarkType.zero, j));
            continue;
        }
        if (isStopAlternative(tr_line)) {
            commands.push(new PostCommand(CommandName.stop));
            continue;
        }
        if (isIfAlternative(tr_line)) {
            var v = tr_line.slice(1).trim();
            var w = v.split(';');
            if (w[0].trim().length <= 0 && !isStringConvertibleToNumber(w[0].trim())) {
                throw new Error(`Invalid syntax: The part "${v}" is not a valid number. Command: "${tr_line}"`);
            }
            var f = Number(w[0].trim());
            if (w[1].trim().length <= 0 && !isStringConvertibleToNumber(w[1].trim())) {
                throw new Error(`Invalid syntax: The part "${v}" is not a valid number. Command: "${tr_line}"`);
            }
            var s = Number(w[1].trim());
            commands.push(new PostCommand(CommandName.if, f, s, MarkType.zero));
            continue;
        }
        throw new Error(`Invalid syntax: The command "${tr_line}" is not recognized. Please check the command format.`);
    }

    return convertPostCommandsToCommands(commands);
}