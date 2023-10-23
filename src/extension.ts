import * as vscode from 'vscode';
import { LambdaService } from './services/lambda.service';
import { FunctionSettingsView } from './view/function-settings.view';
import { InvokeView } from './view/invoke.view';
import { SettingsView } from './view/settings.view';
import { BookmarkService } from './services/bookmark.service';
import { Session } from './session';

export function activate(context: vscode.ExtensionContext) {
	Session.getInstance().setContext(context);
	addInitialSettings(context);
	addViews();
}

async function addViews(): Promise<void> {
	const lambdaService = new LambdaService();
	const settingsView = new SettingsView();
	const functionSettingsView = new FunctionSettingsView();
	const invokeView = new InvokeView();
	const bookmarkService = new BookmarkService();
	bookmarkService.registerBookmarkDataProvider('invokeBookmarkView');
	bookmarkService.registerBookmarkRefreshCommand('invokeBookmarkView.refresh');
	bookmarkService.registerBookmarkNewInvokeCommand('invokeBookmarkView.add');
	lambdaService.registerDataProvider('lambdasView');
	lambdaService.registerDataRefreshButton('lambdasView.refresh');
	lambdaService.registerChangeStageButton('lambdasView.updateStage');
	lambdaService.registerChangeProfileButton('lambdasView.changeAwsProfile');
	lambdaService.registerDeployButton('lambdaItem.deploy');
	lambdaService.registerShowLogButton('lambdaItem.showLog');
	settingsView.registerOpenSettingsButton('lambdaAssistant.openSettings');
	functionSettingsView.registerOpenFunctionSettingsButton('lambdaAssistant.openFunctionSettings');
	invokeView.registerOpenInvokeViewButton('lambdaItem.invoke');
	invokeView.registerOpenInvokeViewCommand('lambdaAssistant.openInvokeView');
}

function addInitialSettings(context: vscode.ExtensionContext): void {
	vscode.commands.executeCommand('setContext', 'stageSupport', context.workspaceState.get('stageSupport'));
	const isConfigured = context.workspaceState.get('isExtesionConfigured') || false;
	vscode.commands.executeCommand('setContext', 'isExtesionConfigured', isConfigured);
}

export function deactivate() { }
