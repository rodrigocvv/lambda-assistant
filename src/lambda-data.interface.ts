export interface LambdaData {
    functionName: string;
    lastModified?: Date;
    functionArn: string;
    serverlessName?: string;
    invokeData?: string;
    isActive?: boolean;
}