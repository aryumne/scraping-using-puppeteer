import googleMapsSearch from "./modules/google-maps-search.js";
import interceptNetworks from "./modules/intercept-networks.js";

const main = async () => {
  // await googleMapsSearch("Toko kopi"); // search keyword on google maps
  await interceptNetworks();
};

main();
