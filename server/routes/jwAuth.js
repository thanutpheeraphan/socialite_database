const router = require ("express").Router()
const { restart } = require("nodemon");
const pool = require("../db");
const bcrypt = require("bcrypt");
const jwtGenerator = require("../utils/jwtGenerator");
const validInfo = require("../middleware/validInfo");
const authorization = require("../middleware/authorization");

//register

router.post("/register", validInfo, async(req,res)=>{
	try{

		//1.destructure the req.body(name,email,password)

		const {name,email,password} = req.body;

		//2. check if user exist by email (if user exist then throw error)

		const user = await pool.query("SELECT * FROM users WHERE user_email = $1", [email]);

		//2.5 check if user_name duplicates exist (if user_name exist then throw error)

		const user_name = await pool.query("SELECT * FROM users WHERE user_name = $1", [name]);

		// res.json(user.rows)

		// console.log(user_name.rows.length);

		if(user.rows.length !== 0){
			return res.status(401).json("Email is already in use!")
		}

		if(user_name.rows.length !== 0){
			return res.status(401).json("User already exist! Try a new user name")
		}
		//3. bcrypt the user password

		const saltRounds = 10; //how encrypted it is gonna be
		const salt = await bcrypt.genSalt(saltRounds);

		const bcryptPassword = await bcrypt.hash(password,salt);

		//4. enter the new user inside the database

		let newUser = await pool.query("INSERT INTO users (user_name, user_email, user_password) VALUES ($1, $2 ,$3) RETURNING * ",[name,email,bcryptPassword]);
		
		// res.json(newUser.rows[0]);
		//5. generating the token

		const jwtToken = jwtGenerator(newUser.rows[0].user_id);
		console.log(jwtToken);
		return res.json({ jwtToken });

	}catch(err){
		console.error(err.message);
		res.status(500).send("Server Error");
	}
})

//login route

router.post("/login", validInfo , async (req,res)=>{
	try{
		
		//1. destructure the req.body

		const {email,password} = req.body;

		//2. check if user doesnt exist (if not we throw error)

		const user = await pool.query("SELECT * FROM users WHERE user_email = $1",[email]);

		if(user.rows.length == 0){
			return res.status(401).json("Password or Email is incorrect!");
		}

		//3. check if incoming password is the same as the database password

		const validPassword = await bcrypt.compare(password, user.rows[0].user_password);

		if (!validPassword){
			return res.status(401).json("Invalid Credentials");
		}
		//4. give them jwt token

		const jwtToken = jwtGenerator(user.rows[0].user_id);
		const userName = user.rows[0].user_name;
		const userId = user.rows[0].user_id;
		return res.json({ jwtToken , userName, userId});
		
	}catch(err){
		console.error(err.message);
		res.status(500).send("Server Error");
	}
})

router.get("/verify", authorization, async (req,res)=>{
	try{

		res.json(true);

	}catch(err){
		console.error(err.message);
		res.status(500).send("Server Error");
	}
})


module.exports = router;