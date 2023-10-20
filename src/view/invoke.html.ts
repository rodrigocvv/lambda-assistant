import { InvokeData, LambdaData } from '../intefaces/lambda-data.interface';

export class InvokeHtml {

    public selectedData = 'request1';

    public getWebViewHtml(lambdaData: LambdaData, invokeResponse: any) {
        console.log('getHtml');
        return `
            <HTML>
                <head>
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
                    </style>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Settings</title>
                </head>
                <BODY>
                    <script>
                    const vscode = acquireVsCodeApi();
                    function save() {
                        const data = document.getElementById("invokeData").value;
                        const name = document.getElementById("invokeName").value;
                        vscode.postMessage({ command: 'save', text: data});
                    }
                    function addBookmark() {
                        const data = document.getElementById("invokeData").value;
                        const name = document.getElementById("invokeName").value;
                        vscode.postMessage({ command: 'addBookmark', text: data, invokeName: name });
                    }                    
                    function removeBookmark() {
                        const data = document.getElementById("invokeData").value;
                        const name = document.getElementById("invokeName").value;
                        vscode.postMessage({ command: 'removeBookmark', text: data, invokeName: name  });
                    }                    
                    function invokeAws() {
                        const data = document.getElementById("invokeData").value;
                        const name = document.getElementById("invokeName").value;
                        vscode.postMessage({ command: 'invokeAws', text: data, invokeName: name });
                    }                    
                    function invokeLocal() {
                        const data = document.getElementById("invokeData").value;
                        const name = document.getElementById("invokeName").value;
                        vscode.postMessage({ command: 'invokeLocal', text: data, invokeName: name });
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
    
                    <center>
                        <div style="border:1px solid;border-radius: 10px;border-spacing: 20px;margin-top: 30px; width: 350px;">
                            <h1>${lambdaData.functionName}</h1></center>
                        </div>
                    
                    <br>
                    <center>
                        <table style="table-layout:fixed;">
                            <tr>
                                <td colspan=2>
                                    <select name="invokeName" id="invokeName" onchange="changeName(this)">
                                        <option value="request1" ${this.selectedData === 'request1' ? 'selected' : ''}>request1</option>
                                        <option value="request2" ${this.selectedData === 'request2' ? 'selected' : ''}>request2</option>
                                        <option value="request3" ${this.selectedData === 'request3' ? 'selected' : ''}>request3</option>                        
                                    </select>
                                    <button class="form-button" style="margin-left: 300px;width: 200px;height: 25px;${!lambdaData.bookmark ? '' : 'display:none'}" onclick="addBookmark()">Add to bookmark</button>
                                    <button class="form-button" style="margin-left: 300px;width: 200px;height: 25px;${lambdaData.bookmark === true ? '' : 'display:none'}" onclick="removeBookmark()">Remove from bookmark</button>
                                </td>
                            </tr>
                                <td>
                                    <textarea id="invokeData" rows="20" cols="70">${this.getSelectedData(lambdaData) || this.getDefaultData()}</textarea>                                
                                </td>
                                ${this.getInvokeResponseText(invokeResponse)}
                            </tr>
                        </table>
                        <br>
                        <button onclick="format()">Format</button>
                        <br>
                        <button style="margin-right: 300px;" class="form-button" onclick="invokeLocal()">Invoke Local</button>
                        <button class="form-button" onclick="invokeAws()">Invoke AWS</button>
                        
                    </center>
                </BODY>
            </HTML>
        `;
    }

    public getLoader(): string {
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

    private getSelectedData(lambdaData: LambdaData) {
        // console.log('p1');
        let invokeContent: InvokeData | undefined;
        if (this.selectedData && lambdaData.invokeData && lambdaData.invokeData.length > 0 && lambdaData.invokeData && Array.isArray(lambdaData.invokeData)) {
            invokeContent = lambdaData.invokeData.find((obj) => obj.name === this.selectedData);
        }
        // console.log('p2 - ' + invokeContent?.data);
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
            <td style="width: 500px;word-break: break-all;"><div style="margin-left:50px"><h3>Response:</h3><br>${JSON.stringify(responseInvoke, undefined, 2)}</div></td>
        `;
        }
        return responseHtml;

    }


}