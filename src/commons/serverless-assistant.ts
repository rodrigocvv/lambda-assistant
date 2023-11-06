import * as vscode from 'vscode';
import { Session } from './session';

export class ServerlessAssistant {
    protected getContext(): vscode.ExtensionContext {
        return Session.getInstance().getContext()!;
    }
}
