export class Messages {
    public static readonly error = {
        badCredentials: 'Error trying to use credentials from profile: ',
        invalidCredentials: 'Invalid Credentials!',
        noServerlessFunctionName: 'For this operation you need to add your function identifier defined in serverless yaml.',
        noServerlessFunctionNameDeploy:
            'For this operation you need to add your function identifier defined in serverless yaml. Click to edit ServerlessName in Invoke Page.',
        errorInvokeLambdaAws: 'Error invoking lambda from aws.',
        existingData: ' already exists.',
        fetchAwsData: 'We could not fetch yours lambdas, please check your aws profile settings!',
    };

    public static readonly label = {
        deploy: 'Deploy: ',
        log: 'Log: ',
        invoke: 'Invoke: ',
        selectStage: 'Select your stage:',
        selectAwsProfile: 'Select your aws profile:',
        awsGettingData: 'Retrieving data from aws',
        addServerlessName1: 'Add identifier name to ',
        addServerlessName2: ' defined in you serverless.yml file under functions section: ',
        worksspaceSettings: 'Workspace Settings',
        selectLambda: 'Select your lambda:',
        selectRegion: 'Type new AWS region code(ex: us-east-1):',
        selectNewProfile: 'Inform new profile name for ',
        removeProfilePart1: 'Are you sure you want to delete ',
        removeProfilePart2: ' profile? This action will delete all data related to this profile.',
        prefixSaved: 'Prefix - Data Save!',
        cliCommandSaved: 'Cli Commands Updated!',
        regionSaved: 'Region Changed!',
        profileSaved: 'Profile name updated!',
    };
}
