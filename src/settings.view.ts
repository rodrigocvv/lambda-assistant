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
                switch (message.command) {
                    case 'save':
                        this.context.workspaceState.update('prefixName', message.text);
                        this.context.workspaceState.update('isExtesionConfigured', true);
                        vscode.commands.executeCommand('lambdasView.refresh');
                        this.panel?.dispose();
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
        const serverlessSupport = this.getServerlessSuport();
        if (!prefixName && serverlessSupport?.available) {
            prefixName = serverlessSupport.serviceName;
        }
        return {
            prefixName,
            serverlessSupport: serverlessSupport?.available
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
                    function save() {
                        vscode.postMessage({
                            command: 'save',
                            text: document.getElementById("prefix").value
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
                        <br>
                        <button onclick="save()">Save</button>
                    </center>
                </BODY>
            </HTML>
        `;
    }

}