-- CreateEnum
CREATE TYPE "public"."VendorStatus" AS ENUM ('Active', 'InReview', 'Terminated');

-- CreateEnum
CREATE TYPE "public"."AssetStatus" AS ENUM ('Proposed', 'InReview', 'Active', 'Retired');

-- CreateEnum
CREATE TYPE "public"."RiskLevel" AS ENUM ('Low', 'Medium', 'High', 'Severe');

-- CreateEnum
CREATE TYPE "public"."AssessmentStatus" AS ENUM ('NotStarted', 'InProgress', 'Completed', 'Archived');

-- CreateEnum
CREATE TYPE "public"."ActionType" AS ENUM ('ASSET_CREATED', 'ASSET_UPDATED', 'ASSESSMENT_STARTED', 'ASSESSMENT_UPDATED', 'ASSESSMENT_COMPLETED', 'VENDOR_CREATED', 'VENDOR_LINKED_TO_ASSET', 'AUTO_DISCOVERY_COMPLETED');

-- CreateTable
CREATE TABLE "public"."AIAsset" (
    "id" TEXT NOT NULL,
    "discoveredId" TEXT,
    "name" TEXT NOT NULL,
    "owner" TEXT NOT NULL,
    "businessPurpose" TEXT NOT NULL,
    "status" "public"."AssetStatus" NOT NULL DEFAULT 'Proposed',
    "riskClassification" "public"."RiskLevel" NOT NULL DEFAULT 'Low',
    "dateRegistered" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "vendorId" TEXT,

    CONSTRAINT "AIAsset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Vendor" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "website" TEXT NOT NULL,
    "status" "public"."VendorStatus" NOT NULL DEFAULT 'Active',

    CONSTRAINT "Vendor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Assessment" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" "public"."AssessmentStatus" NOT NULL DEFAULT 'NotStarted',
    "questions" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "assetId" TEXT NOT NULL,

    CONSTRAINT "Assessment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AuditLog" (
    "id" TEXT NOT NULL,
    "action" "public"."ActionType" NOT NULL,
    "details" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assetId" TEXT,
    "userId" TEXT,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "AIAsset_discoveredId_key" ON "public"."AIAsset"("discoveredId");

-- CreateIndex
CREATE UNIQUE INDEX "Vendor_name_key" ON "public"."Vendor"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "public"."Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "public"."Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "public"."VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "public"."VerificationToken"("identifier", "token");

-- AddForeignKey
ALTER TABLE "public"."AIAsset" ADD CONSTRAINT "AIAsset_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "public"."Vendor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Assessment" ADD CONSTRAINT "Assessment_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "public"."AIAsset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AuditLog" ADD CONSTRAINT "AuditLog_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "public"."AIAsset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
