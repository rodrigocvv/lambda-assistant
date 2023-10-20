export interface LambdaData {
    functionName: string;
    lastModified?: Date;
    functionArn: string;
    serverlessName?: string;
    invokeData?: InvokeData[];
    isActive?: boolean;
    timeout?: number;
    codeSize?: number;
    bookmark?: boolean;
}

export interface InvokeData {
    name: string;
    isLocal?: boolean;
    data: string;
}

export interface AwsData {
    profileName: string;
    lambdaList?: LambdaData[];
    // active: boolean;
}