import { z } from 'zod';
import { 
  insertBusinessSchema, 
  insertCustomerSchema, 
  insertTaskSchema, 
  insertFormSchema, 
  insertFormSubmissionSchema,
  insertProfileSchema,
  businesses,
  customers,
  tasks,
  forms,
  formSubmissions,
  profiles,
  roleEnum,
  taskStatusEnum,
  priorityEnum
} from './schema';
import { users } from './models/auth';

// ============================================
// SHARED ERROR SCHEMAS
// ============================================
export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
  }),
};

// ============================================
// API CONTRACT
// ============================================
export const api = {
  businesses: {
    get: {
      method: 'GET' as const,
      path: '/api/businesses/:id',
      responses: {
        200: z.custom<typeof businesses.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/businesses/:id',
      input: insertBusinessSchema.partial(),
      responses: {
        200: z.custom<typeof businesses.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    // For prototype, simple creation
    create: {
      method: 'POST' as const,
      path: '/api/businesses',
      input: insertBusinessSchema,
      responses: {
        201: z.custom<typeof businesses.$inferSelect>(),
      },
    },
  },
  
  tasks: {
    list: {
      method: 'GET' as const,
      path: '/api/businesses/:businessId/tasks',
      responses: {
        200: z.array(z.custom<typeof tasks.$inferSelect & { assignee: typeof users.$inferSelect | null }>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/businesses/:businessId/tasks',
      input: insertTaskSchema.omit({ businessId: true }),
      responses: {
        201: z.custom<typeof tasks.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/tasks/:id',
      input: insertTaskSchema.partial().omit({ businessId: true }), // businessId shouldn't change
      responses: {
        200: z.custom<typeof tasks.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/tasks/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },

  customers: {
    list: {
      method: 'GET' as const,
      path: '/api/businesses/:businessId/customers',
      responses: {
        200: z.array(z.custom<typeof customers.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/businesses/:businessId/customers',
      input: insertCustomerSchema.omit({ businessId: true }),
      responses: {
        201: z.custom<typeof customers.$inferSelect>(),
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/customers/:id',
      input: insertCustomerSchema.partial().omit({ businessId: true }),
      responses: {
        200: z.custom<typeof customers.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
  },

  forms: {
    list: {
      method: 'GET' as const,
      path: '/api/businesses/:businessId/forms',
      responses: {
        200: z.array(z.custom<typeof forms.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/forms/:id',
      responses: {
        200: z.custom<typeof forms.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/businesses/:businessId/forms',
      input: insertFormSchema.omit({ businessId: true }),
      responses: {
        201: z.custom<typeof forms.$inferSelect>(),
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/forms/:id',
      input: insertFormSchema.partial().omit({ businessId: true }),
      responses: {
        200: z.custom<typeof forms.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/forms/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },

  submissions: {
     list: {
      method: 'GET' as const,
      path: '/api/forms/:formId/submissions',
      responses: {
        200: z.array(z.custom<typeof formSubmissions.$inferSelect & { user: typeof users.$inferSelect | null }>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/forms/:formId/submissions',
      input: z.object({ data: z.any() }), // Simplified input for submissions
      responses: {
        201: z.custom<typeof formSubmissions.$inferSelect>(),
      },
    },
  },

  profiles: {
    me: {
      method: 'GET' as const,
      path: '/api/me/profile',
      responses: {
        200: z.custom<typeof profiles.$inferSelect & { business: typeof businesses.$inferSelect | null } | null>(),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/profiles',
      input: insertProfileSchema.omit({ userId: true }),
      responses: {
        201: z.custom<typeof profiles.$inferSelect>(),
      },
    },
  }
};

// ============================================
// HELPER FUNCTIONS
// ============================================
export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
