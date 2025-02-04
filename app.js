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
  equipmentId: { type: String, required: true },
  name: { type: String, required: true },
  category: { type: String, required: true },
  location: { type: String },
  lastInspectionStatus: { type: String },
  status: { type: String, default: "Operational" },
  lastInspection: { type: Date },
  nextDue: { type: Date },
  notes: { type: String }
});

const Equipment = mongoose.model("Equipment", equipmentSchema);

const orderSchema = new mongoose.Schema({
  requestId: { type: String, required: true },
  equipmentName: { type: String, required: true },
  category: { type: String },
  description: { type: String },
  quantity: { type: Number, default: 1 },
  requestedOn: { type: Date, default: Date.now },
  status: { type: String, default: "Order Requested" }
});

const Order = mongoose.model("Order", orderSchema);

const equipmentRequestSchema = new mongoose.Schema({
  requestId: { type: String, required: true },
  equipmentId: { type: String, required: true },
  requestedBy: { type: String, required: true },
  quantity: { type: Number, required: true },
  requestDate: { type: Date, default: Date.now },
  status: { type: String, default: "Stock" }
});

const EquipmentRequest = mongoose.model(
  "EquipmentRequest",
  equipmentRequestSchema
);

// Equipment API Endpoints
app.get("/api/equipment", async (req, res) => {
  try {
    const equipmentList = await Equipment.find();
    res.json({ success: true, data: equipmentList });
  } catch (error) {
    res.status(500).json({ message: "Error fetching equipment data", error });
  }
});

app.post("/api/equipment", async (req, res) => {
  try {
    const newEquipment = new Equipment(req.body);
    await newEquipment.save();
    res.status(201).json({
      message: "Equipment added successfully",
      equipment: newEquipment
    });
  } catch (error) {
    res.status(500).json({ message: "Error adding equipment", error });
  }
});

app.put("/api/equipment/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updatedEquipment = await Equipment.findByIdAndUpdate(id, req.body, {
      new: true
    });
    if (!updatedEquipment) {
      return res.status(404).json({ message: "Equipment not found" });
    }
    res.json({
      message: "Equipment updated successfully",
      equipment: updatedEquipment
    });
  } catch (error) {
    res.status(500).json({ message: "Error updating equipment", error });
  }
});

app.delete("/api/equipment/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deletedEquipment = await Equipment.findByIdAndDelete(id);
    if (!deletedEquipment) {
      return res.status(404).json({ message: "Equipment not found" });
    }
    res.json({ message: "Equipment deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting equipment", error });
  }
});

// Order API Endpoints
app.get("/api/order-status", async (req, res) => {
  try {
    const orders = await Order.find();
    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ message: "Error fetching orders", error });
  }
});

app.post("/api/order-status", async (req, res) => {
  try {
    const { equipmentName, category, description, quantity } = req.body;
    const requestId = `REQ-${Math.floor(1000 + Math.random() * 9000)}`;

    const newOrder = new Order({
      requestId,
      equipmentName,
      category,
      description,
      quantity
    });

    await newOrder.save();
    res
      .status(201)
      .json({ message: "Order placed successfully", order: newOrder });
  } catch (error) {
    res.status(500).json({ message: "Error placing order", error });
  }
});

app.put("/api/order-status/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updatedOrder = await Order.findByIdAndUpdate(id, req.body, {
      new: true
    });
    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.json({ message: "Order updated successfully", order: updatedOrder });
  } catch (error) {
    res.status(500).json({ message: "Error updating order", error });
  }
});

app.delete("/api/order-status/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deletedOrder = await Order.findByIdAndDelete(id);
    if (!deletedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.json({ message: "Order deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting order", error });
  }
});

// Equipment Requests API Endpoints
app.get("/api/equipment-requests", async (req, res) => {
  try {
    const requests = await EquipmentRequest.find();
    res.json({ success: true, data: requests });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching equipment requests", error });
  }
});

app.post("/api/equipment-requests", async (req, res) => {
  try {
    const { equipmentId, requestedBy, quantity } = req.body;
    const requestId = `REQ-${Math.floor(1000 + Math.random() * 9000)}`;

    const newRequest = new EquipmentRequest({
      requestId,
      equipmentId,
      requestedBy,
      quantity
    });

    await newRequest.save();
    res.status(201).json({
      message: "Equipment request created successfully",
      request: newRequest
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating equipment request", error });
  }
});

app.put("/api/equipment-requests/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updatedRequest = await EquipmentRequest.findByIdAndUpdate(
      id,
      req.body,
      { new: true }
    );
    if (!updatedRequest) {
      return res.status(404).json({ message: "Equipment request not found" });
    }
    res.json({
      message: "Equipment request updated successfully",
      request: updatedRequest
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating equipment request", error });
  }
});

app.delete("/api/equipment-requests/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deletedRequest = await EquipmentRequest.findByIdAndDelete(id);
    if (!deletedRequest) {
      return res.status(404).json({ message: "Equipment request not found" });
    }
    res.json({ message: "Equipment request deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting equipment request", error });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
