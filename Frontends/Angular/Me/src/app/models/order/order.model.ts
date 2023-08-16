

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
    url: string;            // If checkout mode is redirect
    clientSecret: string;   // If checkout mode is intent
    orderId: number;
}

export interface IOrderSummary {
    ordernumber: string;
    status: string;
    date: Date;
    total: number;
}


export interface IOrderItem {
    pictureurl: string;
    productname: string;
    unitprice: number;
    units: number;
    productId: number;
}


export interface IOrderDetails {
    ordernumber: string;
    status: string;
    description: string;
    street: string;
    date: Date;
    city: number;
    state: string;
    zipcode: string;
    country: number;
    total: number;
    orderitems: IOrderItem[];
}