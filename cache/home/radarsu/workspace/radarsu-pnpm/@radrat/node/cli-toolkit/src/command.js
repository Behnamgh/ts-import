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
exports.Command = void 0;
const ts_options_defaults_1 = require("ts-options-defaults");
class Command {
    constructor(options) {
        this.options = ts_options_defaults_1.defaults(Command.defaults, options);
    }
    /**
     * Executes the command.
     */
    execute() {
        return __awaiter(this, void 0, void 0, function* () {
            // Notify that command is going to be executed and others should be skipped.
            if (this.options.exitOnSuccess) {
                this.options.cli.state.exit = true;
            }
            // Run the command.
            const data = yield this.options.execute(this.options.cli);
            const commandExecutionInfo = {
                data,
                executed: true,
            };
            if (this.options.exitOnSuccess) {
                yield this.options.cli.options.onExit(commandExecutionInfo);
                process.exit();
            }
            return commandExecutionInfo;
        });
    }
}
exports.Command = Command;
/**
 * Default options for all RadioactiveCommand instances.
 */
Command.defaults = {
    exitOnSuccess: true,
};
