import * as vscode from 'vscode';
import { LambdaProvider } from './lambda.provider';
import { LambdaService } from './lambda.service';


import { FunctionSettingsView } from './view/function-settings.view';
import { InvokeView } from './view/invoke.view';
import { SettingsView } from './view/settings.view';
import { LambdaData } from './intefaces/lambda-data.interface';

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
		await lambdaService.refreshData();
		lambdaProvider.refresh(lambdaService.getLambdaList());

	});
	context.subscriptions.push(refreshLmabdaButonDisposable);


	let changeStageButonDisposable = vscode.commands.registerCommand('lambdasView.updateStage', async () => {
		const stageList: string[] = context.workspaceState.get('stageList') || [];
		const stage = await vscode.window.showQuickPick(stageList, {canPickMany: false, title: "Select you stage:"});
		context.workspaceState.update('currentStage', stage);
		// lambdaProvider.refresh(lambdaService.getLambdaList());
		// lambdaProvider.refresh(lambdaService);
		// vscode.commands.executeCommand('lambdasView.refresh');
	});
	context.subscriptions.push(changeStageButonDisposable);	
	vscode.commands.executeCommand('setContext', 'stageSupport', context.workspaceState.get('stageSupport'));


	const isConfigured = context.workspaceState.get('isExtesionConfigured') || false;
	vscode.commands.executeCommand('setContext', 'isExtesionConfigured', isConfigured);
	
	const settingsView = new SettingsView(context);
	let openSettingsButonDisposable = vscode.commands.registerCommand('lambdaAssistant.openSettings', async () => {
		settingsView.openView();
	});
	context.subscriptions.push(openSettingsButonDisposable);

	const functionSettingsView = new FunctionSettingsView(context);
	let openFunctionsSettingsButonDisposable = vscode.commands.registerCommand('lambdaAssistant.openFunctionSettings', async (lambdaItem) => {
		functionSettingsView.openView(lambdaItem.lambdaData);
	});
	context.subscriptions.push(openFunctionsSettingsButonDisposable);

	const invokeView = new InvokeView(context);
	let invokeButonDisposable = vscode.commands.registerCommand('lambdaItem.invoke', async (lambdaItem) => {
		invokeView.openView(lambdaItem.lambdaData);
	});
	context.subscriptions.push(invokeButonDisposable);




	let showLogDisposable = vscode.commands.registerCommand('lambdaItem.showLog', async (lambdaItem) => {
		// console.log('lambdaItem => '+ JSON.stringify(lambdaItem, undefined, 2));
		const lambdaName = lambdaItem.label;
		const terminal = vscode.window.createTerminal('Log: ' + lambdaName);
		const logTimeString = context.workspaceState.get('logTimeString') || '4h';
		terminal.sendText(`aws logs tail /aws/lambda/${lambdaName} --since ${logTimeString} --follow`);
		terminal.show();
	});
	context.subscriptions.push(showLogDisposable);

	let deployButtonDisposable = vscode.commands.registerCommand('lambdaItem.deploy', async (lambdaItem) => {
		let localLambdaList = context.workspaceState.get('lambdaList') as LambdaData[];
		const localLambda = localLambdaList.find((item) => item.functionName === lambdaItem.lambdaData.functionName);
		const serverlessName = localLambda?.serverlessName;
		const terminal = vscode.window.createTerminal('Deploy: ' + serverlessName);
		const stageSupport = context.workspaceState.get('stageSupport')
		const currentStage = context.workspaceState.get('currentStage');
		terminal.sendText(`serverless deploy function -f ${serverlessName} --verbose ${ stageSupport ? '--stage ' + currentStage : ''}`);
		terminal.show();
	});
	context.subscriptions.push(deployButtonDisposable);	


}

export function deactivate() {}
