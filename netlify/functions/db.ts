// netlify/functions/db.ts
import { neon } from '@netlify/neon';

// This automatically uses the NETLIFY_DATABASE_URL environment variable
// provided by the Netlify Neon integration.
const sql = neon();

export default sql;
