import { SettingsConfig } from "../intefaces/settings-config.interface";
import * as vscode from 'vscode';

export class SettingHtml {
    public getWebContentSettings(config: SettingsConfig, awsProfileList: string[], logoSrc: vscode.Uri) {
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
                </script>
    
                    <center><h1>Workspace Settings</h1></center>

                    <center>
                    

                    <div class="container">
                        <div class="linha">
                            <div class="coluna">
                                <img src="${logoSrc}" width="150">
                            </div>
                            <div class="coluna">

                                <div style="border:1px solid;border-radius: 10px;border-spacing: 20px;margin-top: 30px; width: 350px;">
                                    <div style="padding-top: 20px; margin-bottom: 20px;">

                                        <table style="">
                                            <tr>
                                                <td>Lambda Prefix Name</td>
                                                <td><input type="text" id="prefix" size="20" value="${config.prefixName}"></td>
                                            </tr>
                                            <tr>
                                                <td>Log Time</td>
                                                <td><input type="text" id="logTime" value="${config.logTimeString}"></td>
                                            </tr>                            
                                        </table>
                                        <br>
                                        <button style="width: 150px;height:30px;" class="form-button" onclick="save()">Save</button>
                                    </div>
                                </div>


                                <div style="border:1px solid;border-radius: 10px;border-spacing: 20px;margin-top: 30px; width: 350px;">
                                <div style="padding-top: 20px; margin-bottom: 20px;">
                                <table>
                                    <tr>
                                        <td><input type="checkbox" ${config.stageSupport ? 'checked' : ''} id="checkStage" onclick="checkStage()"></td>
                                        <td>Add stages support</td>
                                    </tr>
                                </table>
                                <table style="display: ${config.stageSupport ? '' : 'none'}; padding-top: 20px;">
                                    <tr>
                                        <td><input type="text" id="newStageName"></td>
                                        <td><button onclick="addStage()" style="width:25px;">+</button></td>
                                    </tr>
                                    ${this.getStageListHtml(config.stageList)}
                                </table>
                                </div>
                            </div>

        


                        </div>
                        <div class="coluna">


                        <div style="border:1px solid;border-radius: 10px;border-spacing: 20px;margin-top: 30px; width: 350px;">
                            <div style="padding-top: 20px; margin-bottom: 20px;">
                                AWS Region
                                <br><br>
                                ${config.awsRegion}
                                <br><br>
                                <button style="width: 150px;height:30px;" class="form-button" onclick="changeRegion()">Change Region</button>
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
                                    ${this.getProfileListHtml(awsProfileList)}
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

    private getServerlessSupportHtml(config: SettingsConfig): string {
        let html = `
        <table>
            <tr>
                <td><input type="checkbox" ${config.serverlessSupport ? 'checked' : ''} id="checkServerless" onclick="checkServerless()"></td>
                <td>Add serverless support</td>
            </tr>
        </table>
        <table style="display: ${config.serverlessSupport ? '' : 'none'}">
            <tr>
                <td>Deploy command. Add you custom parameter:</td>
            </tr>
            <tr>
                <td>serverless deploy ${config.stageSupport ? '--stage stage' : ''} -f {lambdaName}}</td>
                <td><input type="text" value="${config.servelessDeployParams}" ></td>
            </tr>
        </table>

        `;

        return html;
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
                <td><button onclick="removeProfile('${profile}')" ${profileList.length <2 ? 'disabled' : ''} style="width:25px;">-</button></td>
            </tr>
        `;
        });
        return html;
    }    

}