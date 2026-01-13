// Load environment variables FIRST using require (executes immediately, not hoisted)
// eslint-disable-next-line @typescript-eslint/no-require-imports
require('dotenv').config({ path: '.env.local' });

// Now import app (environment variables are already loaded)
import { createApp } from './app';

const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';

const app = createApp();

app.listen(PORT, () => {
  console.log(`🚀 Suppli API server running on port ${PORT}`);
  console.log(`📦 Environment: ${NODE_ENV}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});
