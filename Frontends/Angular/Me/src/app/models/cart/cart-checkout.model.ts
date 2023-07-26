export interface ICartCheckout {
    city: string;
    street: string;
    state: string;
    country: string;
    zipcode: string;
    cardnumber: string;
    cardholdername: string;
    cardexpiration: Date;
    cardsecuritynumber: string;
    cardtypeid: number;
    buyer: string;
    requestid: string;
    cartsessionid: string;
}