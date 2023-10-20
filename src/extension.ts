import * as vscode from 'vscode';
import { LambdaService } from './services/lambda.service';
import { FunctionSettingsView } from './view/function-settings.view';
import { InvokeView } from './view/invoke.view';
import { SettingsView } from './view/settings.view';
import { BookmarkService } from './services/bookmark.service';

export function activate(context: vscode.ExtensionContext) {
	addInitialSettings(context);
	addViews(context);
}

async function addViews(context: vscode.ExtensionContext): Promise<void> {
	const lambdaService = new LambdaService(context);
	const settingsView = new SettingsView(context);
	const functionSettingsView = new FunctionSettingsView(context);
	const invokeView = new InvokeView(context);
	const bookmarkService = new BookmarkService(context);
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
