CREATE DATABASE socialite_db;

--set extention
CREATE TABLE users(
	user_id uuid PRIMARY KEY DEFAULT,
	uuid_generate_v4(),
	user_name VARCHAR(255) NOT NULL,
	user_email VARCHAR(255) NOT NULL,
	user_password VARCHAR(255) NOT NULL
);

CREATE TABLE users(
	user_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
	user_email VARCHAR(255) NOT NULL,
	user_password VARCHAR(255) NOT NULL
);

CREATE TABLE rooms(
	room_id VARCHAR(255) PRIMARY KEY NOT NULL,
	room_name VARCHAR(255),
	room_link  VARCHAR(255),
	room_member INTEGER NOT NULL,
	tags,
	user_id,
	password, 
	status,
);



--insert fake users
INSERT INTO users (user_name,user_email,user_password) VALUES ('henry','henryhsiesh@gmail.com','helloworld123');