import { db } from "./db";
import { eq, desc } from "drizzle-orm";
import {
  users, businesses, profiles, customers, tasks, forms, formSubmissions,
  type User, type UpsertUser,
  type Business, type InsertBusiness,
  type Profile, type InsertProfile,
  type Customer, type InsertCustomer,
  type Task, type InsertTask,
  type Form, type InsertForm,
  type FormSubmission, type InsertFormSubmission
} from "@shared/schema";
import { IAuthStorage } from "./replit_integrations/auth";

export interface IStorage extends IAuthStorage {
  // Business
  createBusiness(business: InsertBusiness): Promise<Business>;
  getBusiness(id: number): Promise<Business | undefined>;
  updateBusiness(id: number, updates: Partial<Business>): Promise<Business>;
  
  // Profiles
  createProfile(profile: InsertProfile): Promise<Profile>;
  getProfile(userId: string): Promise<Profile | undefined>;
  getProfilesByBusiness(businessId: number): Promise<Profile[]>;
  
  // Customers
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  getCustomers(businessId: number): Promise<Customer[]>;
  updateCustomer(id: number, updates: Partial<InsertCustomer>): Promise<Customer>;
  
  // Tasks
  createTask(task: InsertTask): Promise<Task>;
  getTasks(businessId: number): Promise<(Task & { assignee: User | null })[]>;
  updateTask(id: number, updates: Partial<InsertTask>): Promise<Task>;
  deleteTask(id: number): Promise<void>;
  getTask(id: number): Promise<Task | undefined>;

  // Forms
  createForm(form: InsertForm): Promise<Form>;
  getForms(businessId: number): Promise<Form[]>;
  getForm(id: number): Promise<Form | undefined>;
  updateForm(id: number, updates: Partial<InsertForm>): Promise<Form>;
  deleteForm(id: number): Promise<void>;
  
  // Submissions
  createSubmission(submission: InsertFormSubmission): Promise<FormSubmission>;
  getSubmissions(formId: number): Promise<(FormSubmission & { user: User | null })[]>;
}

export class DatabaseStorage implements IStorage {
  // Auth methods are handled by the separate AuthStorage implementation 
  // but we implement the interface methods here by delegating or reimplementing 
  // if we wanted a single storage class. 
  // For now, let's mix in the auth storage implementation or just implement the required methods.
  // Ideally, we'd inherit or compose. Let's implement directly using the auth table.
  
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(user: UpsertUser): Promise<User> {
    const [existing] = await db.select().from(users).where(eq(users.id, user.id as string));
    if (existing) {
        return existing;
    }
    // Simple insert for now as auth flow handles upsert logic mostly in its own module
    // But to satisfy interface:
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }

  // Business
  async createBusiness(business: InsertBusiness): Promise<Business> {
    const [newBusiness] = await db.insert(businesses).values(business).returning();
    return newBusiness;
  }

  async getBusiness(id: number): Promise<Business | undefined> {
    const [business] = await db.select().from(businesses).where(eq(businesses.id, id));
    return business;
  }

  async updateBusiness(id: number, updates: Partial<Business>): Promise<Business> {
    const [updated] = await db.update(businesses).set(updates).where(eq(businesses.id, id)).returning();
    return updated;
  }

  // Profiles
  async createProfile(profile: InsertProfile): Promise<Profile> {
    const [newProfile] = await db.insert(profiles).values(profile).returning();
    return newProfile;
  }

  async getProfile(userId: string): Promise<Profile | undefined> {
    const [profile] = await db.select().from(profiles).where(eq(profiles.userId, userId));
    return profile;
  }
  
  async getProfilesByBusiness(businessId: number): Promise<Profile[]> {
    return await db.select().from(profiles).where(eq(profiles.businessId, businessId));
  }

  // Customers
  async createCustomer(customer: InsertCustomer): Promise<Customer> {
    const [newCustomer] = await db.insert(customers).values(customer).returning();
    return newCustomer;
  }

  async getCustomers(businessId: number): Promise<Customer[]> {
    return await db.select().from(customers).where(eq(customers.businessId, businessId));
  }
  
  async updateCustomer(id: number, updates: Partial<InsertCustomer>): Promise<Customer> {
      const [updated] = await db.update(customers).set(updates).where(eq(customers.id, id)).returning();
      return updated;
  }

  // Tasks
  async createTask(task: InsertTask): Promise<Task> {
    const [newTask] = await db.insert(tasks).values(task).returning();
    return newTask;
  }

  async getTasks(businessId: number): Promise<(Task & { assignee: User | null })[]> {
    // Perform a join to get assignee details
    const result = await db
      .select({
        task: tasks,
        assignee: users
      })
      .from(tasks)
      .leftJoin(users, eq(tasks.assigneeId, users.id))
      .where(eq(tasks.businessId, businessId))
      .orderBy(desc(tasks.createdAt));
      
    return result.map(r => ({ ...r.task, assignee: r.assignee }));
  }
  
  async getTask(id: number): Promise<Task | undefined> {
      const [task] = await db.select().from(tasks).where(eq(tasks.id, id));
      return task;
  }

  async updateTask(id: number, updates: Partial<InsertTask>): Promise<Task> {
    const [updated] = await db.update(tasks).set(updates).where(eq(tasks.id, id)).returning();
    return updated;
  }

  async deleteTask(id: number): Promise<void> {
    await db.delete(tasks).where(eq(tasks.id, id));
  }

  // Forms
  async createForm(form: InsertForm): Promise<Form> {
    const [newForm] = await db.insert(forms).values(form).returning();
    return newForm;
  }

  async getForms(businessId: number): Promise<Form[]> {
    return await db.select().from(forms).where(eq(forms.businessId, businessId));
  }
  
  async getForm(id: number): Promise<Form | undefined> {
      const [form] = await db.select().from(forms).where(eq(forms.id, id));
      return form;
  }

  async updateForm(id: number, updates: Partial<InsertForm>): Promise<Form> {
    const [updated] = await db.update(forms).set(updates).where(eq(forms.id, id)).returning();
    return updated;
  }

  async deleteForm(id: number): Promise<void> {
    await db.delete(forms).where(eq(forms.id, id));
  }

  // Submissions
  async createSubmission(submission: InsertFormSubmission): Promise<FormSubmission> {
    const [newSubmission] = await db.insert(formSubmissions).values(submission).returning();
    return newSubmission;
  }

  async getSubmissions(formId: number): Promise<(FormSubmission & { user: User | null })[]> {
    const result = await db
        .select({
            submission: formSubmissions,
            user: users
        })
        .from(formSubmissions)
        .leftJoin(users, eq(formSubmissions.submittedBy, users.id))
        .where(eq(formSubmissions.formId, formId))
        .orderBy(desc(formSubmissions.createdAt));
        
    return result.map(r => ({ ...r.submission, user: r.user }));
  }
}

export const storage = new DatabaseStorage();
