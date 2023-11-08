import * as vscode from 'vscode';
import { Session } from './commons/session';
import { AwsService } from './services/aws.service';
import { BookmarkService } from './services/bookmark.service';
import { LambdaService } from './services/lambda.service';
import { DetailsView } from './view/details.view';
import { InvokeView } from './view/invoke.view';
import { SettingsView } from './view/settings.view';
import { Provider } from './enums/provider.enum';
import { Command } from './enums/command.enum';

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
    bookmarkService.registerBookmarkDataProvider(Provider.BOOKMARK_VIEW);
    bookmarkService.registerBookmarkRefreshCommand(Command.BOOKMARK_VIEW_REFRESH);
    bookmarkService.registerBookmarkNewInvokeCommand(Command.BOOKMARK_VIEW_ADD);
    lambdaService.registerDataProvider(Provider.LAMBDA_VIEW);
    lambdaService.registerDataRefreshCommand(Command.LAMBDA_VIEW_REFRESH);
    lambdaService.registerUpdateViewCommand(Command.LAMBDA_VIEW_UPDATE_VIEW);
    lambdaService.registerChangeStageCommand(Command.LAMBDA_VIEW_UPDATE_STAGE);
    lambdaService.registerChangeProfileCommand(Command.LAMBDA_VIEW_CHANGE_PROFILE);
    awsService.registerDeployCommand(Command.LAMBDA_VIEW_DEPLOY);
    awsService.registerShowLogCommand(Command.LAMBDA_VIEW_SHOW_LOG);
    settingsView.registerOpenSettingsCommand(Command.LAMBDA_VIEW_OPEN_SETTINGS);
    detailsView.registerOpenLambdaDetailsCommand(Command.LAMBDA_VIEW_SHOW_DETAILS);
    invokeView.registerOpenInvokeViewButtonCommand(Command.LAMBDA_VIEW_INVOKE);
    invokeView.registerOpenInvokeViewCommand(Command.LAMBDA_VIEW_INVOKE_VIEW);
}

function addInitialSettings(context: vscode.ExtensionContext): void {
    vscode.commands.executeCommand('setContext', 'stageSupport', context.workspaceState.get('stageSupport'));
    const isConfigured = context.workspaceState.get('isExtesionConfigured') || false;
    vscode.commands.executeCommand('setContext', 'isExtesionConfigured', isConfigured);
}

export function deactivate() {}
