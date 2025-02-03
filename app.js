const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();

const app = express();
const port = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const mongoURI =
  process.env.MONGO_URI ||
  "mongodb+srv://demo:demo@cluster0.cnxct.mongodb.net/";

if (!mongoURI) {
  console.error("MongoDB URI not found");
  process.exit(1);
}

mongoose
  .connect(mongoURI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

const equipmentSchema = new mongoose.Schema({
  equipment_id: { type: String, required: true },
  name: { type: String },
  category: { type: String },
  location: { type: String },
  last_inspection_status: { type: String },
  status: { type: String },
  last_inspection: { type: String },
  next_due: { type: String },
  notes: { type: String }
});

const Equipment = mongoose.model("Equipment", equipmentSchema);

app.get("/api/equipment", async (req, res) => {
  try {
    const equipmentList = await Equipment.find();
    res.json({ success: true, data: equipmentList });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching equipment data",
      error
    });
  }
});

app.post("/api/equipment", async (req, res) => {
  try {
    const { name, type, manufacturer, status } = req.body;
    const newEquipment = new Equipment(req.body);
    await newEquipment.save();
    res
      .status(201)
      .json({ success: true, message: "Equipment added successfully" });
  } catch (error) {
    console.error("Error adding equipment:", error);
    res.status(500).json({
      success: false,
      message: "Error adding equipment",
      error: error.message || error
    });
  }
});

app.put("/api/equipment/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updatedEquipment = await Equipment.findByIdAndUpdate(id, req.body, {
      new: true
    });
    if (!updatedEquipment) {
      return res.status(404).json({
        success: false,
        message: "Equipment not found"
      });
    }
    res.json({
      success: true,
      message: "Equipment updated successfully",
      data: updatedEquipment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating equipment",
      error
    });
  }
});

app.delete("/api/equipment/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deletedEquipment = await Equipment.findByIdAndDelete(id);
    if (!deletedEquipment) {
      return res.status(404).json({
        success: false,
        message: "Equipment not found"
      });
    }
    res.json({ success: true, message: "Equipment deleted successfully" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting equipment",
      error
    });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
