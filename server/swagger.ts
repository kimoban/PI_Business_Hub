import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import type { Express } from 'express';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'PI Business Hub API',
    version: '1.0.0',
    description: `
# PI Business Hub API Documentation

A comprehensive business management platform API for managing tasks, customers, forms, reminders, and notifications.

## Authentication
Most endpoints require authentication. The API uses session-based authentication.

## Base URL
- Development: \`http://localhost:5000\`
- Production: Your deployed server URL

## Rate Limiting
No rate limiting is currently implemented.
    `,
    contact: {
      name: 'API Support',
      email: 'support@pibusinesshub.com'
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT'
    }
  },
  servers: [
    {
      url: process.env.NODE_ENV === 'production' 
        ? process.env.BASE_URL || 'https://api.pibusinesshub.com'
        : 'http://localhost:5000',
      description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server'
    }
  ],
  tags: [
    { name: 'Health', description: 'Health check endpoints' },
    { name: 'Auth', description: 'Authentication and authorization' },
    { name: 'Profiles', description: 'User profile management' },
    { name: 'Businesses', description: 'Business management' },
    { name: 'Tasks', description: 'Task management' },
    { name: 'Customers', description: 'Customer management' },
    { name: 'Forms', description: 'Form builder and management' },
    { name: 'Submissions', description: 'Form submissions' },
    { name: 'Reminders', description: 'Reminder management' },
    { name: 'Notifications', description: 'In-app notifications' },
    { name: 'Admin', description: 'Administrative functions' }
  ],
  components: {
    securitySchemes: {
      sessionAuth: {
        type: 'apiKey',
        in: 'cookie',
        name: 'connect.sid',
        description: 'Session-based authentication cookie'
      }
    },
    schemas: {
      Error: {
        type: 'object',
        properties: {
          message: { type: 'string', description: 'Error message' },
          field: { type: 'string', description: 'Field that caused the error (for validation errors)' }
        },
        required: ['message']
      },
      Business: {
        type: 'object',
        properties: {
          id: { type: 'integer', description: 'Unique identifier' },
          name: { type: 'string', description: 'Business name' },
          logoUrl: { type: 'string', nullable: true, description: 'URL to business logo' },
          industry: { type: 'string', nullable: true, description: 'Industry type' },
          phone: { type: 'string', nullable: true, description: 'Contact phone' },
          email: { type: 'string', nullable: true, description: 'Contact email' },
          currency: { type: 'string', default: 'USD', description: 'Currency code' },
          timezone: { type: 'string', default: 'UTC', description: 'Timezone' },
          subscriptionStatus: { type: 'string', default: 'active', description: 'Subscription status' },
          createdAt: { type: 'string', format: 'date-time', description: 'Creation timestamp' }
        }
      },
      Profile: {
        type: 'object',
        properties: {
          id: { type: 'integer', description: 'Unique identifier' },
          userId: { type: 'string', description: 'User ID from auth system' },
          businessId: { type: 'integer', nullable: true, description: 'Associated business ID' },
          role: { type: 'string', enum: ['admin', 'staff', 'guest', 'client'], description: 'User role' },
          business: { $ref: '#/components/schemas/Business', nullable: true }
        }
      },
      Task: {
        type: 'object',
        properties: {
          id: { type: 'integer', description: 'Unique identifier' },
          businessId: { type: 'integer', description: 'Business ID' },
          title: { type: 'string', description: 'Task title' },
          description: { type: 'string', nullable: true, description: 'Task description' },
          status: { type: 'string', enum: ['todo', 'in_progress', 'done'], description: 'Task status' },
          priority: { type: 'string', enum: ['low', 'medium', 'high'], description: 'Task priority' },
          assigneeId: { type: 'string', nullable: true, description: 'Assigned user ID' },
          dueDate: { type: 'string', format: 'date-time', nullable: true, description: 'Due date' },
          createdAt: { type: 'string', format: 'date-time', description: 'Creation timestamp' },
          assignee: { type: 'object', nullable: true, description: 'Assigned user details' }
        }
      },
      TaskInput: {
        type: 'object',
        required: ['title'],
        properties: {
          title: { type: 'string', description: 'Task title' },
          description: { type: 'string', description: 'Task description' },
          status: { type: 'string', enum: ['todo', 'in_progress', 'done'], default: 'todo' },
          priority: { type: 'string', enum: ['low', 'medium', 'high'], default: 'medium' },
          assigneeId: { type: 'string', description: 'Assigned user ID' },
          dueDate: { type: 'string', format: 'date-time', description: 'Due date' }
        }
      },
      Customer: {
        type: 'object',
        properties: {
          id: { type: 'integer', description: 'Unique identifier' },
          businessId: { type: 'integer', description: 'Business ID' },
          name: { type: 'string', description: 'Customer name' },
          email: { type: 'string', nullable: true, description: 'Customer email' },
          phone: { type: 'string', nullable: true, description: 'Customer phone' },
          notes: { type: 'string', nullable: true, description: 'Notes about customer' },
          tags: { type: 'array', items: { type: 'string' }, nullable: true, description: 'Tags' },
          createdAt: { type: 'string', format: 'date-time', description: 'Creation timestamp' }
        }
      },
      CustomerInput: {
        type: 'object',
        required: ['name'],
        properties: {
          name: { type: 'string', description: 'Customer name' },
          email: { type: 'string', description: 'Customer email' },
          phone: { type: 'string', description: 'Customer phone' },
          notes: { type: 'string', description: 'Notes about customer' },
          tags: { type: 'array', items: { type: 'string' }, description: 'Tags' }
        }
      },
      Form: {
        type: 'object',
        properties: {
          id: { type: 'integer', description: 'Unique identifier' },
          businessId: { type: 'integer', description: 'Business ID' },
          title: { type: 'string', description: 'Form title' },
          description: { type: 'string', nullable: true, description: 'Form description' },
          schema: { type: 'object', description: 'Form field schema (JSON)' },
          createdAt: { type: 'string', format: 'date-time', description: 'Creation timestamp' }
        }
      },
      FormInput: {
        type: 'object',
        required: ['title', 'schema'],
        properties: {
          title: { type: 'string', description: 'Form title' },
          description: { type: 'string', description: 'Form description' },
          schema: { type: 'object', description: 'Form field schema (JSON)' }
        }
      },
      FormSubmission: {
        type: 'object',
        properties: {
          id: { type: 'integer', description: 'Unique identifier' },
          formId: { type: 'integer', description: 'Form ID' },
          data: { type: 'object', description: 'Submitted data (JSON)' },
          submittedBy: { type: 'string', nullable: true, description: 'User who submitted' },
          createdAt: { type: 'string', format: 'date-time', description: 'Submission timestamp' },
          user: { type: 'object', nullable: true, description: 'User details' }
        }
      },
      Reminder: {
        type: 'object',
        properties: {
          id: { type: 'integer', description: 'Unique identifier' },
          businessId: { type: 'integer', description: 'Business ID' },
          taskId: { type: 'integer', nullable: true, description: 'Associated task ID' },
          customerId: { type: 'integer', nullable: true, description: 'Associated customer ID' },
          title: { type: 'string', description: 'Reminder title' },
          description: { type: 'string', nullable: true, description: 'Reminder description' },
          type: { type: 'string', enum: ['task', 'customer', 'payment', 'custom'], description: 'Reminder type' },
          status: { type: 'string', enum: ['pending', 'sent', 'snoozed', 'dismissed', 'completed'], description: 'Status' },
          dueAt: { type: 'string', format: 'date-time', description: 'Due date/time' },
          isRecurring: { type: 'boolean', default: false, description: 'Is recurring' },
          recurringPattern: { type: 'string', nullable: true, description: 'Recurring pattern' },
          createdBy: { type: 'string', nullable: true, description: 'Creator user ID' },
          createdAt: { type: 'string', format: 'date-time', description: 'Creation timestamp' },
          task: { $ref: '#/components/schemas/Task', nullable: true },
          customer: { $ref: '#/components/schemas/Customer', nullable: true }
        }
      },
      ReminderInput: {
        type: 'object',
        required: ['title', 'dueAt'],
        properties: {
          taskId: { type: 'integer', description: 'Associated task ID' },
          customerId: { type: 'integer', description: 'Associated customer ID' },
          title: { type: 'string', description: 'Reminder title' },
          description: { type: 'string', description: 'Reminder description' },
          type: { type: 'string', enum: ['task', 'customer', 'payment', 'custom'], default: 'custom' },
          dueAt: { type: 'string', format: 'date-time', description: 'Due date/time' },
          isRecurring: { type: 'boolean', default: false },
          recurringPattern: { type: 'string', description: 'daily, weekly, or monthly' }
        }
      },
      Notification: {
        type: 'object',
        properties: {
          id: { type: 'integer', description: 'Unique identifier' },
          userId: { type: 'string', description: 'User ID' },
          businessId: { type: 'integer', nullable: true, description: 'Business ID' },
          type: { type: 'string', enum: ['reminder', 'task_update', 'customer_added', 'system'], description: 'Type' },
          title: { type: 'string', description: 'Notification title' },
          message: { type: 'string', nullable: true, description: 'Notification message' },
          isRead: { type: 'boolean', default: false, description: 'Read status' },
          linkUrl: { type: 'string', nullable: true, description: 'Related link URL' },
          createdAt: { type: 'string', format: 'date-time', description: 'Creation timestamp' }
        }
      },
      Analytics: {
        type: 'object',
        properties: {
          totalTasks: { type: 'integer' },
          tasksByStatus: {
            type: 'object',
            properties: {
              todo: { type: 'integer' },
              in_progress: { type: 'integer' },
              done: { type: 'integer' }
            }
          },
          tasksByPriority: {
            type: 'object',
            properties: {
              high: { type: 'integer' },
              medium: { type: 'integer' },
              low: { type: 'integer' }
            }
          },
          totalCustomers: { type: 'integer' },
          newCustomersLast30Days: { type: 'integer' },
          totalForms: { type: 'integer' },
          totalReminders: { type: 'integer' },
          pendingReminders: { type: 'integer' }
        }
      },
      HealthCheck: {
        type: 'object',
        properties: {
          status: { type: 'string', example: 'ok' },
          timestamp: { type: 'string', format: 'date-time' },
          environment: { type: 'string', example: 'production' },
          database: { type: 'string', example: 'connected' }
        }
      },
      Permissions: {
        type: 'object',
        properties: {
          role: { type: 'string', enum: ['admin', 'staff', 'guest', 'client'] },
          permissions: { type: 'array', items: { type: 'string' } },
          businessId: { type: 'integer', nullable: true }
        }
      }
    }
  },
  paths: {
    '/api/health': {
      get: {
        tags: ['Health'],
        summary: 'Health check',
        description: 'Check API and database health status',
        responses: {
          200: {
            description: 'Health status',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/HealthCheck' }
              }
            }
          }
        }
      }
    },
    '/api/me/profile': {
      get: {
        tags: ['Profiles'],
        summary: 'Get current user profile',
        description: 'Returns the authenticated user\'s profile with associated business',
        security: [{ sessionAuth: [] }],
        responses: {
          200: {
            description: 'User profile',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Profile' }
              }
            }
          },
          401: {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' }
              }
            }
          }
        }
      }
    },
    '/api/profiles': {
      post: {
        tags: ['Profiles'],
        summary: 'Create a profile',
        description: 'Create a new user profile',
        security: [{ sessionAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  businessId: { type: 'integer' },
                  role: { type: 'string', enum: ['admin', 'staff', 'guest', 'client'] }
                }
              }
            }
          }
        },
        responses: {
          201: {
            description: 'Profile created',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Profile' }
              }
            }
          }
        }
      }
    },
    '/api/businesses': {
      post: {
        tags: ['Businesses'],
        summary: 'Create a business',
        description: 'Create a new business and link it to the current user',
        security: [{ sessionAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name'],
                properties: {
                  name: { type: 'string' },
                  logoUrl: { type: 'string' },
                  industry: { type: 'string' },
                  phone: { type: 'string' },
                  email: { type: 'string' },
                  currency: { type: 'string', default: 'USD' },
                  timezone: { type: 'string', default: 'UTC' }
                }
              }
            }
          }
        },
        responses: {
          201: {
            description: 'Business created',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Business' }
              }
            }
          },
          400: {
            description: 'Validation error',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' }
              }
            }
          },
          401: { description: 'Unauthorized' }
        }
      }
    },
    '/api/businesses/{id}': {
      get: {
        tags: ['Businesses'],
        summary: 'Get a business',
        description: 'Retrieve a business by ID',
        security: [{ sessionAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        responses: {
          200: {
            description: 'Business details',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Business' }
              }
            }
          },
          404: { description: 'Business not found' }
        }
      },
      put: {
        tags: ['Businesses'],
        summary: 'Update a business',
        description: 'Update business details',
        security: [{ sessionAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  logoUrl: { type: 'string' },
                  industry: { type: 'string' },
                  phone: { type: 'string' },
                  email: { type: 'string' },
                  currency: { type: 'string' },
                  timezone: { type: 'string' }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Business updated',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Business' }
              }
            }
          },
          404: { description: 'Business not found' }
        }
      }
    },
    '/api/businesses/{businessId}/tasks': {
      get: {
        tags: ['Tasks'],
        summary: 'List tasks',
        description: 'Get all tasks for a business',
        security: [{ sessionAuth: [] }],
        parameters: [
          { name: 'businessId', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        responses: {
          200: {
            description: 'List of tasks',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Task' }
                }
              }
            }
          },
          401: { description: 'Unauthorized' },
          403: { description: 'Forbidden - insufficient permissions' }
        }
      },
      post: {
        tags: ['Tasks'],
        summary: 'Create a task',
        description: 'Create a new task for a business',
        security: [{ sessionAuth: [] }],
        parameters: [
          { name: 'businessId', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/TaskInput' }
            }
          }
        },
        responses: {
          201: {
            description: 'Task created',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Task' }
              }
            }
          },
          400: { description: 'Validation error' },
          401: { description: 'Unauthorized' },
          403: { description: 'Forbidden' }
        }
      }
    },
    '/api/tasks/{id}': {
      put: {
        tags: ['Tasks'],
        summary: 'Update a task',
        description: 'Update an existing task',
        security: [{ sessionAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/TaskInput' }
            }
          }
        },
        responses: {
          200: {
            description: 'Task updated',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Task' }
              }
            }
          },
          404: { description: 'Task not found' }
        }
      },
      delete: {
        tags: ['Tasks'],
        summary: 'Delete a task',
        description: 'Delete a task by ID',
        security: [{ sessionAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        responses: {
          204: { description: 'Task deleted' },
          404: { description: 'Task not found' }
        }
      }
    },
    '/api/businesses/{businessId}/customers': {
      get: {
        tags: ['Customers'],
        summary: 'List customers',
        description: 'Get all customers for a business',
        security: [{ sessionAuth: [] }],
        parameters: [
          { name: 'businessId', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        responses: {
          200: {
            description: 'List of customers',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Customer' }
                }
              }
            }
          }
        }
      },
      post: {
        tags: ['Customers'],
        summary: 'Create a customer',
        description: 'Add a new customer to a business',
        security: [{ sessionAuth: [] }],
        parameters: [
          { name: 'businessId', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CustomerInput' }
            }
          }
        },
        responses: {
          201: {
            description: 'Customer created',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Customer' }
              }
            }
          },
          400: { description: 'Validation error' }
        }
      }
    },
    '/api/customers/{id}': {
      put: {
        tags: ['Customers'],
        summary: 'Update a customer',
        description: 'Update customer details',
        security: [{ sessionAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CustomerInput' }
            }
          }
        },
        responses: {
          200: {
            description: 'Customer updated',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Customer' }
              }
            }
          },
          404: { description: 'Customer not found' }
        }
      }
    },
    '/api/businesses/{businessId}/forms': {
      get: {
        tags: ['Forms'],
        summary: 'List forms',
        description: 'Get all forms for a business',
        security: [{ sessionAuth: [] }],
        parameters: [
          { name: 'businessId', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        responses: {
          200: {
            description: 'List of forms',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Form' }
                }
              }
            }
          }
        }
      },
      post: {
        tags: ['Forms'],
        summary: 'Create a form',
        description: 'Create a new form for a business',
        security: [{ sessionAuth: [] }],
        parameters: [
          { name: 'businessId', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/FormInput' }
            }
          }
        },
        responses: {
          201: {
            description: 'Form created',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Form' }
              }
            }
          },
          400: { description: 'Validation error' }
        }
      }
    },
    '/api/forms/{id}': {
      get: {
        tags: ['Forms'],
        summary: 'Get a form',
        description: 'Retrieve a form by ID',
        security: [{ sessionAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        responses: {
          200: {
            description: 'Form details',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Form' }
              }
            }
          },
          404: { description: 'Form not found' }
        }
      },
      delete: {
        tags: ['Forms'],
        summary: 'Delete a form',
        description: 'Delete a form by ID',
        security: [{ sessionAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        responses: {
          204: { description: 'Form deleted' },
          404: { description: 'Form not found' }
        }
      }
    },
    '/api/forms/{formId}/submissions': {
      get: {
        tags: ['Submissions'],
        summary: 'List form submissions',
        description: 'Get all submissions for a form',
        security: [{ sessionAuth: [] }],
        parameters: [
          { name: 'formId', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        responses: {
          200: {
            description: 'List of submissions',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/FormSubmission' }
                }
              }
            }
          }
        }
      },
      post: {
        tags: ['Submissions'],
        summary: 'Submit a form',
        description: 'Create a new form submission',
        parameters: [
          { name: 'formId', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['data'],
                properties: {
                  data: { type: 'object', description: 'Submission data matching form schema' }
                }
              }
            }
          }
        },
        responses: {
          201: {
            description: 'Submission created',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/FormSubmission' }
              }
            }
          },
          400: { description: 'Validation error' }
        }
      }
    },
    '/api/businesses/{businessId}/reminders': {
      get: {
        tags: ['Reminders'],
        summary: 'List reminders',
        description: 'Get all reminders for a business',
        security: [{ sessionAuth: [] }],
        parameters: [
          { name: 'businessId', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        responses: {
          200: {
            description: 'List of reminders',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Reminder' }
                }
              }
            }
          }
        }
      },
      post: {
        tags: ['Reminders'],
        summary: 'Create a reminder',
        description: 'Create a new reminder',
        security: [{ sessionAuth: [] }],
        parameters: [
          { name: 'businessId', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ReminderInput' }
            }
          }
        },
        responses: {
          201: {
            description: 'Reminder created',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Reminder' }
              }
            }
          },
          400: { description: 'Validation error' }
        }
      }
    },
    '/api/reminders/{id}': {
      get: {
        tags: ['Reminders'],
        summary: 'Get a reminder',
        description: 'Retrieve a reminder by ID',
        security: [{ sessionAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        responses: {
          200: {
            description: 'Reminder details',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Reminder' }
              }
            }
          },
          404: { description: 'Reminder not found' }
        }
      },
      put: {
        tags: ['Reminders'],
        summary: 'Update a reminder',
        description: 'Update reminder details',
        security: [{ sessionAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ReminderInput' }
            }
          }
        },
        responses: {
          200: {
            description: 'Reminder updated',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Reminder' }
              }
            }
          },
          404: { description: 'Reminder not found' }
        }
      },
      delete: {
        tags: ['Reminders'],
        summary: 'Delete a reminder',
        description: 'Delete a reminder by ID',
        security: [{ sessionAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        responses: {
          204: { description: 'Reminder deleted' },
          404: { description: 'Reminder not found' }
        }
      }
    },
    '/api/reminders/{id}/complete': {
      post: {
        tags: ['Reminders'],
        summary: 'Complete a reminder',
        description: 'Mark a reminder as completed',
        security: [{ sessionAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        responses: {
          200: {
            description: 'Reminder completed',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Reminder' }
              }
            }
          },
          404: { description: 'Reminder not found' }
        }
      }
    },
    '/api/reminders/{id}/snooze': {
      post: {
        tags: ['Reminders'],
        summary: 'Snooze a reminder',
        description: 'Snooze a reminder to a new date/time',
        security: [{ sessionAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['dueAt'],
                properties: {
                  dueAt: { type: 'string', format: 'date-time', description: 'New due date/time' }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Reminder snoozed',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Reminder' }
              }
            }
          },
          404: { description: 'Reminder not found' }
        }
      }
    },
    '/api/me/notifications': {
      get: {
        tags: ['Notifications'],
        summary: 'List notifications',
        description: 'Get all notifications for the current user',
        security: [{ sessionAuth: [] }],
        responses: {
          200: {
            description: 'List of notifications',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Notification' }
                }
              }
            }
          }
        }
      }
    },
    '/api/me/notifications/unread-count': {
      get: {
        tags: ['Notifications'],
        summary: 'Get unread count',
        description: 'Get the count of unread notifications',
        security: [{ sessionAuth: [] }],
        responses: {
          200: {
            description: 'Unread count',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    count: { type: 'integer' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/me/notifications/mark-all-read': {
      post: {
        tags: ['Notifications'],
        summary: 'Mark all as read',
        description: 'Mark all notifications as read',
        security: [{ sessionAuth: [] }],
        responses: {
          200: {
            description: 'Success',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/notifications/{id}/read': {
      post: {
        tags: ['Notifications'],
        summary: 'Mark as read',
        description: 'Mark a single notification as read',
        security: [{ sessionAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        responses: {
          200: {
            description: 'Notification marked as read',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Notification' }
              }
            }
          },
          404: { description: 'Notification not found' }
        }
      }
    },
    '/api/notifications/{id}': {
      delete: {
        tags: ['Notifications'],
        summary: 'Delete notification',
        description: 'Delete a notification by ID',
        security: [{ sessionAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        responses: {
          204: { description: 'Notification deleted' },
          404: { description: 'Notification not found' }
        }
      }
    },
    '/api/auth/permissions': {
      get: {
        tags: ['Auth'],
        summary: 'Get permissions',
        description: 'Get current user role and permissions',
        security: [{ sessionAuth: [] }],
        responses: {
          200: {
            description: 'User permissions',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Permissions' }
              }
            }
          },
          401: { description: 'Unauthorized' }
        }
      }
    },
    '/api/admin/users': {
      get: {
        tags: ['Admin'],
        summary: 'List business users',
        description: 'Get all users in the business (Admin only)',
        security: [{ sessionAuth: [] }],
        responses: {
          200: {
            description: 'List of users',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Profile' }
                }
              }
            }
          },
          401: { description: 'Unauthorized' },
          403: { description: 'Forbidden - Admin only' }
        }
      }
    },
    '/api/admin/users/{userId}/role': {
      put: {
        tags: ['Admin'],
        summary: 'Update user role',
        description: 'Change a user\'s role (Admin only)',
        security: [{ sessionAuth: [] }],
        parameters: [
          { name: 'userId', in: 'path', required: true, schema: { type: 'string' } }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['role'],
                properties: {
                  role: { type: 'string', enum: ['admin', 'staff', 'guest', 'client'] }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Role updated',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Profile' }
              }
            }
          },
          400: { description: 'Invalid role or cannot change own role' },
          403: { description: 'Forbidden - Admin only' },
          404: { description: 'User not found' }
        }
      }
    },
    '/api/admin/analytics': {
      get: {
        tags: ['Admin'],
        summary: 'Get analytics',
        description: 'Get business analytics (Admin only)',
        security: [{ sessionAuth: [] }],
        responses: {
          200: {
            description: 'Analytics data',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Analytics' }
              }
            }
          },
          403: { description: 'Forbidden - Admin only' }
        }
      }
    },
    '/api/admin/invite': {
      post: {
        tags: ['Admin'],
        summary: 'Invite user',
        description: 'Invite a new user to the business (Admin only)',
        security: [{ sessionAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'role'],
                properties: {
                  email: { type: 'string', format: 'email' },
                  role: { type: 'string', enum: ['admin', 'staff', 'guest'] }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Invitation sent',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string' },
                    email: { type: 'string' },
                    role: { type: 'string' },
                    businessId: { type: 'integer' }
                  }
                }
              }
            }
          },
          400: { description: 'Invalid input' },
          403: { description: 'Forbidden - Admin only' }
        }
      }
    }
  }
};

const swaggerSpec = swaggerDefinition;

export function setupSwagger(app: Express): void {
  // Serve Swagger JSON spec
  app.get('/swagger/swagger.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  // Swagger UI options
  const swaggerUiOptions = {
    explorer: true,
    customCss: `
      .swagger-ui .topbar { display: none }
      .swagger-ui .info { margin: 20px 0; }
      .swagger-ui .info .title { font-size: 2.5em; }
    `,
    customSiteTitle: 'PI Business Hub API Documentation',
    customfavIcon: '/favicon.ico',
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      filter: true,
      showExtensions: true,
      showCommonExtensions: true,
      docExpansion: 'list',
      defaultModelsExpandDepth: 2,
      defaultModelExpandDepth: 2
    }
  };

  // Serve Swagger UI at /swagger/
  app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerUiOptions));
  
  console.log('📚 Swagger documentation available at /swagger/');
}
