import { pgTable, text, serial, integer, boolean, timestamp, jsonb, date, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";
// Import auth models to extend/reference
import { users } from "./models/auth";

// === ENUMS ===
export const roleEnum = ["admin", "staff", "guest", "client"] as const;
export const taskStatusEnum = ["todo", "in_progress", "done"] as const;
export const priorityEnum = ["low", "medium", "high"] as const;

// === TABLE DEFINITIONS ===

// Extend users table with app-specific fields
// Note: We're not modifying the auth table definition directly, just conceptualizing the relationship
// In a real app, we might add a separate profile table linked to auth.users, 
// but for simplicity in this prototype, we'll assume we can store app-specific user data 
// in a separate table linked by user_id if needed, or just use the auth user id.
// Let's create a 'profiles' table to extend user info with roles and business association.

export const profiles = pgTable("profiles", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  businessId: integer("business_id"), // Will reference businesses table
  role: text("role", { enum: roleEnum }).default("staff").notNull(),
  // Add other profile fields as needed
});

export const businesses = pgTable("businesses", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  logoUrl: text("logo_url"),
  industry: text("industry"),
  phone: text("phone"),
  email: text("email"),
  currency: text("currency").default("USD"),
  timezone: text("timezone").default("UTC"),
  subscriptionStatus: text("subscription_status").default("active"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").notNull().references(() => businesses.id),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  notes: text("notes"),
  tags: text("tags").array(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").notNull().references(() => businesses.id),
  title: text("title").notNull(),
  description: text("description"),
  status: text("status", { enum: taskStatusEnum }).default("todo").notNull(),
  priority: text("priority", { enum: priorityEnum }).default("medium").notNull(),
  assigneeId: varchar("assignee_id").references(() => users.id), // Link to auth user
  dueDate: timestamp("due_date"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const forms = pgTable("forms", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").notNull().references(() => businesses.id),
  title: text("title").notNull(),
  description: text("description"),
  schema: jsonb("schema").notNull(), // Definition of columns/fields
  createdAt: timestamp("created_at").defaultNow(),
});

export const formSubmissions = pgTable("form_submissions", {
  id: serial("id").primaryKey(),
  formId: integer("form_id").notNull().references(() => forms.id),
  data: jsonb("data").notNull(), // The actual row data
  submittedBy: varchar("submitted_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Reminders table for task-linked and standalone reminders
export const reminderTypeEnum = ["task", "customer", "payment", "custom"] as const;
export const reminderStatusEnum = ["pending", "sent", "snoozed", "dismissed", "completed"] as const;

export const reminders = pgTable("reminders", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").notNull().references(() => businesses.id),
  taskId: integer("task_id").references(() => tasks.id),
  customerId: integer("customer_id").references(() => customers.id),
  title: text("title").notNull(),
  description: text("description"),
  type: text("type", { enum: reminderTypeEnum }).default("custom").notNull(),
  status: text("status", { enum: reminderStatusEnum }).default("pending").notNull(),
  dueAt: timestamp("due_at").notNull(),
  isRecurring: boolean("is_recurring").default(false),
  recurringPattern: text("recurring_pattern"), // 'daily', 'weekly', 'monthly'
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Notifications table for in-app notifications
export const notificationTypeEnum = ["reminder", "task_update", "customer_added", "system"] as const;

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  businessId: integer("business_id").references(() => businesses.id),
  type: text("type", { enum: notificationTypeEnum }).default("system").notNull(),
  title: text("title").notNull(),
  message: text("message"),
  isRead: boolean("is_read").default(false),
  linkUrl: text("link_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

// === RELATIONS ===

export const profilesRelations = relations(profiles, ({ one }) => ({
  user: one(users, {
    fields: [profiles.userId],
    references: [users.id],
  }),
  business: one(businesses, {
    fields: [profiles.businessId],
    references: [businesses.id],
  }),
}));

export const businessesRelations = relations(businesses, ({ many }) => ({
  profiles: many(profiles),
  customers: many(customers),
  tasks: many(tasks),
  forms: many(forms),
}));

export const customersRelations = relations(customers, ({ one }) => ({
  business: one(businesses, {
    fields: [customers.businessId],
    references: [businesses.id],
  }),
}));

export const tasksRelations = relations(tasks, ({ one }) => ({
  business: one(businesses, {
    fields: [tasks.businessId],
    references: [businesses.id],
  }),
  assignee: one(users, {
    fields: [tasks.assigneeId],
    references: [users.id],
  }),
}));

export const formsRelations = relations(forms, ({ one, many }) => ({
  business: one(businesses, {
    fields: [forms.businessId],
    references: [businesses.id],
  }),
  submissions: many(formSubmissions),
}));

export const formSubmissionsRelations = relations(formSubmissions, ({ one }) => ({
  form: one(forms, {
    fields: [formSubmissions.formId],
    references: [forms.id],
  }),
  user: one(users, {
    fields: [formSubmissions.submittedBy],
    references: [users.id],
  }),
}));

export const remindersRelations = relations(reminders, ({ one }) => ({
  business: one(businesses, {
    fields: [reminders.businessId],
    references: [businesses.id],
  }),
  task: one(tasks, {
    fields: [reminders.taskId],
    references: [tasks.id],
  }),
  customer: one(customers, {
    fields: [reminders.customerId],
    references: [customers.id],
  }),
  createdByUser: one(users, {
    fields: [reminders.createdBy],
    references: [users.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
  business: one(businesses, {
    fields: [notifications.businessId],
    references: [businesses.id],
  }),
}));


// === ZOD SCHEMAS ===

export const insertBusinessSchema = createInsertSchema(businesses).omit({ id: true, createdAt: true });
export const insertCustomerSchema = createInsertSchema(customers).omit({ id: true, createdAt: true });
export const insertTaskSchema = createInsertSchema(tasks).omit({ id: true, createdAt: true });
export const insertFormSchema = createInsertSchema(forms).omit({ id: true, createdAt: true });
export const insertFormSubmissionSchema = createInsertSchema(formSubmissions).omit({ id: true, createdAt: true });
export const insertProfileSchema = createInsertSchema(profiles).omit({ id: true });
export const insertReminderSchema = createInsertSchema(reminders).omit({ id: true, createdAt: true });
export const insertNotificationSchema = createInsertSchema(notifications).omit({ id: true, createdAt: true });

// Client-friendly schemas (businessId handled by server)
export const createCustomerSchema = insertCustomerSchema.omit({ businessId: true });
export const createTaskSchema = insertTaskSchema.omit({ businessId: true });
export const createFormSchema = insertFormSchema.omit({ businessId: true, schema: true }).extend({
  schema: z.any().optional()
});
export const createReminderSchema = insertReminderSchema.omit({ businessId: true, createdBy: true });
export const createNotificationSchema = insertNotificationSchema.omit({ businessId: true });
export const updateBusinessSchema = insertBusinessSchema.partial();

// === TYPES ===

export type Business = typeof businesses.$inferSelect;
export type InsertBusiness = z.infer<typeof insertBusinessSchema>;
export type CreateCustomer = z.infer<typeof createCustomerSchema>;
export type CreateTask = z.infer<typeof createTaskSchema>;
export type CreateForm = z.infer<typeof createFormSchema>;

export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;

export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;

export type Form = typeof forms.$inferSelect;
export type InsertForm = z.infer<typeof insertFormSchema>;

export type FormSubmission = typeof formSubmissions.$inferSelect;
export type InsertFormSubmission = z.infer<typeof insertFormSubmissionSchema>;

export type Profile = typeof profiles.$inferSelect;
export type InsertProfile = z.infer<typeof insertProfileSchema>;

export type Reminder = typeof reminders.$inferSelect;
export type InsertReminder = z.infer<typeof insertReminderSchema>;
export type CreateReminder = z.infer<typeof createReminderSchema>;

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type CreateNotification = z.infer<typeof createNotificationSchema>;

// Export Auth models too for convenience
export * from "./models/auth";
