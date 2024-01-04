import puppeteer from "puppeteer";
import fs from "fs";

const interceptNetworks = async () => {
  const browser = await puppeteer.launch({
    headless: false,
    executablePath: "/usr/bin/google-chrome-stable",
  });
  const page = await browser.newPage();
  // Define the regex pattern for the URL
  const apiUrlRegex = /^https:\/\/ygtm.yamalubepromo.com\/api\/v1\//;
  // Array to store response details
  const responsesData = [];

  // Listen for network responses
  page.on("response", async (response) => {
    const url = response.url();
    // Check if the URL matches the regex pattern
    if (apiUrlRegex.test(url)) {
      const resBody = await response.json();
      const responseData = {
        url: url,
        method: response.request().method(),
        statusCode: response.status(),
        body: resBody.data,
      };
      // Add the response data to the array
      responsesData.push(responseData);
    }
  });
  // Navigate to the desired page
  await page.goto("https://ygtm.yamalubepromo.com/gallery");

  // Wait for all requests to be finished
  await page.waitForNavigation({ waitUntil: "networkidle0" });

  // Close the browser
  await browser.close();
  // Save responsesData to a JSON file

  fs.writeFileSync(
    "./exports/listApi.json",
    JSON.stringify(responsesData, null, 2)
  );

  console.log("Scraping done!");
};

export default interceptNetworks;
