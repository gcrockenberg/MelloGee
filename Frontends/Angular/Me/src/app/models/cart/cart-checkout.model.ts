export enum CheckoutMode {
    Redirect = 'Redirect',
    Intent = 'Intent'
}


/**
 * Cart checkout creates and Order and clears the Cart
 * Users must be logged in to create an Order
 */
export interface ICartCheckout {
    cartSessionId: string;

    requestId: string;
}