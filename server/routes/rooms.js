const router = require("express").Router();
const { get } = require("express/lib/response");
const pool = require("../db");

router.post("/createroom", async (req, res) => {
  try {
    const { user_id, room_name, password, room_link, status, room_member } =
      req.body;

    let newRoom = await pool.query(
      "INSERT INTO rooms (user_id,room_name,password,room_link,status,room_member) VALUES ($1, $2 ,$3,$4,$5,$6) RETURNING * ",
      [user_id, room_name, password, room_link, status, room_member]
    );

	console.log("Room created");
    return res.status(200).json(newRoom.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

router.get("/getrooms", async (req, res) => {
  try {
    const roomsfromdb = pool.query( "SELECT * FROM rooms ORDER BY room_name ASC");
	res.status(200).json((await roomsfromdb).rows);

  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

router.get("/noOfmembers/:room_link",async(req,res) =>{

	try {
		const {room_link} = req.params;
		const roomsfromdb = pool.query( "SELECT * FROM rooms WHERE (room_link = $1 AND status = $2)", [room_link,true]);
		res.status(200).json((await roomsfromdb).rows[0].room_member);
		
	} catch (err) {
		console.error(err.message);
		res.status(500).send("Server Error");
	}
})

router.put("/userjoined", async (req,res)=>{
	try {
		const {room_name, room_link , user_state} =
		req.body;

		console.log("room_link ", room_link);
		const roomsfromdb = await pool.query( "SELECT * FROM rooms WHERE (room_link = $1 AND status = $2)", [room_link,true]);
		console.log(roomsfromdb.rows)
		let noOfMembers= roomsfromdb.rows[0].room_member;
		


		noOfMembers += 1;
		const temp = pool.query(
			'UPDATE rooms SET room_member = $1 WHERE (room_link= $2)', [noOfMembers,room_link]);

		res.status(200).json((roomsfromdb).rows[0]);
		// res.status(200).json((await roomsfromdb).rows[0].room_member);
	} catch (err) {
		console.error(err.message);
		res.status(500).send("Server Error");
	}

})

router.delete("/close/:room_link",async(req,res)=>{
	try {
		// let {room_name, room_link } =
		// req.body;
		const {room_link} = req.params;
		// DELETE FROM position WHERE unit != ($1) AND user_id = $2
		const deleteRoom = await pool.query( "DELETE FROM rooms WHERE (room_link = $1)", [room_link]);
		res.json("Room was deleted")
		// console.log(listofRooms);
		// return res.json("Room Deleted");

	} catch (err) {
		console.error(err.message);
		res.status(500).send("Server Error");
	}
})




module.exports = router;
