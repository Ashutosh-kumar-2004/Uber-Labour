import cloudinary from "../config/cloudinary.js";
import Worker from "../modal/Worker.model.js";
import User from "../modal/User.js";

// Helper function to extract public ID from Cloudinary URL (Reuse this logic)
const getPublicIdFromUrl = (url) => {
  try {
    const parts = url.split("/");
    const uploadIndex = parts.indexOf("upload");
    if (uploadIndex === -1) return null;
    const pathParts = parts.slice(uploadIndex + 1);
    const relevantParts = pathParts.filter((part) => !part.match(/^v\d+$/));
    const fullPath = relevantParts.join("/");
    const lastDotIndex = fullPath.lastIndexOf(".");
    if (lastDotIndex === -1) return fullPath;
    return fullPath.substring(0, lastDotIndex);
  } catch (error) {
    console.error("Error parsing public ID:", error);
    return null;
  }
};

export const verifyWorker = async (req, res) => {
  try {
    const { adharCardNumber, address, contactNumber, idCardImage } = req.body;
    const userId = req.user._id;

    if (!idCardImage) {
      return res.status(400).json({ message: "ID Card Image URL is required" });
    }

    // Update User with Address and Contact Number
    await User.findByIdAndUpdate(userId, { address, contactNumber });

    // Create or Update Worker Record
    // Check if worker record already exists for this user
    let worker = await Worker.findOne({ userId });

    if (worker) {
      // Delete old image from Cloudinary if it exists
      if (worker.idCardImage) {
        // Use helper to get correct public_id
        const publicId = getPublicIdFromUrl(worker.idCardImage);
        if (publicId) {
          await cloudinary.uploader.destroy(publicId);
        }
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
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

export const deleteWorker = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find worker by ID (or userId if that's how you want to expose it, but ID is standard)
    const worker = await Worker.findById(id);

    if (!worker) {
      return res.status(404).json({ message: "Worker profile not found" });
    }

    // Ensure only the user themselves or an admin can delete (assuming user check)
    // worker.userId is an objectId, req.user._id is string or objectId
    if (worker.userId.toString() !== req.user._id.toString()) {
         return res.status(403).json({ message: "Not authorized" });
    }

    // Delete ID image from Cloudinary
    if (worker.idCardImage) {
      const publicId = getPublicIdFromUrl(worker.idCardImage);
      if (publicId) {
        await cloudinary.uploader.destroy(publicId);
      }
    }

    await worker.deleteOne();

    res.status(200).json({ message: "Worker profile deleted successfully" });
  } catch (error) {
    console.error("Error deleting worker:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
