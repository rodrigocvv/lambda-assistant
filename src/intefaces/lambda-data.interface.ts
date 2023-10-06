export interface LambdaData {
    functionName: string;
    lastModified?: Date;
    functionArn: string;
    serverlessName?: string;
    invokeData?: InvokeData[];
    isActive?: boolean;
}

export interface InvokeData {
    name: string;
    isLocal?: boolean;
    data: string;
}