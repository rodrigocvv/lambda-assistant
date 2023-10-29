import * as fs from 'fs';
import { load } from "js-yaml";
import * as path from 'path';
import * as vscode from 'vscode';
import { AwsData, InvokeData, LambdaData } from '../interfaces/lambda-data.interface';
import { ServerlessAssistant } from "../serverless-assistant";
import { Session } from "../session";

export class WorkspaceService extends ServerlessAssistant {

    public getLambdaList(): LambdaData[] | undefined {
        const currentAwsProfile = this.getContext().workspaceState.get('currentAwsProfile') || 'default';
        const workspaceData = this.getContext().workspaceState.get('workspaceData') as AwsData[];
        const awsData = workspaceData?.find(obj => obj.profileName === currentAwsProfile);
        return awsData?.lambdaList;
    }

    public getLambdaByName(lambdaName: string): LambdaData | undefined {
        const list: LambdaData[] | undefined = this.getLambdaList();
        return list?.find((item) => item.functionName === lambdaName);
    }

    public saveLambdaList(lambdaList: LambdaData[]): void {
        const currentAwsProfile: string = this.getContext().workspaceState.get('currentAwsProfile') || 'default';
        let workspaceData: AwsData[] | undefined = this.getContext().workspaceState.get('workspaceData') as AwsData[];
        let awsData = workspaceData?.find(obj => obj.profileName === currentAwsProfile);
        if (awsData) {
            awsData.lambdaList = lambdaList;
        } else {
            awsData = {
                profileName: currentAwsProfile,
                lambdaList: lambdaList
            };
        }
        workspaceData = workspaceData ? workspaceData : [awsData];
        // console.log('workspaceData => ' + JSON.stringify(workspaceData, undefined, 2));
        this.getContext().workspaceState.update('workspaceData', workspaceData);
    }

    public setStageSupport(value: boolean): void {
        this.getContext().workspaceState.update('stageSupport', value);
        vscode.commands.executeCommand('setContext', 'stageSupport', value);
    }

    public getStageSupport(): boolean {
        return this.getContext().workspaceState.get('stageSupport') || false;
    }

    public removeStage(stage: string): void {
        let stageList: string[] = this.getContext().workspaceState.get('stageList') || [];
        stageList = stageList.filter(stageName => stageName !== stage);
        this.getContext().workspaceState.update('stageList', stageList);
    }    

    public addStage(stage: string): void {
        const stageList: string[] = this.getContext().workspaceState.get('stageList') || [];
        stageList.push(stage);
        this.getContext().workspaceState.update('stageList', stageList);
    }

    public getCurrentStage(): string | undefined {
        const stageSupport = this.getContext().workspaceState.get('stageSupport');
        const currentStage: string | undefined = stageSupport ? this.getContext().workspaceState.get('currentStage') : undefined;
        return currentStage;
    }

    public getStageList(): string[] {
        return this.getContext().workspaceState.get('stageList') || [];
    }

    public getCurrentAwsProfile(): string | undefined {
        return this.getContext().workspaceState.get('currentAwsProfile');
    }

    public setCurrentAwsProfile(awsProfile: string): void {
        this.getContext().workspaceState.update('currentAwsProfile', awsProfile);
    }

    public getCurrentAwsRegion(): string {
        const context = Session.getInstance().getContext()!;
        let awsRegion: string = context.workspaceState.get('awsRegion') || 'us-east-1';
        return awsRegion;
    }

    public setAwsRegion(awsRegion: string): void {
        this.getContext().workspaceState.update('awsRegion', awsRegion);
    }

    public getLogTime(): string {
        const context = Session.getInstance().getContext()!;
        return context.workspaceState.get('logTimeString') || '4h';
    }

    public updateProfileName(oldProfileName: string, newProfileName: string) {
        let workspaceData = this.getContext().workspaceState.get('workspaceData') as AwsData[];
        if (!workspaceData || workspaceData.length < 1) {
            const awsData: AwsData = {
                profileName: newProfileName
            };
            workspaceData = [awsData];
        } else {
            workspaceData.forEach(awsData => {
                if (awsData.profileName === oldProfileName) {
                    awsData.profileName = newProfileName;
                }
            });
        }
        this.getContext().workspaceState.update('workspaceData', workspaceData);
    }

    public setExtensionConfigured(): void {
        this.getContext().workspaceState.update('isExtesionConfigured', true);
        vscode.commands.executeCommand('setContext', 'isExtesionConfigured', true);
    }

    public isExtensionConfigured(): boolean {
        return this.getContext().workspaceState.get('isExtesionConfigured') || false;
    }

    public setPrefix(prefix: string): void {
        this.getContext().workspaceState.update('prefixName', prefix);
    }

    public isLambdaFromWorkspace(lambdaName: string): boolean {
        let prefix: string | undefined = this.getContext().workspaceState.get('prefixName') as string;
        return lambdaName.startsWith(prefix) ? true : false;
    }

    public getPrefix() {
        let prefix: string | undefined = this.getContext().workspaceState.get('prefixName') as string;
        if (!prefix && prefix !== '') {
            if (vscode.workspace && vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders[0]) {
                const fileFolder = vscode?.workspace?.workspaceFolders[0]?.uri.fsPath;
                const filePath = path.join(fileFolder, 'serverless.yml');
                if (fs.existsSync(filePath)) {
                    const fileContent = fs.readFileSync(filePath, 'utf8');
                    prefix = (load(fileContent) as any).service;
                }
            }
        }
        return prefix || '';
    }


    public getPrefixWithStage() {
        let prefix = this.getContext().workspaceState.get('prefixName') as string;
        const stageSupport = this.getContext().workspaceState.get('stageSupport') || false;
        const stageList: string[] | undefined = this.getContext().workspaceState.get('stageList');
        let currentStage;
        if (stageSupport && stageList && (stageList as string[]).length > 0) {
            currentStage = this.getContext().workspaceState.get('currentStage') || stageList[0];
            prefix += '-' + currentStage;
        }
        return prefix;
    }

    public getAwsProfileList(): string[] {
        const workspaceData = this.getContext().workspaceState.get('workspaceData') as AwsData[];
        let awsProfileList = workspaceData?.map((awsProfile) => awsProfile.profileName);
        if (!awsProfileList || awsProfileList.length === 0) {
            awsProfileList = ['default'];
        }
        return awsProfileList;
    }

    public removeAwsProfile(profileName: string): void {
        let workspaceData = this.getContext().workspaceState.get('workspaceData') as AwsData[];
        workspaceData = workspaceData.filter(item => item.profileName !== profileName);
        this.getContext().workspaceState.update('workspaceData', workspaceData);
    }

    public addNewProfile(newProfileName: string): void {
        let workspaceData = this.getContext().workspaceState.get('workspaceData') as AwsData[];
        const existingProfileList = workspaceData?.filter((awsProfile) => awsProfile.profileName === newProfileName);
        if (!existingProfileList || existingProfileList.length === 0) {
            const awsData: AwsData = {
                profileName: newProfileName
            };
            if (workspaceData) {
                workspaceData.push(awsData);
            } else {
                workspaceData = [awsData];
            }
            this.getContext().workspaceState.update('workspaceData', workspaceData);
        } else if (existingProfileList) {
            vscode.window.showErrorMessage(newProfileName + ' already exists.');
        }
    }

    public getAwsCliCommand(): string {
        return this.getContext().workspaceState.get('awsCliCommand') as string || 'aws';
    }

    public setAwsCliCommand(awsCliCommand: string): void {
        this.getContext().workspaceState.update('awsCliCommand', awsCliCommand);
    }

    public getServerlessCliCommand(): string {
        return this.getContext().workspaceState.get('awsServerlessCliCommand') as string || 'serverless';
    }

    public setServerlessCliCommand(serverlessCliCommand: string): void {
        this.getContext().workspaceState.update('awsServerlessCliCommand', serverlessCliCommand);
    }

    public saveInvokeData(lambdaName: string, invokeName: string, invokeContent: string): void {
        const currentAwsProfile: string = this.getContext().workspaceState.get('currentAwsProfile') || 'default';
        let workspaceData: AwsData[] | undefined = this.getContext().workspaceState.get('workspaceData') as AwsData[];
        let awsData: AwsData = workspaceData!.find(obj => obj.profileName === currentAwsProfile) as AwsData;                
        const lambdaLocal = awsData.lambdaList!.find((lambda) => lambda.functionName === lambdaName)!;
        const invokeData: InvokeData = {
            data: invokeContent,
            name: invokeName
        };
        if (lambdaLocal.invokeData) {
            const oldData = lambdaLocal!.invokeData.find(obj => obj.name === invokeData.name);
            if (oldData) {
                oldData.data = invokeContent;
            } else {
                lambdaLocal!.invokeData.push(invokeData);
            }
        } else {
            lambdaLocal!.invokeData = [invokeData];
        }
        // console.log('lambdaLocal => ' + JSON.stringify(lambdaLocal, undefined, 2));
        // console.log('localLambdaList => ' + JSON.stringify(localLambdaList, undefined, 2));
        // awsData.lambdaList = localLambdaList;

        this.getContext().workspaceState.update('workspaceData', workspaceData);

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
        const currentAwsProfile: string = this.getContext().workspaceState.get('currentAwsProfile') || 'default';
        let workspaceData: AwsData[] | undefined = this.getContext().workspaceState.get('workspaceData') as AwsData[];
        let awsData: AwsData = workspaceData!.find(obj => obj.profileName === currentAwsProfile) as AwsData;                
        let oldlambda = awsData.lambdaList!.find((obj) => lambda.functionName === obj.functionName)!;
        oldlambda = lambda;
        this.getContext().workspaceState.update('workspaceData', workspaceData);
    }

    public getTerminalMode(): string{
        return this.getContext().workspaceState.get('terminalMode') || 'windowsCmd';
    }

    public setTerminalMode(terminalMode: string): void {
        this.getContext().workspaceState.update('terminalMode', terminalMode);
    }

}