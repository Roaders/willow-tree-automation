import { browser, By } from "protractor";

describe("contact pages", () => {

    const baseUrl = "https://www.willow-tree-counselling.co.uk";

    const tests = [
        { url: "", heading: "Welcome", title: "Welcome - Willow Tree Counselling", contactForm: true },
        { url: "/lindsay-roadnight", heading: "Lindsay Roadnight", title: "Lindsay Roadnight - Willow Tree Counselling" },
        { url: "/fees-and-location", heading: "Fees and Location", title: "Fees and Location - Willow Tree Counselling" },
        { url: "/business-support", heading: "Corporate", title: "Corporate - Willow Tree Counselling" },
        { url: "/contact", heading: "Contact", title: "Contact - Willow Tree Counselling", contactForm: true },
        { url: "/blog", heading: "Blog", title: "Blog - Willow Tree Counselling", className: "page-title" },
        { url: "/faqs", heading: "FAQs", title: "FAQs - Willow Tree Counselling" },
        { url: "/covid-19", heading: "COVID-19", title: "COVID-19 - Willow Tree Counselling" },
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

        it(`${test.heading} should successfully fill out the contact form`, async () => {
            await browser.driver.get(url);

            await browser.driver.findElement(By.id("wpforms-124-field_0")).sendKeys("Automation");
            await browser.driver.findElement(By.id("wpforms-124-field_0-last")).sendKeys("Tester");
            await browser.driver.findElement(By.id("wpforms-124-field_1")).sendKeys("giles.roadnight@gmail.com");
            await browser.driver.findElement(By.id("wpforms-124-field_2")).sendKeys(`Testing contact form on page ${test.heading}`);

            await browser.driver.findElement(By.id("wpforms-submit-124")).click();

            const iframes = await browser.driver.findElements(By.tagName("iframe"));
            const capatchaIframe = iframes[iframes.length - 1];
            
            const src = await capatchaIframe.getAttribute("src");
            expect(src.indexOf("https://www.google.com/recaptcha")).toBe(0);
            const tagName = await capatchaIframe.getTagName();
            expect(tagName).toBe("iframe");
        })
    })

    

    it(`should successfully fill out and send a contact form`, async () => {
        await browser.driver.get(`${baseUrl}/automation-contact-us-81536385932043467131/`);

        await browser.driver.findElement(By.id("wpforms-436-field_0")).sendKeys("Automation");
        await browser.driver.findElement(By.id("wpforms-436-field_0-last")).sendKeys("Tester");
        await browser.driver.findElement(By.id("wpforms-436-field_1")).sendKeys("giles.roadnight@gmail.com");
        await browser.driver.findElement(By.id("wpforms-436-field_2")).sendKeys(`Testing contact form on automation testing page`);

        await browser.driver.findElement(By.id("wpforms-submit-436")).click();

        const confirmationChildren = await browser.driver.findElement(By.id("wpforms-confirmation-436")).findElements(By.tagName("div"));
        const confirmationGrandChildren = await confirmationChildren[0].findElements(By.tagName("div"));

        const confirmText = await confirmationGrandChildren[0].getText();

        expect(confirmText).toBe("Thank you for contacting us.");
    })
});
