import { LambdaData } from "./lambda-data.interface";
import { SettingsConfig } from "./settings-config.interface";

export class FunctionsSettingsHtml {
    public getWebViewHtml(lambdaData: LambdaData) {
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
                    function save() {
                        vscode.postMessage({ command: 'save', text: document.getElementById("serverlessName").value });
                    }
                </script>
    
                    <center><h1>${lambdaData.functionName}</h1></center>
                    <center>
                        <table>
                            <tr>
                                <td>Serverless Yaml Function Name:  </td>
                                <td><input type="text" id="serverlessName" value="${lambdaData.serverlessName || ''}"></td>
                            </tr>
                            <tr>
                                <td colspan=2></td>
                            </tr>
                        </table>
                        <br>
                        <button onclick="save()">Save</button>
                    </center>
                </BODY>
                <script>
                    checkStage();
                </script>
            </HTML>
        `;
    }


}