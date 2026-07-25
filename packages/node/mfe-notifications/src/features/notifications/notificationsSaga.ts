import { call, put, takeLatest } from 'redux-saga/effects';
import { notificationsActions } from './notificationsSlice';
import { NotificationsApi } from '@/app/notifications/api-client';

function* fetchNotificationsSaga(action: ReturnType<typeof notificationsActions.fetchNotificationsRequest>) {
  try {
    const data: Awaited<ReturnType<typeof NotificationsApi.listNotifications>> = yield call(
      NotificationsApi.listNotifications,
      action.payload.page,
      action.payload.statusFilter
    );
    yield put(notificationsActions.fetchNotificationsSuccess(data));
  } catch (e: any) {
    yield put(notificationsActions.fetchNotificationsFailure(e.message));
  }
}

function* updateStatusSaga(action: ReturnType<typeof notificationsActions.updateStatusRequest>) {
  try {
    yield call(NotificationsApi.updateStatus, action.payload.id, action.payload.status);
  } catch (e: any) {
    yield put(notificationsActions.updateStatusFailure(e.message));
  }
}

function* dispatchNotificationSaga(action: ReturnType<typeof notificationsActions.dispatchNotificationRequest>) {
  try {
    yield call(
      NotificationsApi.dispatch,
      action.payload.userId,
      action.payload.title,
      action.payload.message,
      action.payload.channels
    );
    yield put(notificationsActions.dispatchNotificationSuccess());
  } catch (e: any) {
    yield put(notificationsActions.dispatchNotificationFailure(e.message));
  }
}

export function* notificationsSaga() {
  yield takeLatest(notificationsActions.fetchNotificationsRequest.type as any, fetchNotificationsSaga);
  yield takeLatest(notificationsActions.updateStatusRequest.type as any, updateStatusSaga);
  yield takeLatest(notificationsActions.dispatchNotificationRequest.type as any, dispatchNotificationSaga);
}
