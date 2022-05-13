CREATE DATABASE socialite_db;

--set extension
CREATE TABLE users(
	user_id uuid DEFAULT uuid_generate_v4(),
	user_name VARCHAR(255) NOT NULL,
	user_email VARCHAR(255) NOT NULL,
	user_password VARCHAR(255) NOT NULL,
	PRIMARY KEY(customer_id)
);

CREATE TABLE rooms(
	user_id uuid DEFAULT uuid_generate_v4(),
	room_name VARCHAR(255) UNIQUE NOT NULL,
	room_link  uuid DEFAULT uuid_generate_v4() NOT NULL,  
	room_member INTEGER NOT NULL,
	password VARCHAR(255), 
	status BOOLEAN,
	PRIMARY KEY (room_link)
);

create table room_tags
(
    room_link uuid DEFAULT uuid_generate_v4(),  
	CONSTRAINT fk_room
      FOREIGN KEY(room_link) 
	  REFERENCES rooms(room_link)
	  ON DELETE CASCADE,
    tag_name VARCHAR(255) not null,  
	CONSTRAINT fk_tag
      FOREIGN KEY(tag_name) 
	  REFERENCES tags(tag_name)
	  ON DELETE CASCADE,
	PRIMARY KEY (room_link, tag_name)
);

CREATE TABLE tags(
	tag_id    SERIAL, 
	tag_name  VARCHAR(255) NOT NULL, 
	PRIMARY KEY(tag_name)
);

ALTER TABLE tags 
ALTER COLUMN tag_id TYPE SERIAL;

ALTER TABLE rooms ADD PRIMARY KEY (room_name);

ALTER TABLE rooms
  ADD CONSTRAINT room_name 
    PRIMARY KEY (order_detail_id);

ALTER TABLE rooms
  DROP COLUMN tags;



--insert fake users
INSERT INTO users (user_name,user_email,user_password) VALUES ('henry','henryhsiesh@gmail.com','helloworld123');


--------------------------------------------------------------------------------------------
create table rooms
(
   room_id    integer primary key not null,
   username   varchar(100) not null
);

create table tags
(
   tag_id    integer primary key not null,
   tag_name  varchar(100) not null
);

create table room_tags
(
    room_id   integer not null references rooms(room_id),
    tag_id   integer not null references tags( tag_id )
); 