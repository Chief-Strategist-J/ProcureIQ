import { combineReducers, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { createListSlice } from '@/shared/store/createListSlice';
import { ActionTemplate, RepoInfo, WorkflowRun, CreateWorkflowResult } from '@/app/github/types';
import { createAsyncState } from '@/shared/types/asyncState';

export const templatesSlice = createListSlice<ActionTemplate>('github/templates');

export const repoSlice = createSlice({
  name: 'github/repo',
  initialState: createAsyncState<RepoInfo | null>(null),
  reducers: {
    fetchRequest(state, _action: PayloadAction<{ owner: string; repo: string }>) {
      state.status = 'loading';
      state.error = null;
    },
    fetchSuccess(state, action: PayloadAction<RepoInfo>) {
      state.status = 'succeeded';
      state.data = action.payload;
    },
    fetchFailure(state, action: PayloadAction<string>) {
      state.status = 'failed';
      state.error = action.payload;
    }
  }
});

export const runsSlice = createSlice({
  name: 'github/runs',
  initialState: createAsyncState<WorkflowRun[]>([]),
  reducers: {
    fetchRequest(state, _action: PayloadAction<{ owner: string; repo: string }>) {
      state.status = 'loading';
      state.error = null;
    },
    fetchSuccess(state, action: PayloadAction<WorkflowRun[]>) {
      state.status = 'succeeded';
      state.data = action.payload;
    },
    fetchFailure(state, action: PayloadAction<string>) {
      state.status = 'failed';
      state.error = action.payload;
    }
  }
});

export const operationsSlice = createSlice({
  name: 'github/operations',
  initialState: {
    dispatch: createAsyncState<{ message: string; templateId: number } | null>(null),
    deploy: createAsyncState<{ result: CreateWorkflowResult; templateId: number } | null>(null),
  },
  reducers: {
    dispatchRequest(state, _action: PayloadAction<{ owner: string; repo: string; eventType: string; templateId: number }>) {
      state.dispatch.status = 'loading';
      state.dispatch.error = null;
    },
    dispatchSuccess(state, action: PayloadAction<{ message: string; templateId: number }>) {
      state.dispatch.status = 'succeeded';
      state.dispatch.data = action.payload;
    },
    dispatchFailure(state, action: PayloadAction<{ error: string; templateId: number }>) {
      state.dispatch.status = 'failed';
      state.dispatch.error = action.payload.error;
    },
    deployRequest(state, _action: PayloadAction<{ owner: string; repo: string; template: ActionTemplate; commitMessage?: string }>) {
      state.deploy.status = 'loading';
      state.deploy.error = null;
    },
    deploySuccess(state, action: PayloadAction<{ result: CreateWorkflowResult; templateId: number }>) {
      state.deploy.status = 'succeeded';
      state.deploy.data = action.payload;
    },
    deployFailure(state, action: PayloadAction<{ error: string; templateId: number }>) {
      state.deploy.status = 'failed';
      state.deploy.error = action.payload.error;
    },
  }
});

const githubReducer = combineReducers({
  templates: templatesSlice.reducer,
  repoInfo: repoSlice.reducer,
  runs: runsSlice.reducer,
  operations: operationsSlice.reducer,
});

export const githubActions = {
  templates: templatesSlice.actions,
  repo: repoSlice.actions,
  runs: runsSlice.actions,
  operations: operationsSlice.actions,
};

export default githubReducer;
