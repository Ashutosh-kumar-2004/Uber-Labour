const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true,
            match: [/^[A-Za-z\s]+$/, "Name must contain only letters and spaces"],
            minlength: [2, "Name must be at least 2 characters long"],
            maxlength: [50, "Name cannot exceed 50 characters"],
        },

        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
        },

        userType: {
            type: String,
            required: true,
            enum: {
                values: ["user", "worker"],
                message: "User type must be either 'user' or 'worker'",
            },
            default: "user",
        },

        password: {
            type: String,
            select: false,
            required: [true, "Password is required"],
            minlength: [8, "Password must be at least 8 characters long"],
            validate: {
                validator: function (value) {
                    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/.test(value);
                },
                message:
                    "Password must include uppercase, lowercase, number, and special character",
            },
        },

        googleId: {
            type: String,
            sparse: true, // Allows multiple nulls but unique if present
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
