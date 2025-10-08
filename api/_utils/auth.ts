// api/_utils/auth.ts
import { verify, JwtHeader, SigningKeyCallback } from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';

const client = jwksClient({
  // This URL is dynamically constructed from environment variables
  // for security and flexibility.
  jwksUri: `https://pictocat-vib.us.auth0.com/.well-known/jwks.json`
});

function getKey(header: JwtHeader, callback: SigningKeyCallback): void {
  if (!header.kid) {
      return callback(new Error("No KID in JWT header"));
  }
  client.getSigningKey(header.kid, (err, key) => {
    if (err) {
      return callback(err);
    }
    const signingKey = key.getPublicKey();
    callback(null, signingKey);
  });
}

// Interface for the decoded token payload
export interface DecodedToken {
  iss: string;
  sub: string;
  aud: string[];
  iat: number;
  exp: number;
  azp: string;
  scope: string;
  email?: string;
  'https://pictocat.netlify.app/roles'?: string[];
}

export const verifyToken = (authorizationHeader?: string): Promise<DecodedToken> => {
  return new Promise((resolve, reject) => {
    if (!authorizationHeader) {
      return reject(new Error('No authorization header provided.'));
    }

    const token = authorizationHeader.split(' ')[1];
    if (!token) {
      return reject(new Error('Bearer token not found.'));
    }
    
    verify(token, getKey, {
      audience: `https://pictocat-vib.us.auth0.com/api/v2/`,
      issuer: `https://pictocat-vib.us.auth0.com/`,
      algorithms: ['RS256']
    }, (err, decoded) => {
      if (err) {
        return reject(err);
      }
      if (!decoded || typeof decoded === 'string') {
          return reject(new Error('Token could not be decoded.'));
      }
      resolve(decoded as DecodedToken);
    });
  });
};