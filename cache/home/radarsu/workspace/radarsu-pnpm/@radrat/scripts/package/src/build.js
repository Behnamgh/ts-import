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
exports.build = void 0;
const execute_1 = require("@radrat-node/execute");
const fs = require("fs");
exports.build = (cli) => __awaiter(void 0, void 0, void 0, function* () {
    const { logger } = cli.options;
    yield execute_1.execute(`rm -rf ./dist`, {
        logger,
    });
    yield execute_1.execute(`pnpx tsc`, {
        logger,
    });
    // Copy static files.
    if (fs.existsSync(`./src/assets`)) {
        yield execute_1.execute(`cp -R ./src/assets ./dist/assets`, {
            logger,
        });
    }
});
