import { call, put, takeLatest } from 'redux-saga/effects';
import { jobsActions, JobRun } from './jobsSlice';
import { JobsApi } from '@/app/jobs/api-client';

function* fetchJobsSaga() {
  try {
    const data: Awaited<ReturnType<typeof JobsApi.listJobs>> = yield call([JobsApi, JobsApi.listJobs]);
    yield put(jobsActions.fetchJobsSuccess(data));
  } catch (e: any) {
    yield put(jobsActions.fetchJobsFailure(e.message));
  }
}

function* createJobSaga(action: ReturnType<typeof jobsActions.createJobRequest>) {
  try {
    const data: Awaited<ReturnType<typeof JobsApi.createJob>> = yield call([JobsApi, JobsApi.createJob], action.payload);
    yield put(jobsActions.createJobSuccess(data));
  } catch (e: any) {
    yield put(jobsActions.createJobFailure(e.message));
  }
}

function* updateJobSaga(action: ReturnType<typeof jobsActions.updateJobRequest>) {
  try {
    const data: Awaited<ReturnType<typeof JobsApi.updateJob>> = yield call([JobsApi, JobsApi.updateJob], action.payload.id, action.payload.data);
    yield put(jobsActions.updateJobSuccess(data));
  } catch (e: any) {
    yield put(jobsActions.updateJobFailure(e.message));
  }
}

function* deleteJobSaga(action: ReturnType<typeof jobsActions.deleteJobRequest>) {
  try {
    yield call([JobsApi, JobsApi.deleteJob], action.payload);
    yield put(jobsActions.deleteJobSuccess(action.payload));
  } catch (e: any) {
    yield put(jobsActions.deleteJobFailure(e.message));
  }
}

function* triggerJobSaga(action: ReturnType<typeof jobsActions.triggerJobRequest>) {
  try {
    const run: JobRun = yield call([JobsApi, JobsApi.triggerRun], Number(action.payload));
    yield put(jobsActions.triggerJobSuccess(run));
  } catch (e: any) {
    yield put(jobsActions.triggerJobFailure(e.message));
  }
}

function* fetchRunsSaga(action: ReturnType<typeof jobsActions.fetchRunsRequest>) {
  try {
    const runs: JobRun[] = yield call([JobsApi, JobsApi.listRuns], action.payload);
    yield put(jobsActions.fetchRunsSuccess(runs));
  } catch (e: any) {
    yield put(jobsActions.fetchRunsFailure(e.message));
  }
}

export function* jobsSaga() {
  yield takeLatest(jobsActions.fetchJobsRequest.type as any, fetchJobsSaga);
  yield takeLatest(jobsActions.createJobRequest.type as any, createJobSaga);
  yield takeLatest(jobsActions.updateJobRequest.type as any, updateJobSaga);
  yield takeLatest(jobsActions.deleteJobRequest.type as any, deleteJobSaga);
  yield takeLatest(jobsActions.triggerJobRequest.type as any, triggerJobSaga);
  yield takeLatest(jobsActions.fetchRunsRequest.type as any, fetchRunsSaga);
}
