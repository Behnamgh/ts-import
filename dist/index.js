"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tsImport = exports.Compiler = void 0;
const childProcess = __importStar(require("child_process"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const options_defaults_1 = require("options-defaults");
/**
 * Compiles TypeScript file to JavaScript, stores it cached and reads js from cache if available.
 * @param scriptPath path to script to store in cache equivalent path.
 * @param cacheDir
 */
class Compiler {
    constructor(options) {
        this.options = options_defaults_1.defaults(Compiler.defaults, options);
    }
    /**
     * Compile scripts.ts to scripts.js, check cache.
     * @param scriptsDir
     */
    async compile(relativeTsPath = ``) {
        // Check if file exists.
        const cwd = process.cwd();
        const tsPath = path.resolve(cwd, relativeTsPath);
        if (!fs.existsSync(tsPath)) {
            throw new Error(`File ${tsPath} not found to compile.`);
        }
        // Get file name and directory path.
        const tsDir = path.dirname(tsPath);
        // Switch directory to scripts.ts to resolve node_modules during require.
        process.chdir(tsDir);
        const compiled = await this.compileOrFail({ cwd, tsDir, tsPath }).catch((err) => {
            // Change directory back to cwd to prevent side-effects on error.
            process.chdir(cwd);
            console.error(`ts-import: Error`, err);
            throw err;
        });
        // Change directory back to cwd and return compiled.
        process.chdir(cwd);
        return compiled;
    }
    async compileOrFail(ctx) {
        const { logger } = this.options;
        const { tsDir, tsPath } = ctx;
        const tsFileName = path.basename(tsPath);
        const jsFileName = tsFileName.replace(/\.[^/.]+$/, `.js`);
        const cacheDir = path.resolve(this.options.cacheDir, `.${tsDir}`);
        const cachedFile = path.resolve(cacheDir, jsFileName);
        // Check if cached scripts.js exist.
        logger === null || logger === void 0 ? void 0 : logger.debug(`Looking for cached file at ${cachedFile}`);
        if (fs.existsSync(cachedFile)) {
            // Cache is correct, do nothing.
            const tsWasModified = await this.wasModified(tsPath, cachedFile);
            if (!tsWasModified) {
                logger === null || logger === void 0 ? void 0 : logger.debug(`File was not modified, importing.`);
                const compiled = await Promise.resolve().then(() => __importStar(require(cachedFile)));
                return compiled;
            }
            // Cache is incorrect, rebuild.
            logger === null || logger === void 0 ? void 0 : logger.debug(`File was modified, building and importing.`);
            await this.buildCache(tsPath);
            const compiled = await Promise.resolve().then(() => __importStar(require(cachedFile)));
            return compiled;
        }
        // Create cache directory if it does not exist.
        if (!fs.existsSync(cacheDir)) {
            logger === null || logger === void 0 ? void 0 : logger.debug(`Creating cache directory.`);
            fs.mkdirSync(cacheDir, {
                recursive: true,
            });
        }
        // Build cache.
        logger === null || logger === void 0 ? void 0 : logger.debug(`File was not cached, caching...`);
        await this.buildCache(tsPath);
        const compiled = await Promise.resolve().then(() => __importStar(require(cachedFile)));
        return compiled;
    }
    buildCache(absoluteTsPath) {
        const { flags, cacheDir, logger } = this.options;
        // Compile new scripts.ts to .js.
        return new Promise((resolve, reject) => {
            const compileCommand = this.options.absoluteTsConfigPath ?
                `npx -p typescript tsc --project ${this.options.absoluteTsConfigPath}` :
                `npx -p typescript tsc '${absoluteTsPath}' --rootDir / --outDir '${cacheDir}' ${flags.join(' ')}`;
            logger === null || logger === void 0 ? void 0 : logger.info(`Compiling ${absoluteTsPath}`);
            logger === null || logger === void 0 ? void 0 : logger.debug(`Command: ${compileCommand}`);
            childProcess.exec(compileCommand, (err, stdout, stderr) => {
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
    }
    async wasModified(tsFilePath, jsFilePath) {
        const [tsFileStat, jsFileStat] = await Promise.all([fs.promises.stat(tsFilePath), fs.promises.stat(jsFilePath)]);
        return tsFileStat.mtimeMs > jsFileStat.mtimeMs;
    }
}
exports.Compiler = Compiler;
Compiler.defaults = {
    cacheDir: path.resolve(__dirname, `../cache`),
    flags: [
        `--downlevelIteration`,
        `--emitDecoratorMetadata`,
        `--experimentalDecorators`,
        `--module commonjs`,
        `--resolveJsonModule`,
        `--skipLibCheck`,
        `--target es2015`,
    ],
};
exports.tsImport = new Compiler();
