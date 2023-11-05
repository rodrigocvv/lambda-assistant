import { InvokeData, LambdaData } from '../interfaces/lambda-data.interface';
import { ServerlessAssistant } from '../commons/serverless-assistant';
import { WorkspaceService } from '../services/worskpace.service';

export class InvokeHtml extends ServerlessAssistant {

    workspaceService: WorkspaceService;

    constructor() {
        super();
        this.workspaceService = new WorkspaceService();
    }

    public selectedData = 'request1';

    public getWebViewHtml(lambdaData: LambdaData, invokeResponse: any, loading: boolean) {
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
                            max-width: 80%;
                            padding: 0 4px;
                        }
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
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Settings</title>
                </head>
                <BODY>
                    <script>
                        const vscode = acquireVsCodeApi();
                        function closeResponse(){
                            vscode.postMessage({ command: 'refresh'});
                        }
                        function editServerlessName(){
                            vscode.postMessage({ command: 'editServerlessName'});
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
                    <div class="container">
                        <div class="linha">
                            <div class="coluna" style="width: 400px;">
                                <div style="border:1px solid;border-radius: 10px;border-spacing: 20px;margin-top: 50px; width: 350px;">
                                    <br>
                                    <h2>${lambdaData.functionName}</h2>
                                    <br><br>
                                    <div style="${this.workspaceService.isLambdaFromWorkspace(lambdaData.functionName) ? '' : 'display:none'}">
                                        ServerlessName:
                                        <br>
                                        <span onclick="changeServerlessName()" style="color:red;${lambdaData.serverlessName ? 'display:none' : ''}" >
                                            Not informed!
                                        </span>
                                        ${lambdaData.serverlessName ? lambdaData.serverlessName : ''}
                                        <br>
                                        <button onclick="editServerlessName()">Edit</button>
                                    </div>
                                    <br><br><br>
                                    <button class="form-button" style="margin-left: 10px;width: 200px;height: 25px;${!lambdaData.bookmark ? '' : 'display:none'}" onclick="addBookmark()">Add to bookmark</button>
                                    <button class="form-button" style="margin-left: 10px;width: 200px;height: 25px;${lambdaData.bookmark === true ? '' : 'display:none'}" onclick="removeBookmark()">Remove from bookmark</button>
                                    <br><br>
                                </div>
                            </div>

                            <div class="coluna" style="margin-left: 100px;">
                                <br>
                                <div class="loader" style="margin-left:170px;margin-top:130px;${loading ? '' : 'display:none'}"></div>
                                <div style="${invokeResponse ? '' : 'display:none'}">
                                    <div style="width: 500px;word-break: break-all;margin-left:50px;text-align: left;">
                                        <h3>Response:</h3>
                                        <br>
                                        <pre id="json">${JSON.stringify(invokeResponse, undefined, 2)}</pre>
                                        <br><br><br>
                                        <button style="width: 250px;" class="form-button" onclick="closeResponse()">Close Response</button>
                                    </div>
                                </div>
                                <div style="margin-top:30px;${invokeResponse || loading ? 'display:none' : ''}">
                                    <select name="invokeName" id="invokeName" onchange="changeName(this)">
                                        <option value="request1" ${this.selectedData === 'request1' ? 'selected' : ''}>request1</option>
                                        <option value="request2" ${this.selectedData === 'request2' ? 'selected' : ''}>request2</option>
                                        <option value="request3" ${this.selectedData === 'request3' ? 'selected' : ''}>request3</option>                        
                                    </select>
                                    <button onclick="format()" style="margin-left:320px;">Format JSON</button>
                                    <br>
                                    <textarea id="invokeData" rows="20" cols="70">${this.getSelectedData(lambdaData) || this.getDefaultData()}</textarea>                                
                                    <br><br>
                                    <div style="${this.workspaceService.isLambdaFromWorkspace(lambdaData.functionName) ? '' : 'display:none'}">
                                        <button style="margin-left:0px; width: 170px; height: 40px;" class="form-button" onclick="invokeLocal()">Invoke Local</button>
                                        <button style="margin-left:200px;; width: 170px; height: 40px;" class="form-button" onclick="invokeAws()">Invoke AWS</button>
                                    </div>
                                    <div style="${this.workspaceService.isLambdaFromWorkspace(lambdaData.functionName) ? 'display:none' : ''}">
                                        <button style="width: 170px; height: 40px;" class="form-button" onclick="invokeAws()">Invoke AWS</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </center>
            </BODY>
        </HTML>
        `;
    }

    private getSelectedData(lambdaData: LambdaData) {
        let invokeContent: InvokeData | undefined;
        if (this.selectedData && lambdaData.invokeData && lambdaData.invokeData.length > 0 && lambdaData.invokeData && Array.isArray(lambdaData.invokeData)) {
            invokeContent = lambdaData.invokeData.find((obj) => obj.name === this.selectedData);
        }
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

}