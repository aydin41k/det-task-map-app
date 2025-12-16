import dotenv from 'dotenv';
dotenv.config();
import app from './app';
import { initDB } from './database';

const PORT = process.env.PORT || 3000;

initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});