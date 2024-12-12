-- 初始化SQLite数据库
-- 初始化users
CREATE TABLE IF NOT EXISTS "users" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
-- 初始化messages
CREATE TABLE IF NOT EXISTS "messages" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" INTEGER NOT NULL,
    FOREIGN KEY ("user_id") REFERENCES "users" ("id")
);

-- 常用命令
-- 插入一条user
-- INSERT INTO "users" ("name") VALUES ("user1");

-- 查询所有表
-- SELECT name FROM sqlite_master WHERE type='table';

-- 

