export enum Command {
    BOOKMARK_VIEW_REFRESH = 'invokeBookmarkView.refresh',
    BOOKMARK_VIEW_ADD = 'invokeBookmarkView.add',
    LAMBDA_VIEW_REFRESH = 'lambdasView.refresh',
    LAMBDA_VIEW_UPDATE_VIEW = 'lambdasView.updateView',
    LAMBDA_VIEW_UPDATE_STAGE = 'lambdasView.updateStage',
    LAMBDA_VIEW_CHANGE_PROFILE = 'lambdasView.changeAwsProfile',
    LAMBDA_VIEW_DEPLOY = 'lambdaItem.deploy',
    LAMBDA_VIEW_SHOW_LOG = 'lambdaItem.showLog',
    LAMBDA_VIEW_OPEN_SETTINGS = 'lambdaAssistant.openSettings',
    LAMBDA_VIEW_SHOW_DETAILS = 'lambdaAssistant.showLambdaDetails',
    LAMBDA_VIEW_INVOKE = 'lambdaItem.invoke',
    LAMBDA_VIEW_INVOKE_VIEW = 'lambdaAssistant.openInvokeView',
}
