-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "vector";

-- CreateTable
CREATE TABLE "document_embeddings" (
    "id" TEXT NOT NULL,
    "vector" vector(1536),
    "content" TEXT NOT NULL,
    "documentName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "document_embeddings_pkey" PRIMARY KEY ("id")
);
