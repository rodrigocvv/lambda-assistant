import * as vscode from 'vscode';
import { LambdaClient, ListFunctionsCommand, FunctionConfiguration, ListFunctionsRequest } from "@aws-sdk/client-lambda";

export class LambdaService {

    constructor(private context: vscode.ExtensionContext) {
    }

    public getLambdaList(): string[] | undefined {
        let lambdaList: string[] | undefined= this.context.workspaceState.get('lambdaList');
        let prefix = this.context.workspaceState.get('prefixName') as string;
        const stageSupport = this.context.workspaceState.get('stageSupport') || false;
        const stageList: string[] | undefined = this.context.workspaceState.get('stageList');
        let currentStage ;
        if (stageSupport && stageList && (stageList as string[]).length > 0){
            currentStage = this.context.workspaceState.get('currentStage') || stageList[0];
            prefix += '-'+currentStage;
        }
        const filteredList = lambdaList?.filter(obj => obj.startsWith(prefix));
        return filteredList;
    }

    public async refreshData(): Promise<void> {
        const lambdaList = await this.retriveLambdaListFromAws();
        let prefix = this.context.workspaceState.get('prefixName') as string;
        const filteredList = lambdaList.filter(obj => obj.startsWith(prefix));
        this.context.workspaceState.update('lambdaList', filteredList);
    }

    private async retriveLambdaListFromAws(): Promise<string[]> {
        const lambdaList: string[] = [];
        let input: ListFunctionsRequest = { MaxItems: 50 };
        const client = new LambdaClient({});
        let command = new ListFunctionsCommand(input);
        let response = await client.send(command);
        response.Functions?.forEach((lambda: FunctionConfiguration) => { lambdaList.push(lambda.FunctionName!); });
        while (response.NextMarker) {
            input = { Marker: response.NextMarker, MaxItems: 50};
            command = new ListFunctionsCommand(input);
            response = await client.send(command);
            response.Functions?.forEach((lambda: FunctionConfiguration) => { lambdaList.push(lambda.FunctionName!); });
        }
        return lambdaList;
    }
}