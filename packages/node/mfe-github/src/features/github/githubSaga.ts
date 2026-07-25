import { all, takeLatest, call, put } from 'redux-saga/effects';
import { githubActions } from './githubSlice';
import { GitHubApi } from '@/app/github/api-client';
import { createFetchSaga } from '@/shared/store/sagaHelpers';
import { ActionTemplate, RepoInfo, WorkflowRun, CreateWorkflowResult } from '@/app/github/types';

function* fetchRepoInfoSaga(action: ReturnType<typeof githubActions.repo.fetchRequest>) {
  try {
    const data: RepoInfo = yield call(GitHubApi.getRepoInfo, action.payload.owner, action.payload.repo);
    yield put(githubActions.repo.fetchSuccess(data));
  } catch (e: any) {
    yield put(githubActions.repo.fetchFailure(e.message));
  }
}

function* fetchRunsSaga(action: ReturnType<typeof githubActions.runs.fetchRequest>) {
  try {
    const data: WorkflowRun[] = yield call(GitHubApi.listWorkflowRuns, action.payload.owner, action.payload.repo);
    yield put(githubActions.runs.fetchSuccess(data));
  } catch (e: any) {
    yield put(githubActions.runs.fetchFailure(e.message));
  }
}

function* dispatchOpSaga(action: ReturnType<typeof githubActions.operations.dispatchRequest>) {
  const { owner, repo, eventType, templateId } = action.payload;
  try {
    const message: string = yield call(GitHubApi.dispatch, owner, repo, eventType);
    yield put(githubActions.operations.dispatchSuccess({ message, templateId }));
  } catch (e: any) {
    yield put(githubActions.operations.dispatchFailure({ error: e.message, templateId }));
  }
}

function* deployOpSaga(action: ReturnType<typeof githubActions.operations.deployRequest>) {
  const { owner, repo, template, commitMessage } = action.payload;
  try {
    const result: CreateWorkflowResult = yield call(GitHubApi.deployTemplate, owner, repo, template, commitMessage);
    yield put(githubActions.operations.deploySuccess({ result, templateId: template.id }));
  } catch (e: any) {
    yield put(githubActions.operations.deployFailure({ error: e.message, templateId: template.id }));
  }
}

export function* githubSaga() {
  yield all([
    takeLatest(githubActions.templates.fetchRequest.type as any, createFetchSaga(
      GitHubApi.list, 
      (data: ActionTemplate[]) => githubActions.templates.fetchSuccess(data), 
      (msg: string) => githubActions.templates.fetchFailure(msg)
    )),
    takeLatest(githubActions.repo.fetchRequest.type as any, fetchRepoInfoSaga),
    takeLatest(githubActions.runs.fetchRequest.type as any, fetchRunsSaga),
    takeLatest(githubActions.operations.dispatchRequest.type as any, dispatchOpSaga),
    takeLatest(githubActions.operations.deployRequest.type as any, deployOpSaga),
  ]);
}
