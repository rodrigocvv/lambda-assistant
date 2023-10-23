import { ServerlessAssistant } from "../serverless-assistant";
import { WorkspaceService } from "./worskpace.service";
import { LambdaData } from '../intefaces/lambda-data.interface';
import * as vscode from 'vscode';
import { fromIni } from "@aws-sdk/credential-providers";
import { FunctionConfiguration, LambdaClient, ListFunctionsCommand, ListFunctionsRequest } from "@aws-sdk/client-lambda";

export class AwsService extends ServerlessAssistant {

    workspaceService: WorkspaceService;

    constructor() {
        super();
        this.workspaceService = new WorkspaceService();
    }

    public invokeLambdaLocal(lambdaName: string, data: string): void {
        const lambdaData = this.workspaceService.getLambdaByName(lambdaName)!;
        if (lambdaData.serverlessName) {
            data = data.replaceAll('\n', '');
            data = data.replaceAll('\t', '');
            const terminal = vscode.window.createTerminal('Invoke: ' + lambdaData.functionName);
            const stageSupport = this.getContext().workspaceState.get('stageSupport');
            const currentStage = this.getContext().workspaceState.get('currentStage');
            terminal.sendText(`serverless invoke local -f ${lambdaData.serverlessName} ${stageSupport ? '--stage ' + currentStage : ''} --data ${JSON.stringify(data)}`);
            terminal.show();
        } else {
            vscode.window.showErrorMessage("For this operation you need to configure your function name(defined in serverless yaml) in functions settings.");
        }
    }

    private getAwsConfig(): any {
        const awsRegion = this.workspaceService.getCurrentAwsRegion();
        const awsProfile = this.workspaceService.getCurrentAwsProfile();
        return { region: awsRegion, credentials: fromIni({ profile: awsProfile }) }

    }

    public async getAllLambdaList(): Promise<LambdaData[]> {
        const lambdaList: LambdaData[] = [];
        let input: ListFunctionsRequest = { MaxItems: 50 };
        // let awsRegion: string = this.getContext().workspaceState.get('awsRegion') || 'us-east-1';
        // const currentAwsProfile: string = this.getContext().workspaceState.get('currentAwsProfile') || 'default';
        const awsRegion = this.workspaceService.getCurrentAwsRegion();

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
            lastModified: functionConfiguration.LastModified ? new Date(functionConfiguration.LastModified) : undefined,
            timeout: functionConfiguration.Timeout,
            codeSize: functionConfiguration.CodeSize
        };
    }

}