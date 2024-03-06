import puppeteer from "puppeteer";
import fs from "fs";
const instagramSearch = async () => {
  const browser = await puppeteer.connect({
    browserURL: "http://localhost:9222",
  });
  const pages = await browser.pages();
  const page = pages[0];

  // Define the regex pattern for the URL
  const apiUrlRegex = /^https:\/\/www.instagram.com\/api\/graphql/; // for get tags
  const apiUrlRegex2 =
    /^https:\/\/www.instagram.com\/api\/v1\/tags\/web_info\//; // for get medias of tag

  // Array to store response details
  const medias = [];
  let hashtags = [];
  ``;
  // Listen for network responses
  page.on("response", async (response) => {
    const url = response.url();
    try {
      // Check if the URL matches the regex pattern to get tags
      if (apiUrlRegex.test(url)) {
        const resBody = await response.json();
        if ("xdt_api__v1__fbsearch__topsearch_connection" in resBody.data) {
          // Add the response data to the array
          hashtags =
            resBody.data.xdt_api__v1__fbsearch__topsearch_connection.hashtags.sort(
              (a, b) => a.position - b.position
            );
        }
      }
      // Check if the URL matches the regex pattern to get medias of tag
      if (apiUrlRegex2.test(url)) {
        const resBody = await response.json();
        if (resBody.data.top.sections.length > 0) {
          resBody.data.top.sections.forEach((section) => {
            if (section.layout_type === "one_by_two_left") {
              section.layout_content.fill_items.forEach((item) => {
                medias.push({ ...item.media, tag_name: resBody.data.name });
              });
            }
            if (section.layout_type === "media_grid") {
              section.layout_content.medias.forEach((item) => {
                medias.push({ ...item.media, tag_name: resBody.data.name });
              });
            }
          });
        }
      }
    } catch (e) {
      console.error("Error on get response: " + e.message);
    }
  });

  // Navigate to the Instagram homepage
  await page.goto("https://www.instagram.com");
  // Find and click the search button
  const searchBtn = await page.waitForSelector('span[aria-describedby=":r4:"]');
  await searchBtn.click();

  // Find the search input and type the hashtag
  const searchInput = await page.waitForSelector(
    'input[aria-label="Search input"]'
  );
  await searchInput.type("#aslilebihbaik");

  // Wait for a short period to allow the search results to load
  await page.evaluate(() => new Promise((r) => setTimeout(r, 1000)));

  // Loop through each hashtag and navigate to its explore page
  let counter = 0;
  for (const item of hashtags) {
    // if (item.position === 17) break;
    if (counter === 5) break;
    const url = `https://www.instagram.com/explore/tags/${item.hashtag.name}/`;
    console.log(counter + ". " + url);
    try {
      // Navigate to the explore page for the current hashtag
      await page.goto(url, { waitUntil: "networkidle0" });
    } catch (error) {
      console.error("Error on explore ", error);
      continue;
    } finally {
      counter++;
    }
  }

  // Wait for a short period after navigating to all explore pages
  await page.evaluate(() => new Promise((r) => setTimeout(r, 1000)));

  // Write the collected data to a JSON file
  fs.writeFileSync(
    "./exports/dataInstagram.json",
    JSON.stringify({ hastags: hashtags, medias: medias }, null, 2)
  );

  console.log("Scraping done!");
};

export default instagramScraping;
