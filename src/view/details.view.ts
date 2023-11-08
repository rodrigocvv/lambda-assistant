import * as vscode from 'vscode';
import { Constants } from '../commons/constants';
import { LambdaData } from '../interfaces/lambda-data.interface';
import { AwsService } from '../services/aws.service';
import { WorkspaceService } from '../services/worskpace.service';
import { DetailsHtml } from './details.html';
import { ExtensionView } from './extension-view';

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

    private async refreshLambdaDataFromAws(lambdaData: LambdaData): Promise<void> {
        const refreshedData = await this.awsService.getLambdaDataByName(lambdaData.functionName);
        this.panel!.webview.html = this.detailsHtml.getWebViewHtml(refreshedData);
    }
}
