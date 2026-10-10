CREATE TYPE "public"."note_status" AS ENUM('draft', 'published', 'archived');--> statement-breakpoint
CREATE TABLE "notes" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(100) NOT NULL,
	"content" text DEFAULT '' NOT NULL,
	"status" "note_status" DEFAULT 'draft' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
