import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { load } from "js-yaml";
import { SettingHtml } from './settings.html';
import { SettingsConfig } from '../intefaces/settings-config.interface';

export class SettingsView {

    settingsHtml: SettingHtml;

    constructor(private context: vscode.ExtensionContext) {
        this.settingsHtml = new SettingHtml();
    }

    panel: vscode.WebviewPanel | undefined;

    public registerOpenSettingsButton(viewId: string): void {
        let openSettingsButonDisposable = vscode.commands.registerCommand(viewId, async () => {
            this.openView();
        });
        this.context.subscriptions.push(openSettingsButonDisposable);
    }

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
                        vscode.commands.executeCommand('setContext', 'isExtesionConfigured', true);
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
                    case 'addServerlessSupport':
                        this.context.workspaceState.update('serverlessSupport', message.text);
                        vscode.commands.executeCommand('setContext', 'serverlessSupport', message.text);
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

    private getConfigs(): SettingsConfig {
        let prefixName: string = this.context.workspaceState.get('prefixName') || '';
        let logTimeString: string = this.context.workspaceState.get('logTimeString') || '4h';
        const servelessDeployParams: string = this.context.workspaceState.get('servelessDeployParams') || '';
        let stageSupport: boolean = this.context.workspaceState.get('stageSupport') || false;
        const serverlessSupport = this.getServerlessSuport();
        const stageList: string[] | undefined = this.context.workspaceState.get('stageList');
        if (!prefixName && serverlessSupport?.available) {
            prefixName = serverlessSupport.serviceName;
        }
        return {
            prefixName,
            serverlessSupport: serverlessSupport?.available as boolean || false,
            stageList: stageList || [],
            stageSupport,
            servelessDeployParams,
            logTimeString
        };
    }

    private getWebContentSettings() {
        const config = this.getConfigs();
        return this.settingsHtml.getWebContentSettings(config);
    }



}