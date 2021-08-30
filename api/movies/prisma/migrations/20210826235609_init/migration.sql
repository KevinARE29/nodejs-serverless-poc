-- CreateTable
CREATE TABLE "Movies" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sinopsis" TEXT,
    "duration" DOUBLE PRECISION NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Movies.uuid_unique" ON "Movies"("uuid");
