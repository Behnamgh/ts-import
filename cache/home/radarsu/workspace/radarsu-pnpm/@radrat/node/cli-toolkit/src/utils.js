"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatCommandInfo = exports.sortDescending = void 0;
const chalk = require("chalk");
exports.sortDescending = (a, b) => {
    return a > b ? 1 : -1;
};
exports.formatCommandInfo = ({ name, description }) => {
    return `\n${chalk.green(name)} ${chalk.white('-')} ${chalk.gray(description)}`;
};
