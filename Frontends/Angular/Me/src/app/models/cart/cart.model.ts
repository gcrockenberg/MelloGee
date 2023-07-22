import { ICartItem } from './cart-item.model';

export interface ICart {
    items: ICartItem[];
    buyerId: string;
}
