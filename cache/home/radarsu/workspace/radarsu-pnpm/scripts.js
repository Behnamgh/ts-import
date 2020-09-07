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
// Do not import custom libraries here, they won't load. Instead import them dynamically.
const git_1 = require("@radrat-scripts/git");
const workspace_1 = require("@radrat-scripts/workspace");
const scripts = (cli) => __awaiter(void 0, void 0, void 0, function* () {
    // Loads all scripts from nested workspaces and utilities.
    yield workspace_1.workspaceScripts(cli);
    // Loads git utility scripts.
    yield git_1.gitScripts(cli);
    // Custom commands.
    yield cli.command({
        name: `global.install`,
        executeString: `pnpm i -g @angular/cli @capacitor/cli @ionic/cli @nestjs/cli cordova pm2 prettier ts-node typescript`,
        hiddenFromHelp: true,
        ignorePackageJsonName: true,
    });
    yield cli.command({
        name: `global.clean`,
        executeString: [`pnpm i`, `rm -rf ./@/node/ts-import/cache`, `rr`].join(' && '),
        hiddenFromHelp: true,
        ignorePackageJsonName: true,
    });
    yield cli.command({
        name: `public.build`,
        executeString: [`rr ts-options-defaults.build`, `rr ts-timeout-promise.build`, `rr types-package-json.build`].join(' && '),
        hiddenFromHelp: true,
        ignorePackageJsonName: true,
    });
    yield cli.command({
        name: `public.publish`,
        executeString: [
            `rr ts-options-defaults.version.patch`,
            `rr ts-timeout-promise.version.patch`,
            `rr types-package-json.version.patch`,
            `rr ts-import.version.patch`,
            `rr git.push`,
            `rr ts-options-defaults.publish`,
            `rr ts-timeout-promise.publish`,
            `rr types-package-json.publish`,
            `rr ts-import.publish`,
        ].join(' && '),
        hiddenFromHelp: true,
        ignorePackageJsonName: true,
    });
    yield cli.command({
        name: `@radrat.build`,
        executeString: `rr all.run -c=build -f=@radrat-*/* && rr all.run -c=build -f=@radrat/*`,
        hiddenFromHelp: true,
        ignorePackageJsonName: true,
    });
    yield cli.command({
        name: `@radrat.publish`,
        executeString: [
            `rr all.run -c=version.prerelease -f=@radrat-*/*`,
            `rr all.run -c=version.prerelease -f=@radrat/*`,
            `rr git.push`,
            `rr all.run -c=publish -f=@radrat-*/*`,
            `rr all.run -c=publish -f=@radrat/*`,
        ].join(' && '),
        hiddenFromHelp: true,
        ignorePackageJsonName: true,
    });
});
exports.default = scripts;
