import * as fs from 'fs';
import { load } from "js-yaml";
import * as path from 'path';
import * as vscode from 'vscode';
import { FunctionsSettingsHtml } from './function-settings.html';
import { LambdaData } from '../intefaces/lambda-data.interface';

export class FunctionSettingsView {

    functionSettingsHtml: FunctionsSettingsHtml;

    constructor(private context: vscode.ExtensionContext) {
        this.functionSettingsHtml = new FunctionsSettingsHtml();
    }

    panel: vscode.WebviewPanel | undefined;

    public openView(lambdaData: LambdaData) {
        if (!this.panel) {
            this.createPanel(lambdaData);
        }
    }

    public registerOpenFunctionSettingsButton(viewId: string): void {
        let openFunctionsSettingsButonDisposable = vscode.commands.registerCommand(viewId, async (lambdaItem) => {
            this.openView(lambdaItem.lambdaData);
        });
        this.context.subscriptions.push(openFunctionsSettingsButonDisposable);
    }

    private createPanel(lambdaData: LambdaData) {
        this.panel = vscode.window.createWebviewPanel('functionSettings', 'Function Settings', vscode.ViewColumn.One,
            { enableScripts: true });

        this.panel.webview.html = this.functionSettingsHtml.getWebViewHtml(lambdaData);

        this.panel.webview.onDidReceiveMessage(
            message => {
                switch (message.command) {
                    case 'save':
                        // serverlessName //message.text
                        let localLambdaList = this.context.workspaceState.get('lambdaList') as LambdaData[];
                        // console.log('localLambdaList 1 => '+ JSON.stringify(localLambdaList, undefined, 2));
                        const lambdaLocal = localLambdaList.find((item) => item.functionName === lambdaData.functionName);
                        lambdaLocal!.serverlessName = message.text && message.text.trim().length > 0 ? message.text : undefined;
                        // console.log('localLambdaList 2 => '+ JSON.stringify(localLambdaList, undefined, 2));
                        this.context.workspaceState.update('lambdaList', localLambdaList);
                        // vscode.commands.executeCommand('lambdasView.refresh');
                        this.panel?.dispose();
                        break;
                }
            },
            undefined,
            undefined
        );

        this.panel.onDidDispose(
            () => {
                this.panel = undefined;
            },
            null,
            undefined
        );
    }

    private getServerlessSuport() {
        let serverlessSupport = this.context.workspaceState.get('serverlessSupport');
        if (serverlessSupport == null || serverlessSupport == undefined) {
            if (vscode.workspace && vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders[0]) {
                const fileFolder = vscode?.workspace?.workspaceFolders[0]?.uri.fsPath;
                const filePath = path.join(fileFolder, 'serverless.yml');
                if (fs.existsSync(filePath)) {
                    const fileContent = fs.readFileSync(filePath, 'utf8');
                    const serviceName = (load(fileContent) as any).service;
                    return {
                        available: true,
                        serviceName
                    };
                } else {
                    return {
                        available: false
                    };
                }
            }
        }
        return {
            available: serverlessSupport
        };

    }

}