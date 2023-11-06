import * as vscode from 'vscode';
import { LambdaData } from '../interfaces/lambda-data.interface';
import { AwsService } from '../services/aws.service';
import { WorkspaceService } from '../services/worskpace.service';
import { DetailsHtml } from './details.html';
import { ExtensionView } from './extension-view';

export class DetailsView extends ExtensionView {
    detailsHtml: DetailsHtml;
    awsService: AwsService;
    workspaceService: WorkspaceService;

    constructor() {
        super();
        this.detailsHtml = new DetailsHtml();
        this.awsService = new AwsService();
        this.workspaceService = new WorkspaceService();
    }

    panel: vscode.WebviewPanel | undefined;

    public openView(lambdaData: LambdaData) {
        if (!this.panel) {
            this.createPanel(lambdaData);
        }
    }

    public registerOpenLambdaDetailsCommand(viewId: string): void {
        let openDetailsCommandDisposable = vscode.commands.registerCommand(viewId, async (lambdaItem) => {
            this.openView(lambdaItem.lambdaData);
        });
        this.getContext().subscriptions.push(openDetailsCommandDisposable);
    }

    private createPanel(lambdaData: LambdaData) {
        this.panel = vscode.window.createWebviewPanel('lambdaDetails', lambdaData.functionName, vscode.ViewColumn.One, {
            enableScripts: true,
        });

        this.panel.webview.html = this.detailsHtml.getLoader();
        this.panel.iconPath = this.iconPath;
        this.refreshLambdaDataFromAws(lambdaData);

        this.panel.webview.onDidReceiveMessage(
            (message) => {
                switch (message.command) {
                    case 'refresh':
                        this.panel!.webview.html = this.detailsHtml.getLoader();
                        this.refreshLambdaDataFromAws(lambdaData);
                        break;
                }
            },
            undefined,
            undefined,
        );

        this.panel.onDidDispose(
            () => {
                this.panel = undefined;
            },
            null,
            undefined,
        );
    }

    private async refreshLambdaDataFromAws(lambdaData: LambdaData): Promise<void> {
        const refreshedData = await this.awsService.getLambdaDataByName(lambdaData.functionName);
        this.panel!.webview.html = this.detailsHtml.getWebViewHtml(refreshedData);
    }
}
