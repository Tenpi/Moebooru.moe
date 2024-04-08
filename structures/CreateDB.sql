CREATE TABLE IF NOT EXISTS "users" (
    "username" text PRIMARY KEY,
    "email" text UNIQUE NOT NULL,
    "joinDate" date,
    "role" text,
    "bio" text,
    "emailVerified" boolean,
    "$2fa" boolean,
    "publicFavorites" boolean,
    "showRelated" boolean,
    "image" text,
    "imagePost" bigint REFERENCES posts ("postID") ON UPDATE CASCADE ON DELETE SET NULL,
    "ip" inet,
    "banned" boolean,
    "password" text
);

CREATE TABLE IF NOT EXISTS "posts" (
    "postID" bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    "uploader" text REFERENCES "users" ("username") ON UPDATE CASCADE ON DELETE SET NULL,
    "updater" text REFERENCES "users" ("username") ON UPDATE CASCADE ON DELETE SET NULL,
    "type" text,
    "restrict" text,
    "style" text,
    "thirdParty" boolean,
    "drawn" date,
    "uploadDate" timestamptz,
    "updatedDate" timestamptz,
    "title" text,
    "translatedTitle" text,
    "artist" text,
    "link" text,
    "commentary" text,
    "translatedCommentary" text,
    "bookmarks" int,
    "mirrors" jsonb
);

CREATE TABLE IF NOT EXISTS "unverified posts" (
    "postID" bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    "originalID" bigint REFERENCES posts ("postID") ON DELETE CASCADE,
    "reason" text,
    "duplicates" boolean,
    "newTags" int,
    "uploader" text REFERENCES "users" ("username") ON UPDATE CASCADE ON DELETE SET NULL,
    "updater" text REFERENCES "users" ("username") ON UPDATE CASCADE ON DELETE SET NULL,
    "type" text,
    "restrict" text,
    "style" text,
    "thirdParty" boolean,
    "drawn" date,
    "uploadDate" timestamptz,
    "updatedDate" timestamptz,
    "title" text,
    "translatedTitle" text,
    "artist" text,
    "link" text,
    "commentary" text,
    "translatedCommentary" text,
    "bookmarks" int,
    "mirrors" jsonb,
    "thumbnail" text
);

CREATE TABLE IF NOT EXISTS "images" (
    "imageID" bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    "postID" bigint REFERENCES posts ON DELETE CASCADE,
    "type" text,
    "filename" text,
    "width" int,
    "height" int,
    "size" int,
    "order" int,
    "hash" text
);

CREATE TABLE IF NOT EXISTS "unverified images" (
    "imageID" bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    "postID" bigint REFERENCES "unverified posts" ON DELETE CASCADE,
    "type" text,
    "filename" text,
    "width" int,
    "height" int,
    "size" int,
    "order" int,
    "hash" text
);

CREATE TABLE IF NOT EXISTS "tags" (
    "tag" text PRIMARY KEY,
    "type" text,
    "image" text,
    "description" text,
    "website" text,
    "pixiv" text,
    "twitter" text,
    "fandom" text,
    "pixivTags" text[]
);

CREATE TABLE IF NOT EXISTS "unverified tags" (
    "tag" text PRIMARY KEY,
    "type" text,
    "image" text,
    "description" text,
    "website" text,
    "pixiv" text,
    "twitter" text,
    "fandom" text,
    "pixivTags" text[]
);

CREATE TABLE IF NOT EXISTS "threads" (
    "threadID" bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    "creator" text REFERENCES "users" ("username") ON UPDATE CASCADE ON DELETE SET NULL,
    "createDate" timestamptz,
    "updater" text REFERENCES "users" ("username") ON UPDATE CASCADE ON DELETE SET NULL,
    "updatedDate" timestamptz,
    "sticky" boolean,
    "locked" boolean,
    "title" text,
    "content" text
);

CREATE TABLE IF NOT EXISTS "replies" (
    "replyID" bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    "threadID" bigint REFERENCES "threads" ("threadID") ON UPDATE CASCADE ON DELETE CASCADE,
    "creator" text REFERENCES "users" ("username") ON UPDATE CASCADE ON DELETE SET NULL,
    "createDate" timestamptz,
    "updatedDate" timestamptz,
    "content" text
);

CREATE TABLE IF NOT EXISTS "tag map" (
    "tagID" bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    "postID" bigint REFERENCES "posts" ON DELETE CASCADE,
    "tag" text REFERENCES "tags" ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "unverified tag map" (
    "tagID" bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    "postID" bigint REFERENCES "unverified posts" ON DELETE CASCADE,
    "tag" text REFERENCES "unverified tags" ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "aliases" (
    "aliasID" bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    "tag" text REFERENCES "tags" ON UPDATE CASCADE ON DELETE CASCADE,
    "alias" text
);

CREATE TABLE IF NOT EXISTS "unverified aliases" (
    "aliasID" bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    "tag" text REFERENCES "unverified tags" ON UPDATE CASCADE ON DELETE CASCADE,
    "alias" text
);

CREATE TABLE IF NOT EXISTS "implications" (
    "implicationID" bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    "tag" text REFERENCES "tags" ON UPDATE CASCADE ON DELETE CASCADE,
    "implication" text REFERENCES "tags" ("tag") ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "third party" (
    "thirdPartyID" bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    "postID" bigint REFERENCES "posts" ON DELETE CASCADE,
    "parentID" bigint REFERENCES "posts" ("postID") ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS "unverified third party" (
    "thirdPartyID" bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    "postID" bigint REFERENCES "unverified posts" ON DELETE CASCADE,
    "parentID" bigint REFERENCES "posts" ("postID") ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS "session" (
  "sessionID" varchar NOT NULL COLLATE "default" PRIMARY KEY NOT DEFERRABLE INITIALLY IMMEDIATE,
  "session" json NOT NULL,
  "expires" timestamp(6) NOT NULL
) WITH (OIDS=FALSE);

CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "session" ("expires");

CREATE TABLE IF NOT EXISTS "email tokens" (
    "email" text PRIMARY KEY,
    "token" text,
    "expires" timestamptz
);

CREATE TABLE IF NOT EXISTS "2fa tokens" (
    "username" text PRIMARY KEY REFERENCES "users" ON UPDATE CASCADE ON DELETE CASCADE,
    "token" text,
    "qrcode" text
);

CREATE TABLE IF NOT EXISTS "password tokens" (
    "username" text PRIMARY KEY REFERENCES "users" ON UPDATE CASCADE ON DELETE CASCADE,
    "token" text,
    "expires" timestamptz
);

CREATE TABLE IF NOT EXISTS "comments" (
    "commentID" bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    "postID" bigint REFERENCES "posts" ON DELETE CASCADE,
    "username" text REFERENCES "users" ON UPDATE CASCADE ON DELETE CASCADE,
    "comment" text,
    "postDate" timestamptz,
    "editedDate" timestamptz
);

CREATE TABLE IF NOT EXISTS "translations" (
    "translationID" bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    "postID" bigint REFERENCES "posts" ON DELETE CASCADE,
    "updater" text REFERENCES "users" ("username") ON UPDATE CASCADE ON DELETE SET NULL,
    "updatedDate" timestamptz,
    "order" int,
    "data" jsonb
);

CREATE TABLE IF NOT EXISTS "unverified translations" (
    "translationID" bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    "postID" bigint REFERENCES "posts" ON DELETE CASCADE,
    "updater" text REFERENCES "users" ("username") ON UPDATE CASCADE ON DELETE SET NULL,
    "updatedDate" timestamptz,
    "order" int,
    "data" jsonb,
    "reason" text
);

CREATE TABLE IF NOT EXISTS "favorites" (
    "favoriteID" bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    "postID" bigint REFERENCES "posts" ON DELETE CASCADE,
    "username" text REFERENCES "users" ON UPDATE CASCADE ON DELETE CASCADE,
    "favoriteDate" timestamptz
);

CREATE TABLE IF NOT EXISTS "cuteness" (
    "cutenessID" bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    "postID" bigint REFERENCES "posts" ON DELETE CASCADE,
    "username" text REFERENCES "users" ON UPDATE CASCADE ON DELETE CASCADE,
    "cuteness" int,
    "cutenessDate" timestamptz
);

CREATE TABLE IF NOT EXISTS "delete requests" (
    "deleteRequestID" bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    "username" text REFERENCES "users" ON UPDATE CASCADE ON DELETE CASCADE,
    "postID" bigint REFERENCES "posts" ON DELETE CASCADE,
    "tag" text REFERENCES "tags" ON UPDATE CASCADE ON DELETE CASCADE,
    "reason" text
);

CREATE TABLE IF NOT EXISTS "alias requests" (
    "aliasRequestID" bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    "username" text REFERENCES "users" ON UPDATE CASCADE ON DELETE CASCADE,
    "tag" text REFERENCES "tags" ON UPDATE CASCADE ON DELETE CASCADE,
    "aliasTo" text REFERENCES "tags" ("tag") ON UPDATE CASCADE ON DELETE CASCADE,
    "reason" text
);

CREATE TABLE IF NOT EXISTS "tag edit requests" (
    "tagEditRequestID" bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    "username" text REFERENCES "users" ON UPDATE CASCADE ON DELETE CASCADE,
    "tag" text REFERENCES "tags" ON UPDATE CASCADE ON DELETE CASCADE,
    "key" text,
    "description" text,
    "image" text,
    "aliases" text[],
    "implications" text[],
    "website" text,
    "pixiv" text,
    "twitter" text,
    "fandom" text,
    "pixivTags" text[],
    "reason" text
);

CREATE TABLE IF NOT EXISTS "reported comments" (
    "reportID" bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    "type" text,
    "reporter" text REFERENCES "users" ("username") ON UPDATE CASCADE ON DELETE CASCADE,
    "reportDate" timestamptz,
    "commentID" bigint REFERENCES "comments" ON DELETE CASCADE,
    "reason" text
);

CREATE TABLE IF NOT EXISTS "reported threads" (
    "reportID" bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    "type" text,
    "reporter" text REFERENCES "users" ("username") ON UPDATE CASCADE ON DELETE CASCADE,
    "reportDate" timestamptz,
    "threadID" bigint REFERENCES "threads" ON DELETE CASCADE,
    "reason" text
);

CREATE TABLE IF NOT EXISTS "reported replies" (
    "reportID" bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    "type" text,
    "reporter" text REFERENCES "users" ("username") ON UPDATE CASCADE ON DELETE CASCADE,
    "reportDate" timestamptz,
    "replyID" bigint REFERENCES "replies" ON DELETE CASCADE,
    "reason" text
);

CREATE TABLE IF NOT EXISTS "translation history" (
    "historyID" bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    "postID" bigint REFERENCES "posts" ON DELETE CASCADE,
    "updater" text REFERENCES "users" ("username") ON UPDATE CASCADE ON DELETE SET NULL,
    "updatedDate" timestamptz,
    "order" int,
    "data" jsonb,
    "reason" text
);

CREATE TABLE IF NOT EXISTS "tag history" (
    "historyID" bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    "tag" text REFERENCES "tags" ON UPDATE CASCADE ON DELETE CASCADE,
    "user" text REFERENCES "users" ("username") ON UPDATE CASCADE ON DELETE SET NULL,
    "date" timestamptz,
    "key" text,
    "type" text,
    "image" text,
    "description" text,
    "aliases" text[],
    "implications" text[],
    "website" text,
    "pixiv" text,
    "twitter" text,
    "fandom" text,
    "pixivTags" text[],
    "reason" text
);

CREATE TABLE IF NOT EXISTS "post history" (
    "historyID" bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    "postID" bigint REFERENCES "posts" ON UPDATE CASCADE ON DELETE CASCADE,
    "user" text REFERENCES "users" ("username") ON UPDATE CASCADE ON DELETE SET NULL,
    "date" timestamptz,
    "images" text[],
    "uploader" text REFERENCES "users" ("username") ON UPDATE CASCADE ON DELETE SET NULL,
    "updater" text REFERENCES "users" ("username") ON UPDATE CASCADE ON DELETE SET NULL,
    "type" text,
    "restrict" text,
    "style" text,
    "thirdParty" boolean,
    "drawn" date,
    "uploadDate" timestamptz,
    "updatedDate" timestamptz,
    "title" text,
    "translatedTitle" text,
    "artist" text,
    "link" text,
    "commentary" text,
    "translatedCommentary" text,
    "bookmarks" int,
    "mirrors" jsonb,
    "artists" text[],
    "characters" text[],
    "series" text[],
    "tags" text[],
    "reason" text
);

CREATE TABLE IF NOT EXISTS "bans" (
    "banID" bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    "username" text REFERENCES "users" ("username") ON UPDATE CASCADE ON DELETE CASCADE,
    "banner" text REFERENCES "users" ("username") ON UPDATE CASCADE ON DELETE SET NULL,
    "banDate" timestamptz,
    "reason" text
);

CREATE INDEX IF NOT EXISTS "posts_index"
    ON "posts" USING btree
    ("postID" DESC NULLS LAST);

CREATE INDEX IF NOT EXISTS "images_index"
    ON "images" USING btree
    ("imageID" DESC NULLS LAST);

CREATE INDEX IF NOT EXISTS "cuteness_index"
    ON "cuteness" USING btree
    ("cutenessID" DESC NULLS LAST);

CREATE INDEX IF NOT EXISTS "favorites_index"
    ON "favorites" USING btree
    ("favoriteID" DESC NULLS LAST);

CREATE INDEX IF NOT EXISTS "comments_index"
    ON "comments" USING btree
    ("commentID" DESC NULLS LAST);

CREATE INDEX IF NOT EXISTS "translations_index"
    ON "translations" USING btree
    ("translationID" DESC NULLS LAST);

CREATE INDEX IF NOT EXISTS "tag_map_index"
    ON "tag map" USING btree
    ("tagID" ASC NULLS LAST);

CREATE INDEX IF NOT EXISTS "tags_index"
    ON "tags" USING btree
    (tag ASC NULLS LAST);

CREATE INDEX IF NOT EXISTS "aliases_index"
    ON "aliases" USING btree
    ("aliasID" ASC NULLS LAST);

CREATE INDEX IF NOT EXISTS "implications_index"
    ON "implications" USING btree
    ("implicationID" ASC NULLS LAST);

CREATE INDEX IF NOT EXISTS "users_index"
    ON "users" USING btree
    (username ASC NULLS LAST);

CREATE INDEX IF NOT EXISTS "threads_index"
    ON "threads" USING btree
    ("threadID" DESC NULLS LAST);

CREATE INDEX IF NOT EXISTS "replies_index"
    ON "replies" USING btree
    ("replyID" DESC NULLS LAST);

CREATE INDEX IF NOT EXISTS "post_history_index"
    ON "post history" USING btree
    ("historyID" DESC NULLS LAST);

CREATE INDEX IF NOT EXISTS "tag_history_index"
    ON "tag history" USING btree
    ("historyID" DESC NULLS LAST);

CREATE INDEX IF NOT EXISTS "translation_history_index"
    ON "translation history" USING btree
    ("historyID" DESC NULLS LAST);

CREATE INDEX IF NOT EXISTS "unverified_images_index"
    ON "unverified images" USING btree
    ("imageID" DESC NULLS LAST);

CREATE INDEX IF NOT EXISTS "unverified_posts_index"
    ON "unverified posts" USING btree
    ("postID" DESC NULLS LAST);

CREATE INDEX IF NOT EXISTS "unverified_tag_map_index"
    ON "unverified tag map" USING btree
    ("tagID" ASC NULLS LAST);

CREATE INDEX IF NOT EXISTS "unverified_tags_index"
    ON "unverified tags" USING btree
    (tag ASC NULLS LAST);

CREATE INDEX IF NOT EXISTS "unverified_aliases_index"
    ON "unverified aliases" USING btree
    ("aliasID" ASC NULLS LAST);

CREATE INDEX IF NOT EXISTS "unverified_translations_index"
    ON "unverified translations" USING btree
    ("translationID" ASC NULLS LAST);