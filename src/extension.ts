import * as vscode from 'vscode';
import { LambdaService } from './services/lambda.service';
import { FunctionSettingsView } from './view/function-settings.view';
import { InvokeView } from './view/invoke.view';
import { SettingsView } from './view/settings.view';

export function activate(context: vscode.ExtensionContext) {
	addInitialSettings(context);
	addViews(context).then();
}

async function addViews(context: vscode.ExtensionContext): Promise<void> {
	const lambdaService = new LambdaService(context);
	const settingsView = new SettingsView(context);
	const functionSettingsView = new FunctionSettingsView(context);
	const invokeView = new InvokeView(context);

	lambdaService.registerDataProvider('lambdasView');
	lambdaService.registerDataRefreshButton('lambdasView.refresh');
	lambdaService.registerChangeStageButton('lambdasView.updateStage');
	lambdaService.registerDeployButton('lambdaItem.deploy');
	lambdaService.registerShowLogButton('lambdaItem.showLog');
	settingsView.registerOpenSettingsButton('lambdaAssistant.openSettings');
	functionSettingsView.registerOpenFunctionSettingsButton('lambdaAssistant.openFunctionSettings');
	invokeView.registerOpenInvokeViewButton('lambdaItem.invoke');
}

function addInitialSettings(context: vscode.ExtensionContext): void {
	vscode.commands.executeCommand('setContext', 'stageSupport', context.workspaceState.get('stageSupport'));
	const isConfigured = context.workspaceState.get('isExtesionConfigured') || false;
	vscode.commands.executeCommand('setContext', 'isExtesionConfigured', isConfigured);
}

export function deactivate() { }
