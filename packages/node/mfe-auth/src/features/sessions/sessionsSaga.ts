import { all, takeLatest } from 'redux-saga/effects';
import { sessionsActions, Session } from './sessionsSlice';
import { createFetchSaga, createMutateSaga } from '@/shared/store/sagaHelpers';
import { sessionsApi } from '@/app/sessions/api-client';

export function* sessionsSaga() {
  yield all([
    takeLatest(
      sessionsActions.fetchRequest,
      createFetchSaga(sessionsApi.list, sessionsActions.fetchSuccess, sessionsActions.fetchFailure)
    ),
    takeLatest(
      sessionsActions.createRequest,
      createMutateSaga(
        sessionsApi.create, 
        sessionsActions.createSuccess, 
        sessionsActions.createFailure
      )
    ),
    takeLatest(
      sessionsActions.updateRequest,
      createMutateSaga(
        (payload: { id: number; data: Omit<Session, 'id'> }) => sessionsApi.update(payload.id, payload.data),
        sessionsActions.updateSuccess,
        sessionsActions.updateFailure
      )
    ),
    takeLatest(
      sessionsActions.deleteRequest,
      createMutateSaga(
        async (id: number) => { await sessionsApi.remove(id); return id; }, 
        sessionsActions.deleteSuccess, 
        sessionsActions.deleteFailure
      )
    ),
  ]);
}
