import * as vscode from 'vscode';
import { LambdaProvider } from './lambda.provider';
import { LambdaService } from './lambda.service';

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

}

export function deactivate() {}
