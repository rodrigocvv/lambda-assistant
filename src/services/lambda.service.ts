import { FunctionConfiguration, LambdaClient, ListFunctionsCommand, ListFunctionsRequest } from "@aws-sdk/client-lambda";
import * as vscode from 'vscode';
import { LambdaData } from '../intefaces/lambda-data.interface';
import { LambdaProvider } from '../providers/lambda.provider';

export class LambdaService {

    lambdaProvider: LambdaProvider | undefined;

    constructor(private context: vscode.ExtensionContext) {
    }

    public registerDataProvider(viewId: string): void {
        const lambdaList = this.getLambdaList();
        this.lambdaProvider = new LambdaProvider(lambdaList);
        const lambdaDisposable = vscode.window.registerTreeDataProvider(viewId, this.lambdaProvider);
        this.context.subscriptions.push(lambdaDisposable);
    }

    public registerDataRefreshButton(viewId: string): void {
        let refreshLmabdaButonDisposable = vscode.commands.registerCommand(viewId, async () => {
            await this.refreshData();
            this.lambdaProvider?.refresh(this.getLambdaList());
        });
        this.context.subscriptions.push(refreshLmabdaButonDisposable);
    }

    public registerDeployButton(viewId: string): void {
        let deployButtonDisposable = vscode.commands.registerCommand(viewId, async (lambdaItem) => {
            let localLambdaList = this.context.workspaceState.get('lambdaList') as LambdaData[];
            const localLambda = localLambdaList.find((item) => item.functionName === lambdaItem.lambdaData.functionName);
            const serverlessName = localLambda?.serverlessName;
            if (serverlessName) {
                const terminal = vscode.window.createTerminal('Deploy: ' + serverlessName);
                const stageSupport = this.context.workspaceState.get('stageSupport');
                const currentStage = this.context.workspaceState.get('currentStage');
                terminal.sendText(`serverless deploy function -f ${serverlessName} --verbose ${stageSupport ? '--stage ' + currentStage : ''}`);
                terminal.show();
            } else {
                vscode.window.showErrorMessage("For this operation you need to configure your function name(defined in serverless yaml) in functions settings.");
            }

        });
        this.context.subscriptions.push(deployButtonDisposable);
    }

    public registerShowLogButton(viewId: string): void {
        let showLogDisposable = vscode.commands.registerCommand(viewId, async (lambdaItem) => {
            // console.log('lambdaItem => '+ JSON.stringify(lambdaItem, undefined, 2));
            const lambdaName = lambdaItem.label;
            const terminal = vscode.window.createTerminal('Log: ' + lambdaName);
            const logTimeString = this.context.workspaceState.get('logTimeString') || '4h';
            terminal.sendText(`aws logs tail /aws/lambda/${lambdaName} --since ${logTimeString} --follow`);
            terminal.show();
        });
        this.context.subscriptions.push(showLogDisposable);
    }

    public registerChangeStageButton(viewId: string): void {
        let changeStageButonDisposable = vscode.commands.registerCommand(viewId, async () => {
            const stageList: string[] = this.context.workspaceState.get('stageList') || [];
            const stage = await vscode.window.showQuickPick(stageList, { canPickMany: false, title: "Select your stage:" });
            this.context.workspaceState.update('currentStage', stage);
            this.lambdaProvider?.refresh(this.getLambdaList());
            // lambdaProvider.refresh(lambdaService);
            // vscode.commands.executeCommand('lambdasView.refresh');
        });
        this.context.subscriptions.push(changeStageButonDisposable);
    }

    public getLambdaList(): LambdaData[] | undefined {
        let lambdaList: LambdaData[] | undefined = this.context.workspaceState.get('lambdaList');
        let prefix = this.context.workspaceState.get('prefixName') as string;
        const stageSupport = this.context.workspaceState.get('stageSupport') || false;
        const stageList: string[] | undefined = this.context.workspaceState.get('stageList');
        let currentStage;
        if (stageSupport && stageList && (stageList as string[]).length > 0) {
            currentStage = this.context.workspaceState.get('currentStage') || stageList[0];
            prefix += '-' + currentStage;
        }
        const filteredList = lambdaList?.filter(obj => obj.functionName?.startsWith(prefix));
        return filteredList;
    }

    public async refreshData(): Promise<void> {
        console.log('refreshing data!');
        let awsLambdaList = await this.retriveLambdaListFromAws();
        let prefix = this.context.workspaceState.get('prefixName') as string;
        awsLambdaList = awsLambdaList.filter(obj => obj.functionName.startsWith(prefix));
        // const filteredList = lambdaList.filter(obj => obj.startsWith(prefix));
        let localLambdaList = this.context.workspaceState.get('lambdaList');
        //fix from first version
        if (localLambdaList && Array.isArray(localLambdaList)) {
            const isStringsArray = localLambdaList.every(i => typeof i === "string");
            this.context.workspaceState.update('lambdaList', undefined);
            localLambdaList = undefined;
        }
        const lambdaList = this.mergeLambdaData(awsLambdaList, localLambdaList as LambdaData[]);
        console.log('Merged Lambda List => ' + JSON.stringify(lambdaList, undefined, 2));
        this.context.workspaceState.update('lambdaList', lambdaList);
    }

    private mergeLambdaData(awsLambdaList: LambdaData[], localLambdaList: LambdaData[] | undefined): LambdaData[] {

        let lambdaList: LambdaData[] = [];

        if (!localLambdaList || localLambdaList.length === 0) {
            lambdaList = awsLambdaList;
        } else {
            // awsLambdaList.forEach((obj) => { obj.isActive = true; });
            awsLambdaList.forEach((awsLambdaData) => {
                const localLambda = localLambdaList.find((item) => item.functionName === awsLambdaData.functionName);
                if (localLambda) {
                    awsLambdaData.isActive = true;
                    awsLambdaData.serverlessName = localLambda.serverlessName;
                    awsLambdaData.invokeData = localLambda.invokeData;
                } else {
                    awsLambdaData.isActive = true;
                }
                lambdaList.push(awsLambdaData);
            });
            localLambdaList.forEach((localLambda) => {
                // const localLambda = localLambdaList.find((item) => {item.functionName === awsLambdaData.functionName});
                const awsLambda = localLambdaList.find((awsLambdaData) => localLambda.functionName === awsLambdaData.functionName);
                if (!awsLambda) {
                    localLambda.isActive = false;
                    lambdaList.push(localLambda);
                }
            });
        }
        return lambdaList;
    }

    private async retriveLambdaListFromAws(): Promise<LambdaData[]> {
        const lambdaList: LambdaData[] = [];
        let input: ListFunctionsRequest = { MaxItems: 50 };
        const client = new LambdaClient({});
        let command = new ListFunctionsCommand(input);
        let response = await client.send(command);
        // console.log('response => '+ JSON.stringify(response, undefined, 2));
        response.Functions?.forEach((lambda: FunctionConfiguration) => { lambdaList.push(this.getLambdaDataFromAws(lambda)); });
        while (response.NextMarker) {
            input = { Marker: response.NextMarker, MaxItems: 50 };
            command = new ListFunctionsCommand(input);
            response = await client.send(command);
            // console.log('Response => ' + JSON.stringify(response, undefined, 2));
            response.Functions?.forEach((lambda: FunctionConfiguration) => { lambdaList.push(this.getLambdaDataFromAws(lambda)); });
        }
        return lambdaList;
    }

    private getLambdaDataFromAws(functionConfiguration: FunctionConfiguration): LambdaData {
        return {
            functionName: functionConfiguration.FunctionName!,
            functionArn: functionConfiguration.FunctionArn!,
            lastModified: functionConfiguration.LastModified ? new Date(functionConfiguration.LastModified) : undefined
        };
    }
}