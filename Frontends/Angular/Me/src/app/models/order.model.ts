
export enum CheckoutMode {
    Redirect = 'redirect',
    Intent = 'intent'
}


/**
 * Order checkout activates Stripe payment to transition Order to Paid status
 * TODO: Clear out unnecessary fields now that Stripe is handling checkout
 */
export interface IOrderCheckout {
    cartSessionId: string;
    orderNumber: string;
    orderItems: IOrderItem[];
    total: number;
    street: string;
    city: string;
    state: string;
    zipcode: string;
    country: string;
    cardholdername: string;
    cardtypeid: number;
    cardnumber: string;
    cardexpiration: Date;
    expiration: string;
    cardsecuritynumber: string;
}


/**
 * Stripe integration
 */
export interface ICheckoutResponse {
    orderId: number;
    url: string;            // If checkout mode is redirect
    clientSecret: string;   // If checkout mode is intent
}


/**
 * For brief listing
 */
export interface IOrderSummary {
    orderNumber: number;
    status: string;
    date: Date;
    total: number;
}


export interface IOrderItem {
    pictureUrl: string;
    productName: string;
    unitPrice: number;
    units: number;
    productId: number;
}


export interface IOrderDetailsResponse {
    orderNumber: number;
    date: Date;
    status: string;
    description: string;
    street: string;
    city: number;
    state: string;
    zipCode: string;
    country: number;
    stripeMode: string;
    redirectUrl: string;
    clientSecret: string;
    total: number;
    orderItems: IOrderItem[];
}


/**
 * Response from orders/pay
 */
export interface IPayOrderResponse {
    order: IOrderDetailsResponse;
    payment: ICheckoutResponse;
}


/**
 * Post to orders/pay/mode&oid=orderId
 */
export interface IPayOrderRequest {
    orderId: number;
    mode: CheckoutMode;
    cancelRoute: string;
    successRoute: string;
}


export interface IStripeCancelComponent {
    isStripeCancelComponent(): this is IStripeCancelComponent;
}

/**
 * Route components are uninstantiated class Type at runtime. To determine if the class is of this type
 * you must either instatiate it and check the obj for the method OR parse the class definition
 * for the existence of the method
 * @param component from the Route definition
 * @returns true if the component is determined to be of type IStripeCancelComponent, else false
 */
export function isStripeCancelComponent(component: IStripeCancelComponent): component is IStripeCancelComponent {
    return (undefined !== component && -1 < component.toString().indexOf("isStripeCancelComponent()"));
}


export interface IStripeSuccessComponent {
    isStripeSuccessComponent(): this is IStripeSuccessComponent;
}

/**
 * Route components are uninstantiated class Type at runtime. To determine if the class is of this type
 * you must either instatiate it and check the obj for the method OR parse the class definition
 * for the existence of the method
 * @param component from the Route definition
 * @returns true if the component is determined to be of type IStripeSuccessComponent, else false
 */
export function isStripeSuccessComponent(component: IStripeSuccessComponent): component is IStripeSuccessComponent {
    return (undefined !== component && -1 < component.toString().indexOf("isStripeSuccessComponent()"));
}
