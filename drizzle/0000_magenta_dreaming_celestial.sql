CREATE TYPE "public"."lead_source" AS ENUM('facebook', 'manual');--> statement-breakpoint
CREATE TYPE "public"."lead_status" AS ENUM('NEW', 'CLAIMED', 'CONSULTING', 'QUOTED', 'DEPOSITED', 'AWAITING_SURVEY', 'SURVEYED', 'DESIGNING', 'AWAITING_APPROVAL', 'COMPLETED');--> statement-breakpoint
CREATE TYPE "public"."quote_status" AS ENUM('draft', 'sent', 'accepted');--> statement-breakpoint
CREATE TABLE "deposit" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lead_id" uuid NOT NULL,
	"amount" numeric(14, 2) NOT NULL,
	"paid_at" timestamp with time zone NOT NULL,
	"method" text,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "design_task" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lead_id" uuid NOT NULL,
	"designer_id" text,
	"revision_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "design_version" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"design_task_id" uuid NOT NULL,
	"file_url" text NOT NULL,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lead" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"phone" text NOT NULL,
	"email" text,
	"note" text,
	"source" "lead_source" DEFAULT 'manual' NOT NULL,
	"fb_leadgen_id" text,
	"form_id" text,
	"ad_id" text,
	"status" "lead_status" DEFAULT 'NEW' NOT NULL,
	"assigned_sales_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "lead_fb_leadgen_id_unique" UNIQUE("fb_leadgen_id")
);
--> statement-breakpoint
CREATE TABLE "lead_status_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lead_id" uuid NOT NULL,
	"from_status" "lead_status",
	"to_status" "lead_status" NOT NULL,
	"user_id" text,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quote" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lead_id" uuid NOT NULL,
	"total" numeric(14, 2) DEFAULT '0' NOT NULL,
	"note" text,
	"status" "quote_status" DEFAULT 'draft' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quote_item" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"quote_id" uuid NOT NULL,
	"name" text NOT NULL,
	"quantity" numeric(12, 2) DEFAULT '1' NOT NULL,
	"unit_price" numeric(14, 2) DEFAULT '0' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "survey_appointment" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lead_id" uuid NOT NULL,
	"scheduled_at" timestamp with time zone NOT NULL,
	"address" text NOT NULL,
	"technician_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "survey_result" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lead_id" uuid NOT NULL,
	"appointment_id" uuid,
	"measurements" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"photo_urls" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	"impersonated_by" text,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean NOT NULL,
	"image" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"role" text,
	"banned" boolean,
	"ban_reason" text,
	"ban_expires" timestamp,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp,
	"updated_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "deposit" ADD CONSTRAINT "deposit_lead_id_lead_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."lead"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "design_task" ADD CONSTRAINT "design_task_lead_id_lead_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."lead"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "design_task" ADD CONSTRAINT "design_task_designer_id_user_id_fk" FOREIGN KEY ("designer_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "design_version" ADD CONSTRAINT "design_version_design_task_id_design_task_id_fk" FOREIGN KEY ("design_task_id") REFERENCES "public"."design_task"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lead" ADD CONSTRAINT "lead_assigned_sales_id_user_id_fk" FOREIGN KEY ("assigned_sales_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lead_status_history" ADD CONSTRAINT "lead_status_history_lead_id_lead_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."lead"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lead_status_history" ADD CONSTRAINT "lead_status_history_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quote" ADD CONSTRAINT "quote_lead_id_lead_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."lead"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quote_item" ADD CONSTRAINT "quote_item_quote_id_quote_id_fk" FOREIGN KEY ("quote_id") REFERENCES "public"."quote"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "survey_appointment" ADD CONSTRAINT "survey_appointment_lead_id_lead_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."lead"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "survey_appointment" ADD CONSTRAINT "survey_appointment_technician_id_user_id_fk" FOREIGN KEY ("technician_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "survey_result" ADD CONSTRAINT "survey_result_lead_id_lead_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."lead"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "survey_result" ADD CONSTRAINT "survey_result_appointment_id_survey_appointment_id_fk" FOREIGN KEY ("appointment_id") REFERENCES "public"."survey_appointment"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "survey_result" ADD CONSTRAINT "survey_result_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;