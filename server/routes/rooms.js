const router = require("express").Router();
const { get } = require("express/lib/response");
const pool = require("../db");

router.post("/createroom", async (req, res) => {
  try {
    const {
      user_id,
      room_name,
      password,
      room_link,
      status,
      room_member,
      tags, //tags={fun,games}
    } = req.body;

    let checkList = "(";
    for (var i = 0; i < tags.length; i++) {
      checkList += "'" + tags[i] + "',";
    }
    checkList = checkList.slice(0, -1);
    checkList += ")";
    let testList = "";
    for (var i = 0; i < tags.length; i++) {
      testList += "('" + tags[i] + "'),";
    }
    testList = testList.slice(0, -1);
    // console.log(testList);
    // console.log(checkList)

    let newRoom = await pool.query(
      // `WITH e AS(
      // 	INSERT INTO rooms (user_id,room_name,password,room_link,status,room_member)
      // 		   VALUES ($1, $2 ,$3,$4,$5,$6)
      // 	ON CONFLICT(room_name) DO NOTHING
      // 	RETURNING room_link
      // )
      // SELECT * FROM e
      // UNION
      // select room_link from rooms where (room_link = $4);`,[user_id, room_name, password, room_link, status, room_member]

      "INSERT INTO rooms (user_id,room_name,password,room_link,status,room_member) VALUES ($1, $2 ,$3,$4,$5,$6) RETURNING room_link",
      [user_id, room_name, password, room_link, status, room_member]
    );

    let newTags = await pool.query(
      // `INSERT INTO tags (tag_name) VALUES ${testList} ON CONFLICT DO NOTHING`
      `WITH e AS(
			INSERT INTO tags (tag_name) 
				   VALUES  ${testList}
			ON CONFLICT(tag_name) DO NOTHING
			RETURNING tag_name
		)
		SELECT * FROM e
		UNION
		select tag_name from tags where tag_name in ${checkList};`
    );

    let newTagList = "";
    // let newRoom = "9940fbe1-092e-414c-b000-af4e77dbcb88";
    newRoom = newRoom.rows[0].room_link;
    for (let j = 0; j < newTags.rowCount; j++) {
      newTagList += "('" + newRoom + "','" + newTags.rows[j].tag_name + "'),";
    }
    newTagList = newTagList.slice(0, -1);
    // console.log("What the hell: ", newTagList);
    // console.log(checkList);

    let roomTag = await pool.query(
      // `WITH e AS(
      // 	INSERT INTO room_tags (room_link , tag_name)
      // 		   VALUES  ${newTagList}
      // 	ON CONFLICT(room_link) DO NOTHING
      // 	RETURNING room_tags_id
      // )
      // SELECT * FROM e
      // UNION
      // select room_tags_id from room_tags where (room_link = $1 and tag_name in ${checkList});`,[newRoom]
      `INSERT INTO room_tags (room_link , tag_name) VALUES ${newTagList} ON CONFLICT DO NOTHING RETURNING *`
    );

    return res.status(200).json(roomTag.rows);
  } catch (err) {
    console.error(err.message);
    res.send(err);
  }
});

router.get("/getrooms", async (req, res) => {
  try {
    const roomsfromdb = await pool.query(
      "SELECT * FROM rooms ORDER BY room_name ASC"
    );

    const roomInfo = roomsfromdb.rows;
    for (let j = 0; j < roomsfromdb.rowCount; j++) {
      roomInfo[j].tags = [];
      const rooms = await pool.query(
        "SELECT tag_name FROM room_tags WHERE (room_link = $1);",
        [roomInfo[j].room_link]
      );

      rooms.rows.forEach((item) => {
        roomInfo[j].tags.push(item["tag_name"]);
      });
    }
    // console.log(roomInfo);
    res.status(200).json(roomInfo);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

router.get("/noOfmembers/:room_link", async (req, res) => {
  try {
    const { room_link } = req.params;
    const roomsfromdb = pool.query(
      "SELECT * FROM rooms WHERE (room_link = $1 AND status = $2)",
      [room_link, true]
    );
    res.status(200).json((await roomsfromdb).rows[0].room_member);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

router.put("/userjoined", async (req, res) => {
  try {
    const { room_name, room_link, user_state } = req.body;

    console.log("room_link ", room_link);
    const roomsfromdb = await pool.query(
      "SELECT * FROM rooms WHERE (room_link = $1 AND status = $2)",
      [room_link, true]
    );
    console.log(roomsfromdb.rows);
    let noOfMembers = roomsfromdb.rows[0].room_member;

    noOfMembers += 1;
    const temp = pool.query(
      "UPDATE rooms SET room_member = $1 WHERE (room_link= $2)",
      [noOfMembers, room_link]
    );

    res.status(200).json(roomsfromdb.rows[0]);
    // res.status(200).json((await roomsfromdb).rows[0].room_member);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

router.delete("/close/:room_link", async (req, res) => {
  try {
    // let {room_name, room_link } =
    // req.body;
    const { room_link } = req.params;
    // DELETE FROM position WHERE unit != ($1) AND user_id = $2
    const deleteRoom = await pool.query(
      "DELETE FROM rooms WHERE (room_link = $1)",
      [room_link]
    );
    res.json("Room was deleted");
    // console.log(listofRooms);
    // return res.json("Room Deleted");
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

router.get("/searchroom", async (req, res) => {
  try {
    const { name } = req.query;

    const rooms = await pool.query(
      "SELECT room_link FROM rooms WHERE room_name ILIKE $1 ORDER BY room_name ASC",
      [`%${name}%`]
    );

    const tags = await pool.query(
      "SELECT room_link FROM room_tags WHERE tag_name ILIKE $1",
      [`%${name}%`]
    );

    const combination = [];
    // console.log(rooms.rows);

    const newRoom = [];
    rooms.rows.forEach((item) => {
      // console.log(item["room_link"]);
      newRoom.push(item["room_link"]);
    });
    const newTag = [];
    tags.rows.forEach((item) => {
      // console.log(item["room_link"]);
      newTag.push(item["room_link"]);
    });

    // console.log(newRoom);
    // console.log(tags.rows);

    let combineRoomAndTags = [...new Set([...newRoom, ...newTag])];
    let finalGroup = "";
    // console.log(combineRoomAndTags.length);
    if (combineRoomAndTags.length == 0) {
    //   console.log("if");
      return res.json([]);
    } else {
    //   console.log("else");
      finalGroup = "(";
      combineRoomAndTags.forEach((item) => {
        finalGroup += "'" + item + "',";
        // console.log(item);
      });
      finalGroup = finalGroup.slice(0, -1);
      finalGroup = finalGroup += ")";
      const getrooms = await pool.query(
        //   `SELECT * FROM rooms WHERE room_link in ${combineRoomAndTags};`,
        `SELECT * FROM rooms WHERE room_link in ${finalGroup};`

        //   `SELECT * FROM rooms WHERE room_link in ('9940fbe1-092e-414c-b000-af4e77dbcb82','9940fbe1-092e-414c-b000-af4e77dbcb86');`
      );
	 
      const roomInfo = getrooms.rows;
	  console.log(roomInfo);
      for (let j = 0; j < getrooms.rowCount; j++) {
        roomInfo[j].tags = [];
        const rooms = await pool.query(
          "SELECT tag_name FROM room_tags WHERE (room_link = $1);",
          [roomInfo[j].room_link]
        );

        rooms.rows.forEach((item) => {
          roomInfo[j].tags.push(item["tag_name"]);
        });
      }
	  res.json(roomInfo);
    }

    // console.log(roomInfo);
   
  } catch (err) {
    console.error(err.message);
    res.status(500).send(err.message);
  }
});

module.exports = router;
