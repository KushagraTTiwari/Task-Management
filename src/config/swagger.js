import swaggerJSDoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Task Management API',
      version: '1.0.0',
      description: 'API for managing users, tasks, and subtasks with authentication',
    },
    servers: [
      {
        url: 'http://localhost:8080/',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{ bearerAuth: [] }], // Apply JWT to all routes by default
  },
  apis: ['./routes/*.js', './controllers/*.js'], // Paths to files with JSDoc comments
};

export const swaggerSpec = swaggerJSDoc(options);