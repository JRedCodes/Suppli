import dotenv from 'dotenv';
import { createApp } from './app';

// Load environment variables
dotenv.config({ path: '.env.local' });

const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';

const app = createApp();

app.listen(PORT, () => {
  console.log(`🚀 Suppli API server running on port ${PORT}`);
  console.log(`📦 Environment: ${NODE_ENV}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});
