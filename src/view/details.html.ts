import { LambdaData } from "../interfaces/lambda-data.interface";

export class DetailsHtml {
    public getWebViewHtml(lambdaData: LambdaData) {
        return `
            <HTML>
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Settings</title>
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
                            max-width: 550px;
                            padding: 0 4px;
                          }                        
                    </style>
                </head>
                <BODY>
                    <script>
                    const vscode = acquireVsCodeApi();
                    function refresh() {
                        vscode.postMessage({ command: 'refresh' });
                    }
                </script>
                    <center>
                    <div class="container">
                        <div class="linha">
                            <div class="coluna" style="width: 450px;">
                                <div style="border:1px solid;border-radius: 10px;border-spacing: 20px;margin-top: 90px; width: 400px;">
                                    <br>
                                    <h1>${lambdaData.functionName}</h1>
                                    <br>
                                    Last modified: ${new Date(lambdaData.lastModified!).toISOString().replace(/T/, ' ').replace(/\..+/, '')}
                                    <br><br>
                                    Size: ${(lambdaData.codeSize! / (1024 * 1024)).toFixed(2)} MB
                                    <br><br>
                                    Timeout: ${lambdaData.timeout}s
                                    <br><br><br>
                                    <button class="form-button" style="width: 170px; height: 40px;" onclick="refresh()">Refresh</button>
                                    <br><br><br>
                                </div>
                            </div>
                            <div class="coluna" style="width: 550px;">
                                ${this.getTagsHtmlTable(lambdaData.tags)}
                            </div>
                        </div>
                    </div>
                    </center>
                </BODY>
                <script>
                    checkStage();
                </script>
            </HTML>
        `;
    }

    private getTagsHtmlTable(tags: any): string {
        let html ='';
        if (tags){
            html = `
                <div style="border:1px solid;border-radius: 10px;border-spacing: 20px;margin-top: 90px; width: 500px;">
                    <h4>Tags</h4>
                    <table style="margin-left:20px; margin-right: 20px; margin-bottom:30px;">            
            `;
            for (const [key, value] of Object.entries(tags)) { 
                html += `<tr><td>${key}</td><td>${value}</td>
                </tr>
                `;
            }
            html += '</table></div>';
        }
        return html;
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

}