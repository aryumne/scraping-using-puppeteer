import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { getCurrentDateTimeFormatted } from "../helpers/getCurrentDateTimeFormatted.js";
import fs from "fs";

function createFoldersIfNotExist(folderName) {
  if (!fs.existsSync(folderName)) {
    fs.mkdirSync(folderName, { recursive: true });
  }
}

// function downloadImage(url, filename) {
//   fetch(url)
//     .then((response) => {
//       if (!response.ok) {
//         throw new Error("Failed to download file.");
//       }
//       return response.arrayBuffer(); // Menggunakan arrayBuffer() untuk mendapatkan konten sebagai buffer
//     })
//     .then((buffer) => {
//       // Menyimpan blob sebagai file menggunakan fs.writeFile
//       fs.writeFile(filename, Buffer.from(buffer), (err) => {
//         if (err) {
//           throw new Error("Failed to write file. Error: " + err.message);
//         }
//         console.log(filename);
//         return true;
//       });
//     })
//     .catch((error) => {
//       console.error("Download is failed. Error: " + error.message);
//       return false;
//     });
// }

async function downloadImage(url, filename) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Failed to download file.");
    }
    const buffer = await response.arrayBuffer();
    await fs.promises.writeFile(filename, Buffer.from(buffer));
    return filename; // Return the filename if download is successful
  } catch (error) {
    console.error("Download failed. Error: " + error.message);
    return null; // Return null if download fails
  }
}

async function download(data) {
  try {
    const now = getCurrentDateTimeFormatted();
    if (data) {
      const vidPath = `download/${now}/videos`;
      createFoldersIfNotExist(vidPath);
      const imgPath = `download/${now}/images`;
      createFoldersIfNotExist(imgPath);
      const listImages = [];
      const promises = [];
      let counter = 0;
      console.log(">>>>>> Start looping!");
      for (const media of data.medias) {
        if (media.product_type === "feed" || media.product_type === "clips") {
          if (media.hasOwnProperty("video_versions")) {
            const vidName = `${vidPath}/feed_${counter}.mp4`; // Nama file yang berbeda untuk setiap gambar
            promises.push(downloadImage(media.video_versions[0].url, vidName));
          }
          if (media.hasOwnProperty("image_versions2")) {
            const imageName = `${imgPath}/image_${counter}.jpg`; // Nama file yang berbeda untuk setiap gambar
            promises.push(
              downloadImage(
                media.image_versions2.candidates[0].url,
                imageName
              ).then((filename) => {
                if (filename) listImages.push({ url: filename, pk: media.pk });
              })
            );
          }
        }
        if (media.product_type === "carousel_container") {
          const imageName = `${imgPath}/image_${counter}.jpg`; // Nama file yang berbeda untuk setiap gambar
          promises.push(
            downloadImage(
              media.carousel_media[0].image_versions2.candidates[2].url,
              imageName
            ).then((filename) => {
              if (filename) listImages.push({ url: filename, pk: media.pk });
            })
          );
        }
        counter++;
      }

      await Promise.all(promises);
      console.log("<<<<< Looping end!");

      if (listImages.length > 0) {
        fs.writeFileSync(
          `./exports/list-images-${now}.json`,
          JSON.stringify({ images: listImages }, null, 2)
        );
      }
    } else {
      throw new Error("File not found!");
    }
  } catch (error) {
    console.log(error.message);
    throw error;
  }
}

// for example: "./exports/dataInstagram.json"
async function downloadFromJsonFile(path) {
  const stringifyData = await readFile(resolve(path), {
    encoding: "utf8",
  });
  const jsonData = JSON.parse(stringifyData);
  return download(jsonData);
}

export { download, downloadFromJsonFile };
