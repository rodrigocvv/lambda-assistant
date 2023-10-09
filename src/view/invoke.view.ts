import { InvokeCommand, InvokeCommandInput, InvokeCommandOutput, LambdaClient } from '@aws-sdk/client-lambda';
import * as vscode from 'vscode';
import { InvokeData, LambdaData } from '../intefaces/lambda-data.interface';
import { InvokeHtml } from './invoke.html';

export class InvokeView {

    invokeHtml: InvokeHtml;

    constructor(private context: vscode.ExtensionContext) {
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
        this.context.subscriptions.push(invokeButonDisposable);
    }


    private createPanel(lambdaData: LambdaData) {
        this.panel = vscode.window.createWebviewPanel('Invoke' + lambdaData.functionName, 'Invoke ' + lambdaData.functionName, vscode.ViewColumn.One,
            {
                enableScripts: true,
                retainContextWhenHidden: true
            });

        // this.panel!.webview!.html = this.invokeHtml.getLoader();
        this.panel.webview.html = this.invokeHtml.getWebViewHtml(lambdaData, undefined);

        this.panel.webview.onDidReceiveMessage(
            message => {
                let localLambdaList = this.context.workspaceState.get('lambdaList') as LambdaData[];
                const lambdaLocal = localLambdaList.find((item) => item.functionName === lambdaData.functionName);

                switch (message.command) {

                    case 'changeName':
                        this.invokeHtml.selectedData = message.text;
                        this.panel!.webview.html = this.invokeHtml.getWebViewHtml(lambdaLocal!, undefined);
                        break;
                    case 'invokeAws':
                        this.saveInvoke(localLambdaList, lambdaLocal!, message.text, message.invokeName);
                        this.invokeLambdaAws(message.text, lambdaData);
                        break;
                    case 'invokeLocal':
                        this.saveInvoke(localLambdaList, lambdaLocal!, message.text, message.invokeName);
                        this.invokeLambdaLocal(message.text, lambdaData);
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

    private invokeLambdaLocal(data: string, lambdaData: LambdaData): void {
        if (lambdaData.serverlessName) {
            data = data.replaceAll('\n', '');
            data = data.replaceAll('\t', '');
            const terminal = vscode.window.createTerminal('Invoke: ' + lambdaData.functionName);
            const stageSupport = this.context.workspaceState.get('stageSupport');
            const currentStage = this.context.workspaceState.get('currentStage');
            terminal.sendText(`serverless invoke local -f ${lambdaData.serverlessName} ${stageSupport ? '--stage ' + currentStage : ''} --data ${JSON.stringify(data)}`);
            terminal.show();
        } else {
            vscode.window.showErrorMessage("For this operation you need to configure your function name(defined in serverless yaml) in functions settings.");
        }
    }

    private saveInvoke(localLambdaList: LambdaData[], lambdaLocal: LambdaData, data: string, invokeName: string): void {
        const invokeData: InvokeData = {
            data,
            name: invokeName
        };
        if (lambdaLocal.invokeData) {
            const oldData = lambdaLocal!.invokeData.find(obj => obj.name === invokeData.name);
            if (oldData) {
                oldData.data = data;
            } else {
                lambdaLocal!.invokeData.push(invokeData);
            }
        } else {
            lambdaLocal!.invokeData = [invokeData];
        }
        // console.log('lambdaLocal => ' + JSON.stringify(lambdaLocal, undefined, 2));
        // console.log('localLambdaList => ' + JSON.stringify(localLambdaList, undefined, 2));
        this.context.workspaceState.update('lambdaList', localLambdaList);
    }

    private invokeLambdaAws(data: string, lambdaData: LambdaData): void {
        try {
            data = data.replaceAll('\n', '');
            data = data.replaceAll('\t', '');

            this.panel!.webview!.html = this.invokeHtml.getLoader();
            const input: InvokeCommandInput = {
                FunctionName: lambdaData.functionName,
                InvocationType: "RequestResponse",
                Payload: Buffer.from(JSON.stringify(JSON.parse(data)), "utf8"),
            };

            const command = new InvokeCommand(input);
            const client = new LambdaClient({ region: "us-east-1" });
            client.send(command).then((response: InvokeCommandOutput) => {
                const responsePayload = JSON.parse(Buffer.from(response.Payload!).toString());
                console.log('responsePayload => ' + JSON.stringify(responsePayload, undefined, 2));
                // vscode.window.showInformationMessage(JSON.stringify(response, undefined, 2));
                this.panel!.webview!.html = this.invokeHtml.getWebViewHtml(lambdaData, responsePayload);
            });
            // const res : InvokeCommandOutput = await client.send(command);
        } catch (e) {
            console.error("error triggering function", e as Error);
        }
    }






}