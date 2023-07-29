export const Constants = {
    IDENTITY_URL: 'identityUrl',
    PURCHASE_URL: 'purchaseUrl',
    SIGNAL_R_HUB_URL: 'signalrHubUrlUrl',
    ACTIVATE_CAMPAIGN_DETAIL_FUNCTION: 'activateCampaignDetailFunction'
}

export interface IConfiguration {
    purchaseUrl: string,
    signalrHubUrl: string,
    activateCampaignDetailFunction: boolean
}