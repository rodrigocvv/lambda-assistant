import { AwsData, LambdaData } from '../intefaces/lambda-data.interface';
import { BookmarkProvider } from '../providers/bookmark.provider';
import * as vscode from 'vscode';
export class BookmarkService {

    bookmarkProvider: BookmarkProvider | undefined;

    constructor(private context: vscode.ExtensionContext) {
    }

    public registerBookmarkDataProvider(viewId: string): void {
        const lambdaList = this.getBookmarkLambdaList();
        this.bookmarkProvider = new BookmarkProvider(lambdaList);
        const lambdaDisposable = vscode.window.registerTreeDataProvider(viewId, this.bookmarkProvider);
        this.context.subscriptions.push(lambdaDisposable);
    }

    private getBookmarkLambdaList(): LambdaData[] | undefined {
        const currentAwsProfile = this.context.workspaceState.get('currentAwsProfile') || 'default';
        const workspaceData = this.context.workspaceState.get('workspaceData') as AwsData[];
        const awsData = workspaceData?.find(obj => obj.profileName === currentAwsProfile);
        return awsData?.lambdaList?.filter(obj => obj.bookmark && obj.isActive);
    }

    public registerBookmarkRefreshCommand(viewId: string): void {
        let bookmarkRefreshCommand = vscode.commands.registerCommand(viewId, async () => {
            this.bookmarkProvider?.refresh(this.getBookmarkLambdaList());
        });
        this.context.subscriptions.push(bookmarkRefreshCommand);
    }

    public registerBookmarkNewInvokeCommand(viewId: string): void {
        let bookmarNewInvokeCommand = vscode.commands.registerCommand(viewId, async () => {
            const currentAwsProfile = this.context.workspaceState.get('currentAwsProfile') || 'default';
            const workspaceData = this.context.workspaceState.get('workspaceData') as AwsData[];
            const awsData = workspaceData?.find(obj => obj.profileName === currentAwsProfile);
            // awsData?.lambdaList?.filter(obj => obj.isActive);            
            const lambdaNameList = awsData?.lambdaList?.map(obj => obj.functionName) || [];
            const lambdaName = await vscode.window.showQuickPick(lambdaNameList, { canPickMany: false, title: "Select your lambda:" });
            if (lambdaName) {
                const lambdaData = awsData?.lambdaList?.find(lambda => lambda.functionName === lambdaName);
                vscode.commands.executeCommand('lambdaAssistant.openInvokeView', lambdaData);
            }
        });
        this.context.subscriptions.push(bookmarNewInvokeCommand);
    }


}