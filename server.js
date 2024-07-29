const mongoose = require("mongoose");
require("dotenv").config();
const app = require("./app");

const PORT = process.env.PORT || 3000;
const mongoURI = process.env.MONGO_URI;

const connectDB = async () => {
  try {
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Database connection successful");
  } catch (error) {
    console.error("Database connection error:", error.message);
    process.exit(1);
  }
};

connectDB();

app.listen(PORT, () => {
  console.log(`Server running. Use our API on port: ${PORT}`);
});
