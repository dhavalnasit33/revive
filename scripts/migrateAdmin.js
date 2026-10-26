
require("dotenv").config();

const mongoose = require("mongoose");
const User = require("../models/User");
const Admin = require("../models/Admin");

const migrateAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB connected");

        const adminUsers = await User.find({ role: "admin" });

        if (adminUsers.length === 0) {
            console.log("No admin records found in users.");
            return;
        }

        for (const user of adminUsers) {
            let admin = await Admin.findOne({
                email: user.email
            });

            if (!admin) {
                admin = await Admin.create({
                    name: user.name,
                    email: user.email,
                    password: user.password,
                    phone: user.phone,
                    isActive: user.isActive
                });
            }

            // Verify the destination before deleting the source.
            if (
                admin.name !== user.name ||
                admin.email !== user.email ||
                admin.password !== user.password
            ) {
                throw new Error(
                    `Verification failed for ${user.email}. Original record retained.`
                );
            }

            await User.deleteOne({
                _id: user._id,
                role: "admin"
            });

            console.log(
                `Admin moved successfully: ${user.email}`
            );
        }

        console.log("Admin migration completed.");
    } catch (error) {
        console.error("Migration failed:", error.message);
    } finally {
        await mongoose.disconnect();
    }
};

migrateAdmin();
