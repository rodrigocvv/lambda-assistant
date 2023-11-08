import * as fs from 'fs';
import { load } from 'js-yaml';
import * as path from 'path';
import * as vscode from 'vscode';
import { Constants } from '../commons/constants';
import { Messages } from '../commons/messages';
import { ServerlessAssistant } from '../commons/serverless-assistant';
import { Session } from '../commons/session';
import { TerminalMode } from '../enums/terminal.enum';
import { Workspace } from '../enums/workspace.enum';
import { AwsData, InvokeData, LambdaData } from '../interfaces/lambda-data.interface';

export class WorkspaceService extends ServerlessAssistant {
    public getLambdaList(): LambdaData[] | undefined {
        return this.getAwsData()?.lambdaList;
    }

    private getAwsData(): AwsData | undefined {
        const currentAwsProfile = this.getContext().workspaceState.get(Workspace.CURRENT_AWS_PROFILE);
        const workspaceData = this.getContext().workspaceState.get(Workspace.USER_DATA) as AwsData[];
        return workspaceData?.find((obj) => obj.profileName === currentAwsProfile);
    }

    public getLambdaByName(lambdaName: string): LambdaData | undefined {
        const list: LambdaData[] | undefined = this.getLambdaList();
        return list?.find((item) => item.functionName === lambdaName);
    }

    public saveLambdaList(lambdaList: LambdaData[]): void {
        const currentAwsProfile: string = this.getContext().workspaceState.get(Workspace.CURRENT_AWS_PROFILE) || Constants.DEFAULT_PROFILE;
        let workspaceData: AwsData[] | undefined = this.getContext().workspaceState.get(Workspace.USER_DATA) as AwsData[];
        let awsData = workspaceData?.find((obj) => obj.profileName === currentAwsProfile);
        if (awsData) {
            awsData.lambdaList = lambdaList;
        } else {
            awsData = {
                profileName: currentAwsProfile,
                lambdaList: lambdaList,
            };
        }
        workspaceData = workspaceData ? workspaceData : [awsData];
        this.getContext().workspaceState.update(Workspace.USER_DATA, workspaceData);
    }

    public setStageSupport(value: boolean): void {
        this.getContext().workspaceState.update(Workspace.STAGE_SUPPORT, value);
        vscode.commands.executeCommand('setContext', Workspace.STAGE_SUPPORT, value);
    }

    public getStageSupport(): boolean {
        return this.getContext().workspaceState.get(Workspace.STAGE_SUPPORT) || false;
    }

    public removeStage(stage: string): void {
        let stageList: string[] = this.getContext().workspaceState.get(Workspace.STAGE_LIST) || [];
        stageList = stageList.filter((stageName) => stageName !== stage);
        this.getContext().workspaceState.update(Workspace.STAGE_LIST, stageList);
    }

    public addStage(stage: string): void {
        const stageList: string[] = this.getContext().workspaceState.get(Workspace.STAGE_LIST) || [];
        stageList.push(stage);
        this.getContext().workspaceState.update(Workspace.STAGE_LIST, stageList);
    }

    public getCurrentStage(): string | undefined {
        const stageSupport = this.getContext().workspaceState.get(Workspace.STAGE_SUPPORT);
        const currentStage: string | undefined = stageSupport ? this.getContext().workspaceState.get(Workspace.CURRENT_STAGE) : undefined;
        return currentStage;
    }

    public getStageList(): string[] {
        return this.getContext().workspaceState.get(Workspace.STAGE_LIST) || [];
    }

    public getCurrentAwsProfile(): string | undefined {
        return this.getContext().workspaceState.get(Workspace.CURRENT_AWS_PROFILE);
    }

    public setCurrentStage(stage: string): void {
        this.getContext().workspaceState.update(Workspace.CURRENT_STAGE, stage);
    }


    public setCurrentAwsProfile(awsProfile: string): void {
        this.getContext().workspaceState.update(Workspace.CURRENT_AWS_PROFILE, awsProfile);
    }

    public getCurrentAwsRegion(): string {
        const context = Session.getInstance().getContext()!;
        let awsRegion: string = context.workspaceState.get(Workspace.AWS_REGION) || Constants.DEFAULT_AWS_REGION;
        return awsRegion;
    }

    public setAwsRegion(awsRegion: string): void {
        this.getContext().workspaceState.update(Workspace.AWS_REGION, awsRegion);
    }

    public getLogTime(): string {
        const context = Session.getInstance().getContext()!;
        return context.workspaceState.get(Workspace.LOG_TIME) || Constants.DEFAULT_LOG_TIME;
    }

    public updateProfileName(oldProfileName: string, newProfileName: string) {
        let workspaceData = this.getContext().workspaceState.get(Workspace.USER_DATA) as AwsData[];
        if (!workspaceData || workspaceData.length < 1) {
            const awsData: AwsData = {
                profileName: newProfileName,
            };
            workspaceData = [awsData];
        } else {
            workspaceData.forEach((awsData) => {
                if (awsData.profileName === oldProfileName) {
                    awsData.profileName = newProfileName;
                }
            });
        }
        this.getContext().workspaceState.update(Workspace.USER_DATA, workspaceData);
    }

    public setExtensionConfigured(): void {
        this.getContext().workspaceState.update(Workspace.EXTENSION_CONFIGURED, true);
        vscode.commands.executeCommand(Constants.SET_CONTEXT_COMMAND, Workspace.EXTENSION_CONFIGURED, true);
    }

    public isExtensionConfigured(): boolean {
        return this.getContext().workspaceState.get(Workspace.EXTENSION_CONFIGURED) || false;
    }

    public setPrefix(prefix: string): void {
        this.getContext().workspaceState.update(Workspace.PREFIX_NAME, prefix);
    }

    public isLambdaFromWorkspace(lambdaName: string): boolean {
        let prefix: string | undefined = this.getContext().workspaceState.get(Workspace.PREFIX_NAME) as string;
        return lambdaName.startsWith(prefix) ? true : false;
    }

    public getPrefix() {
        let prefix: string | undefined = this.getContext().workspaceState.get(Workspace.PREFIX_NAME) as string;
        if (!prefix && prefix !== '') {
            if (vscode.workspace && vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders[0]) {
                const fileFolder = vscode?.workspace?.workspaceFolders[0]?.uri.fsPath;
                const filePath = path.join(fileFolder, Constants.SERVERLESS_YAML_FILE);
                if (fs.existsSync(filePath)) {
                    const fileContent = fs.readFileSync(filePath, Constants.UTF8);
                    prefix = (load(fileContent) as any).service;
                }
            }
        }
        return prefix || '';
    }

    public getPrefixWithStage() {
        let prefix = this.getContext().workspaceState.get(Workspace.PREFIX_NAME) as string;
        const stageSupport = this.getContext().workspaceState.get(Workspace.STAGE_SUPPORT) || false;
        const stageList: string[] | undefined = this.getContext().workspaceState.get(Workspace.STAGE_LIST);
        let currentStage;
        if (stageSupport && stageList && (stageList as string[]).length > 0) {
            currentStage = this.getContext().workspaceState.get(Workspace.CURRENT_STAGE) || stageList[0];
            prefix += '-' + currentStage;
        }
        return prefix;
    }

    public getAwsProfileList(): string[] {
        const workspaceData = this.getContext().workspaceState.get(Workspace.USER_DATA) as AwsData[];
        let awsProfileList = workspaceData?.map((awsProfile) => awsProfile.profileName);
        if (!awsProfileList || awsProfileList.length === 0) {
            awsProfileList = [Constants.DEFAULT_PROFILE];
        }
        return awsProfileList;
    }

    public removeAwsProfile(profileName: string): void {
        let workspaceData = this.getContext().workspaceState.get(Workspace.USER_DATA) as AwsData[];
        workspaceData = workspaceData.filter((item) => item.profileName !== profileName);
        this.getContext().workspaceState.update(Workspace.USER_DATA, workspaceData);
    }

    public addNewProfile(newProfileName: string): void {
        let workspaceData = this.getContext().workspaceState.get(Workspace.USER_DATA) as AwsData[];
        const existingProfileList = workspaceData?.filter((awsProfile) => awsProfile.profileName === newProfileName);
        if (!existingProfileList || existingProfileList.length === 0) {
            const awsData: AwsData = {
                profileName: newProfileName,
            };
            if (workspaceData) {
                workspaceData.push(awsData);
            } else {
                workspaceData = [awsData];
            }
            this.getContext().workspaceState.update(Workspace.USER_DATA, workspaceData);
        } else if (existingProfileList) {
            vscode.window.showErrorMessage(newProfileName + Messages.error.existingData);
        }
    }

    public getAwsCliCommand(): string {
        return (this.getContext().workspaceState.get(Workspace.AWS_CLI_COMMAND) as string) || Constants.DEFAULT_AWS_CLI_COMMAND;
    }

    public setAwsCliCommand(awsCliCommand: string): void {
        this.getContext().workspaceState.update(Workspace.AWS_CLI_COMMAND, awsCliCommand);
    }

    public getServerlessCliCommand(): string {
        return (
            (this.getContext().workspaceState.get(Workspace.SERVERLESS_CLI_COMMAND) as string) || Constants.DEFAULT_SERVERLESS_CLI_COMMAND
        );
    }

    public setServerlessCliCommand(serverlessCliCommand: string): void {
        this.getContext().workspaceState.update(Workspace.SERVERLESS_CLI_COMMAND, serverlessCliCommand);
    }

    public saveInvokeData(lambdaName: string, invokeName: string, invokeContent: string): void {
        const currentAwsProfile: string = this.getContext().workspaceState.get(Workspace.CURRENT_AWS_PROFILE) || Constants.DEFAULT_PROFILE;
        let workspaceData: AwsData[] | undefined = this.getContext().workspaceState.get(Workspace.USER_DATA) as AwsData[];
        let awsData: AwsData = workspaceData!.find((obj) => obj.profileName === currentAwsProfile) as AwsData;
        const lambdaLocal = awsData.lambdaList!.find((lambda) => lambda.functionName === lambdaName)!;
        const invokeData: InvokeData = {
            data: invokeContent,
            name: invokeName,
        };
        if (lambdaLocal.invokeData) {
            const oldData = lambdaLocal!.invokeData.find((obj) => obj.name === invokeData.name);
            if (oldData) {
                oldData.data = invokeContent;
            } else {
                lambdaLocal!.invokeData.push(invokeData);
            }
        } else {
            lambdaLocal!.invokeData = [invokeData];
        }

        this.getContext().workspaceState.update(Workspace.USER_DATA, workspaceData);
    }

    public setBookmark(lambdaName: string, isBookmark: boolean): void {
        const lambdaLocal = this.getLambdaByName(lambdaName)!;
        lambdaLocal.bookmark = isBookmark;
        this.updateLambda(lambdaLocal);
    }

    public setServerlessName(lambdaName: string, serverlessName: string): void {
        const lambdaLocal = this.getLambdaByName(lambdaName)!;
        lambdaLocal.serverlessName = serverlessName;
        this.updateLambda(lambdaLocal);
    }

    private updateLambda(lambda: LambdaData): void {
        const currentAwsProfile: string = this.getContext().workspaceState.get(Workspace.CURRENT_AWS_PROFILE) || Constants.DEFAULT_PROFILE;
        let workspaceData: AwsData[] | undefined = this.getContext().workspaceState.get(Workspace.USER_DATA) as AwsData[];
        let awsData: AwsData = workspaceData!.find((obj) => obj.profileName === currentAwsProfile) as AwsData;
        let oldlambda = awsData.lambdaList!.find((obj) => lambda.functionName === obj.functionName)!;
        oldlambda = lambda;
        this.getContext().workspaceState.update(Workspace.USER_DATA, workspaceData);
    }

    public getTerminalMode(): string {
        return this.getContext().workspaceState.get(Workspace.TERMINAL_MODE) || TerminalMode.WINDOWS_CMD;
    }

    public setTerminalMode(terminalMode: string): void {
        this.getContext().workspaceState.update(Workspace.TERMINAL_MODE, terminalMode);
    }
}
