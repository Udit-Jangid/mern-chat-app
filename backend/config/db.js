const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const clientOptions = {
      dbName: "chatApp",
      serverApi: { strict: true, deprecationErrors: true, version: "1" },
    };
    const conn = await mongoose.connect(
      `${process.env.MONGO_URI}`,
      clientOptions
    );
    console.log(
      `MongoDB Connected :: ${conn.connection.host}`.cyan.underline.bold
    );
  } catch (error) {
    console.error(`Error :: ${error.message}`.red.bold);
    process.exit(1); // Exit with a non-zero status code to indicate an error
  }
};

module.exports = connectDB;
