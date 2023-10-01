import * as fs from 'fs';
import { load } from "js-yaml";
import * as path from 'path';
import * as vscode from 'vscode';
import { InvokeHtml } from './invoke.html';
import { LambdaData } from '../lambda-data.interface';
import { InvokeCommand, InvokeCommandInput, InvokeCommandOutput, LambdaClient } from '@aws-sdk/client-lambda';

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

    private createPanel(lambdaData: LambdaData) {
        this.panel = vscode.window.createWebviewPanel('Invoke' + lambdaData.functionName, 'Invoke ' + lambdaData.functionName, vscode.ViewColumn.One,
            { enableScripts: true });

        this.panel.webview.html = this.invokeHtml.getWebViewHtml(lambdaData, undefined);

        this.panel.webview.onDidReceiveMessage(
            message => {
                switch (message.command) {
                    case 'save':
                        // console.log('message => ' + JSON.stringify(message, undefined, 2));
                        let data = message.text;
                        const isLocal = message.invokeLocal;
                        let localLambdaList = this.context.workspaceState.get('lambdaList') as LambdaData[];
                        // console.log('localLambdaList 1 => '+ JSON.stringify(localLambdaList, undefined, 2));
                        const lambdaLocal = localLambdaList.find((item) => item.functionName === lambdaData.functionName);
                        lambdaLocal!.invokeData = message.text && message.text.trim().length > 0 ? message.text : undefined;
                        // console.log('localLambdaList 2 => '+ JSON.stringify(localLambdaList, undefined, 2));
                        this.context.workspaceState.update('lambdaList', localLambdaList);
                        data = data.replaceAll('\n', '');
                        if (isLocal) {
                            const terminal = vscode.window.createTerminal('Invoke: ' + lambdaData.functionName);
                            const stageSupport = this.context.workspaceState.get('stageSupport')
                            const currentStage = this.context.workspaceState.get('currentStage');
                            terminal.sendText(`serverless invoke local -f ${lambdaData.serverlessName} ${stageSupport ? '--stage ' + currentStage : ''} --data ${JSON.stringify(data)}`);
                            terminal.show();
                        } else {
                            try {

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