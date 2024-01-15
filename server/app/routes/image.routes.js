const multer = require("multer");
const upload = multer();

module.exports = (app) => {
  const images = require("../controllers/image.controller.js");

  var router = require("express").Router();

  // Create a new image from file
  router.post("/", upload.single("image"), images.create);

  // Create a new image from url
  router.post("/url", images.createUrl);

  // Get image by path
  router.get("/:type/:imageName", images.getImage);

  // Clean out unused images
  router.post("/clean", images.clean);

  app.use("/api/image", router);
};
