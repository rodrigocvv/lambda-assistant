import * as vscode from 'vscode';
import { AwsData, LambdaData } from '../intefaces/lambda-data.interface';
import { ExtensionView } from './extension-view';
import { FunctionsSettingsHtml } from './function-settings.html';
import { WorkspaceService } from '../services/worskpace.service';

export class FunctionSettingsView extends ExtensionView {

    functionSettingsHtml: FunctionsSettingsHtml;
    workspaceService: WorkspaceService;

    constructor() {
        super();
        this.functionSettingsHtml = new FunctionsSettingsHtml();
        this.workspaceService = new WorkspaceService();
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
        this.getContext().subscriptions.push(openFunctionsSettingsButonDisposable);
    }

    private createPanel(lambdaData: LambdaData) {
        this.panel = vscode.window.createWebviewPanel('functionSettings', 'Function Settings', vscode.ViewColumn.One,
            { enableScripts: true });

        this.panel.webview.html = this.functionSettingsHtml.getWebViewHtml(lambdaData);
        this.panel.iconPath = this.iconPath;

        this.panel.webview.onDidReceiveMessage(
            message => {
                switch (message.command) {
                    case 'save':
                        this.workspaceService.setServerlessName(lambdaData.functionName, message.text.trim());
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

}