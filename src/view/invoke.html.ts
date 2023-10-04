import { InvokeData, LambdaData } from '../intefaces/lambda-data.interface';

export class InvokeHtml {

    public selectedData = 'request1';

    public getWebViewHtml(lambdaData: LambdaData, invokeResponse: any) {
        console.log('getHtml');
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
                        const data = document.getElementById("invokeData").value;
                        const invokeLocal = document.getElementById("invokeLocal").checked;
                        const name = document.getElementById("invokeName").value;
                        vscode.postMessage({ command: 'save', text: data, invokeLocal: invokeLocal ? true: false, name });
                    }
                    function changeName(obj) {
                        const name = obj.value;
                        // document.getElementById("invokeData").value = name;
                        // console.log('name => ' + name);
                        vscode.postMessage({ command: 'changeName', text: name });
                    }
                    function format() {
                        const data = document.getElementById("invokeData").value;
                        document.getElementById("invokeData").value = JSON.stringify(JSON.parse(data), undefined, 2);
                    }                    
                </script>
    
                    <center><h1>${lambdaData.functionName}</h1></center>
                    <br><br>
                    <select name="invokeName" id="invokeName" onchange="changeName(this)">
                        <option value="request1" ${this.selectedData === 'request1' ? 'selected' : ''}>request1</option>
                        <option value="request2" ${this.selectedData === 'request2' ? 'selected' : ''}>request2</option>
                        <option value="request3" ${this.selectedData === 'request3' ? 'selected' : ''}>request3</option>                        
                    </select>
                    <br>
                    <center>
                        <table>
                            <tr>
                                <td colspan=2>Data:  </td>
                            </tr>
                                <td colspan=2>
                                    <textarea id="invokeData" rows="20" cols="120">${this.getSelectedData(lambdaData) || this.getDefaultData()}</textarea>                                
                                </td>
                            </tr>
                            <tr>
                                <td><input readonly type="checkbox" checked id="invokeLocal"></td>
                                <td>Invoke Local</td>
                            </tr>
                        </table>
                        <br>
                        <button onclick="format()">Format</button> - <button onclick="save()">Invoke</button>
                        ${this.getInvokeResponseText(invokeResponse)}
                    </center>
                </BODY>
                <script>
                    checkStage();
                </script>
            </HTML>
        `;
    }

    private getSelectedData(lambdaData: LambdaData) {
        console.log('p1');
        let invokeContent: InvokeData | undefined;
        if (this.selectedData && lambdaData.invokeData && lambdaData.invokeData.length > 0){
            invokeContent = lambdaData.invokeData.find((obj) => obj.name === this.selectedData);
        }
        console.log('p2 - ' + invokeContent?.data);
        return invokeContent?.data;
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