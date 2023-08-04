import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { load } from "js-yaml";

export class SettingsView {

    constructor(private context: vscode.ExtensionContext) { }

    panel: vscode.WebviewPanel | undefined;

    public openView() {
        if (!this.panel) {
            this.createPanel();
        }
    }

    private createPanel() {
        this.panel = vscode.window.createWebviewPanel('settings', 'Lambda Assistant Settings', vscode.ViewColumn.One,
            { enableScripts: true });

        this.panel.webview.html = this.getWebContentSettings();

        this.panel.webview.onDidReceiveMessage(
            message => {
                let stageList: string[];
                switch (message.command) {
                    case 'save':
                        this.context.workspaceState.update('prefixName', message.text);
                        this.context.workspaceState.update('isExtesionConfigured', true);
                        vscode.commands.executeCommand('lambdasView.refresh');
                        this.panel?.dispose();
                        break;
                    case 'addStageSupport':
                        this.context.workspaceState.update('stageSupport', message.text);
                        vscode.commands.executeCommand('setContext', 'stageSupport', message.text);
                        if (this.panel) {
                            this.panel.webview.html = this.getWebContentSettings();
                        }
                        break;
                    case 'addStage':
                        stageList = this.context.workspaceState.get('stageList') || [];
                        stageList.push(message.text);
                        this.context.workspaceState.update('stageList', stageList);
                        // vscode.commands.executeCommand('lambdasView.refresh');
                        if (this.panel) {
                            this.panel.webview.html = this.getWebContentSettings();
                        }
                        break;
                    case 'deleteStage':
                        stageList = this.context.workspaceState.get('stageList') || [];
                        stageList = stageList.filter(stage => stage !== message.text);
                        this.context.workspaceState.update('stageList', stageList);
                        if (this.panel) {
                            this.panel.webview.html = this.getWebContentSettings();
                        }
                        break;

                    case 'test':
                        console.log('valor => ' + message.text);
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

    private getConfigs() {
        let prefixName = this.context.workspaceState.get('prefixName');
        let stageSupport: boolean = this.context.workspaceState.get('stageSupport') || false;
        const serverlessSupport = this.getServerlessSuport();
        const stageList: string[] | undefined = this.context.workspaceState.get('stageList');
        if (!prefixName && serverlessSupport?.available) {
            prefixName = serverlessSupport.serviceName;
        }
        return {
            prefixName,
            serverlessSupport: serverlessSupport?.available,
            stageList,
            stageSupport
        };
    }

    private getWebContentSettings() {
        const config = this.getConfigs();
        return `
            <HTML>
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Settings</title>
                </head>
                <BODY>
                    <script>
                    const vscode = acquireVsCodeApi();
                    function removeStage(stage) {
                        vscode.postMessage({
                            command: 'deleteStage',
                            text: stage
                        });
                    }                                    
                    function save() {
                        vscode.postMessage({
                            command: 'save',
                            text: document.getElementById("prefix").value
                        });
                    }
                    function checkStage(){
                        var checked = document.getElementById("checkStage").checked;
                        vscode.postMessage({
                            command: 'addStageSupport',
                            text: checked
                        });
                    }
                    function addStage() {
                        vscode.postMessage({
                            command: 'addStage',
                            text: document.getElementById("newStageName").value
                        });
                    } 
                </script>
    
                    <center><h1>Lambda Assistant - Settings</h1></center>
                    <center>
                        <table>
                            <tr>
                                <td>Lambda Prefix Name</td>
                                <td><input type="text" id="prefix" value="${config.prefixName}"></td>
                            </tr>
                            <tr>
                                <td colspan=2></td>
                            </tr>
                        </table>
                        <table>
                            <tr>
                                <td><input type="checkbox" ${config.stageSupport ? 'checked' : ''} id="checkStage" onclick="checkStage()"></td>
                                <td>Add stages support</td>
                            </tr>
                        </table>
                        <table style="display: ${config.stageSupport ? '' : 'none'}">
                            <tr>
                                <td><input type="text" id="newStageName"></td>
                                <td><button onclick="addStage()">+</button></td>
                            </tr>
                            ${this.getStageListHtml(config.stageList)}
                        </table>


                        <br>
                        <button onclick="save()">Save</button>
                    </center>
                </BODY>
                <script>
                    checkStage();
                </script>
            </HTML>
        `;
    }

    private getStageListHtml(stageList: string[] | undefined): string {
        let html = '';
        stageList?.forEach((stage: string) => {
            html += `
            <tr>
                <td>${stage}</td>
                <td><button onclick="removeStage('${stage}')">-</button></td>
            </tr>
        `;
        });
        return html;
    }

}