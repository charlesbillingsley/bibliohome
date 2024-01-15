const fs = require("fs");
const path = require("path");

async function cleanUpUnusedImages(folderPath, usedPhotos) {
  try {
    const files = await fs.promises.readdir(folderPath);

    // Iterate over each file in the folder
    for (const file of files) {
      const filePath = path.join(folderPath, file);

      // Check if the file is not used
      if (!usedPhotos.includes(file)) {
        // Delete the file
        await fs.promises.unlink(filePath);
        console.log(`Deleted ${filePath}`);
      }
    }

    console.log("Clean-up completed.");
  } catch (error) {
    console.error("Error cleaning up unused images:", error);
  }
}

module.exports = {
  cleanUpUnusedImages,
};
