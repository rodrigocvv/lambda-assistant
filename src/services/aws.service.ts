/* eslint-disable @typescript-eslint/naming-convention */
import {
    FunctionConfiguration,
    GetFunctionCommand,
    GetFunctionCommandOutput,
    InvokeCommand,
    InvokeCommandInput,
    LambdaClient,
    ListFunctionsCommand,
    ListFunctionsRequest,
} from '@aws-sdk/client-lambda';
import { fromIni } from '@aws-sdk/credential-providers';
import { AwsCredentialIdentityProvider } from '@smithy/types';
import * as vscode from 'vscode';
import { Messages } from '../commons/messages';
import { ServerlessAssistant } from '../commons/serverless-assistant';
import { LambdaData } from '../interfaces/lambda-data.interface';
import { WorkspaceService } from './worskpace.service';
import { TerminalMode } from '../enums/terminal.enum';
import { Constants } from '../commons/constants';

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
                const terminal = vscode.window.createTerminal(Messages.label.deploy + serverlessName);
                const currentStage = this.workspaceService.getCurrentStage();
                const serverlessCliCommand = this.workspaceService.getServerlessCliCommand();
                let cliCommand = Constants.DEPLOY_CLI_COMMAND;
                cliCommand = cliCommand.replace(Constants.PARAM_CLI_COMMAND, serverlessCliCommand);
                cliCommand = cliCommand.replace(Constants.PARAM_SERVERLESSNAME, serverlessName);
                cliCommand = cliCommand.replace(Constants.PARAM_STAGE, currentStage ? Constants.CLI_PARAM_STAGE + currentStage : '');
                cliCommand = cliCommand.replace(
                    Constants.PARAM_AWS_PROFILE,
                    this.workspaceService.getCurrentAwsProfile() || Constants.DEFAULT_PROFILE,
                );
                cliCommand = cliCommand.replace(Constants.PARAM_AWS_REGION, this.workspaceService.getCurrentAwsRegion());
                terminal.sendText(cliCommand);
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
            const terminal = vscode.window.createTerminal(Messages.label.log + lambdaName);
            const awsCliCommand = this.workspaceService.getAwsCliCommand();
            let cliCommand = Constants.SHOW_LOG_CLI_COMMAND;
            cliCommand = cliCommand.replace(Constants.PARAM_CLI_COMMAND, awsCliCommand);
            cliCommand = cliCommand.replace(Constants.PARAM_LAMBDA_NAME, lambdaName);
            cliCommand = cliCommand.replace(Constants.PARAM_LOG_TIME, this.workspaceService.getLogTime());
            cliCommand = cliCommand.replace(
                Constants.PARAM_AWS_PROFILE,
                this.workspaceService.getCurrentAwsProfile() || Constants.DEFAULT_PROFILE,
            );
            cliCommand = cliCommand.replace(Constants.PARAM_AWS_REGION, this.workspaceService.getCurrentAwsRegion());
            terminal.sendText(cliCommand);
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
            let cliCommand = Constants.INVOKE_LOCAL_CLI_COMMAND;
            cliCommand = cliCommand.replace(Constants.PARAM_CLI_COMMAND, serverlessCliCommand);
            cliCommand = cliCommand.replace(Constants.PARAM_SERVERLESSNAME, lambdaData.serverlessName);
            cliCommand = cliCommand.replace(Constants.PARAM_STAGE, currentStage ? Constants.CLI_PARAM_STAGE + currentStage : '');
            cliCommand = cliCommand.replace(
                Constants.PARAM_AWS_PROFILE,
                this.workspaceService.getCurrentAwsProfile() || Constants.DEFAULT_PROFILE,
            );
            cliCommand = cliCommand.replace(Constants.PARAM_AWS_REGION, this.workspaceService.getCurrentAwsRegion());
            cliCommand = cliCommand.replace(
                Constants.PARAM_DATA,
                terminalMode === TerminalMode.WINDOWS_CMD
                    ? ` ${Constants.CLI_PARAM_DATA} ${JSON.stringify(data)}`
                    : ` ${Constants.CLI_PARAM_DATA} '${data}'`,
            );
            const terminal = vscode.window.createTerminal(Messages.label.invoke + lambdaData.functionName);
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
            InvocationType: Constants.REQUEST_RESPONSE,
            Payload: Buffer.from(JSON.stringify(JSON.parse(data)), Constants.UTF8),
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
        response.Functions?.forEach((lambda: FunctionConfiguration) => {
            lambdaList.push(this.parseLambda(lambda, undefined));
        });
        while (response.NextMarker) {
            input = { Marker: response.NextMarker, MaxItems: 50 };
            command = new ListFunctionsCommand(input);
            response = await client.send(command);
            response.Functions?.forEach((lambda: FunctionConfiguration) => {
                lambdaList.push(this.parseLambda(lambda, undefined));
            });
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
            tags,
        };
    }
}
