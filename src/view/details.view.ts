import * as vscode from 'vscode';
import { LambdaData } from '../interfaces/lambda-data.interface';
import { AwsService } from '../services/aws.service';
import { WorkspaceService } from '../services/worskpace.service';
import { DetailsHtml } from './details.html';
import { ExtensionView } from './extension-view';
import { Constants } from '../commons/constants';

export class DetailsView extends ExtensionView {

    detailsHtml: DetailsHtml;
    awsService: AwsService;
    workspaceService: WorkspaceService;
    lambdaData: LambdaData | undefined;

    constructor() {
        super();
        this.detailsHtml = new DetailsHtml();
        this.awsService = new AwsService();
        this.workspaceService = new WorkspaceService();
    }

    //     panel: vscode.WebviewPanel | undefined;

    // public openView(lambdaData: LambdaData) {
    //     if (!this.panel) {
    //         this.createPanel(lambdaData);
    //     }
    // }

    async executeViewActions(message: any): Promise<void> {
        if (message.command === Constants.ACTION_REFRESH) {
            this.panel!.webview.html = this.detailsHtml.getLoader();
            this.refreshLambdaDataFromAws(this.lambdaData!);
        }
    }

    public registerOpenLambdaDetailsCommand(viewId: string): void {
        let openDetailsCommandDisposable = vscode.commands.registerCommand(viewId, async (lambdaItem) => {
            this.lambdaData = lambdaItem.lambdaData;
            this.openView(Constants.WEB_VIEW_ID_LAMBDA_DETAILS, lambdaItem.lambdaData.functionName, false);
            this.panel!.webview.html = this.detailsHtml.getLoader();
            this.refreshLambdaDataFromAws(this.lambdaData!);
        });
        this.getContext().subscriptions.push(openDetailsCommandDisposable);
    }

    // createPanel(lambdaData: LambdaData) {
    //     this.panel = vscode.window.createWebviewPanel(Constants.WEB_VIEW_ID_LAMBDA_DETAILS, lambdaData.functionName, vscode.ViewColumn.One, {
    //         enableScripts: true,
    //     });

    //     this.panel.webview.html = this.detailsHtml.getLoader();
    //     this.panel.iconPath = this.iconPath;
    //     this.refreshLambdaDataFromAws(lambdaData);

    //     this.panel.webview.onDidReceiveMessage(
    //         (message) => {
    //             switch (message.command) {
    //                 case Constants.ACTION_REFRESH:
    //                     this.panel!.webview.html = this.detailsHtml.getLoader();
    //                     this.refreshLambdaDataFromAws(lambdaData);
    //                     break;
    //             }
    //         },
    //         undefined,
    //         undefined,
    //     );

    //     this.panel.onDidDispose(
    //         () => {
    //             this.panel = undefined;
    //         },
    //         null,
    //         undefined,
    //     );
    // }

    private async refreshLambdaDataFromAws(lambdaData: LambdaData): Promise<void> {
        const refreshedData = await this.awsService.getLambdaDataByName(lambdaData.functionName);
        this.panel!.webview.html = this.detailsHtml.getWebViewHtml(refreshedData);
    }
}
