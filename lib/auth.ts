import {
  adminLogin as loginRequest,
  adminLogout as logoutRequest,
  getAdminSession,
} from './api';

export interface AdminUser {
  id: string;
  email: string;
  name: string;
}

export async function adminLogin(
  email: string,
  password: string,
): Promise<{ user: AdminUser | null; error: string | null }> {
  try {
    const { user } = await loginRequest(email, password);
    return { user, error: null };
  } catch (error) {
    return { user: null, error: error instanceof Error ? error.message : 'Login failed' };
  }
}

export async function adminLogout() {
  try {
    await logoutRequest();
  } catch (error) {
    console.error('Failed to logout admin', error);
  }
}

export async function getSession() {
  try {
    const { user } = await getAdminSession();
    return user;
  } catch (error) {
    console.error('Failed to fetch admin session', error);
    return null;
  }
}
