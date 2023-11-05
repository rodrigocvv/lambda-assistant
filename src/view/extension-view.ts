import * as vscode from 'vscode';
import { ServerlessAssistant } from '../commons/serverless-assistant';
export class ExtensionView extends ServerlessAssistant {

    iconPath;

    constructor() {
        super();
        this.iconPath = vscode.Uri.joinPath(this.getContext().extensionUri, 'resources', 'ext_red.png');
    }

}