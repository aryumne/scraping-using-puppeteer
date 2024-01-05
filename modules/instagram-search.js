import puppeteer from "puppeteer";
import fs from "fs";
const instagramSearch = async () => {
  const browser = await puppeteer.connect({
    browserURL: "http://localhost:9222",
  });
  const pages = await browser.pages();
  const page = pages[0];

  // Define the regex pattern for the URL
  const apiUrlRegex = /^https:\/\/www.instagram.com\/api\/graphql/;
  // Array to store response details
  const responsesData = [];
  // Listen for network responses
  page.on("response", async (response) => {
    const url = response.url();
    // Check if the URL matches the regex pattern
    if (apiUrlRegex.test(url)) {
      const resBody = await response.json();
      if ("xdt_api__v1__fbsearch__topsearch_connection" in resBody.data) {
        const responseData = {
          url: url,
          method: response.request().method(),
          statusCode: response.status(),
          body: resBody.data.xdt_api__v1__fbsearch__topsearch_connection,
        };
        // Add the response data to the array
        responsesData.push(responseData);
        fs.writeFileSync(
          "./exports/dataInstagram.json",
          JSON.stringify(responsesData, null, 2)
        );
      } else {
        console.log(Object.keys(resBody.data));
      }
    }
  });

  await page.goto("https://www.instagram.com");
  const searchBtn = await page.waitForSelector('span[aria-describedby=":r4:"]');
  await searchBtn.click();
  const searchInput = await page.waitForSelector(
    'input[aria-label="Search input"]'
  );
  await searchInput.type("food");

  console.log("Scraping done!");
};

export default instagramSearch;
