import express from 'express';
var router = express.Router();
import bodyParser from 'body-parser';
import cors from 'cors';
import mysql from 'mysql';
import nodemailer from 'nodemailer';

const connection = mysql.createConnection({
    port: 3306,
    host: "localhost",
    user: "root",
    password: "b1gmoney",
    database: 'kidtergarteners'
});

connection.connect( (err) => {
    if (err) throw err;
    console.log('connected to database')
});

var transporter = nodemailer.createTransport({
    service: 'Gmail',
    host: "smtp.gmail.com",
    port: "465",
    secure: true,
    auth: {
      user: 'arikwocha@gmail.com',
      pass: 'vmtl ytwr kqkq mjtg'
    }
  });


router.use(bodyParser.urlencoded({extended: true}))
router.use(bodyParser.json())
router.use(cors())

router.get("/", (req, res) => {
    res.redirect("http://localhost:3000/Sign-Up")
})

router.post("/", (req, res, next) => {
    var userDetails = req.body;
    var Fname = userDetails.Fname;
    var Lname = userDetails.Lname;
    var otherName = userDetails.otherName;
    var preDOB = userDetails.DOB;
    var preDOB = new Date();
    var DOB = preDOB.toISOString().slice(0, 10);
    var Username = userDetails.Username;
    var pwd = userDetails.pwd;
    var email = userDetails.email;
    var phone = userDetails.phone;

    if (!Fname || !Lname || !otherName || !DOB || !Username || !pwd || !email || !phone){
        var errorMessage = "You must provide all parameters to create an account"
        res.render('error', {errorMessage: errorMessage})
    }

    else if (Fname || Lname || otherName || DOB || Username || pwd || email || phone){
        var sql = `INSERT IGNORE INTO kidtergarten_data (Fname, Lname, otherName, DOB, Username, pwd, email, phone) 
        VALUES ('${Fname}', '${Lname}', '${otherName}', '${DOB}', '${Username}', SHA('${pwd}'), '${email}', '${phone}')`;
        connection.query(sql, (err, result) => {
            if (err) throw err;

            if(result.warningCount === 0 ){
                var verificationToken = Math.random().toString().substring(2,6);
                var mailOptions = {
                    from: 'arikwocha@gmail.com',
                    to: `${email}`,
                    subject: 'Your Verification Token',
                    html: `<text> Use ${verificationToken} to verify your email </text>`
                  };
                  
                transporter.sendMail(mailOptions, function(error, info){
                    if (error) {
                      console.log(error);
                    } else {
                      console.log('Email sent: ' + info.response);
                    }
                  });

                res.render("emailValidation", {email: email});


                router.post("/verify", (req, res) => {
                    const newToken = verificationToken;
                    if (req.body.Token === newToken){
                        var sql = `UPDATE kidtergarten_data
                        SET isVerified = 'VERIFIED'
                        WHERE email = '${email}' `;
                        connection.query(sql, (err, result) => {
                            if (err) throw err;
                        })
                        res.redirect("http://localhost:3000/Login") //to the login page
                    }

                    else if (!req.body.Token || req.body.token != newToken){
                        var errorMessage = "incorrect credentials";
                        res.render('error', {errorMessage: errorMessage})
                    }
                })

                router.post("/reValidate", (req, res) => {
                    transporter.sendMail(mailOptions, function(error, info){
                        if (error) {
                          console.log(error);
                        } else {
                          console.log('Email sent: ' + info.response);
                        }
                      });
    
                    res.render("emailValidation", {email: email});
                })
            }
            
            else if (result.affectedRows = 0 || result.warningCount >= 1){
                var errorMessage = "Unable to open account, please ensure you have not used this information previously";
                res.render('error', {errorMessage: errorMessage})
            }

         }
        )}

    

})

export { router as SignUp}