import { LambdaData } from "../lambda-data.interface";

export class InvokeHtml {
    public getWebViewHtml(lambdaData: LambdaData, invokeResponse: any) {
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
                        vscode.postMessage({ command: 'save', text: document.getElementById("invokeData").value, invokeLocal: document.getElementById("invokeLocal").checked ? true: false });
                    }
                </script>
    
                    <center><h1>${lambdaData.functionName}</h1></center>
                    <center>
                        <table>
                            <tr>
                                <td colspan=2>Data:  </td>
                            </tr>
                                <td colspan=2>
                                    <textarea id="invokeData" rows="20" cols="120">${lambdaData.invokeData || this.getDefaultData()}</textarea>                                
                                </td>
                            </tr>
                            <tr>
                                <td><input readonly type="checkbox" checked id="invokeLocal"></td>
                                <td>Invoke Local</td>
                            </tr>
                        </table>
                        <br>
                        <button onclick="save()">Invoke</button>
                        ${this.getInvokeResponseText(invokeResponse)}
                    </center>
                </BODY>
                <script>
                    checkStage();
                </script>
            </HTML>
        `;
    }

    private getDefaultData() {
        const dataContent = {
            queryStringParameters: {
                queryParameterName: "test1"
            },
            pathParameters: {
                pathParameterName: "test2"
            },
            body: "{ \"data\": \"test3\"}"
        };
        return JSON.stringify(dataContent, undefined, 2);
    }

    private getInvokeResponseText(responseInvoke: any) {
        let responseHtml = '';
        if (responseInvoke) {
            responseHtml = `
            <br>
            <h3>Response:</h3>
            <br>
            ${JSON.stringify(responseInvoke, undefined, 2)}
        `;
        }
        return responseHtml;

    }


}