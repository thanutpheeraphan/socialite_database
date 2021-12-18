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

router.get("/noOfmembers",async(req,res) =>{

	try {
		let {password, room_link ,room_name} = req.body;
		const roomsfromdb = pool.query( "SELECT * FROM rooms WHERE (room_link = $1 AND status = $2 AND room_name = $3)", [room_link,true,room_name]);
		res.status(200).json((await roomsfromdb).rows[0].room_member);
		
	} catch (err) {
		console.error(err.message);
		res.status(500).send("Server Error");
	}
})

router.put("/userjoined", async (req,res)=>{
	try {
		let { user_id, room_name, password, room_link } =
		req.body;

		const roomsfromdb = pool.query( "SELECT * FROM rooms WHERE (room_link = $1 AND status = $2 AND room_name = $3)", [room_link,true,room_name]);
		let noOfMembers=res.status(200).json((await roomsfromdb).rows[0].room_member);


		noOfMembers += 1;
		pool.query(
			'UPDATE rooms SET room_member = $1 WHERE (room_name= $2 AND user_id= $3)', [noOfMembers,room_name, user_id]);

		res.status(200).send(`Someone joined room: ${room_name}`)
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
