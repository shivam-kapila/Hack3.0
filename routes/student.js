var express = require("express");
var router = express.Router();
var Student = require("../models/student");
var Team = require("../models/team");
var async = require("async");
var crypto = require("crypto");
var nodemailer = require("nodemailer");
var passport = require("passport");
var ObjectId = require('mongodb').ObjectID;
  LocalStrategy = require('passport-local').Strategy;

router.get("/signup", function (req, res) {
  res.render("studentRegistration");
});

router.get("/dashboard",isStudentLoggedIn, isVerified, function(req, res) {
    // console.log(req.user);
    if(req.user.name === undefined) {
        res.render("studentDetails");
    } else {
            // console.log(req.body.username);
        // console.log(req.user.name);
        // console.log(req.user.teamusername);
        let students = [];

        if(req.user.teamusername !== undefined) {
            Team.findOne({username: req.user.teamusername}, function(err, team) {
                if(!err) {
                    console.log("team"+ JSON.stringify(team));
                    for(var i = 0 ; i < team.members.length; i++) {
                    Student.find({_id: ObjectId(team.members[i])}, function(err, student) {
                        if(!err){
                            // student.forEach((person) => students.push(person));
                            console.log("---_______--___----" + student + "---_______--___----");
                            students = student;
                        }
                    });
                    //   console.log(`Students ${JSON.stringify(students)}`);
                    }
                } if(!err) {
                    res.render("studentDashboard", {students});
                }
            });    
        } else {
            res.render("studentDashboard", {students});
        }
    }
});

router.get("/createTeam", isStudentLoggedIn, isVerified, function(req, res){
        res.render("createTeam");
});

router.post("/createTeam", isStudentLoggedIn, isVerified, function(req, res){
       var mentorNeed = false;
       if(req.body.mentorRequired == "on"){
       mentorNeed = true;
       }

        
async.waterfall([
        function(done) {
        crypto.randomBytes(10, function(err, buf) {
        var token = buf.toString('hex');
        done(err, token);
      });
    },
    function(token, done) {
        // console.log(req.body.username);

        var newTeam = new Team({
            username: req.body.username,
            memberLength: req.body.members,
            mentorRequired: mentorNeed,
            area: req.body.area,
            teamToken: token
          });

          newTeam.save();
                  //   console.log(JSON.stringify(team));
            Student.updateOne({username: req.user.username}, {teamusername: req.body.username, isLeader: true}, function(err, student) {
            });
            console.log(req.body.username);
            Team.findOne({username: req.body.username}, function(err, team){
                if(!err) {
                    Team.updateOne({username: req.body.username}, {$push: {members: req.user._id}}, function(errr, none){
                        if(!errr) {
                            done(errr, token, team);
                        }
                    });
                      
                }
            }); 
    },          
    function(token, team, done) {
        console.log("JJJJJJJJJJJJJJJJJJJJJJJJJJJJJ");
      var link = 'http://' + req.headers.host + '/student/team/' +req.body.username + "/" + token;
      var smtpTransport = nodemailer.createTransport({
        service: 'Gmail', 
        auth: {
            type: "login",
          user: 'csechack3.0@gmail.com',
          pass: process.env.GMAILPW
        }

      });
      var mailOptions = {
        to: req.user.username,
        from: 'csechack3.0@gmail.com',
        subject: 'Team Created',
        text: 
          'This is to inform you that you created a team with the following username:\n\n' +
          req.body.username +
          '\n \n Please share the username or else share the clickable link to accept team members. \n \n' +
          link + '\n\n' +
          'Regards \nTeam CSEC'
      };
      smtpTransport.sendMail(mailOptions, function(err) {
        console.log('mail sent');
        req.flash('success', 'An e-mail has been sent to ' + req.body.username + ' with further instructions.');
        done(err, 'done');
      });
    }
  ], function(err) {
    if (err) {
        return next(err);
}
});
                res.redirect("/student/dashboard")
  });

  router.get("/team/:teamName/:token", isStudentLoggedIn, isVerified, function(req, res) {
    //   console.log(req.user.username);
    // if(req.user.teamusername !== undefined) {
    // } else {
    {Team.findOne({username: req.params.teamName, teamToken: req.params.token}, function(err, team) {
            if(!err) {
                console.log("team" + team);
                
                if(team.members.length <= team.memberLength) {
                    Student.updateOne({username: req.user.username}, {teamusername: req.params.teamName}, function(err, stat) {
                        if(!err) {
                            
                            Team.updateOne({username: req.params.teamName}, {$push: {members: req.user._id}}, function(errr, none){
                                if(!errr) {
                                    console.log("HElloi");
                                    res.redirect("/student/dashboard");
                                }
                            });
                        }
                    });
                }
            }
         });
    }
  });



router.post("/details", isStudentLoggedIn, isVerified, function(req, res) {
    Student.updateOne({username: req.user.username}, {name: req.body.name,
        phone: req.body.phone,
        year: req.body.year,
        rollNumber: req.body.rollno}, function(err, student) {
            req.user.teamName = req.body.username;
            if(!err) {
                res.redirect("/student/dashboard");
            }
        });
});

router.get("/login", function(req, res) {
    res.render("studentLogin");
});

router.post("/login", passport.authenticate("student",
  {
    successRedirect: "/student/dashboard",
    failureRedirect: "/student/login",
    successFlash: "Welcome back!!!",
    failureFlash: "OOPS!Login failed. Please try again",


  }), function (req, res) {
  });

router.post("/signup", function (req, res, next){
if(req.body.password === req.body.passwordConfirm){
        var newStudent = new Student({
            username: req.body.username,
          });

        Student.register(newStudent, req.body.password, function (err, student) {
        if (err) {
            console.log(err);
            return res.render("studentRegistration");
        } 
         async.waterfall([
        function(done) {
        crypto.randomBytes(20, function(err, buf) {
        var token = buf.toString('hex');
        done(err, token);
      });
    },
    function(token, done) {
      Student.findOne({ username: req.body.username }, function(err, student) {
 
        student.verifyToken = token;
        student.verifyExpires = Date.now() + 3600000; // 1 hour
        student.save(function(err) {
          done(err, token, student);
        });
      });
    },          
    function(token, student, done) {
      var smtpTransport = nodemailer.createTransport({
        service: 'Gmail', 
        auth: {
            type: "login",
          user: 'csechack3.0@gmail.com',
          pass: process.env.GMAILPW
        }

      });
      var mailOptions = {
        to: student.username,
        from: 'csechack3.0@gmail.com',
        subject: 'Verify Account',
        text: 'Welcome\n\n' +
          'Please click on the following link, or paste this into your browser to complete your verification process:\n\n' +
          'http://' + req.headers.host + '/student/verify/' + token + '\n\n' +
          'If you did not request this, ignore this email and the account will remain unverified.\n' +
          'Please note that the link expires within an hour. \n \n' +
          'Regards \nTeam CSEC'
      };
      smtpTransport.sendMail(mailOptions, function(err) {
        console.log('mail sent');
        req.flash('success', 'An e-mail has been sent to ' + student.username + ' with further instructions.');
        done(err, 'done');
      });
    }
  ], function(err) {
    if (err) {
        return next(err);
    res.redirect('/student/login');
}
    else
                res.render("test")

  });
    
    });
    }
    else{
        console.log("Passwords don't match")
        req.flash('error', "Passwords don't match");
     res.redirect('/student/login');
    }
});

router.get('/verify/:token', function(req, res) {
res.render("test2", {token: req.params.token});
});


router.post('/verify/:token', function(req, res) {
  async.waterfall([
    function(done) {
      Student.findOne({ verifyToken: req.params.token, verifyExpires: { $gt: Date.now() } }, function(err, student) {
        if (!student) {
          req.flash('error', 'Account verification token is invalid or has expired.');
          console.log('Account verification token is invalid or has expired.');
          return res.redirect('back');
        }
            student.isVerified = true;
            student.verifyToken = undefined;
            student.verifyExpires = undefined;
            student.save(function(err) {
                console.log(student);
                 });
                });
    },
    function(student, done) {
      var smtpTransport = nodemailer.createTransport({
        service: 'Gmail', 
        auth: {
          user: 'csechack3.0@gmail.com',
          pass: process.env.GMAILPW
        }
      });
      var mailOptions = {
        to: student.username,
        from: 'csechack3.0@gmail.com',
        subject: 'Account Verified',
        text: 'Hello,\n\n' +
          'This is a confirmation that the your account has just been verified.\n \n' +
          'Regards \nTeam CSEC'
      };
      smtpTransport.sendMail(mailOptions, function(err) {
        req.flash('success', 'Success! Your account has been verified.');
        done(err);
      });
    }
  ], function(err) {
    res.redirect('/student/login');
  });
  console.log("Verified");
  res.redirect('/student/login');
});

function isStudentLoggedIn(req, res, next) {
  if (req.isAuthenticated() && req.user.role === "student") {
    return next();
  }
  req.flash("error", "You need to be logged in to do that");
  res.redirect("/student/login");
}

function isVerified(req, res, next) {
    Student.findOne({username: req.user.username}, function(err, student){
  if (req.user.isVerified == true) {
    return next();
  }
  req.flash("error", "Please verify your account to continue to login");
  console.log("Please verify your account to continue to login");
  res.redirect("/student/login");      
    })
  
}

// function validateTeam(teamDetails, year) {
//     var first = 0, second = 0, third = 0, fourth = 0, fifth = 0;
//     console.log("Year" + year);
//     switch (year) {
//         case "2": second++;
//             break;
//         case "3": third++;
//             break;
//         case "4": fourth++;
//             break;
//         case "5": fifth++;
//             break;
//         case "1": first++;
//             break;
//         default: break;     // No use        
//     }
//     teamDetails.forEach(function (member) {
//         switch (member.year) {
//             case "2": second++;
//                 break;
//             case "3": third++;
//                 break;
//             case "4": fourth++;
//                 break;
//             case "5": fifth++;
//                 break;
//             case "1": first++;
//                 break;
//             default: break;     // No use        
//         }
//     });
//     console.log(`Second: ${second}\nThird: ${third}\nFourth: ${fourth}\nFirst: ${first}`);
//     console.log('Team Details in Validate Form: ', teamDetails);
//     if (second > 1) {        // If there are three second years
//         if (third > 0 || fourth > 0 || fifth > 0 || second > 3) {
//             console.log('Caught at first if');
//             return false;
//         } else {
//             return true;
//         }
//     }
//     if (third > 0) {         // If there are two third years
//         if (second > 1 || fourth > 0 || fifth > 0 || third > 2) {
//             console.log('Caught at second if');
//             return false;
//         } else {
//             return true;
//         }
//     }
//     if (fourth > 0) {
//         if (third > 0 || second > 0 || fifth > 0 || fourth > 1) {
//             return false;
//         } else {
//             return true;
//         }
//     }
//     if (fifth > 0) {
//         if (third > 0 || second > 0 || fourth > 0 || fifth > 1) {
//             return false;
//         } else {
//             return true;
//         }
//     }
//     return true;
// }

module.exports = router;