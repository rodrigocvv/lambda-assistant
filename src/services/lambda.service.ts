import * as vscode from 'vscode';
import { Messages } from '../commons/messages';
import { ServerlessAssistant } from '../commons/serverless-assistant';
import { Command } from '../enums/command.enum';
import { LambdaData } from '../interfaces/lambda-data.interface';
import { LambdaProvider } from '../providers/lambda.provider';
import { AwsService } from './aws.service';
import { WorkspaceService } from './worskpace.service';

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

    public registerUpdateViewCommand(viewId: string): void {
        let refreshLmabdaButonDisposable = vscode.commands.registerCommand(viewId, async () => {
            this.lambdaProvider?.refresh(this.getLambdaList());
            vscode.commands.executeCommand(Command.BOOKMARK_VIEW_REFRESH);
        });
        this.getContext().subscriptions.push(refreshLmabdaButonDisposable);
    }

    public async registerDataRefreshCommand(viewId: string): Promise<void> {
        let refreshLmabdaButonDisposable = vscode.commands.registerCommand(viewId, async () => {
            await this.refreshData();
            const lambdaList = this.getLambdaList();
            this.lambdaProvider?.refresh(lambdaList);
            await vscode.commands.executeCommand(Command.BOOKMARK_VIEW_REFRESH);
        });
        this.getContext().subscriptions.push(refreshLmabdaButonDisposable);
    }

    public async registerChangeStageCommand(viewId: string): Promise<void> {
        let changeStageButonDisposable = vscode.commands.registerCommand(viewId, async () => {
            const stage = await vscode.window.showQuickPick(this.workspaceService.getStageList(), {
                canPickMany: false,
                title: Messages.label.selectStage,
            });
            if (stage) {
                this.workspaceService.setCurrentStage(stage);
                this.lambdaProvider?.refresh(this.getLambdaList());
            }
        });
        this.getContext().subscriptions.push(changeStageButonDisposable);
    }

    public async registerChangeProfileCommand(viewId: string): Promise<void> {
        let changeProfileButonDisposable = vscode.commands.registerCommand(viewId, async () => {
            const awsProfileList = this.workspaceService.getAwsProfileList();
            const currentAwsProfile = await vscode.window.showQuickPick(awsProfileList, {
                canPickMany: false,
                title: Messages.label.selectAwsProfile,
            });
            if (currentAwsProfile) {
                this.workspaceService.setCurrentAwsProfile(currentAwsProfile);
                this.lambdaProvider?.refresh(this.getLambdaList());
                vscode.commands.executeCommand(Command.BOOKMARK_VIEW_REFRESH);
            }
        });
        this.getContext().subscriptions.push(changeProfileButonDisposable);
    }

    public getLambdaList(): LambdaData[] | undefined {
        let lambdaList: LambdaData[] | undefined = this.workspaceService.getLambdaList();
        let filteredList = lambdaList?.filter((obj) => obj.isActive);
        const prefix = this.workspaceService.getPrefixWithStage();
        if (prefix && prefix.length > 0) {
            filteredList = filteredList?.filter((obj) => obj.functionName?.startsWith(this.workspaceService.getPrefixWithStage()));
        }
        return filteredList;
    }

    public async refreshData(): Promise<void> {
        await vscode.window.withProgress(
            {
                location: vscode.ProgressLocation.Notification,
                title: Messages.label.awsGettingData,
                cancellable: true,
            },
            async () => {
                let awsLambdaList = await this.awsService.getAllLambdaList();
                const workspaceService = this.workspaceService;
                const lambdaList = this.mergeLambdaData(awsLambdaList, workspaceService.getLambdaList());
                workspaceService.saveLambdaList(lambdaList);
            },
        );
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
