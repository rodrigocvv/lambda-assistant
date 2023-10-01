import { SettingsConfig } from "./settings-config.interface";

export class SettingHtml {
    public getWebContentSettings(config: SettingsConfig) {
        return `
            <HTML>
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Settings</title>
                </head>
                <BODY>
                    <script>
                    const vscode = acquireVsCodeApi();
                    function removeStage(stage) {
                        vscode.postMessage({ command: 'deleteStage', text: stage });
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
    
                    <center><h1>Lambda Assistant - Settings</h1></center>
                    <center>
                        <table>
                            <tr>
                                <td>Lambda Prefix Name</td>
                                <td><input type="text" id="prefix" value="${config.prefixName}"></td>
                            </tr>
                            <tr>
                                <td>Log Time</td>
                                <td><input type="text" id="logTime" value="${config.logTimeString}"></td>
                            </tr>                            
                            <tr>
                                <td colspan=2></td>
                            </tr>
                        </table>
                        <table>
                            <tr>
                                <td><input type="checkbox" ${config.stageSupport ? 'checked' : ''} id="checkStage" onclick="checkStage()"></td>
                                <td>Add stages support</td>
                            </tr>
                        </table>
                        <table style="display: ${config.stageSupport ? '' : 'none'}">
                            <tr>
                                <td><input type="text" id="newStageName"></td>
                                <td><button onclick="addStage()">+</button></td>
                            </tr>
                            ${this.getStageListHtml(config.stageList)}
                        </table>
                        <br>
                        ${this.getServerlessSupportHtml(config)}
                        <button onclick="save()">Save</button>
                    </center>
                </BODY>
                <script>
                    checkStage();
                </script>
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
                <td><button onclick="removeStage('${stage}')">-</button></td>
            </tr>
        `;
        });
        return html;
    }

}