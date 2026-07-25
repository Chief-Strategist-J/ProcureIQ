import { createSlice, PayloadAction, SliceCaseReducers } from '@reduxjs/toolkit';
import { AsyncState, createAsyncState } from '@/shared/types/asyncState';

export interface ListUiState {
  searchQuery: string;
  isModalOpen: boolean;
  modalMode: 'create' | 'edit';
  editingId: number | null;
  formFields: Record<string, any>;
  saving: boolean;
  localError: string;
  successMessage: string;
}

export interface ListState<T> {
  items: AsyncState<T[]>;
  lastAction?: { type: 'create' | 'update' | 'delete'; status: 'success' | 'error'; message?: string };
  ui: ListUiState;
}

export const initialListUiState: ListUiState = {
  searchQuery: '',
  isModalOpen: false,
  modalMode: 'create',
  editingId: null,
  formFields: {},
  saving: false,
  localError: '',
  successMessage: '',
};

export function createListSlice<T>(
  name: string,
  extraReducers?: SliceCaseReducers<ListState<T>>
) {
  return createSlice({
    name,
    initialState: { items: createAsyncState<T[]>([]), ui: initialListUiState } as ListState<T>,
    reducers: {
      setSearchQuery(state, action: PayloadAction<string>) {
        state.ui.searchQuery = action.payload;
      },
      openModal(state, action: PayloadAction<{ mode: 'create' | 'edit'; editingId?: number | null; initialFields?: Record<string, any> }>) {
        state.ui.isModalOpen = true;
        state.ui.modalMode = action.payload.mode;
        state.ui.editingId = action.payload.editingId ?? null;
        state.ui.formFields = action.payload.initialFields || {};
        state.ui.localError = '';
        state.ui.successMessage = '';
      },
      closeModal(state) {
        state.ui.isModalOpen = false;
        state.ui.editingId = null;
        state.ui.formFields = {};
        state.ui.saving = false;
      },
      setFormField(state, action: PayloadAction<{ field: string; value: any }>) {
        state.ui.formFields[action.payload.field] = action.payload.value;
      },
      setFormFields(state, action: PayloadAction<Record<string, any>>) {
        state.ui.formFields = { ...state.ui.formFields, ...action.payload };
      },
      setLocalError(state, action: PayloadAction<string>) {
        state.ui.localError = action.payload;
      },
      setSuccessMessage(state, action: PayloadAction<string>) {
        state.ui.successMessage = action.payload;
      },
      clearMessages(state) {
        state.ui.localError = '';
        state.ui.successMessage = '';
      },
      fetchRequest(state) {
        state.items.status = 'loading';
        state.items.error = null;
      },
      fetchSuccess(state, action: PayloadAction<T[]>) {
        state.items.status = 'succeeded';
        state.items.data = action.payload as any;
      },
      fetchFailure(state, action: PayloadAction<string>) {
        state.items.status = 'failed';
        state.items.error = action.payload;
      },
      createRequest(state, _action: PayloadAction<Omit<T, 'id'>>) {
        state.items.status = 'loading';
        state.ui.saving = true;
        state.lastAction = undefined;
      },
      createSuccess(state, action: PayloadAction<T>) {
        state.items.status = 'succeeded';
        state.ui.saving = false;
        state.ui.isModalOpen = false;
        state.ui.formFields = {};
        (state.items.data as any[]).push(action.payload);
        state.lastAction = { type: 'create', status: 'success' };
        state.ui.successMessage = 'Created successfully.';
      },
      createFailure(state, action: PayloadAction<string>) {
        state.items.status = 'failed';
        state.items.error = action.payload;
        state.ui.saving = false;
        state.ui.localError = action.payload;
        state.lastAction = { type: 'create', status: 'error', message: action.payload };
      },
      updateRequest(state, _action: PayloadAction<{ id: number; data: Omit<T, 'id'> }>) {
        state.items.status = 'loading';
        state.ui.saving = true;
        state.lastAction = undefined;
      },
      updateSuccess(state, action: PayloadAction<T & { id: number }>) {
        state.items.status = 'succeeded';
        state.ui.saving = false;
        state.ui.isModalOpen = false;
        state.ui.formFields = {};
        state.items.data = (state.items.data as any[]).map((item: any) =>
          item.id === action.payload.id ? action.payload : item
        ) as any;
        state.lastAction = { type: 'update', status: 'success' };
        state.ui.successMessage = 'Updated successfully.';
      },
      updateFailure(state, action: PayloadAction<string>) {
        state.items.status = 'failed';
        state.items.error = action.payload;
        state.ui.saving = false;
        state.ui.localError = action.payload;
        state.lastAction = { type: 'update', status: 'error', message: action.payload };
      },
      deleteRequest(state, _action: PayloadAction<number>) {
        state.items.status = 'loading';
        state.lastAction = undefined;
      },
      deleteSuccess(state, action: PayloadAction<number>) {
        state.items.status = 'succeeded';
        state.items.data = (state.items.data as any[]).filter((item: any) => item.id !== action.payload) as any;
        state.lastAction = { type: 'delete', status: 'success' };
        state.ui.successMessage = 'Deleted successfully.';
      },
      deleteFailure(state, action: PayloadAction<string>) {
        state.items.status = 'failed';
        state.items.error = action.payload;
        state.ui.localError = action.payload;
        state.lastAction = { type: 'delete', status: 'error', message: action.payload };
      },
      resetLastAction(state) {
        state.lastAction = undefined;
      },
      ...extraReducers,
    },
  });
}
