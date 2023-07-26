import { IOrderItem } from '../cart/order-item.model';

/**
 * User must be logged in to create Order
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
