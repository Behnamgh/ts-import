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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
exports.__esModule = true;
exports.tsImport = exports.Compiler = void 0;
var childProcess = require("child_process");
var fs = require("fs");
var path = require("path");
var ts_options_defaults_1 = require("ts-options-defaults");
/**
 * Compiles TypeScript file to JavaScript, stores it cached and reads js from cache if available.
 * @param scriptPath path to script to store in cache equivalent path.
 * @param cacheDir
 */
var Compiler = /** @class */ (function () {
    function Compiler(options) {
        this.options = ts_options_defaults_1.defaults(Compiler.defaults, options);
    }
    /**
     * Compile scripts.ts to scripts.js, check cache.
     * @param scriptsDir
     */
    Compiler.prototype.compile = function (relativeTsPath) {
        if (relativeTsPath === void 0) { relativeTsPath = ""; }
        return __awaiter(this, void 0, void 0, function () {
            var cwd, tsPath, tsDir, compiled;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        cwd = process.cwd();
                        tsPath = path.resolve(cwd, relativeTsPath);
                        if (!fs.existsSync(tsPath)) {
                            throw new Error("File " + tsPath + " not found to compile.");
                        }
                        tsDir = path.dirname(tsPath);
                        // Switch directory to scripts.ts to resolve node_modules during require.
                        process.chdir(tsDir);
                        return [4 /*yield*/, this.compileOrFail({ cwd: cwd, tsDir: tsDir, tsPath: tsPath })["catch"](function (err) {
                                // Change directory back to cwd to prevent side-effects on error.
                                process.chdir(cwd);
                                throw err;
                            })];
                    case 1:
                        compiled = _a.sent();
                        // Change directory back to cwd and return compiled.
                        process.chdir(cwd);
                        return [2 /*return*/, compiled];
                }
            });
        });
    };
    Compiler.prototype.compileOrFail = function (ctx) {
        return __awaiter(this, void 0, void 0, function () {
            var logger, tsDir, tsPath, tsFileName, jsFileName, cacheDir, cachedFile, tsWasModified, compiled_1, compiled_2, compiled;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        logger = this.options.logger;
                        tsDir = ctx.tsDir, tsPath = ctx.tsPath;
                        tsFileName = path.basename(tsPath);
                        jsFileName = tsFileName.replace(/\.[^/.]+$/, ".js");
                        cacheDir = path.resolve(this.options.cacheDir, "." + tsDir);
                        cachedFile = path.resolve(cacheDir, jsFileName);
                        // Check if cached scripts.js exist.
                        logger === null || logger === void 0 ? void 0 : logger.debug("Looking for cached file at " + cachedFile);
                        if (!fs.existsSync(cachedFile)) return [3 /*break*/, 6];
                        return [4 /*yield*/, this.wasModified(tsPath, cachedFile)];
                    case 1:
                        tsWasModified = _a.sent();
                        if (!!tsWasModified) return [3 /*break*/, 3];
                        logger === null || logger === void 0 ? void 0 : logger.debug("File was not modified, importing.");
                        return [4 /*yield*/, Promise.resolve().then(function () { return require(cachedFile); })];
                    case 2:
                        compiled_1 = _a.sent();
                        return [2 /*return*/, compiled_1];
                    case 3:
                        // Cache is incorrect, rebuild.
                        logger === null || logger === void 0 ? void 0 : logger.debug("File was modified, building and importing.");
                        return [4 /*yield*/, this.buildCache(tsPath)];
                    case 4:
                        _a.sent();
                        return [4 /*yield*/, Promise.resolve().then(function () { return require(cachedFile); })];
                    case 5:
                        compiled_2 = _a.sent();
                        return [2 /*return*/, compiled_2];
                    case 6:
                        // Create cache directory if it does not exist.
                        if (!fs.existsSync(cacheDir)) {
                            logger === null || logger === void 0 ? void 0 : logger.debug("Creating cache directory.");
                            fs.mkdirSync(cacheDir, {
                                recursive: true
                            });
                        }
                        // Build cache.
                        logger === null || logger === void 0 ? void 0 : logger.debug("File was not cached, caching...");
                        return [4 /*yield*/, this.buildCache(tsPath)];
                    case 7:
                        _a.sent();
                        return [4 /*yield*/, Promise.resolve().then(function () { return require(cachedFile); })];
                    case 8:
                        compiled = _a.sent();
                        return [2 /*return*/, compiled];
                }
            });
        });
    };
    Compiler.prototype.buildCache = function (absoluteTsPath) {
        var _a = this.options, flags = _a.flags, cacheDir = _a.cacheDir, logger = _a.logger;
        // Compile new scripts.ts to .js.
        return new Promise(function (resolve, reject) {
            var compileCommand = "npx -p typescript tsc '" + absoluteTsPath + "' --rootDir / --outDir '" + cacheDir + "' " + flags.join(' ');
            logger === null || logger === void 0 ? void 0 : logger.info("Compiling " + absoluteTsPath);
            logger === null || logger === void 0 ? void 0 : logger.debug("Command: " + compileCommand);
            childProcess.exec(compileCommand, function (err, stdout, stderr) {
                if (err) {
                    logger === null || logger === void 0 ? void 0 : logger.error(err);
                    reject(err);
                    return;
                }
                if (stdout.trim()) {
                    logger === null || logger === void 0 ? void 0 : logger.log(stdout);
                }
                if (stderr.trim()) {
                    logger === null || logger === void 0 ? void 0 : logger.error(stderr);
                    reject(stderr);
                    return;
                }
                resolve();
            });
        });
    };
    Compiler.prototype.wasModified = function (tsFilePath, jsFilePath) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, tsFileStat, jsFileStat;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, Promise.all([fs.promises.stat(tsFilePath), fs.promises.stat(jsFilePath)])];
                    case 1:
                        _a = __read.apply(void 0, [_b.sent(), 2]), tsFileStat = _a[0], jsFileStat = _a[1];
                        return [2 /*return*/, tsFileStat.mtimeMs > jsFileStat.mtimeMs];
                }
            });
        });
    };
    Compiler.defaults = {
        cacheDir: path.resolve(__dirname, "../cache"),
        flags: [
            "--downlevelIteration",
            "--emitDecoratorMetadata",
            "--experimentalDecorators",
            "--module commonjs",
            "--resolveJsonModule",
            "--skipLibCheck",
            "--target es2015",
        ]
    };
    return Compiler;
}());
exports.Compiler = Compiler;
exports.tsImport = new Compiler();
