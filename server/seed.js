const db = require("./app/models");
const AppSettings = db.appSettings;
const MediaType = db.mediaTypes;

async function seedDatabase() {
  try {
    // Seed the media types
    console.log("Seeding Media Types.");
    const existingMediaTypes = await MediaType.findAll();

    if (existingMediaTypes.length <= 0) {
      const mediaTypes = [{ name: "Books" }, { name: "Movies" }];

      await MediaType.bulkCreate(mediaTypes);
      console.log("Media Types seeded successfully.");
    }

    // Seed the app settings
    console.log("Seeding App Settings.");
    const existingSettings = await AppSettings.findByPk(1);

    if (!existingSettings || existingSettings.length <= 0) {
      await AppSettings.create({
        emailService: "",
        emailUsername: "",
        emailPassKey: "",
        movieApiKey: "",
      });
      console.log("App Settings seeded successfully.");
    }
  } catch (error) {
    console.error("Failed to seed database:", error);
  }
}

module.exports = seedDatabase;
