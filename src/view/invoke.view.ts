import * as vscode from 'vscode';
import { Constants } from '../commons/constants';
import { Messages } from '../commons/messages';
import { Command } from '../enums/command.enum';
import { LambdaData } from '../interfaces/lambda-data.interface';
import { AwsService } from '../services/aws.service';
import { WorkspaceService } from '../services/worskpace.service';
import { ExtensionView } from './extension-view';
import { InvokeHtml } from './invoke.html';

export class InvokeView extends ExtensionView {
    invokeHtml: InvokeHtml;
    workspaceService: WorkspaceService;
    awsService: AwsService;
    lambdaData: LambdaData | undefined;

    constructor() {
        super();
        this.workspaceService = new WorkspaceService();
        this.awsService = new AwsService();
        this.invokeHtml = new InvokeHtml();
    }

    public registerOpenInvokeViewButtonCommand(viewId: string): void {
        let invokeButonDisposable = vscode.commands.registerCommand(viewId, async (lambdaItem) => {
            this.lambdaData = lambdaItem.lambdaData;
            this.openView(Constants.WEB_VIEW_ID_INVOKE, Constants.WEB_VIEW_ID_INVOKE + ' ' + lambdaItem.lambdaData.functionName, true);
            this.panel!.webview.html = this.invokeHtml.getWebViewHtml(lambdaItem.lambdaData, undefined, false);
        });
        this.getContext().subscriptions.push(invokeButonDisposable);
    }

    public registerOpenInvokeViewCommand(viewId: string): void {
        let invokeButonDisposable = vscode.commands.registerCommand(viewId, async (lambdaData) => {
            this.lambdaData = lambdaData;
            this.openView(Constants.WEB_VIEW_ID_INVOKE, Constants.WEB_VIEW_ID_INVOKE + ' ' + lambdaData.functionName, true);
            this.panel!.webview.html = this.invokeHtml.getWebViewHtml(lambdaData, undefined, false);
        });
        this.getContext().subscriptions.push(invokeButonDisposable);
    }

    async executeViewActions(message: any): Promise<void> {
        switch (message.command) {
            case Constants.ACTION_REFRESH:
                this.panel!.webview.html = this.invokeHtml.getWebViewHtml(this.lambdaData!, undefined, false);
                break;
            case Constants.ACTION_CHANGE_NAME:
                this.invokeHtml.selectedData = message.text;
                this.panel!.webview.html = this.invokeHtml.getWebViewHtml(this.lambdaData!, undefined, false);
                break;
            case Constants.ACTION_INVOKE_AWS:
                this.workspaceService.saveInvokeData(this.lambdaData!.functionName, message.invokeName, message.text);
                this.invokeLambdaAws(message.text, this.lambdaData!);
                break;
            case Constants.ACTION_INVOKE_LOCAL:
                this.workspaceService.saveInvokeData(this.lambdaData!.functionName, message.invokeName, message.text);
                this.awsService.invokeLambdaLocal(this.lambdaData!.functionName, message.text);
                break;
            case Constants.ACTION_ADD_BOOKMARK:
                this.workspaceService.saveInvokeData(this.lambdaData!.functionName, message.invokeName, message.text);
                this.workspaceService.setBookmark(this.lambdaData!.functionName, true);
                vscode.commands.executeCommand(Command.BOOKMARK_VIEW_REFRESH);
                this.panel!.webview!.html = this.invokeHtml.getWebViewHtml(this.lambdaData!, undefined, false);
                break;
            case Constants.ACTION_REMOVE_BOOKMARK:
                this.workspaceService.saveInvokeData(this.lambdaData!.functionName, message.invokeName, message.text);
                this.workspaceService.setBookmark(this.lambdaData!.functionName, false);
                vscode.commands.executeCommand(Command.BOOKMARK_VIEW_REFRESH);
                this.panel!.webview!.html = this.invokeHtml.getWebViewHtml(this.lambdaData!, undefined, false);
                break;
            case Constants.ACTION_EDIT_SERVERLESS_NAME:
                this.editServerlessName(this.lambdaData!);
                break;
        }
    }

    private async editServerlessName(lambdaData: LambdaData): Promise<void> {
        const serverlessName = await vscode.window.showInputBox({
            title: Messages.label.addServerlessName1 + lambdaData.functionName + Messages.label.addServerlessName2,
        });
        if (serverlessName) {
            this.workspaceService.setServerlessName(lambdaData.functionName, serverlessName);
            vscode.commands.executeCommand(Command.LAMBDA_VIEW_UPDATE_VIEW);
            this.panel!.webview!.html = this.invokeHtml.getWebViewHtml(
                this.workspaceService.getLambdaByName(lambdaData.functionName)!,
                undefined,
                false,
            );
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
            vscode.window.showErrorMessage(Messages.error.errorInvokeLambdaAws);
        }
    }
}
