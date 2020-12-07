import { browser, By } from "protractor";
import axios from "axios"
import { v4 } from "uuid"

interface IWebhookItem{
    content: String;
    type: "email";
    text_content: string;
}

interface IWebhookResponse{
    data: IWebhookItem[];
}

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

    const userMail = "25c66bda-03f2-41de-8657-b9a12f6f8647@email.webhook.site";
    const webHookBase = "https://webhook.site/token/25c66bda-03f2-41de-8657-b9a12f6f8647/";

    describe("contact form", () => {
        let originalTimeout: number;
        beforeEach(() => {
            originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
            jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000;
        });

        afterEach(() => {
            jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
        });

        fit(`should successfully fill out and send a contact form`, async doneFunc => {
            await browser.driver.get(`${baseUrl}/automation-contact-us-81536385932043467131/`);

            const uniqueString = v4();

            await browser.driver.findElement(By.id("wpforms-436-field_0")).sendKeys("Automation");
            await browser.driver.findElement(By.id("wpforms-436-field_0-last")).sendKeys("Tester");
            await browser.driver.findElement(By.id("wpforms-436-field_1")).sendKeys(userMail);
            await browser.driver.findElement(By.id("wpforms-436-field_2")).sendKeys(`Testing contact form on automation testing page (${uniqueString})`);

            await browser.driver.findElement(By.id("wpforms-submit-436")).click();

            const confirmationChildren = await browser.driver.findElement(By.id("wpforms-confirmation-436")).findElements(By.tagName("div"));
            const confirmationGrandChildren = await confirmationChildren[0].findElements(By.tagName("div"));

            const confirmText = await confirmationGrandChildren[0].getText();

            expect(confirmText).toBe("Thank you for contacting us.");

            setInterval(async () => {
                try{
                    console.log(`Loading mails (${uniqueString})`);
                    const response = await axios.get<IWebhookResponse>(`${webHookBase}requests?password=&page=1&sorting=newest`, { headers: { "Accept": "application/json", "Content-Type": "application/json" } });

                    const emails = response.data.data.filter(item => item.type === "email");
                    const matchFound = emails.some(email => email.text_content.indexOf(uniqueString) > 0);
                    console.log(`${emails.length} Mails loaded ${matchFound}`);

                    if(!matchFound){
                        return
                    }

                    expect(matchFound).toBe(true);
                } catch(e){
                    fail(`Error while loading requests: ${e}`)
                }

                try{
                    console.log(`Deleting all mails`)
                    await axios.delete(`${webHookBase}request?password=`, { headers: { "Accept": "application/json", "Content-Type": "application/json" } });
                } catch(e){
                    fail(`Error while deleting requests: ${e}`);
                }

                doneFunc();
            }, 5000)
        })
    })
});
