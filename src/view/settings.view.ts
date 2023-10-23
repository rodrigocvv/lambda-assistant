import * as vscode from 'vscode';
import { WorkspaceService } from '../services/worskpace.service';
import { ExtensionView } from './extension-view';
import { SettingHtml } from './settings.html';

export class SettingsView extends ExtensionView {

    settingsHtml: SettingHtml;
    workspaceService: WorkspaceService;

    constructor() {
        super();
        this.workspaceService = new WorkspaceService();
        this.settingsHtml = new SettingHtml();
    }

    panel: vscode.WebviewPanel | undefined;

    public registerOpenSettingsButton(viewId: string): void {
        let openSettingsButonDisposable = vscode.commands.registerCommand(viewId, async () => {
            this.openView();
        });
        this.getContext().subscriptions.push(openSettingsButonDisposable);
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
        this.panel.iconPath = this.iconPath;
        this.panel.webview.onDidReceiveMessage(
            message => {
                let stageList: string[];
                switch (message.command) {
                    case 'save':
                        this.workspaceService.setPrefix(message.text);
                        this.workspaceService.setExtensionConfigured();
                        vscode.commands.executeCommand('lambdasView.refresh');
                        vscode.window.showInformationMessage('Data saved!');
                        break;
                    case 'addNewProfile':
                        this.workspaceService.addNewProfile(message.profileName);
                        this.panel!.webview.html = this.getWebContentSettings();
                        break;
                    case 'removeProfile':
                        this.removeAwsProfile(message.profileName).finally(() => {
                            this.panel!.webview.html = this.getWebContentSettings();
                        });
                        break;
                    case 'addStageSupport':
                        this.workspaceService.setStageSupport(message.text);
                        this.panel!.webview.html = this.getWebContentSettings();
                        break;
                    case 'addStage':
                        this.workspaceService.addStage(message.text);
                        this.panel!.webview.html = this.getWebContentSettings();
                        break;
                    case 'deleteStage':
                        this.workspaceService.removeStage(message.text);
                        this.panel!.webview.html = this.getWebContentSettings();
                        break;
                    case 'updateProfile':
                        this.updateProfileName(message.profileName).then(() => {
                            this.panel!.webview.html = this.getWebContentSettings();
                        });
                        break;
                    case 'changeRegion':
                        this.changeRegion();
                        break;
                    case 'updateCliCommands':
                        this.workspaceService.setAwsCliCommand(message.awsCliCommand);
                        this.workspaceService.setServerlessCliCommand(message.serverlessCliCommand);
                        vscode.window.showInformationMessage('Cli Commands Updated!');
                        this.panel!.webview.html = this.getWebContentSettings();
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
        if (newAwsRegion) {
            this.workspaceService.setAwsRegion(newAwsRegion);
            vscode.commands.executeCommand('lambdasView.refresh');
            vscode.window.showInformationMessage('Region Changed!');
            this.panel!.webview.html = this.getWebContentSettings();
        }
    }

    async updateProfileName(oldProfileName: string): Promise<void> {
        const newProfileName = await vscode.window.showInputBox({ title: 'Inform new profile name for ' + oldProfileName + ':' });
        if (newProfileName) {
            this.workspaceService.updateProfileName(oldProfileName, newProfileName);
            vscode.window.showInformationMessage('Profile name updated!');
        }
    }

    private getWebContentSettings() {
        const logoScr = this.panel?.webview.asWebviewUri(this.iconPath);
        return this.settingsHtml.getWebContentSettings(logoScr!);
    }

    private async removeAwsProfile(profileName: string): Promise<void> {
        const response = await vscode.window.showWarningMessage("Are you sure you want to delete " + profileName + " profile? This will delete all data related.", "Yes", "No");
        if (response && response === "Yes") {
            this.workspaceService.removeAwsProfile(profileName);
        }
    }

}