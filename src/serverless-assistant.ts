import { WorkspaceService } from "./services/worskpace.service";
import { Session } from "./session";
import * as vscode from 'vscode';

export class ServerlessAssistant {

    // private workspaceService: WorkspaceService | undefined;

    // protected getWorkspaceService(): WorkspaceService {
    //     if (!this.workspaceService){
    //         this.workspaceService = new WorkspaceService();
    //     }
    //     return this.workspaceService;
    // }

    protected getContext(): vscode.ExtensionContext {
        return Session.getInstance().getContext()!;
    }

}