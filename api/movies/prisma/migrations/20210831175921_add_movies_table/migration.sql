-- CreateTable
CREATE TABLE "movies" (
    "id" SERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "synopsis" TEXT,
    "duration" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "poster_id" INTEGER,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attachments" (
    "id" SERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "key" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "ext" TEXT NOT NULL,
    "content_type" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "movies.uuid_unique" ON "movies"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "movies_poster_id_unique" ON "movies"("poster_id");

-- CreateIndex
CREATE UNIQUE INDEX "attachments.uuid_unique" ON "attachments"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "attachments.key_unique" ON "attachments"("key");

-- AddForeignKey
ALTER TABLE "movies" ADD FOREIGN KEY ("poster_id") REFERENCES "attachments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
