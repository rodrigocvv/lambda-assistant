import * as vscode from 'vscode';
import { WorkspaceService } from '../services/worskpace.service';
export class Session {

    private static instance: Session;

    private static context: vscode.ExtensionContext | undefined;

    private constructor() {
     }

    public static getInstance(): Session {
        if (!Session.instance) {
            Session.instance = new Session();
        }
        return Session.instance;
    }

    public getContext(): vscode.ExtensionContext | undefined {
        return Session.context;
    }

    public setContext(context: vscode.ExtensionContext) {
        Session.context = context;
    }

}