import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
//import routes from './routes/index.js';

const app = express();

// Global middlewares
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// API routes
//app.use('/api', routes);

// Health check
app.get('/', (req, res) => {
  res.send('Rituals World Backend is running');
  
});

export default app;
