const mongoose = require('mongoose');
const passportLocalMongoose = require("passport-local-mongoose");

var studentSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    teamusername: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    phone: {
        type: String,
        required: true
    },
    rollNumber: {
        type: String,
        required: true
    },
    year: {
        type: String,
        required: true
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
    }
});

// PASSWORD HASHING ADDED

studentSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("Student", studentSchema);
