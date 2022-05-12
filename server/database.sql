CREATE DATABASE socialite_db;

--set extention
CREATE TABLE users(
	user_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
	user_name VARCHAR(255) NOT NULL,
	user_email VARCHAR(255) NOT NULL,
	user_password VARCHAR(255) NOT NULL
);

CREATE TABLE rooms(
	user_id uuid DEFAULT uuid_generate_v4(),
	room_name VARCHAR(255) PRIMARY KEY NOT NULL,
	room_link  INTEGER NOT NULL,
	room_member INTEGER NOT NULL,
	tags VARCHAR(255)[],
	password VARCHAR(255), 
	status BOOLEAN
);



--insert fake users
INSERT INTO users (user_name,user_email,user_password) VALUES ('henry','henryhsiesh@gmail.com','helloworld123');