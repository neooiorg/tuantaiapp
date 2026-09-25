import {
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { LEAD_SOURCES, LEAD_STATUS_ORDER, QUOTE_STATUSES } from "@/lib/lead-status";
import { user } from "./auth-schema";

// ---- Enums -----------------------------------------------------------------

export const leadStatusEnum = pgEnum("lead_status", LEAD_STATUS_ORDER);

export const leadSourceEnum = pgEnum("lead_source", LEAD_SOURCES);

export const quoteStatusEnum = pgEnum("quote_status", QUOTE_STATUSES);

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
};

// ---- Lead ------------------------------------------------------------------

export const lead = pgTable("lead", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  email: text("email"),
  note: text("note"),
  source: leadSourceEnum("source").notNull().default("manual"),
  fbLeadgenId: text("fb_leadgen_id").unique(),
  formId: text("form_id"),
  adId: text("ad_id"),
  status: leadStatusEnum("status").notNull().default("NEW"),
  assignedSalesId: text("assigned_sales_id").references(() => user.id),
  ...timestamps,
});

// ---- Quote -----------------------------------------------------------------

export const quote = pgTable("quote", {
  id: uuid("id").primaryKey().defaultRandom(),
  leadId: uuid("lead_id")
    .notNull()
    .references(() => lead.id, { onDelete: "cascade" }),
  total: numeric("total", { precision: 14, scale: 2 }).notNull().default("0"),
  note: text("note"),
  status: quoteStatusEnum("status").notNull().default("draft"),
  ...timestamps,
});

export const quoteItem = pgTable("quote_item", {
  id: uuid("id").primaryKey().defaultRandom(),
  quoteId: uuid("quote_id")
    .notNull()
    .references(() => quote.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  quantity: numeric("quantity", { precision: 12, scale: 2 }).notNull().default("1"),
  unitPrice: numeric("unit_price", { precision: 14, scale: 2 }).notNull().default("0"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// ---- Deposit ---------------------------------------------------------------

export const deposit = pgTable("deposit", {
  id: uuid("id").primaryKey().defaultRandom(),
  leadId: uuid("lead_id")
    .notNull()
    .references(() => lead.id, { onDelete: "cascade" }),
  amount: numeric("amount", { precision: 14, scale: 2 }).notNull(),
  paidAt: timestamp("paid_at", { withTimezone: true }).notNull(),
  method: text("method"),
  note: text("note"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// ---- Survey ----------------------------------------------------------------

export const surveyAppointment = pgTable("survey_appointment", {
  id: uuid("id").primaryKey().defaultRandom(),
  leadId: uuid("lead_id")
    .notNull()
    .references(() => lead.id, { onDelete: "cascade" }),
  scheduledAt: timestamp("scheduled_at", { withTimezone: true }).notNull(),
  address: text("address").notNull(),
  technicianId: text("technician_id").references(() => user.id),
  ...timestamps,
});

// measurements: array of { area, length, width, height, note }
export type SurveyMeasurement = {
  area: string;
  length?: number;
  width?: number;
  height?: number;
  note?: string;
};

export const surveyResult = pgTable("survey_result", {
  id: uuid("id").primaryKey().defaultRandom(),
  leadId: uuid("lead_id")
    .notNull()
    .references(() => lead.id, { onDelete: "cascade" }),
  appointmentId: uuid("appointment_id").references(() => surveyAppointment.id),
  measurements: jsonb("measurements").$type<SurveyMeasurement[]>().notNull().default([]),
  photoUrls: jsonb("photo_urls").$type<string[]>().notNull().default([]),
  createdBy: text("created_by").references(() => user.id),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// ---- Design ----------------------------------------------------------------

export const designTask = pgTable("design_task", {
  id: uuid("id").primaryKey().defaultRandom(),
  leadId: uuid("lead_id")
    .notNull()
    .references(() => lead.id, { onDelete: "cascade" }),
  designerId: text("designer_id").references(() => user.id),
  revisionCount: integer("revision_count").notNull().default(0),
  ...timestamps,
});

export const designVersion = pgTable("design_version", {
  id: uuid("id").primaryKey().defaultRandom(),
  designTaskId: uuid("design_task_id")
    .notNull()
    .references(() => designTask.id, { onDelete: "cascade" }),
  fileUrl: text("file_url").notNull(),
  note: text("note"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// ---- Lead status history ---------------------------------------------------

export const leadStatusHistory = pgTable("lead_status_history", {
  id: uuid("id").primaryKey().defaultRandom(),
  leadId: uuid("lead_id")
    .notNull()
    .references(() => lead.id, { onDelete: "cascade" }),
  fromStatus: leadStatusEnum("from_status"),
  toStatus: leadStatusEnum("to_status").notNull(),
  userId: text("user_id").references(() => user.id),
  note: text("note"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// ---- Notification ----------------------------------------------------------

export const notification = pgTable("notification", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  title: text("title").notNull(),
  body: text("body"),
  linkUrl: text("link_url"),
  readAt: timestamp("read_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// ---- Inferred types --------------------------------------------------------

export type LeadStatus = (typeof leadStatusEnum.enumValues)[number];
export type LeadSource = (typeof leadSourceEnum.enumValues)[number];
export type QuoteStatus = (typeof quoteStatusEnum.enumValues)[number];

export type Lead = typeof lead.$inferSelect;
export type NewLead = typeof lead.$inferInsert;
export type Quote = typeof quote.$inferSelect;
export type QuoteItem = typeof quoteItem.$inferSelect;
export type Deposit = typeof deposit.$inferSelect;
export type SurveyAppointment = typeof surveyAppointment.$inferSelect;
export type SurveyResult = typeof surveyResult.$inferSelect;
export type DesignTask = typeof designTask.$inferSelect;
export type DesignVersion = typeof designVersion.$inferSelect;
export type LeadStatusHistory = typeof leadStatusHistory.$inferSelect;
export type Notification = typeof notification.$inferSelect;
