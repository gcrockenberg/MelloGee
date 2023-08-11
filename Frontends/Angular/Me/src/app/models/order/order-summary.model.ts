/**
 * Display the status of orders after Checkout
 */
export interface IOrderSummary {
    ordernumber: string;
    status: string;
    date: Date;
    total: number;
    }