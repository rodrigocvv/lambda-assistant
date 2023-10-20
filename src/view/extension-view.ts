import * as vscode from 'vscode';
export class ExtensionView {

    logoUri;

    constructor(context: vscode.ExtensionContext) {
        this.logoUri = vscode.Uri.joinPath(context.extensionUri, 'resources', 'icon.png');
    }

}