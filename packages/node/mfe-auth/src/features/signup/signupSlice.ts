import { createListSlice } from '@/shared/store/createListSlice';
import { SignupUser } from './api-client';

export const signupSlice = createListSlice<SignupUser>('signup');

export const {
  fetchRequest,
  fetchSuccess,
  fetchFailure,
  createRequest,
  createSuccess,
  createFailure,
  updateRequest,
  updateSuccess,
  updateFailure,
  deleteRequest,
  deleteSuccess,
  deleteFailure,
  resetLastAction,
} = signupSlice.actions;

export const selectSignupItems = (state: any) => state.signup.items.data;
export const selectSignupStatus = (state: any) => state.signup.items.status;
export const selectSignupError = (state: any) => state.signup.items.error;
export const selectSignupLastAction = (state: any) => state.signup.lastAction;

export default signupSlice.reducer;
