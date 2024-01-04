import puppeteer from "puppeteer";
import fs from "fs";

const interceptNetworks = async () => {
  const browser = await puppeteer.launch({
    headless: false,
    executablePath: "/usr/bin/google-chrome-stable",
  });
  const page = await browser.newPage();
  const apiUrlRegex = /^http:\/\/localhost:8000\/api\/v1\//;

  page.on("response", async (response) => {
    const url = response.url();
    if (apiUrlRegex.test(url)) {
      console.log("Request URL:", response.url());
      console.log("Request Method:", response.request().method());
      console.log("Response Status Code:", response.status());
      const resBody = await response.json();
      console.log("Response Body:", resBody.data);
      console.log("---");
    }
  });
  await page.goto("http://localhost:5173/");

  console.log("Scraming done!");
  //   await browser.close();
};

export default interceptNetworks;
