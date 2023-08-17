import { CheckoutMode } from "../cart/cart-checkout.model";


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
    orderNumber: string;
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


export interface IOrderDetails {
    orderNumber: string;
    date: Date;
    status: string;
    description: string;
    street: string;
    city: number;
    state: string;
    zipCode: string;
    country: number;
    total: number;
    orderItems: IOrderItem[];
}


/**
 * Response from orders/pay
 */
export interface IPayOrder {
    order: IOrderDetails;
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