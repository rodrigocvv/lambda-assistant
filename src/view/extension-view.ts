import * as vscode from 'vscode';
import { Constants } from '../commons/constants';
import { ServerlessAssistant } from '../commons/serverless-assistant';
export abstract class ExtensionView extends ServerlessAssistant {
    iconPath;
    panel: vscode.WebviewPanel | undefined;

    constructor() {
        super();
        this.iconPath = vscode.Uri.joinPath(this.getContext().extensionUri, Constants.RESOURCES_FOLDER, Constants.ICON_FILE);
    }

    public openView(viewId: string, viewLabel: string, retainContextWhenHidden: boolean) {
        if (!this.panel) {
            this.createPanel(viewId, viewLabel, retainContextWhenHidden);
        }
    }

    abstract executeViewActions(message: any): Promise<void>;

    createPanel(viewId: string, viewLabel: string, retainContextWhenHidden: boolean) {
        this.panel = vscode.window.createWebviewPanel(viewId, viewLabel, vscode.ViewColumn.One, {
            enableScripts: true,
            retainContextWhenHidden,
        });
        this.panel.iconPath = this.iconPath;
        this.panel.webview.onDidReceiveMessage((message) => this.executeViewActions(message), undefined, undefined);
        this.panel.onDidDispose(
            () => {
                this.panel = undefined;
            },
            null,
            undefined,
        );
    }
}
