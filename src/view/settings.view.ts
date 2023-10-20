import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { load } from "js-yaml";
import { SettingHtml } from './settings.html';
import { SettingsConfig } from '../intefaces/settings-config.interface';
import { AwsData } from '../intefaces/lambda-data.interface';

export class SettingsView {

    settingsHtml: SettingHtml;
    logoPath;

    constructor(private context: vscode.ExtensionContext) {
        this.settingsHtml = new SettingHtml();
        this.logoPath = vscode.Uri.joinPath(context.extensionUri, 'resources', 'ext_red.png');
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
        this.panel = vscode.window.createWebviewPanel('settings', 'Workspace Settings', vscode.ViewColumn.One,
            { enableScripts: true, retainContextWhenHidden: true });

        this.panel.webview.html = this.getWebContentSettings();
        this.panel.iconPath = this.panel?.webview.asWebviewUri(vscode.Uri.joinPath(this.context.extensionUri, 'resources', 'icon.jpg'));

        this.panel.webview.onDidReceiveMessage(
            message => {
                let stageList: string[];
                switch (message.command) {
                    case 'save':
                        this.context.workspaceState.update('prefixName', message.text);
                        this.context.workspaceState.update('isExtesionConfigured', true);
                        vscode.commands.executeCommand('setContext', 'isExtesionConfigured', true);
                        vscode.commands.executeCommand('lambdasView.refresh');
                        vscode.window.showInformationMessage('Data saved!');
                        break;
                    case 'addNewProfile':
                        this.addNewProfile(message.profileName);
                        this.panel!.webview.html = this.getWebContentSettings();
                        break;
                    case 'removeProfile':
                        this.removeAwsProfile(message.profileName).finally(() => {
                            this.panel!.webview.html = this.getWebContentSettings();
                        });
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
                    case 'updateProfile':
                        this.updateProfileName(message.profileName).then(() => {
                            this.panel!.webview.html = this.getWebContentSettings();
                        });
                        break;
                    case 'changeRegion':
                        this.changeRegion().then(() => {
                            vscode.window.showInformationMessage('Region Changed!');
                            this.panel!.webview.html = this.getWebContentSettings();
                        });
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

    async changeRegion(): Promise<void> {
        const newAwsRegion = await vscode.window.showInputBox({ title: 'Inform new AWS region code(ex: us-east-1):' });
        this.context.workspaceState.update('awsRegion', newAwsRegion);
        vscode.commands.executeCommand('lambdasView.refresh');
    }

    async updateProfileName(oldProfileName: string): Promise<void> {
        const newProfileName = await vscode.window.showInputBox({ title: 'Inform new profile name for ' + oldProfileName + ':' });
        if (newProfileName) {
            let workspaceData = this.context.workspaceState.get('workspaceData') as AwsData[];
            if (!workspaceData || workspaceData.length < 1) {
                const awsData: AwsData = {
                    profileName: newProfileName
                };
                workspaceData = [awsData];
            } else {
                workspaceData.forEach(awsData => {
                    if (awsData.profileName === oldProfileName) {
                        awsData.profileName = newProfileName;
                    }
                });
            }
            this.context.workspaceState.update('workspaceData', workspaceData);
            vscode.window.showInformationMessage('Profile name updated!');
        }
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
        let awsRegion: string | undefined = this.context.workspaceState.get('awsRegion');
        if (!awsRegion) {
            awsRegion = 'us-east-1';
            this.context.workspaceState.update('awsRegion', awsRegion);
        }

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
            logTimeString,
            awsRegion
        };
    }

    private getWebContentSettings() {
        const config = this.getConfigs();
        const logoScr = this.panel?.webview.asWebviewUri(this.logoPath);
        return this.settingsHtml.getWebContentSettings(config, this.getAwsProfileList(), logoScr!);
    }

    private getAwsProfileList(): string[] {
        const workspaceData = this.context.workspaceState.get('workspaceData') as AwsData[];
        let awsProfileList = workspaceData?.map((awsProfile) => awsProfile.profileName);
        if (!awsProfileList || awsProfileList.length === 0) {
            awsProfileList = ['default'];
        }
        return awsProfileList;
    }

    private async removeAwsProfile(profileName: string): Promise<void> {
        const response = await vscode.window.showWarningMessage("Are you sure you want to delete " + profileName + " profile? This will delete all data related.", "Yes", "No");
        if (response && response === "Yes"){
            let workspaceData = this.context.workspaceState.get('workspaceData') as AwsData[];
            workspaceData = workspaceData.filter(item => item.profileName !== profileName) ;
            this.context.workspaceState.update('workspaceData', workspaceData);
        }
    }

    private addNewProfile(newProfileName: string): void {
        let workspaceData = this.context.workspaceState.get('workspaceData') as AwsData[];
        const existingProfileList = workspaceData?.filter((awsProfile) => awsProfile.profileName === newProfileName);
        if (!existingProfileList || existingProfileList.length === 0) {
            const awsData: AwsData = {
                profileName: newProfileName
            };
            if (workspaceData) {
                workspaceData.push(awsData);
            } else {
                workspaceData = [awsData];
            }
            this.context.workspaceState.update('workspaceData', workspaceData);
        } else if (existingProfileList) {
            vscode.window.showErrorMessage(newProfileName + ' already exists.');
        }
    }

}