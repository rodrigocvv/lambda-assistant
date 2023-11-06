/* eslint-disable @typescript-eslint/naming-convention */
import { FunctionConfiguration, GetFunctionCommand, GetFunctionCommandOutput, InvokeCommand, InvokeCommandInput, LambdaClient, ListFunctionsCommand, ListFunctionsRequest } from "@aws-sdk/client-lambda";
import { fromIni } from "@aws-sdk/credential-providers";
import { AwsCredentialIdentityProvider } from "@smithy/types";
import * as vscode from 'vscode';
import { Messages } from "../commons/messages";
import { ServerlessAssistant } from "../commons/serverless-assistant";
import { LambdaData } from '../interfaces/lambda-data.interface';
import { WorkspaceService } from "./worskpace.service";

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
                const currentStage = this.workspaceService.getCurrentStage();
                const serverlessCliCommand = this.workspaceService.getServerlessCliCommand();
                terminal.sendText(`${serverlessCliCommand} deploy function -f ${serverlessName} --verbose ${currentStage ? '--stage ' + currentStage : ''} --aws-profile ${this.workspaceService.getCurrentAwsProfile()} --region ${this.workspaceService.getCurrentAwsRegion()}`);
                terminal.show();
            } else {
                vscode.window.showErrorMessage(Messages.error.noServerlessFunctionNameDeploy);
            }
        });
        this.getContext().subscriptions.push(deployButtonDisposable);
    }

    public registerShowLogCommand(viewId: string): void {
        let showLogDisposable = vscode.commands.registerCommand(viewId, async (lambdaItem) => {
            const lambdaName = lambdaItem.label;
            const terminal = vscode.window.createTerminal('Log: ' + lambdaName);
            const awsCliCommand = this.workspaceService.getAwsCliCommand();
            terminal.sendText(`${awsCliCommand} logs tail /aws/lambda/${lambdaName} --since ${this.workspaceService.getLogTime()} --follow  --profile ${this.workspaceService.getCurrentAwsProfile()} --region ${this.workspaceService.getCurrentAwsRegion()}`);
            terminal.show();
        });
        this.getContext().subscriptions.push(showLogDisposable);
    }

    public invokeLambdaLocal(lambdaName: string, data: string): void {
        const lambdaData = this.workspaceService.getLambdaByName(lambdaName)!;
        const serverlessCliCommand = this.workspaceService.getServerlessCliCommand();
        if (lambdaData.serverlessName) {
            const currentStage = this.workspaceService.getCurrentStage();
            const stageSupport = this.workspaceService.getStageSupport();
            const terminalMode = this.workspaceService.getTerminalMode();
            data = this.cleanStringPayload(data);
            let cliCommand = `${serverlessCliCommand} invoke local -f ${lambdaData.serverlessName} ${stageSupport ? '--stage ' + currentStage : ''} --aws-profile ${this.workspaceService.getCurrentAwsProfile()} --region ${this.workspaceService.getCurrentAwsRegion()}`;
            cliCommand += terminalMode === 'windowsCmd' ? ` --data ${JSON.stringify(data)}` : ` --data '${data}'`;
            const terminal = vscode.window.createTerminal('Invoke: ' + lambdaData.functionName);
            terminal.sendText(cliCommand);
            terminal.show();
        } else {
            vscode.window.showErrorMessage(Messages.error.noServerlessFunctionName);
        }
    }

    private cleanStringPayload(payloadString: string): string {
        payloadString = payloadString.replaceAll('\n', '');
        payloadString = payloadString.replaceAll('\t', '');
        return payloadString;
    }

    public async invokeLambdaAws(lambdaName: string, data: string): Promise<any> {
        data = this.cleanStringPayload(data);
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

    private async getAwsConfig(): Promise<any> {
        const awsRegion = this.workspaceService.getCurrentAwsRegion();
        const awsProfile = this.workspaceService.getCurrentAwsProfile();
        const credentials: AwsCredentialIdentityProvider = fromIni({ profile: awsProfile });
        const provider = await credentials();
        if (!provider) {
            vscode.window.showErrorMessage(Messages.error.badCredentials + awsProfile);
            throw new Error(Messages.error.invalidCredentials);
        }
        return { region: awsRegion, credentials: credentials };
    }

    public async getLambdaDataByName(lambdaName: string): Promise<LambdaData> {
        const client = new LambdaClient(await this.getAwsConfig());
        const command = new GetFunctionCommand({ FunctionName: lambdaName });
        const response: GetFunctionCommandOutput = await client.send(command);
        return this.parseLambda(response.Configuration!, response.Tags as any);
    }

    public async getAllLambdaList(): Promise<LambdaData[]> {
        const lambdaList: LambdaData[] = [];
        let input: ListFunctionsRequest = { MaxItems: 50 };
        const client = new LambdaClient(await this.getAwsConfig());
        let command = new ListFunctionsCommand(input);
        let response: any = await client.send(command);
        response.Functions?.forEach((lambda: FunctionConfiguration) => { lambdaList.push(this.parseLambda(lambda, undefined)); });
        while (response.NextMarker) {
            input = { Marker: response.NextMarker, MaxItems: 50 };
            command = new ListFunctionsCommand(input);
            response = await client.send(command);
            response.Functions?.forEach((lambda: FunctionConfiguration) => { lambdaList.push(this.parseLambda(lambda, undefined)); });
        }
        return lambdaList;
    }

    private parseLambda(functionConfiguration: FunctionConfiguration, tags: any | undefined): LambdaData {
        return {
            functionName: functionConfiguration.FunctionName!,
            functionArn: functionConfiguration.FunctionArn!,
            lastModified: functionConfiguration.LastModified,
            timeout: functionConfiguration.Timeout,
            codeSize: functionConfiguration.CodeSize,
            isActive: true,
            tags
        };
    }

}