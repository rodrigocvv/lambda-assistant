import * as vscode from 'vscode';
import { Constants } from '../commons/constants';
import { Messages } from '../commons/messages';
import { Command } from '../enums/command.enum';
import { WorkspaceService } from '../services/worskpace.service';
import { ExtensionView } from './extension-view';
import { SettingHtml } from './settings.html';

export class SettingsView extends ExtensionView {
    settingsHtml: SettingHtml;
    workspaceService: WorkspaceService;
    logoScr: vscode.Uri | undefined;

    constructor() {
        super();
        this.workspaceService = new WorkspaceService();
        this.settingsHtml = new SettingHtml();
    }

    public registerOpenSettingsCommand(viewId: string): void {
        let openSettingsButonDisposable = vscode.commands.registerCommand(viewId, async () => {
            this.openView(Constants.WEB_VIEW_ID_SETTINGS, Messages.label.worksspaceSettings, true);
            this.logoScr = this.panel?.webview.asWebviewUri(this.iconPath);
            this.panel!.webview.html = this.workspaceService.isExtensionConfigured()
                ? this.settingsHtml.getWebContentSettings(this.logoScr!)
                : this.settingsHtml.getWebContentWelcome(this.logoScr!);
        });
        this.getContext().subscriptions.push(openSettingsButonDisposable);
    }

    async executeViewActions(message: any): Promise<void> {
        switch (message.command) {
            case Constants.ACTION_START:
                this.startExtension(message.prefix, message.awsProfile, message.awsRegion);
                break;
            case Constants.ACTION_SAVE:
                this.workspaceService.setPrefix(message.text);
                vscode.commands.executeCommand(Command.LAMBDA_VIEW_REFRESH);
                vscode.window.showInformationMessage(Messages.label.prefixSaved);
                break;
            case Constants.ACTION_ADD_NEW_PROFILE:
                this.workspaceService.addNewProfile(message.profileName);
                this.panel!.webview.html = this.settingsHtml.getWebContentSettings(this.logoScr!);
                break;
            case Constants.ACTION_REMOVE_PROFILE:
                await this.removeAwsProfile(message.profileName);
                break;
            case Constants.ACTION_ADD_STAGE_SUPPORT:
                this.workspaceService.setStageSupport(message.text);
                this.panel!.webview.html = this.settingsHtml.getWebContentSettings(this.logoScr!);
                break;
            case Constants.ACTION_ADD_STAGE:
                this.workspaceService.addStage(message.text);
                this.panel!.webview.html = this.settingsHtml.getWebContentSettings(this.logoScr!);
                break;
            case Constants.ACTION_DELETE_STAGE:
                this.workspaceService.removeStage(message.text);
                this.panel!.webview.html = this.settingsHtml.getWebContentSettings(this.logoScr!);
                break;
            case Constants.ACTION_UPDATE_PROFILE:
                await this.updateProfileName(message.profileName);
                break;
            case Constants.ACTION_CHANGE_REGION:
                this.changeRegion();
                break;
            case Constants.ACTION_UPDATE_CLI_COMMANDS:
                this.workspaceService.setAwsCliCommand(message.awsCliCommand);
                this.workspaceService.setServerlessCliCommand(message.serverlessCliCommand);
                vscode.window.showInformationMessage(Messages.label.cliCommandSaved);
                this.panel!.webview.html = this.settingsHtml.getWebContentSettings(this.logoScr!);
                break;
            case Constants.ACTION_CHANGE_TERMINAL_MODE:
                this.workspaceService.setTerminalMode(message.terminalMode);
                this.panel!.webview.html = this.settingsHtml.getWebContentSettings(this.logoScr!);
                break;
        }
    }

    async changeRegion(): Promise<void> {
        const newAwsRegion = await vscode.window.showInputBox({ title: Messages.label.selectRegion });
        if (newAwsRegion) {
            this.workspaceService.setAwsRegion(newAwsRegion);
            vscode.commands.executeCommand(Command.LAMBDA_VIEW_REFRESH);
            vscode.window.showInformationMessage(Messages.label.regionSaved);
            this.panel!.webview.html = this.settingsHtml.getWebContentSettings(this.logoScr!);
        }
    }

    async updateProfileName(oldProfileName: string): Promise<void> {
        const newProfileName = await vscode.window.showInputBox({ title: Messages.label.selectNewProfile + oldProfileName });
        if (newProfileName) {
            this.workspaceService.updateProfileName(oldProfileName, newProfileName);
            vscode.window.showInformationMessage(Messages.label.profileSaved);
            this.panel!.webview.html = this.settingsHtml.getWebContentSettings(this.logoScr!);
        }
    }

    private async removeAwsProfile(profileName: string): Promise<void> {
        const response = await vscode.window.showWarningMessage(
            Messages.label.removeProfilePart1 + profileName + Messages.label.removeProfilePart2,
            Constants.YES,
            Constants.NO,
        );
        if (response && response === Constants.YES) {
            this.workspaceService.removeAwsProfile(profileName);
            this.panel!.webview.html = this.settingsHtml.getWebContentSettings(this.logoScr!);
        }
    }

    private async startExtension(prefix: string, awsProfile: string, awsRegion: string): Promise<void> {
        try {
            this.panel!.webview.html = this.settingsHtml.getWebContentLoading();
            this.workspaceService.setPrefix(prefix);
            this.workspaceService.setAwsRegion(awsRegion);
            this.workspaceService.setCurrentAwsProfile(awsProfile);
            await vscode.commands.executeCommand(Command.LAMBDA_VIEW_REFRESH);
            this.workspaceService.setExtensionConfigured();
            this.panel!.webview.html = this.settingsHtml.getWebContentSettings(this.logoScr!);
        } catch (error) {
            this.panel!.webview.html = this.settingsHtml.getWebContentWelcome(this.logoScr!);
            vscode.window.showErrorMessage(Messages.error.fetchAwsData);
        }
    }
}
