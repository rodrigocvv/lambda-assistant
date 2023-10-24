import { ServerlessAssistant } from "../serverless-assistant";
import { WorkspaceService } from "./worskpace.service";
import { LambdaData } from '../intefaces/lambda-data.interface';
import * as vscode from 'vscode';
import { fromIni } from "@aws-sdk/credential-providers";
import { FunctionConfiguration, GetAccountSettingsCommandInput, GetFunctionCommand, GetFunctionCommandInput, GetFunctionCommandOutput, InvokeCommand, InvokeCommandInput, LambdaClient, ListFunctionsCommand, ListFunctionsRequest } from "@aws-sdk/client-lambda";

export class AwsService extends ServerlessAssistant {

    workspaceService: WorkspaceService;

    constructor() {
        super();
        this.workspaceService = new WorkspaceService();
    }

    public registerDeployCommand(viewId: string): void {
        let deployButtonDisposable = vscode.commands.registerCommand(viewId, async (lambdaItem) => {
            const localLambda = this.workspaceService.getLambdaByName(lambdaItem.lambdaData.functionName);
            const serverlessName = localLambda?.serverlessName;
            if (serverlessName) {
                const terminal = vscode.window.createTerminal('Deploy: ' + serverlessName);
                const currentStage = this.getContext().workspaceState.get('currentStage');
                terminal.sendText(`serverless deploy function -f ${serverlessName} --verbose ${currentStage ? '--stage ' + currentStage : ''} --aws-profile ${this.workspaceService.getCurrentAwsProfile()} --region ${this.workspaceService.getCurrentAwsRegion()}`);
                terminal.show();
            } else {
                vscode.window.showErrorMessage("For this operation you need to add your function identifier defined in serverless yaml. Click to edit ServerlessName in Invoke Page.");
            }

        });
        this.getContext().subscriptions.push(deployButtonDisposable);
    }

    public registerShowLogCommand(viewId: string): void {
        let showLogDisposable = vscode.commands.registerCommand(viewId, async (lambdaItem) => {
            const workspaceService = this.workspaceService;
            const lambdaName = lambdaItem.label;
            const terminal = vscode.window.createTerminal('Log: ' + lambdaName);
            terminal.sendText(`aws logs tail /aws/lambda/${lambdaName} --since ${workspaceService.getLogTime()} --follow  --profile ${workspaceService.getCurrentAwsProfile()} --region ${workspaceService.getCurrentAwsRegion()}`);
            terminal.show();
        });
        this.getContext().subscriptions.push(showLogDisposable);
    }



    public invokeLambdaLocal(lambdaName: string, data: string): void {
        const lambdaData = this.workspaceService.getLambdaByName(lambdaName)!;
        if (lambdaData.serverlessName) {
            data = data.replaceAll('\n', '');
            data = data.replaceAll('\t', '');
            const terminal = vscode.window.createTerminal('Invoke: ' + lambdaData.functionName);
            const stageSupport = this.getContext().workspaceState.get('stageSupport');
            const currentStage = this.getContext().workspaceState.get('currentStage');
            terminal.sendText(`serverless invoke local -f ${lambdaData.serverlessName} ${stageSupport ? '--stage ' + currentStage : ''} --aws-profile ${this.workspaceService.getCurrentAwsProfile()} --region ${this.workspaceService.getCurrentAwsRegion()}  --data ${JSON.stringify(data)}`);
            terminal.show();
        } else {
            vscode.window.showErrorMessage("For this operation you need to add your function identifier defined in serverless yaml.");
        }
    }

    public async invokeLambdaAws(lambdaName: string, data: string): Promise<any> {
        data = data.replaceAll('\n', '');
        data = data.replaceAll('\t', '');
        const input: InvokeCommandInput = {
            FunctionName: lambdaName,
            InvocationType: "RequestResponse",
            Payload: Buffer.from(JSON.stringify(JSON.parse(data)), "utf8"),
        };
        const command = new InvokeCommand(input);
        const client = new LambdaClient(this.getAwsConfig());
        const response = await client.send(command);
        return JSON.parse(Buffer.from(response.Payload!).toString());
    }


    private getAwsConfig(): any {
        const awsRegion = this.workspaceService.getCurrentAwsRegion();
        const awsProfile = this.workspaceService.getCurrentAwsProfile();
        return { region: awsRegion, credentials: fromIni({ profile: awsProfile }) }

    }

    public async getLambdaDataByName(lambdaName: string): Promise<LambdaData> {
        const client = new LambdaClient(this.getAwsConfig());
        const command = new GetFunctionCommand({ FunctionName: lambdaName });
        const response: GetFunctionCommandOutput = await client.send(command);
        return this.parseLambda(response.Configuration!);
    }

    public async getAllLambdaList(): Promise<LambdaData[]> {
        const lambdaList: LambdaData[] = [];
        let input: ListFunctionsRequest = { MaxItems: 50 };
        const client = new LambdaClient(this.getAwsConfig());
        let command = new ListFunctionsCommand(input);
        let response: any = await client.send(command);
        // console.log('response => '+ JSON.stringify(response, undefined, 2));
        response.Functions?.forEach((lambda: FunctionConfiguration) => { lambdaList.push(this.parseLambda(lambda)); });
        while (response.NextMarker) {
            input = { Marker: response.NextMarker, MaxItems: 50 };
            command = new ListFunctionsCommand(input);
            response = await client.send(command);
            // console.log('Response => ' + JSON.stringify(response, undefined, 2));
            response.Functions?.forEach((lambda: FunctionConfiguration) => { lambdaList.push(this.parseLambda(lambda)); });
        }
        return lambdaList;
    }

    private parseLambda(functionConfiguration: FunctionConfiguration): LambdaData {
        return {
            functionName: functionConfiguration.FunctionName!,
            functionArn: functionConfiguration.FunctionArn!,
            lastModified: functionConfiguration.LastModified,
            timeout: functionConfiguration.Timeout,
            codeSize: functionConfiguration.CodeSize
        };
    }

}