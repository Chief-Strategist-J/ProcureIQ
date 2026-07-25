import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AsyncState, createAsyncState } from '@/shared/types/asyncState';
import { Job } from '@/app/jobs/api-client';
import { ListUiState, initialListUiState } from '@/shared/store/createListSlice';

export interface JobRun {
  id: number;
  jobId: number;
  status: string;
  startedAt: string;
  completedAt?: string;
  createdAt: string;
}

export interface JobsState {
  jobs: AsyncState<Job[]> & { ui: ListUiState };
  runs: AsyncState<JobRun[]>;
}

const jobsSlice = createSlice({
  name: 'jobs',
  initialState: {
    jobs: {
      ...createAsyncState<Job[]>([]),
      ui: initialListUiState,
    },
    runs: createAsyncState<JobRun[]>([]),
  } as JobsState,
  reducers: {
    setSearchQuery(state, action: PayloadAction<string>) {
      state.jobs.ui.searchQuery = action.payload;
    },
    openModal(state, action: PayloadAction<{ mode?: "create" | "edit"; editingId?: number | null; initialFields?: Record<string, any> }>) {
      state.jobs.ui.isModalOpen = true;
      state.jobs.ui.modalMode = action.payload.mode || "create";
      state.jobs.ui.editingId = action.payload.editingId ?? null;
      if (action.payload.initialFields) {
        state.jobs.ui.formFields = action.payload.initialFields;
      }
    },
    closeModal(state) {
      state.jobs.ui.isModalOpen = false;
      state.jobs.ui.editingId = null;
      state.jobs.ui.formFields = {};
    },
    setFormField(state, action: PayloadAction<{ field: string; value: any }>) {
      state.jobs.ui.formFields[action.payload.field] = action.payload.value;
    },
    fetchJobsRequest(state) {
      state.jobs.status = 'loading';
      state.jobs.error = null;
      state.jobs.lastAction = null;
    },
    fetchJobsSuccess(state, action: PayloadAction<Job[]>) {
      state.jobs.status = 'succeeded';
      state.jobs.data = action.payload;
    },
    fetchJobsFailure(state, action: PayloadAction<string>) {
      state.jobs.status = 'failed';
      state.jobs.error = action.payload;
    },
    createJobRequest(state, _action: PayloadAction<Omit<Job, 'id'>>) {
      state.jobs.status = 'loading';
      state.jobs.error = null;
      state.jobs.lastAction = null;
    },
    createJobSuccess(state, action: PayloadAction<Job>) {
      state.jobs.status = 'succeeded';
      state.jobs.data.push(action.payload);
      state.jobs.lastAction = `Job "${action.payload.name}" created successfully.`;
      state.jobs.ui.isModalOpen = false;
    },
    createJobFailure(state, action: PayloadAction<string>) {
      state.jobs.status = 'failed';
      state.jobs.error = action.payload;
    },
    updateJobRequest(state, _action: PayloadAction<{ id: number; data: Omit<Job, 'id'> }>) {
      state.jobs.status = 'loading';
      state.jobs.error = null;
      state.jobs.lastAction = null;
    },
    updateJobSuccess(state, action: PayloadAction<Job>) {
      state.jobs.status = 'succeeded';
      state.jobs.data = state.jobs.data.map(j => j.id === action.payload.id ? action.payload : j);
      state.jobs.lastAction = `Job "${action.payload.name}" updated.`;
      state.jobs.ui.isModalOpen = false;
    },
    updateJobFailure(state, action: PayloadAction<string>) {
      state.jobs.status = 'failed';
      state.jobs.error = action.payload;
    },
    deleteJobRequest(state, _action: PayloadAction<number>) {
      state.jobs.status = 'loading';
      state.jobs.error = null;
      state.jobs.lastAction = null;
    },
    deleteJobSuccess(state, action: PayloadAction<number>) {
      state.jobs.status = 'succeeded';
      state.jobs.data = state.jobs.data.filter(j => j.id !== action.payload);
      state.jobs.lastAction = 'Job deleted.';
    },
    deleteJobFailure(state, action: PayloadAction<string>) {
      state.jobs.status = 'failed';
      state.jobs.error = action.payload;
    },
    triggerJobRequest(state, _action: PayloadAction<number>) {
      state.runs.status = 'loading';
      state.runs.lastAction = null;
    },
    triggerJobSuccess(state, action: PayloadAction<JobRun>) {
      state.runs.status = 'succeeded';
      state.runs.data.push(action.payload);
      state.runs.lastAction = 'Job run triggered successfully.';
    },
    triggerJobFailure(state, action: PayloadAction<string>) {
      state.runs.status = 'failed';
      state.runs.error = action.payload;
    },
    fetchRunsRequest(state, _action: PayloadAction<number>) {
      state.runs.status = 'loading';
      state.runs.error = null;
    },
    fetchRunsSuccess(state, action: PayloadAction<JobRun[]>) {
      state.runs.status = 'succeeded';
      state.runs.data = action.payload;
    },
    fetchRunsFailure(state, action: PayloadAction<string>) {
      state.runs.status = 'failed';
      state.runs.error = action.payload;
    },
  },
});

export const jobsActions = jobsSlice.actions;
export default jobsSlice.reducer;
