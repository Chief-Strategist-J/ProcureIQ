import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { ListState, createListSlice } from '@/shared/store/createListSlice';
import { EmailScheduleResponse, EmailSendRequest } from '@/app/email/types';
import { AsyncState, createAsyncState } from '@/shared/types/asyncState';

export interface EmailState extends ListState<EmailScheduleResponse> {
  sendState: AsyncState<null>;
}

const baseSlice = createListSlice<EmailScheduleResponse>('email');

export const emailSlice = createSlice({
  name: 'email',
  initialState: {
    ...baseSlice.getInitialState(),
    sendState: createAsyncState<null>(null),
  } as EmailState,
  reducers: {
    ...baseSlice.caseReducers,
    sendRequest(state: EmailState, _action: PayloadAction<EmailSendRequest>) {
      state.sendState.status = 'loading';
      state.sendState.error = null;
    },
    sendSuccess(state: EmailState, action: PayloadAction<string>) {
      state.sendState.status = 'succeeded';
      state.sendState.error = null;
      state.lastAction = { type: 'create', status: 'success', message: action.payload };
    },
    sendFailure(state: EmailState, action: PayloadAction<string>) {
      state.sendState.status = 'failed';
      state.sendState.error = action.payload;
      state.lastAction = { type: 'create', status: 'error', message: action.payload };
    },
    resetSendState(state: EmailState) {
      state.sendState.status = 'idle';
      state.sendState.error = null;
      state.lastAction = undefined;
    }
  },
});

export const {
  fetchRequest, fetchSuccess, fetchFailure,
  createRequest, createSuccess, createFailure,
  updateRequest, updateSuccess, updateFailure,
  deleteRequest, deleteSuccess, deleteFailure,
  resetLastAction,
  sendRequest, sendSuccess, sendFailure, resetSendState
} = emailSlice.actions;

export const selectEmailState = (state: { email: EmailState }) => state.email;
export const selectEmailItems = (state: { email: EmailState }) => state.email.items;
export const selectEmailSendState = (state: { email: EmailState }) => state.email.sendState;

export default emailSlice.reducer;
