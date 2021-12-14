CREATE DATABASE segment
AS PERMANENT = 60e6, SPOOL = 120e6;

DATABASE segment;

CREATE MULTISET TABLE tracks (
  id				VARCHAR(25),
    received_at		TIMESTAMP,
    sent_at			TIMESTAMP,
    user_id			VARCHAR(25),
    anonymous_id    VARCHAR(25),
    context   		CLOB,
    properties 		CLOB,
    event           VARCHAR(25),
    event_text      VARCHAR(200)
)
NO PRIMARY INDEX;

CREATE MULTISET TABLE pages (
  id				VARCHAR(25),
    received_at		TIMESTAMP,
    sent_at			TIMESTAMP,
    user_id			VARCHAR(25),
    anonymous_id    VARCHAR(25),
    properties 		CLOB,
    page           	VARCHAR(25)
)
NO PRIMARY INDEX;

CREATE MULTISET TABLE screens (
  id				VARCHAR(25),
    received_at		TIMESTAMP,
    sent_at			TIMESTAMP,
    user_id			VARCHAR(25),
    anonymous_id    VARCHAR(25),
    properties 		CLOB,
    screen          VARCHAR(25)
)
NO PRIMARY INDEX;

CREATE MULTISET TABLE groups (
  id				VARCHAR(25),
    received_at		TIMESTAMP,
    sent_at			TIMESTAMP,
    user_id			VARCHAR(25),
    anonymous_id    VARCHAR(25),
    traits 			CLOB,
    group_id        VARCHAR(25)
)
NO PRIMARY INDEX;


CREATE MULTISET TABLE identifies (
  id				VARCHAR(25),
    received_at		TIMESTAMP,
    sent_at			TIMESTAMP,
    user_id			VARCHAR(25),
    anonymous_id    VARCHAR(25),
    traits 			CLOB
)
NO PRIMARY INDEX;
