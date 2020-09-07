"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Cli = void 0;
const ts_options_defaults_1 = require("ts-options-defaults");
const command_1 = require("./command");
const utils_1 = require("./utils");
class Cli {
    /**
     * Sets defaults, parses arguments and flags.
     * @param options
     */
    constructor(options) {
        /**
         * Useful information for various commands.
         */
        this.data = {
            argv: [],
            commandName: ``,
            flags: {},
            commands: {},
        };
        /**
         * Booelans informing about state of cli.
         */
        this.state = {
            exit: false,
        };
        this.options = ts_options_defaults_1.defaults(Cli.defaults, options);
        // Parse flags and commands initially.
        this.parse();
    }
    /**
     * Parse argv, split it into commands chain and flags.
     */
    parse() {
        return __awaiter(this, void 0, void 0, function* () {
            // Remove node and rr entries.
            this.data.argv = process.argv.slice(2);
            // Split argv into 2 groups: commands and flags.
            const { commands, flags } = this.getCommandsAndFlags();
            // Map commands.
            this.data.commandName = commands.join(' ');
            // Get flags map of flag-flagValue.
            this.data.flags = this.createFlagsMap(flags);
        });
    }
    /**
     * Register command and execute instantly if matches.
     * @param options
     */
    command(options) {
        return __awaiter(this, void 0, void 0, function* () {
            const { logger } = this.options;
            // If cli already executed some command, skip all others.
            if (this.state.exit) {
                logger.debug(`Some command was already executed, skipping "${options.name}".`);
                return {
                    executed: false,
                };
            }
            // Add new command to map for sake of other commands.
            const command = new command_1.Command(Object.assign({ cli: this }, options));
            if (this.data.commands[options.name] && this.data.commandName !== 'completion') {
                logger.warn(`Command ${options.name} already exists, overriding.`);
            }
            this.data.commands[options.name] = command;
            // If this is not the command to run, skip it.
            const matchesCommand = this.data.commandName === command.options.name;
            if (!matchesCommand) {
                return {
                    executed: false,
                };
            }
            logger.debug(`Matched command "${options.name}", executing...`);
            return command.execute();
        });
    }
    /**
     * Handles --help, --version and showing info withot flags.
     * @param options
     */
    default(options) {
        return this.command(Object.assign({ name: ``, description: `Default command.`, execute: () => __awaiter(this, void 0, void 0, function* () {
                // Show version.
                if (this.data.flags.version) {
                    const cliPackageJson = yield Promise.resolve().then(() => require(this.options.packageJsonPath));
                    console.log(cliPackageJson.version);
                    return;
                }
                // Show help.
                this.list();
            }) }, options));
    }
    /**
     * Displays help when user didn't match any command.
     */
    feedback() {
        const { commandName } = this.data;
        // Show info for command matching commandName.
        const selectedCommand = this.data.commands[commandName];
        if (!selectedCommand) {
            this.options.logger.error(`No command matching "${commandName}" has been found.`);
            return;
        }
        this.list();
    }
    /**
     * Lists all commands in human-friendly format.
     */
    list(forceShowAll = false) {
        const commandInfoString = this.getCommandInfoString(forceShowAll);
        const commandsArr = commandInfoString.split(`\n`);
        const sortedCommands = commandsArr.sort(utils_1.sortDescending);
        console.log(sortedCommands.join(`\n`));
        console.log();
    }
    /* --------------------------------- Helpers -------------------------------- */
    /**
     * Creates string with colored information about available commands.
     */
    getCommandInfoString(forceShowAll = false) {
        let commandInfoString = ``;
        Object.entries(this.data.commands).forEach(([name, command]) => {
            // Ignore default command.
            if (!name || (command.options.hiddenFromHelp && !forceShowAll)) {
                return;
            }
            commandInfoString += utils_1.formatCommandInfo({
                name,
                description: command.options.description || `no description`,
            });
        });
        return commandInfoString;
    }
    getCommandsAndFlags() {
        const commands = [...this.data.argv];
        let flags = [];
        for (const [index, argv] of this.data.argv.entries()) {
            if (argv.charAt(0) === '-') {
                flags = commands.splice(index);
                return {
                    commands,
                    flags,
                };
            }
        }
        return {
            commands,
            flags,
        };
    }
    createFlagsMap(flags) {
        var _a;
        const flagsMap = {};
        for (const [index, rawFlag] of flags.entries()) {
            let normalizedFlagName = rawFlag;
            if (normalizedFlagName.charAt(0) === '-') {
                normalizedFlagName = normalizedFlagName.substr(1);
            }
            if (normalizedFlagName.charAt(0) === '-') {
                normalizedFlagName = normalizedFlagName.substr(1);
            }
            const flagAndValueArr = normalizedFlagName.split('=');
            const flag = flagAndValueArr[0];
            let flagValue = flagAndValueArr[1];
            // Detect if following element is flagValue.
            if (!flagValue && ((_a = flags[index + 1]) === null || _a === void 0 ? void 0 : _a.charAt(0)) !== '-') {
                flagValue = flags[index + 1];
                // Remove flagValue from flags array.
                flags.splice(index + 1);
            }
            flagsMap[flag] = flagValue !== null && flagValue !== void 0 ? flagValue : 'true';
        }
        return flagsMap;
    }
}
exports.Cli = Cli;
/**
 * Default options for all Cli instances.
 */
Cli.defaults = {
    name: `rr`,
    logger: console,
    onExit: () => __awaiter(void 0, void 0, void 0, function* () { }),
};
