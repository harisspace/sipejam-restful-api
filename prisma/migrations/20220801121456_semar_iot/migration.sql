/*
  Warnings:

  - A unique constraint covering the columns `[iot_token]` on the table `systems` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `payload` to the `notifications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `iot_token` to the `systems` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "notifications" DROP CONSTRAINT "notifications_from_uid_fkey";

-- DropForeignKey
ALTER TABLE "notifications" DROP CONSTRAINT "notifications_to_uid_fkey";

-- DropForeignKey
ALTER TABLE "systems" DROP CONSTRAINT "systems_system_maker_fkey";

-- DropForeignKey
ALTER TABLE "usersystemlinks" DROP CONSTRAINT "usersystemlinks_user_uid_fkey";

-- AlterTable
ALTER TABLE "notifications" ADD COLUMN     "payload" UUID NOT NULL;

-- AlterTable
ALTER TABLE "systems" ADD COLUMN     "iot_token" VARCHAR(300) NOT NULL;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "oauth" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "image_uri" SET DEFAULT E'user.jpg';

-- AlterTable
ALTER TABLE "usersystemlinks" ALTER COLUMN "system_role" SET DEFAULT E'admin';

-- CreateTable
CREATE TABLE "speeds1" (
    "id" SERIAL NOT NULL,
    "speeds1_uid" UUID NOT NULL,
    "iot_token" VARCHAR(300) NOT NULL,
    "speed" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "speeds2" (
    "id" SERIAL NOT NULL,
    "speeds2_uid" UUID NOT NULL,
    "iot_token" VARCHAR(300) NOT NULL,
    "speed" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicles1" (
    "id" SERIAL NOT NULL,
    "vehicles1_uid" UUID NOT NULL,
    "iot_token" VARCHAR(300) NOT NULL,
    "vehicle" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicles2" (
    "id" SERIAL NOT NULL,
    "vehicles2_uid" UUID NOT NULL,
    "iot_token" VARCHAR(300) NOT NULL,
    "vehicle" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "smallvehicles1" (
    "id" SERIAL NOT NULL,
    "smallvehicles1_uid" UUID NOT NULL,
    "iot_token" VARCHAR(300) NOT NULL,
    "small_vehicle" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "smallvehicles2" (
    "id" SERIAL NOT NULL,
    "smallvehicles2_uid" UUID NOT NULL,
    "iot_token" VARCHAR(300) NOT NULL,
    "small_vehicle" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "speeds1.speeds1_uid_unique" ON "speeds1"("speeds1_uid");

-- CreateIndex
CREATE UNIQUE INDEX "speeds2.speeds2_uid_unique" ON "speeds2"("speeds2_uid");

-- CreateIndex
CREATE UNIQUE INDEX "vehicles1.vehicles1_uid_unique" ON "vehicles1"("vehicles1_uid");

-- CreateIndex
CREATE UNIQUE INDEX "vehicles2.vehicles2_uid_unique" ON "vehicles2"("vehicles2_uid");

-- CreateIndex
CREATE UNIQUE INDEX "smallvehicles1.smallvehicles1_uid_unique" ON "smallvehicles1"("smallvehicles1_uid");

-- CreateIndex
CREATE UNIQUE INDEX "smallvehicles2.smallvehicles2_uid_unique" ON "smallvehicles2"("smallvehicles2_uid");

-- CreateIndex
CREATE UNIQUE INDEX "systems.iot_token_unique" ON "systems"("iot_token");

-- AddForeignKey
ALTER TABLE "notifications" ADD FOREIGN KEY ("from_uid") REFERENCES "users"("user_uid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD FOREIGN KEY ("to_uid") REFERENCES "users"("user_uid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "systems" ADD FOREIGN KEY ("system_maker") REFERENCES "users"("user_uid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usersystemlinks" ADD FOREIGN KEY ("user_uid") REFERENCES "users"("user_uid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "speeds1" ADD FOREIGN KEY ("iot_token") REFERENCES "systems"("iot_token") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "speeds2" ADD FOREIGN KEY ("iot_token") REFERENCES "systems"("iot_token") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "vehicles1" ADD FOREIGN KEY ("iot_token") REFERENCES "systems"("iot_token") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "vehicles2" ADD FOREIGN KEY ("iot_token") REFERENCES "systems"("iot_token") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "smallvehicles1" ADD FOREIGN KEY ("iot_token") REFERENCES "systems"("iot_token") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "smallvehicles2" ADD FOREIGN KEY ("iot_token") REFERENCES "systems"("iot_token") ON DELETE CASCADE ON UPDATE NO ACTION;
