// Optional example: simple /health route for Express (ESM)
// Place this in your Express app and mount it for warmup probes.

import express from "express";
const router = express.Router();

router.get("/health", async (req, res) => {
  // perform any lightweight readiness checks here (db ping, cache ping, etc.)
  // Keep this as fast as possible to allow quick warmup probes.
  try {
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ success: false });
  }
});

export default router;

/* Usage in your app.js:
import healthExample from './health-example.js';
app.use('/', healthExample);
*/
