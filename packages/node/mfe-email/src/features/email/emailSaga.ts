import { call, put, takeLatest } from 'redux-saga/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import { EmailApi } from '@/app/email/api-client';
import { EmailScheduleResponse, EmailScheduleRequest, EmailSendRequest, EmailResponse } from '@/app/email/types';
import {
  fetchRequest, fetchSuccess, fetchFailure,
  createRequest, createSuccess, createFailure,
  sendRequest, sendSuccess, sendFailure
} from './emailSlice';

function* handleFetchEmails() {
  try {
    const data: EmailScheduleResponse[] = yield call([EmailApi, EmailApi.listScheduled]);
    yield put(fetchSuccess(data));
  } catch (error: any) {
    yield put(fetchFailure(error.message || 'Failed to fetch scheduled emails'));
  }
}

function* handleScheduleEmail(action: PayloadAction<EmailScheduleRequest>) {
  try {
    const data: EmailScheduleResponse = yield call([EmailApi, EmailApi.scheduleEmail], action.payload);
    yield put(createSuccess(data));
  } catch (error: any) {
    yield put(createFailure(error.message || 'Failed to schedule email'));
  }
}

function* handleSendEmail(action: PayloadAction<EmailSendRequest>) {
  try {
    const data: EmailResponse = yield call([EmailApi, EmailApi.sendNow], action.payload);
    yield put(sendSuccess(data.message));
  } catch (error: any) {
    yield put(sendFailure(error.message || 'Failed to send email'));
  }
}

export function* emailSaga() {
  yield takeLatest(fetchRequest.type as any, handleFetchEmails);
  yield takeLatest(createRequest.type as any, handleScheduleEmail);
  yield takeLatest(sendRequest.type as any, handleSendEmail);
}
