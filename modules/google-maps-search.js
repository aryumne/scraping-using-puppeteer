import puppeteer from "puppeteer";
import fs from "fs";

const googleMapsSearch = async (keyword) => {
  const browser = await puppeteer.launch({
    headless: false,
    executablePath: "/usr/bin/google-chrome-stable",
  });
  const page = await browser.newPage();

  await page.goto("https://google.com/maps");

  // Wait for the input field to be present
  await page.waitForSelector("#searchboxinput");

  // Hide the label
  await page.evaluate(() => {
    const label = document.querySelector('label[for="searchboxinput"]');
    label.style.display = "none";
  });

  // Type "toko kopi" in the input field
  await page.type("#searchboxinput", keyword);
  const btnSearch = await page.waitForSelector("#searchbox-searchbutton");
  await btnSearch.click();

  await page.waitForSelector('div[role="feed"]');
  let data = [];
  let iteration = 10;
  // Scroll loop - you can adjust the number of scrolls as needed
  for (let i = 1; i <= iteration; i++) {
    // Scroll down to trigger loading more results
    await page.evaluate(() => {
      const listContainer = document.querySelector('div[role="feed"]');
      listContainer.scrollTop += 500; // Adjust the scroll amount as needed
    });
    // Wait for some time to let the new content load
    await page.evaluate(() => new Promise((r) => setTimeout(r, 2000)));

    // Extract and append new data
    if (i === iteration) {
      console.log(i);
      const newOptions = await page.evaluate(() => {
        const newElements = document.querySelectorAll(".Nv2PK.THOPZb.CpccDe");
        let newData = [];
        newElements.forEach((el) => {
          let name = el
            .querySelector(".qBF1Pd.fontHeadlineSmall")
            .textContent.trim();
          let address = el
            .querySelector(".W4Efsd span span:nth-child(2)")
            .textContent.trim();
          newData.push({ tokoName: name, address: address });
        });
        return newData;
      });

      // Append new data to the existing data array
      data = data.concat(newOptions);
    }
    console.log(`Page ${i}`);
  }

  fs.writeFileSync("./exports/listToko.json", JSON.stringify(data, null, 2));
  console.log("Scraping done!");
  await browser.close();
};

export default googleMapsSearch;
