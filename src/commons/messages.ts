export class Messages {

    public static readonly error = {
        badCredentials: 'Error trying to use credentials from profile: ',
        invalidCredentials: 'Invalid Credentials!',
        noServerlessFunctionName: 'For this operation you need to add your function identifier defined in serverless yaml.',
        noServerlessFunctionNameDeploy: 'For this operation you need to add your function identifier defined in serverless yaml. Click to edit ServerlessName in Invoke Page.',
        errorInvokeLambdaAws: 'Error invoking lambda from aws.',
        existingData: ' already exists.'
    };

    public static readonly label = {
        selectStage: "Select your stage:",
        selectAwsProfile: "Select your aws profile:",
        awsGettingData: 'Retrieving data from aws',
        addServerlessName1: 'Add identifier name to ',
        addServerlessName2: " defined in you serverless.yml file under functions section: ",
        worksspaceSettings: 'Workspace Settings'
    };

}