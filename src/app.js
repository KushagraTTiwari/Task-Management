import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger.js';

import connectDB from './config/db.js';
import configVariables from './config/config.js';

import authRoutes from './routes/auth.routes.js';
import taskRoutes from './routes/task.routes.js';

// db connection
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

const PORT = configVariables.PORT;

app.listen(PORT, () => 
    console.log(`Server running on port ${PORT}`)
);