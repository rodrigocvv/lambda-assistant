import * as vscode from 'vscode';
import { Session } from './commons/session';
import { AwsService } from './services/aws.service';
import { BookmarkService } from './services/bookmark.service';
import { LambdaService } from './services/lambda.service';
import { DetailsView } from './view/details.view';
import { InvokeView } from './view/invoke.view';
import { SettingsView } from './view/settings.view';

export function activate(context: vscode.ExtensionContext) {
    Session.getInstance().setContext(context);
    addInitialSettings(context);
    addViews();
}

async function addViews(): Promise<void> {
    const lambdaService = new LambdaService();
    const settingsView = new SettingsView();
    const detailsView = new DetailsView();
    const invokeView = new InvokeView();
    const bookmarkService = new BookmarkService();
    const awsService = new AwsService();
    bookmarkService.registerBookmarkDataProvider('invokeBookmarkView');
    bookmarkService.registerBookmarkRefreshCommand('invokeBookmarkView.refresh');
    bookmarkService.registerBookmarkNewInvokeCommand('invokeBookmarkView.add');
    lambdaService.registerDataProvider('lambdasView');
    lambdaService.registerDataRefreshCommand('lambdasView.refresh');
    lambdaService.registerUpdateViewCommand('lambdasView.updateView');
    lambdaService.registerChangeStageCommand('lambdasView.updateStage');
    lambdaService.registerChangeProfileCommand('lambdasView.changeAwsProfile');
    awsService.registerDeployCommand('lambdaItem.deploy');
    awsService.registerShowLogCommand('lambdaItem.showLog');
    settingsView.registerOpenSettingsCommand('lambdaAssistant.openSettings');
    detailsView.registerOpenLambdaDetailsCommand('lambdaAssistant.showLambdaDetails');
    invokeView.registerOpenInvokeViewButton('lambdaItem.invoke');
    invokeView.registerOpenInvokeViewCommand('lambdaAssistant.openInvokeView');
}

function addInitialSettings(context: vscode.ExtensionContext): void {
    vscode.commands.executeCommand('setContext', 'stageSupport', context.workspaceState.get('stageSupport'));
    const isConfigured = context.workspaceState.get('isExtesionConfigured') || false;
    vscode.commands.executeCommand('setContext', 'isExtesionConfigured', isConfigured);
}

export function deactivate() {}
