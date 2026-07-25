import { createResourceApi } from '@/shared/utils/resourceApi';

export interface SignupUser {
  id: number;
  username: string;
  email: string;
  password?: string;
}

export const signupApi = createResourceApi<SignupUser>({
  endpoints: {
    list: '/api/v1/auth/users',
    create: '/api/v1/auth/signup',
    update: (id) => `/api/v1/auth/users/${id}`,
    delete: (id) => `/api/v1/auth/users/${id}`,
  },
  storageKey: 'signup-users',
  label: 'signup',
  seed: [],
});
