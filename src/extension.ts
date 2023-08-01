import * as vscode from 'vscode';
import { LambdaProvider } from './lambda.provider';
import { LambdaService } from './lambda.service';
import * as fs from 'fs';
import * as path from 'path';
import { load } from "js-yaml";

export function activate(context: vscode.ExtensionContext) {

	addViews(context).then();
	
}

function getWebContentSettings() {
	return `
		<HTML>
			<head>
				<meta charset="UTF-8">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<title>Settings</title>
			</head>
			<BODY>
				<script>
				function save() {
					const vscode = acquireVsCodeApi();
					vscode.postMessage({
						command: 'save',
						text: 'teste rodrigo'
					});
				}
			</script>

				<center><h1>Lambda Assistant - Settings</h1></center>
				<center>
					<table>
						<tr>
							<td>Lambda Prefix Name</td>
							<td><input type="text"></td>
						</tr>
						<tr>
							<td colspan=2></td>
						</tr>
					</table>
					<br>
					<button onclick="save()">Save</button>
				</center>
			</BODY>
		</HTML>
	`;
}

async function addViews(context: vscode.ExtensionContext): Promise<void> {

	if (vscode.workspace && vscode.workspace.workspaceFolders &&  vscode.workspace.workspaceFolders[0]){
		const serverlessPath = vscode?.workspace?.workspaceFolders[0]?.uri.fsPath;
		const fileContent = fs.readFileSync(path.join(serverlessPath, 'serverless.yml'),'utf8');
		const serviceName =(load(fileContent) as any).service;
	}

	// vscode.workspace.openTextDocument('serverless.yml').then((document) => {
	// 	let text = document.getText();
	// 	console.log('Valor do text => ' + text);
	//   });

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




	let openSettingsButonDisposable = vscode.commands.registerCommand('lambdaAssistant.openSettings', async () => {

      // Create and show panel
      const panel = vscode.window.createWebviewPanel('settings','Lambda Assistant Settings', vscode.ViewColumn.One,
	  	{ enableScripts: true } );

      // And set its HTML content
      panel.webview.html = getWebContentSettings();

	  panel.webview.onDidReceiveMessage(
        message => {
          switch (message.command) {
            case 'save':
              vscode.window.showErrorMessage(message.text);
              return;
          }
        },
        undefined,
        context.subscriptions
      );


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
