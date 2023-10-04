import * as vscode from 'vscode';
import { LambdaData } from './intefaces/lambda-data.interface';

export class LambdaProvider implements vscode.TreeDataProvider<LambdaItem> {

    private _onDidChangeTreeData: vscode.EventEmitter<LambdaItem | undefined | void> = new vscode.EventEmitter<LambdaItem | undefined | void>();
    readonly onDidChangeTreeData: vscode.Event<LambdaItem | undefined | void> = this._onDidChangeTreeData.event;

    data: LambdaItem[] | undefined;

    constructor(lambdaList: LambdaData[] | undefined) {
        this.data = this.getDataFromLambdaList(lambdaList);
    }

    private getDataFromLambdaList(lambdaList: LambdaData[] | undefined): LambdaItem[] | undefined {
        let data;
        if (lambdaList && lambdaList.length > 0) {
            data = [];
            lambdaList.forEach(lambda => data.push(new LambdaItem(lambda, vscode.TreeItemCollapsibleState.None)));
        }
        return data;
    }

    getTreeItem(element: LambdaItem): vscode.TreeItem {
        return element;
    }

    refresh(lambdaList: LambdaData[] | undefined): void {
        this.data = this.getDataFromLambdaList(lambdaList);
        this._onDidChangeTreeData.fire();
    }

    getChildren(element?: LambdaItem | undefined): vscode.ProviderResult<LambdaItem[]> {
        if (element === undefined) {
            return this.data;
        }
    }
}

class LambdaItem extends vscode.TreeItem {
    constructor(
        public lambdaData: LambdaData,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState
    ) {
        super(lambdaData.functionName, collapsibleState);
    }
}

