const asyncHandler = require("express-async-handler");
const db = require("../models");
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const sharp = require("sharp");
const imageCleanup = require("../utils/imageCleanup");
const Book = db.books;
const Movie = db.movies;
const ProductionCompany = db.productionCompanies;
const User = db.users;

const modelTypes = {
  book: Book,
  movie: Movie,
  productionCompany: ProductionCompany,
  user: User,
};

// Save the image on the server
exports.create = asyncHandler(async (req, res) => {
  const imageFile = req.file;
  const type = req.body.type;

  if (!imageFile) {
    return res.status(400).json({ error: "Image file is required" });
  }

  if (!type) {
    return res.status(400).json({ error: "Image type is required" });
  }

  const imageData = imageFile.buffer;

  try {
    const fileExt = ".jpeg";

    // Generate a unique file name for the image
    const uniqueFileName =
      Date.now() + "-" + Math.round(Math.random() * 1e9) + fileExt;

    const imagePath = path.join(
      __dirname,
      "../../public/images/" + type + "/",
      uniqueFileName
    );

    // Resize the image to a width of 128 pixels
    // and save it out as JPEG
    await sharp(imageData)
      .resize({ width: 256 })
      .toFormat("jpeg", { mozjpeg: true })
      .toFile(imagePath);

    // Send the image file name as a response
    res.json({ imageName: uniqueFileName });
  } catch (error) {
    console.log("Failed to save the image:", error);
    return res
      .status(500)
      .json({ error: "Failed to save the image" });
  }
});

// Download and save the image on the server
exports.createUrl = asyncHandler(async (req, res) => {
  let imageUrl = req.body.imageUrl;
  let type = req.body.type;

  if (!imageUrl) {
    return res.status(400).json({ error: "Image URL is required" });
  }

  if (!type) {
    return res.status(400).json({ error: "Image type is required" });
  }

  let imageData;
  // If an image URL is provided, fetch the image data
  imageUrl = imageUrl.replace("&edge=curl", "");

  try {
    // Fetch the image data
    const response = await axios.get(imageUrl, {
      responseType: "arraybuffer",
    });

    imageData = response.data;
  } catch (error) {
    console.log("Failed to download the image:", error);
    return res.status(500).json({ error: "Failed to download the image" });
  }

  try {
    // Determine the file extension based on the response data
    const fileExt = ".jpeg";

    // Generate a unique file name for the image
    const uniqueFileName =
      Date.now() + "-" + Math.round(Math.random() * 1e9) + fileExt;

    const imagePath = path.join(
      __dirname,
      "../../public/images/" + type + "/",
      uniqueFileName
    );

    // Resize the image to a width of 128 pixels
    // and save it out as JPEG
    await sharp(imageData)
      .resize({ width: 256 })
      .toFormat("jpeg", { mozjpeg: true })
      .toFile(imagePath);

    // Send the image file name as a response
    res.json({ imageName: uniqueFileName });
  } catch (error) {
    console.log("Failed to save the image:", error);
    return res
      .status(500)
      .json({ error: "Failed to save the image" });
  }
});

// Get image by path
exports.getImage = asyncHandler(async (req, res) => {
  const type = req.params.type;
  const imageName = req.params.imageName;
  const imagePath = path.join(
    __dirname,
    "../../public/images/" + type + "/",
    imageName
  );

  // Check if the image file exists
  if (!fs.existsSync(imagePath)) {
    return res.status(404).json({ error: "Image not found" });
  }

  // Send the image file as a response
  res.sendFile(imagePath);
});

// Clean unused images
exports.clean = asyncHandler(async (req, res) => {
  var type = req.body.type;

  if (!type) {
    return res.status(400).json({ error: "Image type is required" });
  }

  const imagePath = path.join(__dirname, "../../public/images/" + type + "/");

  try {
    // Get all the used photo filenames
    const Model = modelTypes[type];
    if (!Model) {
      throw new Error(`Unsupported model type: ${type}`);
    }

    const items = await Model.findAll({
      attributes: ["photo"],
      raw: true,
    });

    let usedPhotos = items.map((item) => item.photo);

    // Call the clean-up function
    await imageCleanup.cleanUpUnusedImages(imagePath, usedPhotos);

    return res.status(200).json({ message: "Image clean-up completed." });
  } catch (error) {
    console.error("Error retrieving used photos:", error);
    return res.status(500).json({ error: "Error retrieving used photos" });
  }
});
