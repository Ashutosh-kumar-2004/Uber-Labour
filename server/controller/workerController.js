import cloudinary from "../config/cloudinary.js";
import Worker from "../modal/Worker.model.js";
import User from "../modal/User.js";
import fs from "fs";

export const verifyWorker = async (req, res) => {
  try {
    const { adharCardNumber, address } = req.body;
    const userId = req.user._id;

    if (!req.file) {
      return res.status(400).json({ message: "ID Card Image is required" });
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "workers",
    });

    // Clean up temp file
    fs.unlinkSync(req.file.path);

    const idCardImage = result.secure_url;

    // Update User with Address
    await User.findByIdAndUpdate(userId, { address });

    // Create or Update Worker Record
    // Check if worker record already exists for this user
    let worker = await Worker.findOne({ userId });

    if (worker) {
      // Delete old image from Cloudinary if it exists
      if (worker.idCardImage) {
        const publicId = worker.idCardImage.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(`workers/${publicId}`);
      }

      worker.adharCardNumber = adharCardNumber;
      worker.idCardImage = idCardImage;
      worker.status = "pending";
      await worker.save();
    } else {
      worker = new Worker({
        userId,
        adharCardNumber,
        idCardImage,
        status: "pending",
      });
      await worker.save();
    }

    res.status(200).json({
      success: true,
      message: "Worker verification submitted successfully",
      worker,
    });
  } catch (error) {
    console.error("Error in verifyWorker:", error);
    // Try to clean up file if it exists and error occurred
    if (req.file && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.error("Error deleting temp file:", unlinkError);
      }
    }
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
