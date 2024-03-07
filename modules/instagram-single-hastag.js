import puppeteer from "puppeteer-core";
import fs from "fs";
import { getCurrentDateTimeFormatted } from "../helpers/getCurrentDateTimeFormatted.js";
import { download } from "../plugins/downloadSource.js";

const instagramSingleHastag = async (hastag) => {
  const now = getCurrentDateTimeFormatted();
  // const browser = await puppeteer.launch({
  //   headless: false,
  //   executablePath: "/usr/bin/google-chrome-stable",
  // });
  const browser = await puppeteer.connect({
    browserURL: "http://localhost:9222",
    defaultViewport: false,
  });
  const pages = await browser.pages();
  const page = pages[0];
  // Define the regex pattern for the URL
  const apiUrlRegex = /^https:\/\/www.instagram.com\/api\/v1\/tags\/web_info\//; // for get medias of tag
  // Array to store response details
  const medias = [];

  // Listen for network responses
  page.on("response", async (response) => {
    const url = response.url();
    // Check if the URL matches the regex pattern
    try {
      // Check if the URL matches the regex pattern to get medias of tag
      if (apiUrlRegex.test(url)) {
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
  // Navigate to the desired page
  await page.goto(`https://www.instagram.com/explore/tags/${hastag}/`, {
    waitUntil: "networkidle0",
  });

  // Save responsesData to a JSON file
  if (medias.length > 0) {
    await download({ medias: medias });
    fs.writeFileSync(
      `./exports/${hastag}-${now}.json`,
      JSON.stringify({ hastag: hastag, medias: medias }, null, 2)
    );
  }

  console.log("Scraping done!");
};

export default instagramSingleHastag;
