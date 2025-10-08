// netlify/functions/create-profile.ts
// This function is deprecated and its functionality has been moved to the
// `identity-signup.ts` webhook for better reliability.
// This file can be safely deleted after deploying the new webhook.
import { Handler } from '@netlify/functions';

export const handler: Handler = async () => {
  return {
    statusCode: 410, // Gone
    body: JSON.stringify({ message: 'This endpoint is deprecated. User profiles are now created automatically on signup.' }),
  };
};
