export interface ICompilerOptions {
    logger?: Partial<Console>;
    cacheDir?: string;
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
export declare class Compiler {
    static defaults: {
        cacheDir: string;
        flags: string[];
    };
    options: ICompilerOptions & typeof Compiler.defaults;
    constructor(options?: ICompilerOptions);
    /**
     * Compile scripts.ts to scripts.js, check cache.
     * @param scriptsDir
     */
    compile(relativeTsPath?: string): Promise<any>;
    compileOrFail(ctx: ICompilationContext): Promise<any>;
    buildCache(absoluteTsPath: string): Promise<unknown>;
    wasModified(tsFilePath: string, jsFilePath: string): Promise<boolean>;
}
export declare const tsImport: Compiler;
