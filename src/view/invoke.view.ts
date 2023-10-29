import * as vscode from 'vscode';
import { LambdaData } from '../interfaces/lambda-data.interface';
import { AwsService } from '../services/aws.service';
import { WorkspaceService } from '../services/worskpace.service';
import { ExtensionView } from './extension-view';
import { InvokeHtml } from './invoke.html';

export class InvokeView extends ExtensionView {

    invokeHtml: InvokeHtml;
    workspaceService: WorkspaceService;
    awsService: AwsService;

    constructor() {
        super();
        this.workspaceService = new WorkspaceService();
        this.awsService = new AwsService();
        this.invokeHtml = new InvokeHtml();
    }

    panel: vscode.WebviewPanel | undefined;

    public openView(lambdaData: LambdaData) {
        if (this.panel) {
            this.panel?.dispose();
        }
        this.createPanel(lambdaData);
    }

    public registerOpenInvokeViewButton(viewId: string): void {
        let invokeButonDisposable = vscode.commands.registerCommand(viewId, async (lambdaItem) => {
            this.openView(lambdaItem.lambdaData);
        });
        this.getContext().subscriptions.push(invokeButonDisposable);
    }

    public registerOpenInvokeViewCommand(viewId: string): void {
        let invokeButonDisposable = vscode.commands.registerCommand(viewId, async (lambdaData) => {
            this.openView(lambdaData);
        });
        this.getContext().subscriptions.push(invokeButonDisposable);
    }

    private createPanel(lambdaData: LambdaData) {
        this.panel = vscode.window.createWebviewPanel('Invoke' + lambdaData.functionName, 'Invoke ' + lambdaData.functionName, vscode.ViewColumn.One,
            {
                enableScripts: true,
                retainContextWhenHidden: true
            });

        this.panel.iconPath = this.iconPath;
        this.panel.webview.html = this.invokeHtml.getWebViewHtml(lambdaData, undefined, false);

        this.panel.webview.onDidReceiveMessage(
            message => {
                switch (message.command) {
                    case 'refresh':
                        this.panel!.webview.html = this.invokeHtml.getWebViewHtml(lambdaData, undefined, false);
                        break;
                    case 'changeName':
                        this.invokeHtml.selectedData = message.text;
                        this.panel!.webview.html = this.invokeHtml.getWebViewHtml(lambdaData, undefined, false);
                        break;
                    case 'invokeAws':
                        this.workspaceService.saveInvokeData(lambdaData.functionName, message.invokeName, message.text);
                        this.invokeLambdaAws(message.text, lambdaData);
                        break;
                    case 'invokeLocal':
                        this.workspaceService.saveInvokeData(lambdaData.functionName, message.invokeName, message.text);
                        this.awsService.invokeLambdaLocal(lambdaData.functionName, message.text);
                        break;
                    case 'addBookmark':
                        this.workspaceService.saveInvokeData(lambdaData.functionName, message.invokeName, message.text);
                        this.workspaceService.setBookmark(lambdaData.functionName, true);
                        vscode.commands.executeCommand('invokeBookmarkView.refresh');
                        this.panel!.webview!.html = this.invokeHtml.getWebViewHtml(lambdaData, undefined, false);
                        break;
                    case 'removeBookmark':
                        this.workspaceService.saveInvokeData(lambdaData.functionName, message.invokeName, message.text);
                        this.workspaceService.setBookmark(lambdaData.functionName, false);
                        vscode.commands.executeCommand('invokeBookmarkView.refresh');
                        this.panel!.webview!.html = this.invokeHtml.getWebViewHtml(lambdaData, undefined, false);
                        break;
                    case 'editServerlessName':
                        this.editServerlessName(lambdaData);
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

    private async editServerlessName(lambdaData: LambdaData): Promise<void> {
        const serverlessName = await vscode.window.showInputBox({ title: "Add identifier name to " + lambdaData.functionName + " defined in you serverless.yml file under functions section: " });
        if (serverlessName) {
            this.workspaceService.setServerlessName(lambdaData.functionName, serverlessName);
            vscode.commands.executeCommand('lambdasView.updateView');
            this.panel!.webview!.html = this.invokeHtml.getWebViewHtml(this.workspaceService.getLambdaByName(lambdaData.functionName)!, undefined, false);
        }
    }

    private async invokeLambdaAws(data: string, lambdaData: LambdaData): Promise<void> {
        try {
            this.panel!.webview!.html = this.invokeHtml.getWebViewHtml(lambdaData, undefined, true);
            const responsePayload = await this.awsService.invokeLambdaAws(lambdaData.functionName, data);
            this.panel!.webview!.html = this.invokeHtml.getWebViewHtml(lambdaData, responsePayload, false);
        } catch (e: any) {
            console.error(e);
            this.panel!.webview!.html = this.invokeHtml.getWebViewHtml(lambdaData, undefined, false);
            vscode.window.showErrorMessage('Error invoking lambda from aws.');
        }
    }

}