/**
* main page object containing all methods, selectors and functionality
* that is shared across all page objects
*/
export default class Page {
    public readonly URI: string = 'stmedev.z13.web.core.windows.net';

    public readonly ROUTE: string = '';

    /**
    * Opens a sub page of the page
    * @param path path of the sub page (e.g. /path/to/page.html)
    */
    public open () {
        return browser.url(`https://${this.URI}/#/${this.ROUTE}`)
    }
}
