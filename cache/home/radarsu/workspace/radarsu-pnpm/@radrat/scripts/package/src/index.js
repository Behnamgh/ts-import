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
exports.packageScripts = void 0;
const fs = require("fs");
const build_1 = require("./build");
const publish_1 = require("./publish");
exports.packageScripts = (cli) => __awaiter(void 0, void 0, void 0, function* () {
    // Bump all versions.
    yield cli.command({
        name: `version.prerelease`,
        description: `Bump version of package.`,
        hiddenFromHelp: true,
        executeString: `pnpm version prerelease`,
    });
    yield cli.command({
        name: `version.patch`,
        description: `Bump version of package.`,
        hiddenFromHelp: true,
        executeString: `pnpm version patch`,
    });
    // Build.
    const buildCommand = `${cli.packageJson.name}.build`;
    if (!cli.data.commands[buildCommand]) {
        // If cli.path has scripts - use them, otherwise use default builder/publisher.
        const buildScript = {
            name: `build`,
            description: `Build project.`,
        };
        if (fs.existsSync(`${cli.path}/scripts/build.ts`)) {
            buildScript.executeString = `ts-node ./scripts/build.ts`;
        }
        else {
            buildScript.execute = () => __awaiter(void 0, void 0, void 0, function* () {
                return build_1.build(cli);
            });
        }
        yield cli.command(buildScript);
    }
    // Publish.
    const publishCommand = `${cli.packageJson.name}.publish`;
    if (!cli.data.commands[publishCommand]) {
        const publishScript = {
            name: `publish`,
            description: `Publish project to npm.`,
            hiddenFromHelp: true,
        };
        if (fs.existsSync(`${cli.path}/scripts/publish.ts`)) {
            publishScript.executeString = `ts-node ./scripts/publish.ts`;
        }
        else {
            publishScript.execute = () => __awaiter(void 0, void 0, void 0, function* () {
                return publish_1.publish(cli);
            });
        }
        yield cli.command(publishScript);
    }
    // Auto-publish.
    const publishAutoCommand = `${cli.packageJson.name}.publish-auto`;
    if (!cli.data.commands[publishAutoCommand]) {
        yield cli.command({
            name: `publish.auto`,
            description: `Publish project to npm.`,
            executeString: `rr ${cli.packageJson.name}.build && rr ${cli.packageJson.name}.version.patch && rr git.push && rr ${cli.packageJson.name}.publish`,
            processDirectory: true,
            hiddenFromHelp: true,
        });
    }
});
exports.default = exports.packageScripts;
