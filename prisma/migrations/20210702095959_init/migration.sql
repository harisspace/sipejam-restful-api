-- CreateEnum
CREATE TYPE "role" AS ENUM ('user', 'admin', 'superadmin');

-- CreateEnum
CREATE TYPE "status" AS ENUM ('on', 'off');

-- CreateTable
CREATE TABLE "notifications" (
    "id" SERIAL NOT NULL,
    "notification_uid" UUID NOT NULL,
    "title" VARCHAR(100) NOT NULL,
    "message" VARCHAR(300) NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "to_uid" UUID NOT NULL,
    "from_uid" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "systems" (
    "id" SERIAL NOT NULL,
    "system_uid" UUID NOT NULL,
    "name" VARCHAR(250) NOT NULL,
    "placed" VARCHAR(300) NOT NULL,
    "system_maker" UUID NOT NULL,
    "image_uri" VARCHAR(300),
    "status" "status" NOT NULL,
    "aplication_id" VARCHAR(300),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "user_uid" UUID NOT NULL,
    "username" VARCHAR(250) NOT NULL,
    "email" VARCHAR(300) NOT NULL,
    "password" VARCHAR(300) NOT NULL,
    "user_role" "role" NOT NULL,
    "image_uri" VARCHAR(300),
    "confirmed" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usersystemlinks" (
    "id" SERIAL NOT NULL,
    "usersystemlinks_uid" UUID NOT NULL,
    "user_uid" UUID NOT NULL,
    "system_uid" UUID NOT NULL,
    "system_role" "role" NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "notifications.notification_uid_unique" ON "notifications"("notification_uid");

-- CreateIndex
CREATE UNIQUE INDEX "systems.system_uid_unique" ON "systems"("system_uid");

-- CreateIndex
CREATE UNIQUE INDEX "systems.name_unique" ON "systems"("name");

-- CreateIndex
CREATE UNIQUE INDEX "systems.aplication_id_unique" ON "systems"("aplication_id");

-- CreateIndex
CREATE UNIQUE INDEX "users.user_uid_unique" ON "users"("user_uid");

-- CreateIndex
CREATE UNIQUE INDEX "users.username_unique" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users.email_unique" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "usersystemlinks.usersystemlinks_uid_unique" ON "usersystemlinks"("usersystemlinks_uid");

-- AddForeignKey
ALTER TABLE "notifications" ADD FOREIGN KEY ("from_uid") REFERENCES "users"("user_uid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD FOREIGN KEY ("to_uid") REFERENCES "users"("user_uid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "systems" ADD FOREIGN KEY ("system_maker") REFERENCES "users"("user_uid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usersystemlinks" ADD FOREIGN KEY ("system_uid") REFERENCES "systems"("system_uid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usersystemlinks" ADD FOREIGN KEY ("user_uid") REFERENCES "users"("user_uid") ON DELETE CASCADE ON UPDATE CASCADE;
