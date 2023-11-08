export class Constants {
    public static readonly WEB_VIEW_ID_LAMBDA_DETAILS = 'lambdaDetails';
    public static readonly WEB_VIEW_ID_SETTINGS = 'settings';
    public static readonly WEB_VIEW_ID_INVOKE = 'Invoke';
    public static readonly YES = 'Yes';
    public static readonly NO = 'No';
    public static readonly DEFAULT_PROFILE = 'default';
    public static readonly DEFAULT_SERVERLESS_CLI_COMMAND = 'serverless';
    public static readonly DEFAULT_AWS_CLI_COMMAND = 'aws';
    public static readonly DEFAULT_AWS_REGION = 'us-east-1';
    public static readonly SET_CONTEXT_COMMAND = 'setContext';
    public static readonly DEFAULT_LOG_TIME = '4h';
    public static readonly SERVERLESS_YAML_FILE = 'serverless.yml';
    public static readonly UTF8 = 'utf8';
    public static readonly REQUEST_RESPONSE = 'RequestResponse';
    public static readonly DEPLOY_CLI_COMMAND =
        '{cliCommand} deploy function -f {serverlessName} --verbose {stage} --aws-profile {awsProfile} --region {awsRegion}';
    public static readonly SHOW_LOG_CLI_COMMAND =
        '{cliCommand} logs tail /aws/lambda/{lambdaName} --since {logTime} --follow  --profile {awsProfile} --region {awsRegion}';
    public static readonly INVOKE_LOCAL_CLI_COMMAND =
        '{cliCommand} invoke local -f {serverlessName} {stage} --aws-profile {awsProfile} --region {awsRegion} --data ${data}';
    public static readonly PARAM_CLI_COMMAND = '{cliCommand}';
    public static readonly PARAM_SERVERLESSNAME = '{serverlessName}';
    public static readonly PARAM_STAGE = '{stage}';
    public static readonly PARAM_AWS_PROFILE = '{awsProfile}';
    public static readonly PARAM_AWS_REGION = '{awsRegion}';
    public static readonly PARAM_LAMBDA_NAME = '{lambdaName}';
    public static readonly PARAM_LOG_TIME = '{logTime}';
    public static readonly PARAM_DATA = '{data}';
    public static readonly CLI_PARAM_STAGE = '--stage ';
    public static readonly CLI_PARAM_DATA = '--data ';
    public static readonly ACTION_REFRESH = 'refresh';
    public static readonly ACTION_START = 'start';
    public static readonly ACTION_SAVE = 'save';
    public static readonly ACTION_ADD_NEW_PROFILE = 'addNewProfile';
    public static readonly ACTION_REMOVE_PROFILE = 'removeProfile';
    public static readonly ACTION_ADD_STAGE_SUPPORT = 'addStageSupport';
    public static readonly ACTION_ADD_STAGE = 'addStage';
    public static readonly ACTION_DELETE_STAGE = 'deleteStage';
    public static readonly ACTION_UPDATE_PROFILE = 'updateProfile';
    public static readonly ACTION_CHANGE_REGION = 'changeRegion';
    public static readonly ACTION_UPDATE_CLI_COMMANDS = 'updateCliCommands';
    public static readonly ACTION_CHANGE_TERMINAL_MODE = 'changeTerminalMode';
    public static readonly ACTION_CHANGE_NAME = 'changeName';
    public static readonly ACTION_INVOKE_AWS = 'invokeAws';
    public static readonly ACTION_INVOKE_LOCAL = 'invokeLocal';
    public static readonly ACTION_ADD_BOOKMARK = 'addBookmark';
    public static readonly ACTION_REMOVE_BOOKMARK = 'removeBookmark';
    public static readonly ACTION_EDIT_SERVERLESS_NAME = 'editServerlessName';

}
