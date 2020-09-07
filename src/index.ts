import * as childProcess from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { defaults } from 'ts-options-defaults';

export interface ICompilerOptions {
    logger?: Partial<Console>;
    cacheDir?: string;
    flags?: string[];
}

/**
 * Compiles TypeScript file to JavaScript, stores it cached and reads js from cache if available.
 * @param scriptPath path to script to store in cache equivalent path.
 * @param cacheDir
 */
export class Compiler {
    static defaultCacheDir = path.resolve(__dirname, `../cache`);
    static defaults = {
        cacheDir: Compiler.defaultCacheDir,
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

    options: ICompilerOptions & typeof Compiler.defaults;
    constructor(options?: ICompilerOptions) {
        this.options = defaults(Compiler.defaults, options);
    }

    /**
     * Compile scripts.ts to scripts.js, check cache.
     * @param scriptsDir
     */
    async compile(tsPath: string = ``): Promise<any> {
        const { logger } = this.options;

        const absoluteTsPath = path.resolve(process.cwd(), tsPath);
        if (!fs.existsSync(tsPath)) {
            throw new Error(`File ${tsPath} not found to compile.`);
        }

        const absoluteTsDir = path.dirname(absoluteTsPath);

        const tsFileName = path.basename(absoluteTsPath);
        const jsFileName = tsFileName.replace(/\.[^/.]+$/, `.js`);

        const cacheDir = path.resolve(this.options.cacheDir, `.${absoluteTsDir}`);
        const cachedFile = path.resolve(cacheDir, jsFileName);

        // Switch directory to scripts.ts to resolve node_modules during require.
        const cwd = process.cwd();
        process.chdir(absoluteTsDir);

        // Check if cached scripts.js exist.
        logger?.debug(`Looking for cached file at ${cachedFile}`);
        if (fs.existsSync(cachedFile)) {
            // Cache is correct, do nothing.
            const tsWasModified = await this.wasModified(absoluteTsPath, cachedFile);
            if (!tsWasModified) {
                logger?.debug(`File was not modified, importing.`);
                const compiled = await import(cachedFile);
                process.chdir(cwd);
                return compiled;
            }

            // Cache is incorrect, rebuild.
            logger?.debug(`File was modified, building and importing.`);
            await this.buildCache(absoluteTsPath);
            const compiled = await import(cachedFile);
            process.chdir(cwd);
            return compiled;
        }

        // Create cache directory if it does not exist.
        if (!fs.existsSync(cacheDir)) {
            logger?.debug(`Creating cache directory.`);
            fs.mkdirSync(cacheDir, {
                recursive: true,
            });
        }

        // Build cache.
        logger?.debug(`File was not cached, caching...`);
        await this.buildCache(absoluteTsPath);
        const compiled = await import(cachedFile);
        process.chdir(cwd);
        return compiled;
    }

    buildCache(absoluteTsPath: string) {
        const { flags, cacheDir, logger } = this.options;

        // Compile new scripts.ts to .js.
        return new Promise((resolve, reject) => {
            const compileCommand = `pnpx tsc ${absoluteTsPath} --rootDir / --outDir ${cacheDir} ${flags.join(' ')}`;
            logger?.info(`Compiling ${absoluteTsPath}`);
            logger?.debug(`Command: ${compileCommand}`);

            childProcess.exec(compileCommand, (err, stdout, stderr) => {
                if (err) {
                    logger?.error(err);
                    reject(err);
                    return;
                }

                if (stdout.trim()) {
                    logger?.log(stdout);
                }

                if (stderr.trim()) {
                    logger?.error(stderr);
                    reject(stderr);
                    return;
                }

                resolve();
            });
        });
    }

    async wasModified(tsFilePath: string, jsFilePath: string) {
        const [tsFileStat, jsFileStat] = await Promise.all([fs.promises.stat(tsFilePath), fs.promises.stat(jsFilePath)]);
        return tsFileStat.mtimeMs > jsFileStat.mtimeMs;
    }
}

export const tsImport = new Compiler();
