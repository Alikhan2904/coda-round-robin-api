import express from 'express';
import apiRoutes from './api/routes/apiRoutes.js';

const app = express();
app.use(express.json());
app.use('/api', apiRoutes);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Round Robin API running on port ${PORT}`);
});
