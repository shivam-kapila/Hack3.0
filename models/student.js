const mongoose = require('mongoose');
const passportLocalMongoose = require("passport-local-mongoose");

var studentSchema = mongoose.Schema({
    name: {
        type: String,
    },
    teamusername: {
        type: String,
    },
    username: {
        type: String,
        unique: true
    },
    phone: {
        type: String,
    },
    rollNumber: {
        type: String,
    },
    year: {
        type: String,
    },
    password: {
        type: String,
    },
    isLeader: {
        type: Boolean,
        default: false
    },
    role: {
        type: String,
        default: "student"
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    verifyToken: {
        type: String
    },
    verifyExpires: {
        type: Date
    }
});

// PASSWORD HASHING ADDED

studentSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("Student", studentSchema);
