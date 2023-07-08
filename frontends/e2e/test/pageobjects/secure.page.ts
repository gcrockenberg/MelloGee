import { ChainablePromiseElement } from 'webdriverio';

import Page from './page';

/**
 * sub page containing specific selectors and methods for a specific page
 */
class SecurePage extends Page {

    public readonly ROUTE: string = 'secure';

    /**
    * overwrite specific options to adapt it to page object
    */
    public open() {
        return super.open();
    }
}

export default new SecurePage();
