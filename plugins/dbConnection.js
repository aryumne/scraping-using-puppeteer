import { MongoClient, ServerApiVersion } from "mongodb";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
const uri =
  "mongodb+srv://be-mern:newpass@mern-db.ca3u4tj.mongodb.net/?retryWrites=true&w=majority";
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    const db = client.db("insta-scraping");
    await db.command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
    const data = await readFile(resolve("./exports/dataInstagram.json"), {
      encoding: "utf8",
    });
    if (data) {
      const dt = JSON.parse(data);
      for (const hastag of dt.hastags) {
        let existedHastag = await db.collection("hastags").findOne({
          name: hastag.hashtag.name,
        });
        if (!existedHastag) {
          existedHastag = await db.collection("hastags").insertOne({
            name: hastag.hashtag.name,
            mediaCount: hastag.hashtag.media_count,
            hashtagId: hastag.hashtag.id,
            position: hastag.position,
          });
        }
        const medias = dt.medias.filter(
          (media) => media.tag_name === hastag.hashtag.name
        );
        if (medias.length > 0) {
          for (const media of medias) {
            let existedMedia = await db.collection("medias").findOne({
              pk: media.pk,
            });
            if (!existedMedia) {
              media.product_type === "feed"
                ? await db.collection("medias").insertOne({
                    pk: media.pk,
                    takenAt: media.taken_at,
                    textCaption: media.caption.text,
                    originalWidth: media.original_width,
                    originalHeight: media.original_height,
                    commentCount: media.comment_count,
                    likeCount: media.like_count,
                    owner: media.owner,
                    product_type: media.product_type,
                    videoVersions: media.video_versions,
                    videoDuration: media.video_duration,
                    hasAudio: media.has_audio,
                    hastagId: existedHastag.insertedId,
                  })
                : await db.collection("medias").insertOne({
                    pk: media.pk,
                    takenAt: media.taken_at,
                    textCaption: media.caption.text,
                    originalWidth: media.original_width,
                    originalHeight: media.original_height,
                    commentCount: media.comment_count,
                    likeCount: media.like_count,
                    owner: media.owner,
                    product_type: media.product_type,
                    carouselMediaCount: media.carousel_media_count,
                    carouselMedia: media.carousel_media,
                    hastagId: existedHastag.insertedId,
                  });
            }
          }
        }
      }
      console.log("stored successfully!");
    }
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
run().catch(console.dir);
