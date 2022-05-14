const router = require("express").Router();
const pool = require("../db");
const authorization = require("../middleware/authorization");

router.get("/", authorization, async(req,res) => {
	try{

		//req.user has the payload
		// res.json(req.user);

		const user = await pool.query("SELECT user_id, user_name FROM users WHERE user_id = $1", [req.user]);

		res.json(user.rows[0]);

	}catch(err){
		console.error(err.message);
		res.status(500).json("Server Error");
	}
})

router.get("/getusers", async(req,res) => {
	try{

		const getUserCount = await pool.query(
			"SELECT COUNT(*) from users;"
		);
		
		const toReturn = getUserCount.rows[0]
		// console.log(getUserCount.rows[0])


		return res.status(200).json(toReturn);

	}catch(err){
		console.error(err.message);
		res.status(500).json("Server Error");
	}
})

module.exports = router;

