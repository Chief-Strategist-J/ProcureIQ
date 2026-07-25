import { call, put } from 'redux-saga/effects';

export function createFetchSaga<T>(
  fetchFn: () => Promise<T[]>,
  successAction: (data: T[]) => any,
  failureAction: (msg: string) => any
) {
  return function* () {
    try {
      const data: T[] = yield call(fetchFn);
      yield put(successAction(data));
    } catch (e: any) {
      yield put(failureAction(e.message));
    }
  };
}

export function createMutateSaga<TPayload, TResult>(
  mutateFn: (payload: TPayload) => Promise<TResult>,
  successAction: (data: TResult) => any,
  failureAction: (msg: string) => any
) {
  return function* (action: { payload: TPayload }) {
    try {
      const data: TResult = yield call(mutateFn as any, action.payload);
      yield put(successAction(data));
    } catch (e: any) {
      yield put(failureAction(e.message));
    }
  };
}

export function createSagaHandlers<T, A extends { fetchRequest: any, fetchSuccess: any, fetchFailure: any, createRequest: any, createSuccess: any, createFailure: any, updateRequest: any, updateSuccess: any, updateFailure: any, deleteRequest: any, deleteSuccess: any, deleteFailure: any }>(
  actions: A,
  api: any
) {
  return {
    fetchSaga: createFetchSaga(api.list || api.get || api.fetch, actions.fetchSuccess, actions.fetchFailure),
    createSaga: createMutateSaga(api.create || api.post, actions.createSuccess, actions.createFailure),
    updateSaga: createMutateSaga(api.update || api.put, actions.updateSuccess, actions.updateFailure),
    deleteSaga: createMutateSaga(api.delete || api.remove, actions.deleteSuccess, actions.deleteFailure)
  };
}
