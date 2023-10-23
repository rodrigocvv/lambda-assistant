import * as vscode from 'vscode';
import { ServerlessAssistant } from "../serverless-assistant";
import { WorkspaceService } from "../services/worskpace.service";

export class SettingHtml extends ServerlessAssistant {

    workspaceService: WorkspaceService;

    constructor() {
        super();
        this.workspaceService = new WorkspaceService();
    }

    public getWebContentSettings(logoSrc: vscode.Uri) {
        return `
            <HTML>
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <style>
                        .form-button {
                            background: #0066A2;
                            color: white;
                            border-style: outset;
                            border-color: #0066A2;
                            height: 50px;
                            width: 100px;
                            font: bold15px arial,sans-serif;
                            text-shadow: none;
                        }
                        .container {
                            max-width: 100%;
                            margin: auto;
                          }
                          
                          .linha {
                            display: flex;
                            flex-wrap: wrap;
                            padding: 0 4px;
                          }
                          
                          .coluna {
                            flex: 25%;
                            max-width: 25%;
                            padding: 0 4px;
                          }

                    </style>                    
                    <title>Settings</title>
                </head>
                <BODY>
                    <script>
                    const vscode = acquireVsCodeApi();
                    function changeRegion() {
                        vscode.postMessage({ command: 'changeRegion' });
                    }                    
                    function removeStage(stage) {
                        vscode.postMessage({ command: 'deleteStage', text: stage });
                    }      
                    function updateProfile(profile) {
                        vscode.postMessage({ command: 'updateProfile', profileName: profile });
                    }                                                    
                    function removeProfile(profile) {
                        vscode.postMessage({ command: 'removeProfile', profileName: profile });
                    }                                                    
                    function addNewProfile() {
                        vscode.postMessage({ command: 'addNewProfile', profileName: document.getElementById("newAwsProfile").value });
                    }                                                    
                    function save() {
                        vscode.postMessage({ command: 'save', text: document.getElementById("prefix").value });
                    }
                    function checkStage(){
                        var checked = document.getElementById("checkStage").checked;
                        vscode.postMessage({ command: 'addStageSupport', text: checked });
                    }
                    function checkServerless(){
                        var checked = document.getElementById("checkServerless").checked;
                        vscode.postMessage({ command: 'addServerlessSupport', text: checked });
                    }
                    function addStage() {
                        vscode.postMessage({ command: 'addStage', text: document.getElementById("newStageName").value });
                    } 
                    function updateCliCommands() {
                        const awsCliCommand = document.getElementById("awsCliCommand").value;
                        const serverlessCliCommand = document.getElementById("serverlessCliCommand").value;
                        vscode.postMessage({ command: 'updateCliCommands', awsCliCommand, serverlessCliCommand });
                    }
                </script>
    
                    <center><h1>Workspace Settings</h1></center>

                    <center>
                    

                    <div class="container">
                        <div class="linha">
                            <div class="coluna">
                                <img style="margin-top:30px; margin-left: 140px;" src="${logoSrc}" width="150">


                                <div style="margin-left: 140px;border:1px solid;border-radius: 10px;border-spacing: 20px;margin-top: 60px; width: 200px;">
                                    <div style="padding-top: 20px; margin-bottom: 20px;">
                                        AWS Region
                                        <br><br>
                                        ${this.workspaceService.getCurrentAwsRegion()}
                                        <br><br>
                                        <button style="width: 150px;height:30px;" class="form-button" onclick="changeRegion()">Change Region</button>
                                    </div>
                                </div>
    

                            </div>
                            <div class="coluna">

                                <div style="border:1px solid;border-radius: 10px;border-spacing: 20px;margin-top: 30px; width: 350px;">
                                    <div style="padding-top: 20px; margin-bottom: 20px;">

                                        <table style="">
                                            <tr>
                                                <td>Lambda Prefix Name</td>
                                                <td><input type="text" id="prefix" size="20" value="${this.workspaceService.getPrefix()}"></td>
                                            </tr>
                                            <tr>
                                                <td>Log Time</td>
                                                <td><input type="text" id="logTime" value="${this.workspaceService.getLogTime()}"></td>
                                            </tr>                            
                                        </table>
                                        <br>
                                        <button style="width: 150px;height:30px;" class="form-button" onclick="save()">Save</button>
                                    </div>
                                </div>


                                <div style="border:1px solid;border-radius: 10px;border-spacing: 20px;margin-top: 70px; width: 350px;">
                                <div style="padding-top: 20px; margin-bottom: 20px;">
                                <table>
                                    <tr>
                                        <td><input type="checkbox" ${this.workspaceService.getStageSupport() ? 'checked' : ''} id="checkStage" onclick="checkStage()"></td>
                                        <td>Add stages support</td>
                                    </tr>
                                </table>
                                <table style="display: ${this.workspaceService.getStageSupport() ? '' : 'none'}; padding-top: 20px;">
                                    <tr>
                                        <td><input type="text" id="newStageName"></td>
                                        <td><button onclick="addStage()" style="width:25px;">+</button></td>
                                    </tr>
                                    ${this.getStageListHtml(this.workspaceService.getStageList())}
                                </table>
                                </div>
                            </div>

        


                        </div>
                        <div class="coluna">


                        <div style="border:1px solid;border-radius: 10px;border-spacing: 20px;margin-top: 30px; width: 350px;">
                            <div style="padding-top: 20px; margin-bottom: 20px;">
                                AWS Cli Command:
                                <br>
                                <input type="text" id="awsCliCommand" size="30" value="${this.workspaceService.getAwsCliCommand()}">
                                <br>
                                <br>
                                Serverless Cli Command:
                                <br>
                                <input type="text" id="serverlessCliCommand" size="30" value="${this.workspaceService.getServerlessCliCommand()}">
                                <br>
                                <br>
                                <button style="width: 150px;height:30px;" class="form-button" onclick="updateCliCommands()">Update</button>
                            </div>
                        </div>



                        <div style="border:1px solid;border-radius: 10px;border-spacing: 20px;margin-top: 30px; width: 350px;">
                            <div style="padding-top: 20px; margin-bottom: 20px;">
                                AWS Profile List
                                <br>
                                * Use update button  to keep invoke historic and functions data.
                                <table style="padding-top: 20px;">
                                    <tr>
                                        <td><input type="text" id="newAwsProfile"></td>
                                        <td><button onclick="addNewProfile()" style="width:25px;">+</button></td>
                                    </tr>
                                    ${this.getProfileListHtml(this.workspaceService.getAwsProfileList())}
                                </table>
                            </div>
                        </div>




                        </div> <!-- coluna -->
                    </div> <!-- linha -->
                </div> <!-- container -->





                        <br>
                        
                        
                    </center>
                </BODY>
            </HTML>
        `;
    }

    private getStageListHtml(stageList: string[] | undefined): string {
        let html = '';
        stageList?.forEach((stage: string) => {
            html += `
            <tr>
                <td>${stage}</td>
                <td><button onclick="removeStage('${stage}')" style="width:25px;">-</button></td>
            </tr>
        `;
        });
        return html;
    }

    private getProfileListHtml(profileList: string[] | undefined): string {
        let html = '';
        profileList?.forEach((profile: string) => {
            html += `
            <tr>
                <td>${profile} - <button onclick="updateProfile('${profile}')" style="width:55px;">Update</button></td>
                <td><button onclick="removeProfile('${profile}')" ${profileList.length < 2 ? 'disabled' : ''} style="width:25px;">-</button></td>
            </tr>
        `;
        });
        return html;
    }

}