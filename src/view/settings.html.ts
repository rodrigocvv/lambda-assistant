import * as vscode from 'vscode';
import { ServerlessAssistant } from "../commons/serverless-assistant";
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
                            flex: 30%;
                            max-width: 30%;
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
                    function changeTerminalMode(terminalMode) {
                        vscode.postMessage({ command: 'changeTerminalMode', terminalMode: terminalMode.value });
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
                                <img style="margin-top:30px; margin-left: 10%;" src="${logoSrc}" width="150">


                                <div style="margin-left: 10%;border:1px solid;border-radius: 10px;border-spacing: 20px;margin-top: 60px; width: 200px;">
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

                                <div style="border:1px solid;border-radius: 10px;border-spacing: 20px;margin-top: 30px; width: 250px;">
                                    <div style="padding-top: 20px; margin-bottom: 20px;">
                                        Lambda Prefix Name:<br>
                                        <input type="text" id="prefix" size="20" value="${this.workspaceService.getPrefix()}">
                                        <br><br>
                                        Log Time<br>
                                        <input type="text" id="logTime" value="${this.workspaceService.getLogTime()}">
                                        <br><br>
                                        Terminal Type<br>
                                        <select name="terminalMode" id="terminalMode" onchange="changeTerminalMode(this)">
                                            <option value="windowsCmd" ${this.workspaceService.getTerminalMode() === 'windowsCmd' ? 'selected' : ''}>Windows Cmd</option>
                                            <option value="shell" ${this.workspaceService.getTerminalMode() === 'shell' ? 'selected' : ''}>Shell</option>
                                        </select>
                                        <br><br><br>
                                        <button style="width: 150px;height:30px;" class="form-button" onclick="save()">Save</button>
                                    </div>
                                </div>


                                <div style="border:1px solid;border-radius: 10px;border-spacing: 20px;margin-top: 50px; width: 250px;">
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


                        <div style="border:1px solid;border-radius: 10px;border-spacing: 20px;margin-top: 30px; width: 300px;">
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



                        <div style="border:1px solid;border-radius: 10px;border-spacing: 20px;margin-top: 30px; width: 300px;">
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


    public getWebContentWelcome(logoSrc: vscode.Uri) {
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
                            flex: 50%;
                            max-width: 50%;
                            padding: 0 4px;
                          }

                    </style>                    
                    <title>Settings</title>
                </head>
                <BODY>
                    <script>
                    const vscode = acquireVsCodeApi();
                    function start() {
                        var prefix = document.getElementById("prefix").value;
                        var awsProfile = document.getElementById("awsProfile").value;
                        var awsRegion = document.getElementById("awsRegion").value;
                        vscode.postMessage({ command: 'start', prefix, awsProfile, awsRegion });
                    }
                </script>
                        <div class="container">
                            <div class="linha">
                                <div class="coluna" style="max-width: 25%">
                                    <center><img style="margin-top:35%;" src="${logoSrc}" width="150"></center>
                                </div>
                                <div class="coluna">
                                    <center><h1>Welcome to Serverless Assistant Extension</h1>
                                    <div style="border:1px solid;border-radius: 10px;border-spacing: 20px;margin-top: 30px; width: 500px;">
                                    
                                        <br>
                                        <div style="margin-left: 30px; margin-right: 30px;">This extension searches lambdas and filter using your project/workspace prefix name. If you do not have a prefix use an empty string to load all lambdas.</div>

                                        <br><br>

                                        <table>
                                            <tr>
                                                <td>
                                                    Workspace prefix:
                                                </td>
                                                <td>
                                                    <input type="text" id="prefix" size="20" value="${this.workspaceService.getPrefix()}">
                                                </td>
                                            </tr>
                                            <tr>
                                                <td>
                                                    Profile Name(credentials file):
                                                </td>
                                                <td>
                                                    <input type="text" id="awsProfile" size="20" value="${this.workspaceService.getCurrentAwsProfile() || 'default'}">
                                                </td>
                                            </tr>
                                            <tr>
                                                <td>
                                                    Aws Region:
                                                </td>
                                                <td>
                                                    <input type="text" id="awsRegion" size="20" value="${this.workspaceService.getCurrentAwsRegion()}">
                                                </td>
                                            </tr>
                                        </table>

                                        
                                        <br><br>
                                        <button style="width: 150px;height:30px;" class="form-button" onclick="start()">Start</button>
                                        <br>
                                        <br>
                                        <br>
                                        </center>
                                    </div>

                                </div> <!-- coluna -->
                            </div> <!-- linha -->
                        </div> <!-- container -->
                        <br>
                </BODY>
            </HTML>
        `;
    }


    public getWebContentLoading(): string {
        return `
        <HTML>
            <HEAD>
                <style>
                    .loader {
                        border: 16px solid #f3f3f3; /* Light grey */
                        border-top: 16px solid #3498db; /* Blue */
                        border-radius: 50%;
                        width: 120px;
                        height: 120px;
                        animation: spin 2s linear infinite;
                    }
                    
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                </style>
            </HEAD>
            <BODY>
                <BR><BR><BR><BR><BR><BR><BR>
                <CENTER>
                    <div class="loader"></div>
                </CENTER>
            </BODY>
        </HTML>
        `;
    }


}