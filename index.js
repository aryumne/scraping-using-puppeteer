import googleMapsSearch from "./modules/google-maps-search.js";
import interceptNetworks from "./modules/intercept-networks.js";
import instagramScraping from "./modules/instagram-scraping.js";

const main = async () => {
  // await googleMapsSearch("Toko kopi"); // search keyword on google maps
  // await interceptNetworks(); // get api response from a page

  /**
   * instagram search
   * close all the chromes that are currently opened
   * run command in terminal "/usr/bin/google-chrome-stable --remote-debugging-port=9222"
   * open instagram.com, then login if you have not logged in
   * comment all functions except this line "await instagramScraping();"
   */
  await instagramScraping();
};

main();
