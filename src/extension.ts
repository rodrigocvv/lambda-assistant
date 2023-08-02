import * as vscode from 'vscode';
import { LambdaProvider } from './lambda.provider';
import { LambdaService } from './lambda.service';


import { SettingsView } from './settings.view';

export function activate(context: vscode.ExtensionContext) {

	addViews(context).then();
	
}



async function addViews(context: vscode.ExtensionContext): Promise<void> {



	const lambdaService = new LambdaService(context);
	const lambdaList = lambdaService.getLambdaList();
	const lambdaProvider = new LambdaProvider(lambdaList);

	const lambdaDisposable = vscode.window.registerTreeDataProvider('lambdasView', lambdaProvider);
	context.subscriptions.push(lambdaDisposable);
	
	let refreshLmabdaButonDisposable = vscode.commands.registerCommand('lambdasView.refresh', async () => {
		const list = await lambdaService.refreshData();
		lambdaProvider.refresh(lambdaService.getLambdaList());
	});
	context.subscriptions.push(refreshLmabdaButonDisposable);



	const isConfigured = context.workspaceState.get('isExtesionConfigured') || false;
	vscode.commands.executeCommand('setContext', 'isExtesionConfigured', isConfigured);



	
	const settingsView = new SettingsView(context);
	let openSettingsButonDisposable = vscode.commands.registerCommand('lambdaAssistant.openSettings', async () => {
		settingsView.openView();
	});
	context.subscriptions.push(openSettingsButonDisposable);


	let showLogDisposable = vscode.commands.registerCommand('lambdaItem.showLog', async (lambdaItem) => {
		const lambdaName = lambdaItem.label;
		const terminal = vscode.window.createTerminal('Log: ' + lambdaName);
		// aws logs tail /aws/lambda/dominio-functions-dev-api --since 5d --follow
		terminal.sendText(`aws logs tail /aws/lambda/${lambdaName} --since 5d --follow`);
		terminal.show();
		// console.log('Valor => ' + JSON.stringify(lambdaItem));
		// const terminal = vscode.window.createTerminal(''));
		// const list = await lambdaService.refreshData();
		// lambdaProvider.refresh(lambdaService.getLambdaList());

	});
	context.subscriptions.push(showLogDisposable);


}

export function deactivate() {}
