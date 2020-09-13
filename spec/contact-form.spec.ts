import { browser, By } from "protractor";

describe("contact pages", () => {

    const baseUrl = "https://www.willow-tree-counselling.co.uk";

    const tests = [
        { url: "", heading: "Welcome", title: "Welcome - Willow Tree Counselling", contactForm: true },
        { url: "/lindsay-roadnight", heading: "Lindsay Roadnight", title: "Lindsay Roadnight - Willow Tree Counselling" },
        { url: "/fees-and-location", heading: "Fees and Location", title: "Fees and Location - Willow Tree Counselling" },
        { url: "/business-support", heading: "Business Support", title: "Business Support - Willow Tree Counselling" },
        { url: "/contact", heading: "Contact", title: "Contact - Willow Tree Counselling", contactForm: true },
        { url: "/blog", heading: "Blog", title: "Blog - Willow Tree Counselling", className: "page-title" },
        { url: "/faqs", heading: "FAQs", title: "FAQs - Willow Tree Counselling" },
    ];

    tests.forEach(test => {
        const url = `${baseUrl}${test.url}`;

        it(`should load and have correct title and heading (${test.heading})`, async () => {
            const className = test.className || "entry-header";
            await browser.driver.get(url);

            const title = await browser.driver.getTitle();
            const headingFinder = await browser.driver.findElements(By.className(className));
            const heading = await headingFinder[0].getText();

            expect(title).toBe(test.title);
            expect(heading).toBe(test.heading);
        });
    });

    tests.filter(test => test.contactForm === true).forEach(test => {
        const url = `${baseUrl}${test.url}`;

        it(`${test.heading} should successfully submit the contact form`, async () => {
            await browser.driver.get(url);

            await browser.driver.findElement(By.id("wpforms-124-field_0")).sendKeys("Travis");
            await browser.driver.findElement(By.id("wpforms-124-field_0-last")).sendKeys("Tester");
            await browser.driver.findElement(By.id("wpforms-124-field_1")).sendKeys("travis.tester@willow-tree-counselling.co.uk");
            await browser.driver.findElement(By.id("wpforms-124-field_2")).sendKeys(`Testing contact form on page ${test.heading}`);

            await browser.driver.findElement(By.id("wpforms-submit-124")).click();

            const confirmationChildren = await browser.driver.findElement(By.id("wpforms-confirmation-124")).findElements(By.tagName("div"));
            const confirmationGrandChildren = await confirmationChildren[0].findElements(By.tagName("div"));

            const confirmText = await confirmationGrandChildren[0].getText();

            expect(confirmText).toBe("Thank you for contacting us.");
        })
    })
});