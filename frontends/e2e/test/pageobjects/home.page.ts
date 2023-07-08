import { ChainablePromiseElement } from 'webdriverio';

import Page from './page';

/**
 * sub page containing specific selectors and methods for a specific page
 */
class HomePage extends Page {
    /**
     * define selectors using getter methods
     */
    // public get inputUsername () {
    //     return $('#username');
    // }

    // public get inputPassword () {
    //     return $('#password');
    // }

    public get btnLogin () {
        return $('#btnLogin');
    }

    public get btnLogout () {
        return $('#btnLogout');
    }

    /**
     * a method to encapsule automation code to interact with the page
     * e.g. to login using username and password
     */
    public async initiateLogin () {
        await this.btnLogin.click();
    }

    /**
     * overwrite specific options to adapt it to page object
     */
    public open () {
        return super.open();
    }
}

export default new HomePage();
