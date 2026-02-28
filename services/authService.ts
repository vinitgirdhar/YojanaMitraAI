import { awsconfig } from '../aws-config';

export interface AuthUser {
  userId: string;
  email: string;
  name?: string;
  attributes?: Record<string, string>;
  idToken: string;
  accessToken: string;
}

export interface SignUpParams {
  email: string;
  password: string;
  name: string;
  phone?: string;
}

export interface SignInParams {
  email: string;
  password: string;
}

/**
 * Initialize Cognito connection
 * This will be called once in App.tsx with Amplify.configure()
 */
export function getCognitoConfig() {
  return {
    Auth: {
      Cognito: {
        userPoolId: awsconfig.Auth.Cognito.userPoolId,
        userPoolClientId: awsconfig.Auth.Cognito.userPoolClientId,
        region: awsconfig.Auth.Cognito.region,
        identityPoolId: awsconfig.Auth.Cognito.identityPoolId
      }
    }
  };
}

/**
 * Signs up a new user with email and password
 */
export async function signUp({
  email,
  password,
  name,
  phone
}: SignUpParams): Promise<{ userSub: string; userConfirmed: boolean }> {
  try {
    // This will be implemented using Amplify Auth
    // For now, placeholder implementation
    const response = await fetch(`${getAuthEndpoint()}/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        password,
        name,
        phone,
        userAttributes: {
          email,
          name,
          phone_number: phone
        }
      })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Sign up failed');
    }

    return data;
  } catch (error) {
    console.error('Sign up error:', error);
    throw error;
  }
}

/**
 * Confirms user sign up with verification code
 */
export async function confirmSignUp(
  email: string,
  code: string
): Promise<{ confirmed: boolean }> {
  try {
    const response = await fetch(`${getAuthEndpoint()}/confirm-signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, confirmationCode: code })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Confirmation failed');
    }

    return data;
  } catch (error) {
    console.error('Confirm sign up error:', error);
    throw error;
  }
}

/**
 * Signs in a user with email and password
 */
export async function signIn({
  email,
  password
}: SignInParams): Promise<AuthUser> {
  try {
    const response = await fetch(`${getAuthEndpoint()}/signin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Sign in failed');
    }

    // Store tokens in session storage
    sessionStorage.setItem('authToken', data.accessToken);
    sessionStorage.setItem('idToken', data.idToken);
    sessionStorage.setItem('user', JSON.stringify(data.user));

    return data.user as AuthUser;
  } catch (error) {
    console.error('Sign in error:', error);
    throw error;
  }
}

/**
 * Signs out the current user
 */
export async function signOut(): Promise<void> {
  try {
    await fetch(`${getAuthEndpoint()}/signout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sessionStorage.getItem('authToken')}`
      }
    });

    // Clear tokens from session storage
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('idToken');
    sessionStorage.removeItem('user');
  } catch (error) {
    console.error('Sign out error:', error);
    // Clear tokens anyway
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('idToken');
    sessionStorage.removeItem('user');
    throw error;
  }
}

/**
 * Gets the current authenticated user
 */
export function getCurrentUser(): AuthUser | null {
  try {
    const userStr = sessionStorage.getItem('user');
    if (!userStr) {
      return null;
    }
    return JSON.parse(userStr) as AuthUser;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

/**
 * Gets the current authentication token
 */
export function getAuthToken(): string {
  return sessionStorage.getItem('authToken') || '';
}

/**
 * Checks if user is authenticated
 */
export function isAuthenticated(): boolean {
  return !!sessionStorage.getItem('authToken');
}

/**
 * Initiates password reset
 */
export async function forgotPassword(email: string): Promise<void> {
  try {
    const response = await fetch(`${getAuthEndpoint()}/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Password reset initiation failed');
    }
  } catch (error) {
    console.error('Forgot password error:', error);
    throw error;
  }
}

/**
 * Completes password reset with new password and code
 */
export async function confirmPassword(
  email: string,
  code: string,
  newPassword: string
): Promise<void> {
  try {
    const response = await fetch(`${getAuthEndpoint()}/confirm-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, confirmationCode: code, newPassword })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Password change failed');
    }
  } catch (error) {
    console.error('Confirm password error:', error);
    throw error;
  }
}

/**
 * Changes password for authenticated user
 */
export async function changePassword(
  oldPassword: string,
  newPassword: string
): Promise<void> {
  try {
    const response = await fetch(`${getAuthEndpoint()}/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify({ oldPassword, newPassword })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Password change failed');
    }
  } catch (error) {
    console.error('Change password error:', error);
    throw error;
  }
}

/**
 * Gets the authentication endpoint URL
 */
function getAuthEndpoint(): string {
  return process.env.VITE_AUTH_ENDPOINT || `${awsconfig.API.endpoints[0].endpoint}/auth`;
}

/**
 * Prepares Cognito for Aadhaar federated identity (future Phase 2)
 * This is a placeholder for UIDAI integration
 */
export function initializeAadhaarFederation() {
  console.log('Aadhaar federated identity configuration placeholder');
  console.log('To be implemented in Phase 2 with UIDAI partnership');
  
  // Future implementation will include:
  // 1. Register custom domain with Cognito
  // 2. Configure Aadhaar as identity provider
  // 3. Set up OIDC federation
  // 4. Handle Aadhaar redirect flow
}

/**
 * Verifies a JWT token (client-side validation)
 */
export async function verifyToken(token: string): Promise<boolean> {
  try {
    const response = await fetch(`${getAuthEndpoint()}/verify-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    return response.ok;
  } catch (error) {
    console.error('Token verification error:', error);
    return false;
  }
}

/**
 * Refreshes the access token using the refresh token
 */
export async function refreshAccessToken(): Promise<string> {
  try {
    const response = await fetch(`${getAuthEndpoint()}/refresh-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sessionStorage.getItem('idToken')}`
      }
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Token refresh failed');
    }

    // Update stored token
    sessionStorage.setItem('authToken', data.accessToken);
    return data.accessToken;
  } catch (error) {
    console.error('Token refresh error:', error);
    throw error;
  }
}
