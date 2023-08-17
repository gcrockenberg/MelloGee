import { CheckoutMode } from "../cart/cart-checkout.model";


/**
 * User must be logged in to create Order
 * OrderCheckout is posted to the Checkout process
 * TODO: Clear out unnecessary fields now that Stripe is handling checkout
 */
export interface IOrderCheckout {
    cartSessionId: string;
    ordernumber: string;
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


export interface ICheckoutResponse {
    orderId: number;
    url: string;            // If checkout mode is redirect
    clientSecret: string;   // If checkout mode is intent
}

export interface IOrderSummary {
    ordernumber: string;
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