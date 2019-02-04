const mongoose = require('mongoose');
const passportLocalMongoose = require("passport-local-mongoose");

var teamSchema = mongoose.Schema({
    username: {
        type: String,
        unique: true,
        // default: "team1"
    },
    memberLength: {
        type: Integer,
    },
    area: {
        type: String
    },
    mentorRequired:
    {
        type: Boolean
    },
    mentorName: {
        type: String
    },
     teamToken: { 
       type: String
    },
    teamTokenExpires: { 
       type: Boolean
    },
    members: [
         comments: [
      {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Comment"
      }
      ]
    ]
});

// PASSWORD HASHING ADDED

teamSchema.plugin(passportLocalMongoose);


module.exports = mongoose.model("Team", teamSchema);
