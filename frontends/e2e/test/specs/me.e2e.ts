import AuthPage from '../pageobjects/auth.page';
import HomePage from '../pageobjects/home.page';
import SecurePage from '../pageobjects/secure.page';


describe('Me application login', () => {
    it('should have login initial state', async () => {
        await HomePage.open();

        await expect(HomePage.btnLogin).toExist();
        await expect(HomePage.btnLogout).not.toExist();

        await browser.pause(2000);
    });

    it('should open B2C login popup upon login button click', async () => {
        await HomePage.open();

        await HomePage.initiateLogin();

        await browser.switchWindow(AuthPage.URI);
        await expect(browser).toHaveUrlContaining(AuthPage.URI);

        await browser.closeWindow();

        await browser.switchWindow(HomePage.URI);
        await expect(browser).toHaveUrlContaining(HomePage.URI);

        await browser.pause(2000);
    });

    it('should open B2C login popup upon navigation to secure page', async () => {
        await SecurePage.open();
        await expect(browser).toHaveUrlContaining(SecurePage.ROUTE);

        await browser.switchWindow(AuthPage.URI);
        await expect(browser).toHaveUrlContaining(AuthPage.URI);

        await browser.closeWindow();

        await browser.switchWindow(SecurePage.URI);
        await expect(browser).not.toHaveUrlContaining(SecurePage.ROUTE);

        await browser.pause(2000);
    });
});


