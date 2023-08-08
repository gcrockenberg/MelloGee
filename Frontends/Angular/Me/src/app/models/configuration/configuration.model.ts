export const Constants = {
    IDENTITY_URL: 'identityUrl',
    PURCHASE_URL: 'catalogUrl',
    ORDER_URL: 'orderUrl',
    CART_URL: 'cartUrl',
    SIGNAL_R_HUB_URL: 'signalrHubUrlUrl',
    ACTIVATE_CAMPAIGN_DETAIL_FUNCTION: 'activateCampaignDetailFunction'
}

export interface IConfiguration {
    catalogUrl: string,
    orderUrl: string,
    cartUrl: string,
    signalrHubUrl: string,
    activateCampaignDetailFunction: boolean
}