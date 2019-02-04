const mongoose = require('mongoose');
const passportLocalMongoose = require("passport-local-mongoose");

var teamSchema = mongoose.Schema({
    username: {
        type: String,
        unique: true,
        // default: "team1"
    },
    mentorRequired:
    {
        type: Boolean
    },
    memberLength: {
        type: Number,
    },
    area: {
        type: String
    },
    members: [
      {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Student"
      }
    ],
    
    mentorName: {
        type: String
    },
     teamToken: { 
       type: String
    },
});

// PASSWORD HASHING ADDED

teamSchema.plugin(passportLocalMongoose);


module.exports = mongoose.model("Team", teamSchema);
