import {IOrderItem} from './order-item.model';

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