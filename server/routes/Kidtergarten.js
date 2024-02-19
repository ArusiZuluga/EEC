import express from 'express';
var router = express.Router();
import bodyParser from 'body-parser';
import cors from 'cors';
import mysql from 'mysql';
import session from 'express-session';
import expressMySqlSession from 'express-mysql-session' ;


const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "b1gmoney",
    database: 'kidtergarteners'
});

connection.connect( (err) => {
    if (err) throw err;
    console.log('connected to database')
});

const options = {
    host: 'localhost',
    port: 3306,
	user: 'root',
	password: 'b1gmoney',
	database: 'kidtergarteners',
    clearExpired: true,
    checkExpirationInterval: 900000,
    expiration: 86400000,
    createDatabaseTable: true,

}

const MySQLStore   = expressMySqlSession(session);
const sessionStore = new MySQLStore(options);

router.use(bodyParser.urlencoded({extended: true}))
router.use(bodyParser.json())
router.use(cors())
router.use(session({
    key: 'kidtergarteners_session_key',
    secret: 'kidtergaten00##',
    store: sessionStore,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false , maxAge : 20000}
}));

router.get("/", (req, res) => {
    res.redirect("http://localhost:3000/Login")
})

var User = {
    isEmailVerified : false,
    isLoggedIn : false,
    isSubscribed : false,
    fullName : '',
    DOB : '',
    Name : '',
    Email : '',
    Phone : ''
};

router.post("/", (req, res) => {
    var loginDetails = req.body;
    var Username = loginDetails.Username;
    var password = loginDetails.password;

    if (!Username || !password ){
        var errorMessage = "You must login to continue";
        res.render('error', {errorMessage: errorMessage})
    }

    else if (Username && password){
        var sql = `SELECT *
        FROM kidtergarten_data WHERE Username = '${Username}'
        AND pwd = SHA('${password}')
        `
        connection.query(sql, (err, result) => {
            if (err) throw err;
            if (!result[0] ) {
                var errorMessage = 'incorrect credentials';
                res.render('error', {errorMessage: errorMessage})
            }

            else{
                var verificationCheck = result[0].isVerified
                if (verificationCheck === 'VERIFIED'){
                User.isEmailVerified = true;
                User.isLoggedIn = true;
                User.DOB = result[0].DOB;
                User.Email = result[0].email;
                User.fullName = result[0].Fname + ' ' + result[0].Lname;
                User.Phone = result[0].phone;
                User.Name = result[0].Username;
                res.render('kidtergarten' , {User : User})
                }
                
                else if (verificationCheck === null){
                var errorMessage = "You must verify your email to use this service"
                res.render('error', {errorMessage: errorMessage})
                }
                
            }

            

        })
    }
})







export { router as Kidtergarten}