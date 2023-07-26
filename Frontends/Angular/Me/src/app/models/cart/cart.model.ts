import { ICartItem } from './cart-item.model';

/**
 * Cart management via SessionId without login
 */
export interface ICart {
    items: ICartItem[];
    sessionId: string; 
}
