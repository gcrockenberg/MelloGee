import { IOrderItem } from './order-item.model';

/**
 * User must be logged in to create Order
 * Orders are posted to Checkout process
 */
export interface IOrder {
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
