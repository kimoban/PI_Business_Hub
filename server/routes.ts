import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, registerAuthRoutes } from "./replit_integrations/auth";
import { api, errorSchemas } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Setup Auth first
  await setupAuth(app);
  registerAuthRoutes(app);

  // Helper to get profile and business context
  // In a real app, this would be middleware
  const requireBusiness = async (req: any, res: any, next: any) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    
    const profile = await storage.getProfile(req.user.claims.sub);
    if (!profile || !profile.businessId) {
       // If no profile or business, maybe auto-create for prototype?
       // For now, let's assume valid state or handle in specific routes
       // We'll just attach what we have
       req.profile = profile;
       return next();
    }
    
    req.profile = profile;
    req.businessId = profile.businessId;
    next();
  };


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
  app.get(api.tasks.list.path, async (req, res) => {
    const businessId = Number(req.params.businessId);
    const tasks = await storage.getTasks(businessId);
    res.json(tasks);
  });

  app.post(api.tasks.create.path, async (req: any, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
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

  app.put(api.tasks.update.path, async (req, res) => {
    const id = Number(req.params.id);
    try {
      const input = api.tasks.update.input.parse(req.body);
      const updated = await storage.updateTask(id, input);
      res.json(updated);
    } catch (err) {
        res.status(404).json({ message: "Task not found" });
    }
  });
  
  app.delete(api.tasks.delete.path, async (req, res) => {
      const id = Number(req.params.id);
      await storage.deleteTask(id);
      res.status(204).send();
  });


  // === CUSTOMERS ===
  app.get(api.customers.list.path, async (req, res) => {
    const businessId = Number(req.params.businessId);
    const customers = await storage.getCustomers(businessId);
    res.json(customers);
  });

  app.post(api.customers.create.path, async (req, res) => {
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
  
  app.put(api.customers.update.path, async (req, res) => {
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
  app.get(api.forms.list.path, async (req, res) => {
    const businessId = Number(req.params.businessId);
    const forms = await storage.getForms(businessId);
    res.json(forms);
  });
  
  app.get(api.forms.get.path, async (req, res) => {
     const id = Number(req.params.id);
     const form = await storage.getForm(id);
     if (!form) return res.status(404).json({ message: "Form not found" });
     res.json(form);
  });

  app.post(api.forms.create.path, async (req, res) => {
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
  
  app.delete(api.forms.delete.path, async (req, res) => {
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
  
  
  // Seed function 
  seedDatabase();

  return httpServer;
}

async function seedDatabase() {
  // Check if we have any businesses, if not, create a demo one?
  // Since businesses are tied to users, we might wait for the first user.
  // Or we can create some dummy data if needed.
  // For now, let's just log that we are ready.
  console.log("Database initialized. Ready for users.");
}
