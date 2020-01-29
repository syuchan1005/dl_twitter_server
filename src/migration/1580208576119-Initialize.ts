import {MigrationInterface, QueryRunner} from "typeorm";

export class Initialize1580208576119 implements MigrationInterface {
    name = 'Initialize1580208576119'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`CREATE TABLE "user" ("id" integer PRIMARY KEY NOT NULL, "name" varchar(50) NOT NULL, "screenName" varchar(15) NOT NULL, "raw" varchar NOT NULL)`, undefined);
        await queryRunner.query(`CREATE TABLE "status" ("id" integer PRIMARY KEY NOT NULL, "text" varchar NOT NULL, "createdAt" datetime NOT NULL, "raw" varchar NOT NULL, "deletedAt" datetime, "userId" integer)`, undefined);
        await queryRunner.query(`CREATE TABLE "media" ("id" integer PRIMARY KEY NOT NULL, "type" varchar(7) NOT NULL, "url" varchar NOT NULL, "ext" varchar NOT NULL, "raw" varchar NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "statusId" integer)`, undefined);
        await queryRunner.query(`CREATE TABLE "temporary_status" ("id" integer PRIMARY KEY NOT NULL, "text" varchar NOT NULL, "createdAt" datetime NOT NULL, "raw" varchar NOT NULL, "deletedAt" datetime, "userId" integer, CONSTRAINT "FK_94cb5dda3cf592da917ec3a2746" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`, undefined);
        await queryRunner.query(`INSERT INTO "temporary_status"("id", "text", "createdAt", "raw", "deletedAt", "userId") SELECT "id", "text", "createdAt", "raw", "deletedAt", "userId" FROM "status"`, undefined);
        await queryRunner.query(`DROP TABLE "status"`, undefined);
        await queryRunner.query(`ALTER TABLE "temporary_status" RENAME TO "status"`, undefined);
        await queryRunner.query(`CREATE TABLE "temporary_media" ("id" integer PRIMARY KEY NOT NULL, "type" varchar(7) NOT NULL, "url" varchar NOT NULL, "ext" varchar NOT NULL, "raw" varchar NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "statusId" integer, CONSTRAINT "FK_afd5d23e509890c5454a5dee811" FOREIGN KEY ("statusId") REFERENCES "status" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`, undefined);
        await queryRunner.query(`INSERT INTO "temporary_media"("id", "type", "url", "ext", "raw", "createdAt", "statusId") SELECT "id", "type", "url", "ext", "raw", "createdAt", "statusId" FROM "media"`, undefined);
        await queryRunner.query(`DROP TABLE "media"`, undefined);
        await queryRunner.query(`ALTER TABLE "temporary_media" RENAME TO "media"`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "media" RENAME TO "temporary_media"`, undefined);
        await queryRunner.query(`CREATE TABLE "media" ("id" integer PRIMARY KEY NOT NULL, "type" varchar(7) NOT NULL, "url" varchar NOT NULL, "ext" varchar NOT NULL, "raw" varchar NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "statusId" integer)`, undefined);
        await queryRunner.query(`INSERT INTO "media"("id", "type", "url", "ext", "raw", "createdAt", "statusId") SELECT "id", "type", "url", "ext", "raw", "createdAt", "statusId" FROM "temporary_media"`, undefined);
        await queryRunner.query(`DROP TABLE "temporary_media"`, undefined);
        await queryRunner.query(`ALTER TABLE "status" RENAME TO "temporary_status"`, undefined);
        await queryRunner.query(`CREATE TABLE "status" ("id" integer PRIMARY KEY NOT NULL, "text" varchar NOT NULL, "createdAt" datetime NOT NULL, "raw" varchar NOT NULL, "deletedAt" datetime, "userId" integer)`, undefined);
        await queryRunner.query(`INSERT INTO "status"("id", "text", "createdAt", "raw", "deletedAt", "userId") SELECT "id", "text", "createdAt", "raw", "deletedAt", "userId" FROM "temporary_status"`, undefined);
        await queryRunner.query(`DROP TABLE "temporary_status"`, undefined);
        await queryRunner.query(`DROP TABLE "media"`, undefined);
        await queryRunner.query(`DROP TABLE "status"`, undefined);
        await queryRunner.query(`DROP TABLE "user"`, undefined);
    }

}
