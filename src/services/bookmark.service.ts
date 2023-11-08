import * as vscode from 'vscode';
import { Messages } from '../commons/messages';
import { ServerlessAssistant } from '../commons/serverless-assistant';
import { Command } from '../enums/command.enum';
import { LambdaData } from '../interfaces/lambda-data.interface';
import { LambdaProvider } from '../providers/lambda.provider';
import { WorkspaceService } from './worskpace.service';
export class BookmarkService extends ServerlessAssistant {
    lambdaProvider: LambdaProvider | undefined;
    workspaceService: WorkspaceService;

    constructor() {
        super();
        this.workspaceService = new WorkspaceService();
    }

    public registerBookmarkDataProvider(viewId: string): void {
        const lambdaList = this.getBookmarkLambdaList();
        this.lambdaProvider = new LambdaProvider(lambdaList);
        const lambdaDisposable = vscode.window.registerTreeDataProvider(viewId, this.lambdaProvider);
        this.getContext().subscriptions.push(lambdaDisposable);
    }

    private getBookmarkLambdaList(): LambdaData[] | undefined {
        return this.workspaceService.getLambdaList()?.filter((obj) => obj.bookmark && obj.isActive);
    }

    public registerBookmarkRefreshCommand(viewId: string): void {
        let bookmarkRefreshCommand = vscode.commands.registerCommand(viewId, async () => {
            this.lambdaProvider?.refresh(this.getBookmarkLambdaList());
        });
        this.getContext().subscriptions.push(bookmarkRefreshCommand);
    }

    public registerBookmarkNewInvokeCommand(viewId: string): void {
        let bookmarNewInvokeCommand = vscode.commands.registerCommand(viewId, async () => {
            const lambdaNameList = this.workspaceService.getLambdaList()?.map((obj) => obj.functionName) || [];
            const lambdaName = await vscode.window.showQuickPick(lambdaNameList, {
                canPickMany: false,
                title: Messages.label.selectLambda,
            });
            if (lambdaName) {
                const lambdaData = this.workspaceService.getLambdaList()?.find((lambda) => lambda.functionName === lambdaName);
                vscode.commands.executeCommand(Command.LAMBDA_VIEW_INVOKE_VIEW, lambdaData);
            }
        });
        this.getContext().subscriptions.push(bookmarNewInvokeCommand);
    }
}
