-- CreateTable
CREATE TABLE "public"."AssessmentTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "questions" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AssessmentTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AssessmentTemplate_name_key" ON "public"."AssessmentTemplate"("name");
