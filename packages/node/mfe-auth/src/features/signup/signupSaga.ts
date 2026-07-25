import { takeLatest } from 'redux-saga/effects';
import { createMutateSaga } from '@/shared/store/sagaHelpers';
import { signupApi, SignupUser } from './api-client';
import {
  createRequest,
  createSuccess,
  createFailure,
} from './signupSlice';

const handleCreateSignup = createMutateSaga<Omit<SignupUser, 'id'>, SignupUser>(
  signupApi.create,
  createSuccess,
  createFailure
);

export function* signupSaga() {
  yield takeLatest(createRequest.type as any, handleCreateSignup);
}
