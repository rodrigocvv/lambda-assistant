import * as vscode from 'vscode';
import { LambdaData } from '../intefaces/lambda-data.interface';
import { LambdaProvider } from '../providers/lambda.provider';
import { ServerlessAssistant } from "../serverless-assistant";
import { AwsService } from "./aws.service";
import { WorkspaceService } from "./worskpace.service";

export class LambdaService extends ServerlessAssistant {

    lambdaProvider: LambdaProvider | undefined;
    workspaceService: WorkspaceService;
    awsService: AwsService;

    constructor() {
        super();
        this.workspaceService = new WorkspaceService();
        this.awsService = new AwsService();
    }

    public registerDataProvider(viewId: string): void {
        const lambdaList = this.getLambdaList();
        this.lambdaProvider = new LambdaProvider(lambdaList);
        const lambdaDisposable = vscode.window.registerTreeDataProvider(viewId, this.lambdaProvider);
        this.getContext().subscriptions.push(lambdaDisposable);
    }

    public registerDataRefreshButton(viewId: string): void {
        let refreshLmabdaButonDisposable = vscode.commands.registerCommand(viewId, async () => {
            await this.refreshData();
            this.lambdaProvider?.refresh(this.getLambdaList());
            vscode.commands.executeCommand('invokeBookmarkView.refresh');
        });
        this.getContext().subscriptions.push(refreshLmabdaButonDisposable);
    }

    public registerDeployButton(viewId: string): void {
        let deployButtonDisposable = vscode.commands.registerCommand(viewId, async (lambdaItem) => {
            const workspaceService = this.workspaceService;
            const localLambda = workspaceService.getLambdaByName(lambdaItem.lambdaData.functionName); // localLambdaList?.find((item) => item.functionName === lambdaItem.lambdaData.functionName);
            const serverlessName = localLambda?.serverlessName;
            if (serverlessName) {
                const terminal = vscode.window.createTerminal('Deploy: ' + serverlessName);
                const currentStage = workspaceService.getCurrentStage();
                terminal.sendText(`serverless deploy function -f ${serverlessName} --verbose ${currentStage ? '--stage ' + currentStage : ''} --aws-profile ${workspaceService.getCurrentAwsProfile()} --region ${workspaceService.getCurrentAwsRegion()}`);
                terminal.show();
            } else {
                vscode.window.showErrorMessage("For this operation you need to configure your function name(defined in serverless yaml) in functions settings.");
            }

        });
        this.getContext().subscriptions.push(deployButtonDisposable);
    }

    public registerShowLogButton(viewId: string): void {
        let showLogDisposable = vscode.commands.registerCommand(viewId, async (lambdaItem) => {
            const workspaceService = this.workspaceService;
            const lambdaName = lambdaItem.label;
            const terminal = vscode.window.createTerminal('Log: ' + lambdaName);
            terminal.sendText(`aws logs tail /aws/lambda/${lambdaName} --since ${workspaceService.getLogTime()} --follow  --profile ${workspaceService.getCurrentAwsProfile()} --region ${workspaceService.getCurrentAwsRegion()}`);
            terminal.show();
        });
        this.getContext().subscriptions.push(showLogDisposable);
    }

    public async registerChangeStageButton(viewId: string): Promise<void> {
        let changeStageButonDisposable = vscode.commands.registerCommand(viewId, async () => {
            const stageList: string[] = this.getContext().workspaceState.get('stageList') || [];
            const stage = await vscode.window.showQuickPick(stageList, { canPickMany: false, title: "Select your stage:" });
            this.getContext().workspaceState.update('currentStage', stage);
            this.lambdaProvider?.refresh(this.getLambdaList());
        });
        this.getContext().subscriptions.push(changeStageButonDisposable);
    }

    public async registerChangeProfileButton(viewId: string): Promise<void> {
        let changeProfileButonDisposable = vscode.commands.registerCommand(viewId, async () => {
            const awsProfileList = this.workspaceService.getAwsProfileList();
            const currentAwsProfile = await vscode.window.showQuickPick(awsProfileList, { canPickMany: false, title: "Select your aws profile:" });
            this.getContext().workspaceState.update('currentAwsProfile', currentAwsProfile);
            this.lambdaProvider?.refresh(this.getLambdaList());
            vscode.commands.executeCommand('invokeBookmarkView.refresh');
        });
        this.getContext().subscriptions.push(changeProfileButonDisposable);
    }

    public getLambdaList(): LambdaData[] | undefined {
        const workspaceService = this.workspaceService;
        let lambdaList: LambdaData[] | undefined = workspaceService.getLambdaList();
        const filteredList = lambdaList?.filter(obj => obj.functionName?.startsWith(workspaceService.getPrefixWithStage()) && obj.isActive);
        return filteredList;
    }

    public async refreshData(): Promise<void> {
        console.log('refreshing data!');
        vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: "Retrieving data from aws",
            cancellable: true
        }, async () => {
            let awsLambdaList = await this.awsService.getAllLambdaList();
            const workspaceService = this.workspaceService;
            const lambdaList = this.mergeLambdaData(awsLambdaList, workspaceService.getLambdaList());
            workspaceService.saveLambdaList(lambdaList);
        });
    }

    private mergeLambdaData(awsLambdaList: LambdaData[], localLambdaList: LambdaData[] | undefined): LambdaData[] {
        let lambdaList: LambdaData[] = [];
        if (!localLambdaList || localLambdaList.length === 0) {
            lambdaList = awsLambdaList;
        } else {
            awsLambdaList.forEach((awsLambdaData) => {
                const localLambda = localLambdaList?.find((item) => item.functionName === awsLambdaData.functionName);
                if (localLambda) {
                    awsLambdaData.isActive = true;
                    awsLambdaData.serverlessName = localLambda.serverlessName;
                    awsLambdaData.invokeData = localLambda.invokeData;
                    awsLambdaData.bookmark = localLambda.bookmark;
                } else {
                    awsLambdaData.isActive = true;
                }
                lambdaList.push(awsLambdaData);
            });
            localLambdaList.forEach((localLambda) => {
                const awsLambda = lambdaList?.find((awsLambdaData) => localLambda.functionName === awsLambdaData.functionName);
                if (!awsLambda) {
                    localLambda.isActive = false;
                    lambdaList.push(localLambda);
                }
            });
        }
        return lambdaList;
    }

}