import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, registerAuthRoutes } from "./replit_integrations/auth";
import { api, errorSchemas } from "@shared/routes";
import { z } from "zod";
import { 
  loadUserProfile, 
  requirePermission, 
  requireBusiness, 
  requireBusinessMatch,
  requireAdmin,
  hasPermission,
  getRolePermissions
} from "./middleware/rbac";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Setup Auth first
  await setupAuth(app);
  registerAuthRoutes(app);
  
  // Load user profile for all authenticated requests
  app.use(loadUserProfile());


  // === PROFILES ===
  app.get(api.profiles.me.path, async (req: any, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    
    let profile = await storage.getProfile(req.user.claims.sub);
    let business = null;
    
    // Auto-create profile if missing (prototype convenience)
    if (!profile) {
      // Check if this is the first user -> Admin?
      // For now, just create a profile without business
      profile = await storage.createProfile({
        userId: req.user.claims.sub,
        role: "guest", // Default role until they create/join business
      });
    }

    if (profile && profile.businessId) {
        business = await storage.getBusiness(profile.businessId);
    }
    
    res.json({ ...profile, business: business || null });
  });

  // === BUSINESSES ===
  app.post(api.businesses.create.path, async (req: any, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    
    try {
      const input = api.businesses.create.input.parse(req.body);
      const business = await storage.createBusiness(input);
      
      // Link creator to business as admin
      let profile = await storage.getProfile(req.user.claims.sub);
      if (profile) {
          // Update existing profile (TODO: add updateProfile to storage)
          // For now, hack: we didn't implement updateProfile fully in interface yet for this specific case
          // so let's just assume fresh profile creation for this flow or manual DB update
          // Implementation detail: createProfile returns new profile. 
          // We need update capability.
      } else {
          await storage.createProfile({
              userId: req.user.claims.sub,
              businessId: business.id,
              role: "admin"
          });
      }
      
      res.status(201).json(business);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });


  // === TASKS ===
  app.get(api.tasks.list.path, requirePermission("task:read"), requireBusinessMatch(), async (req, res) => {
    const businessId = Number(req.params.businessId);
    const tasks = await storage.getTasks(businessId);
    res.json(tasks);
  });

  app.post(api.tasks.create.path, requirePermission("task:create"), requireBusinessMatch(), async (req: any, res) => {
    const businessId = Number(req.params.businessId);
    
    try {
      const input = api.tasks.create.input.parse(req.body);
      const task = await storage.createTask({
        ...input,
        businessId,
        assigneeId: input.assigneeId || req.user.claims.sub // Default to self if not assigned
      });
      res.status(201).json(task);
    } catch (err) {
       if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.put(api.tasks.update.path, requirePermission("task:update"), async (req, res) => {
    const id = Number(req.params.id);
    try {
      const input = api.tasks.update.input.parse(req.body);
      const updated = await storage.updateTask(id, input);
      res.json(updated);
    } catch (err) {
        res.status(404).json({ message: "Task not found" });
    }
  });
  
  app.delete(api.tasks.delete.path, requirePermission("task:delete"), async (req, res) => {
      const id = Number(req.params.id);
      await storage.deleteTask(id);
      res.status(204).send();
  });


  // === CUSTOMERS ===
  app.get(api.customers.list.path, requirePermission("customer:read"), requireBusinessMatch(), async (req, res) => {
    const businessId = Number(req.params.businessId);
    const customers = await storage.getCustomers(businessId);
    res.json(customers);
  });

  app.post(api.customers.create.path, requirePermission("customer:create"), requireBusinessMatch(), async (req, res) => {
    const businessId = Number(req.params.businessId);
    try {
      const input = api.customers.create.input.parse(req.body);
      const customer = await storage.createCustomer({
        ...input,
        businessId
      });
      res.status(201).json(customer);
    } catch (err) {
       if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });
  
  app.put(api.customers.update.path, requirePermission("customer:update"), async (req, res) => {
      const id = Number(req.params.id);
      try {
          const input = api.customers.update.input.parse(req.body);
          const updated = await storage.updateCustomer(id, input);
          res.json(updated);
      } catch (err) {
          res.status(404).json({ message: "Customer not found" });
      }
  });


  // === FORMS ===
  app.get(api.forms.list.path, requirePermission("form:read"), requireBusinessMatch(), async (req, res) => {
    const businessId = Number(req.params.businessId);
    const forms = await storage.getForms(businessId);
    res.json(forms);
  });
  
  app.get(api.forms.get.path, requirePermission("form:read"), async (req, res) => {
     const id = Number(req.params.id);
     const form = await storage.getForm(id);
     if (!form) return res.status(404).json({ message: "Form not found" });
     res.json(form);
  });

  app.post(api.forms.create.path, requirePermission("form:create"), requireBusinessMatch(), async (req, res) => {
    const businessId = Number(req.params.businessId);
    try {
      const input = api.forms.create.input.parse(req.body);
      const form = await storage.createForm({
        ...input,
        businessId
      });
      res.status(201).json(form);
    } catch (err) {
       if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });
  
  app.delete(api.forms.delete.path, requirePermission("form:delete"), async (req, res) => {
      const id = Number(req.params.id);
      await storage.deleteForm(id);
      res.status(204).send();
  });


  // === SUBMISSIONS ===
  app.get(api.submissions.list.path, async (req, res) => {
     const formId = Number(req.params.formId);
     const submissions = await storage.getSubmissions(formId);
     res.json(submissions);
  });
  
  app.post(api.submissions.create.path, async (req: any, res) => {
      const formId = Number(req.params.formId);
      try {
          const input = api.submissions.create.input.parse(req.body);
          const submission = await storage.createSubmission({
              formId,
              data: input.data,
              submittedBy: req.isAuthenticated() ? req.user.claims.sub : null
          });
          res.status(201).json(submission);
      } catch (err) {
          if (err instanceof z.ZodError) {
            return res.status(400).json({ message: err.errors[0].message });
          }
          throw err;
      }
  });
  

  // === REMINDERS ===
  app.get(api.reminders.list.path, requirePermission("reminder:read"), requireBusinessMatch(), async (req, res) => {
    const businessId = Number(req.params.businessId);
    const reminders = await storage.getReminders(businessId);
    res.json(reminders);
  });

  app.get(api.reminders.get.path, requirePermission("reminder:read"), async (req, res) => {
    const id = Number(req.params.id);
    const reminder = await storage.getReminder(id);
    if (!reminder) return res.status(404).json({ message: "Reminder not found" });
    res.json(reminder);
  });

  app.post(api.reminders.create.path, requirePermission("reminder:create"), requireBusinessMatch(), async (req: any, res) => {
    const businessId = Number(req.params.businessId);
    
    try {
      const input = api.reminders.create.input.parse(req.body);
      const reminder = await storage.createReminder({
        ...input,
        businessId,
        createdBy: req.user.claims.sub
      });
      res.status(201).json(reminder);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.put(api.reminders.update.path, requirePermission("reminder:update"), async (req, res) => {
    const id = Number(req.params.id);
    try {
      const input = api.reminders.update.input.parse(req.body);
      const updated = await storage.updateReminder(id, input);
      res.json(updated);
    } catch (err) {
      res.status(404).json({ message: "Reminder not found" });
    }
  });

  app.delete(api.reminders.delete.path, requirePermission("reminder:delete"), async (req, res) => {
    const id = Number(req.params.id);
    await storage.deleteReminder(id);
    res.status(204).send();
  });

  app.post(api.reminders.complete.path, requirePermission("reminder:update"), async (req, res) => {
    const id = Number(req.params.id);
    try {
      const updated = await storage.updateReminder(id, { status: "completed" });
      res.json(updated);
    } catch (err) {
      res.status(404).json({ message: "Reminder not found" });
    }
  });

  app.post(api.reminders.snooze.path, requirePermission("reminder:update"), async (req, res) => {
    const id = Number(req.params.id);
    try {
      const input = api.reminders.snooze.input.parse(req.body);
      const updated = await storage.updateReminder(id, { 
        dueAt: new Date(input.dueAt),
        status: "snoozed"
      });
      res.json(updated);
    } catch (err) {
      res.status(404).json({ message: "Reminder not found" });
    }
  });


  // === NOTIFICATIONS ===
  app.get(api.notifications.list.path, requirePermission("notification:read"), async (req: any, res) => {
    const notifications = await storage.getNotifications(req.user.claims.sub);
    res.json(notifications);
  });

  app.get(api.notifications.unreadCount.path, requirePermission("notification:read"), async (req: any, res) => {
    const count = await storage.getUnreadNotificationCount(req.user.claims.sub);
    res.json({ count });
  });

  app.post(api.notifications.markRead.path, requirePermission("notification:manage"), async (req, res) => {
    const id = Number(req.params.id);
    try {
      const updated = await storage.markNotificationRead(id);
      res.json(updated);
    } catch (err) {
      res.status(404).json({ message: "Notification not found" });
    }
  });

  app.post(api.notifications.markAllRead.path, requirePermission("notification:manage"), async (req: any, res) => {
    await storage.markAllNotificationsRead(req.user.claims.sub);
    res.json({ success: true });
  });

  app.delete(api.notifications.delete.path, requirePermission("notification:manage"), async (req, res) => {
    const id = Number(req.params.id);
    await storage.deleteNotification(id);
    res.status(204).send();
  });


  // === ADMIN ENDPOINTS ===
  
  // Get current user's role and permissions
  app.get("/api/auth/permissions", async (req: any, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    const profile = req.profile || await storage.getProfile(req.user.claims.sub);
    const role = profile?.role || "guest";
    const permissions = getRolePermissions(role);
    
    res.json({
      role,
      permissions,
      businessId: profile?.businessId || null
    });
  });
  
  // Admin: Get all users in business
  app.get("/api/admin/users", requireAdmin(), async (req: any, res) => {
    if (!req.profile?.businessId) {
      return res.status(403).json({ error: "No business associated" });
    }
    
    const users = await storage.getUsersByBusiness(req.profile.businessId);
    res.json(users);
  });
  
  // Admin: Update user role
  app.put("/api/admin/users/:userId/role", requireAdmin(), async (req: any, res) => {
    const { userId } = req.params;
    const { role } = req.body;
    
    if (!["admin", "staff", "guest", "client"].includes(role)) {
      return res.status(400).json({ error: "Invalid role" });
    }
    
    // Can't change own role
    if (userId === req.user.claims.sub) {
      return res.status(400).json({ error: "Cannot change your own role" });
    }
    
    try {
      const updated = await storage.updateUserRole(userId, role);
      res.json(updated);
    } catch (err) {
      res.status(404).json({ error: "User not found" });
    }
  });
  
  // Admin: Get business analytics
  app.get("/api/admin/analytics", requireAdmin(), async (req: any, res) => {
    if (!req.profile?.businessId) {
      return res.status(403).json({ error: "No business associated" });
    }
    
    const businessId = req.profile.businessId;
    
    // Gather analytics
    const [tasks, customers, forms, reminders] = await Promise.all([
      storage.getTasks(businessId),
      storage.getCustomers(businessId),
      storage.getForms(businessId),
      storage.getReminders(businessId)
    ]);
    
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    res.json({
      totalTasks: tasks.length,
      tasksByStatus: {
        todo: tasks.filter(t => t.status === "todo").length,
        in_progress: tasks.filter(t => t.status === "in_progress").length,
        done: tasks.filter(t => t.status === "done").length
      },
      tasksByPriority: {
        high: tasks.filter(t => t.priority === "high").length,
        medium: tasks.filter(t => t.priority === "medium").length,
        low: tasks.filter(t => t.priority === "low").length
      },
      totalCustomers: customers.length,
      newCustomersLast30Days: customers.filter(c => 
        c.createdAt && new Date(c.createdAt) >= thirtyDaysAgo
      ).length,
      totalForms: forms.length,
      totalReminders: reminders.length,
      pendingReminders: reminders.filter(r => r.status === "pending").length
    });
  });
  
  // Admin: Invite user to business (creates pending profile)
  app.post("/api/admin/invite", requireAdmin(), async (req: any, res) => {
    const { email, role } = req.body;
    
    if (!email || !role) {
      return res.status(400).json({ error: "Email and role are required" });
    }
    
    if (!["admin", "staff", "guest"].includes(role)) {
      return res.status(400).json({ error: "Invalid role" });
    }
    
    // In a real app, this would send an email invitation
    // For now, we'll just return success with the invitation details
    res.json({
      message: "Invitation sent",
      email,
      role,
      businessId: req.profile.businessId
    });
  });

  return httpServer;
}
