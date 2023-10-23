import { InvokeCommand, InvokeCommandInput, InvokeCommandOutput, LambdaClient } from '@aws-sdk/client-lambda';
import * as vscode from 'vscode';
import { AwsData, InvokeData, LambdaData } from '../intefaces/lambda-data.interface';
import { InvokeHtml } from './invoke.html';
import { ExtensionView } from './extension-view';
import { WorkspaceService } from '../services/worskpace.service';
import { AwsService } from '../services/aws.service';

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

    private invokeLambdaAws(data: string, lambdaData: LambdaData): void {
        try {
            data = data.replaceAll('\n', '');
            data = data.replaceAll('\t', '');

            this.panel!.webview!.html = this.invokeHtml.getWebViewHtml(lambdaData, undefined, true);
            const input: InvokeCommandInput = {
                FunctionName: lambdaData.functionName,
                InvocationType: "RequestResponse",
                Payload: Buffer.from(JSON.stringify(JSON.parse(data)), "utf8"),
            };
            const command = new InvokeCommand(input);

            // ************************************************ //
            // ************************************************ //
            // ************************************************ //
            // ************************************************ //
              // PROFILE E REGION

            // ************************************************ //
            // ************************************************ //
            // ************************************************ //

            const client = new LambdaClient({ region: "us-east-1" });
            client.send(command).then((response: any) => {
                const responsePayload = JSON.parse(Buffer.from(response.Payload!).toString());
                console.log('responsePayload => ' + JSON.stringify(responsePayload, undefined, 2));
                // vscode.window.showInformationMessage(JSON.stringify(response, undefined, 2));
                this.panel!.webview!.html = this.invokeHtml.getWebViewHtml(lambdaData, responsePayload, false);
            });
            // const res : InvokeCommandOutput = await client.send(command);
        } catch (e) {
            console.error("error triggering function", e as Error);
        }
    }

}