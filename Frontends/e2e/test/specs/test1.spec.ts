import { Key } from "webdriverio";

describe("My Login application", () => {
    it("should seach when search button clicked", async () => {
        await browser.url("https://google.com");

        (await $('[name="q"]')).setValue("Myoptyx");

        (await $('[name="btnK"]')).click();

        await browser.pause(5000);
    });

    it("should seach when search enter key is pressed", async () => {
        await browser.url("https://google.com");

        const searchInput = await $('[name="q"]');
        console.log(`--> select isFocused: ${await searchInput.isFocused()}`);

        searchInput.setValue("Myoptyx");
        console.log(`--> setValue isFocused: ${await searchInput.isFocused()}`);

        await browser.keys(Key.Enter);

        await browser.pause(2000);
    });

});
