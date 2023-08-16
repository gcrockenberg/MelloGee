export enum CheckoutMode {
    Redirect = 'Redirect',
    Intent = 'Intent'
}

export interface ICartCheckout {
    mode: CheckoutMode;
    successRoute: string;   // Stripe callback (e.g. "/orders")
    cancelRoute: string;    // Stripe callback (e.g. "/cart")
    cartsessionid: string;

    street: string;
    city: string;
    state: string;
    zipcode: string;
    country: string;

    buyer: string;
    cardnumber: string;
    cardholdername: string;
    cardexpiration: Date;
    cardsecuritynumber: string;
    cardtypeid: number;

    requestid: string;
}