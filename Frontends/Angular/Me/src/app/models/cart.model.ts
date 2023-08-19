/**
 * Cart management via SessionId without login
 */
export interface ICart {
    items: ICartItem[];
    sessionId: string; 
}


export interface ICartItem {
    id: string;
    productId: number;
    productName: string;
    unitPrice: number;
    oldUnitPrice: number;
    quantity: number;
    pictureUrl: string;
}


/**
 * Cart checkout creates and Order and clears the Cart
 * Users must be logged in to create an Order
 */
export interface ICartCheckout {
    cartSessionId: string;

    requestId: string;
}
