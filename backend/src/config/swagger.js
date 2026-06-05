import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'CareTrack Clinic API',
      version: '1.0.0',
      description: 'API documentation for the CareTrack Clinic Medical Record Management System',
    },
    servers: [
      {
        url: process.env.API_URL || process.env.RENDER_EXTERNAL_URL || 'http://localhost:5000',
        description: 'Production / Current Host',
      },
      {
        url: 'http://localhost:5000',
        description: 'Local Development Server',
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
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.js', './src/controllers/*.js'], // Path to the API docs
};

const specs = swaggerJsdoc(options);

export const setupSwagger = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
  const port = process.env.PORT || 5000;
  console.log(`Swagger docs available at http://localhost:${port}/api-docs`);
};
