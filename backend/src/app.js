import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import authRoutes from './routes/auth.routes.js';
import familyRoutes from './routes/family.routes.js';
import personRoutes from './routes/person.routes.js';
import ritualRoutes from './routes/ritual.routes.js';
import documentRoutes from './routes/document.routes.js';


//import routes from './routes/index.js';

const app = express();

// Global middlewares
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use('/api/auth', authRoutes);app.use('/api/family', familyRoutes);
// API routes


app.use('/api/ritual', ritualRoutes);


app.use('/api/document', documentRoutes);

//app.use('/api', routes);
app.use('/api/person', personRoutes);
// Health check
app.get('/', (req, res) => {
  res.send('Rituals World Backend is running');
  
});

export default app;
