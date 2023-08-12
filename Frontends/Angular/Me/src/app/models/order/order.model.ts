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

/**
 * Display the status of orders after Checkout
 */
export interface IOrderSummary {
    ordernumber: string;
    status: string;
    date: Date;
    total: number;
    }

    /**
 * Display the status of orders after Checkout
 */
export interface IOrderStatus {
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