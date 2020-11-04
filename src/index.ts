import * as childProcess from "child_process";
import * as fs from "fs";
import * as path from "path";
import { defaults } from "options-defaults";

export interface ICompilerOptions {
  logger?: Partial<Console>;
  cacheDir?: string;
  absoluteTsConfigPath?: string;
  flags?: string[];
}

export interface ICompilationContext {
  cwd: string;
  tsDir: string;
  tsPath: string;
}

/**
 * Compiles TypeScript file to JavaScript, stores it cached and reads js from cache if available.
 * @param scriptPath path to script to store in cache equivalent path.
 * @param cacheDir
 */
export class Compiler {
  static defaults = {
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

  options: ICompilerOptions & typeof Compiler.defaults;
  constructor(options?: ICompilerOptions) {
    this.options = defaults(Compiler.defaults, options);
  }

  /**
   * Compile scripts.ts to scripts.js, check cache.
   * @param scriptsDir
   */
  async compile(relativeTsPath: string = ``): Promise<any> {
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

    const compiled = await this.compileOrFail({ cwd, tsDir, tsPath }).catch(
      (err) => {
        // Change directory back to cwd to prevent side-effects on error.
        process.chdir(cwd);
        console.error(`ts-import: Error`, err);
        throw err;
      }
    );

    // Change directory back to cwd and return compiled.
    process.chdir(cwd);
    return compiled;
  }

  async compileOrFail(ctx: ICompilationContext) {
    const { logger } = this.options;
    const { tsDir, tsPath } = ctx;

    const tsFileName = path.basename(tsPath);
    const jsFileName = tsFileName.replace(/\.[^/.]+$/, `.js`);

    const cacheDir = path.resolve(this.options.cacheDir, `.${tsDir}`);
    const cachedFile = path.resolve(cacheDir, jsFileName);

    // Check if cached scripts.js exist.
    logger?.debug(`Looking for cached file at ${cachedFile}`);
    if (fs.existsSync(cachedFile)) {
      // Cache is correct, do nothing.
      const tsWasModified = await this.wasModified(tsPath, cachedFile);
      if (!tsWasModified) {
        logger?.debug(`File was not modified, importing.`);
        const compiled = await import(cachedFile);
        return compiled;
      }

      // Cache is incorrect, rebuild.
      logger?.debug(`File was modified, building and importing.`);
      await this.buildCache(tsPath);
      const compiled = await import(cachedFile);
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
    await this.buildCache(tsPath);
    const compiled = await import(cachedFile);
    return compiled;
  }

  buildCache(absoluteTsPath: string) {
    const { flags, cacheDir, logger } = this.options;

    // Compile new scripts.ts to .js.
    return new Promise((resolve, reject) => {
      const compileCommand = this.options.absoluteTsConfigPath
        ? `npx -p typescript tsc --project ${this.options.absoluteTsConfigPath}`
        : `npx -p typescript tsc '${absoluteTsPath}' --rootDir / --outDir '${cacheDir}' ${flags.join(
            " "
          )}`;

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

        if (stderr.trim() && !stderr.toString().includes("npx: installed")) {
          logger?.error(stderr);
          reject(stderr);
          return;
        }

        resolve();
      });
    });
  }

  async wasModified(tsFilePath: string, jsFilePath: string) {
    const [tsFileStat, jsFileStat] = await Promise.all([
      fs.promises.stat(tsFilePath),
      fs.promises.stat(jsFilePath),
    ]);
    return tsFileStat.mtimeMs > jsFileStat.mtimeMs;
  }
}

export const tsImport = new Compiler();
