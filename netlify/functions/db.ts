// netlify/functions/db.ts
// This file is adapted to use the shared MongoDB connection utility.
import { getDb } from '../../api/_utils/mongodb';

export default getDb;
