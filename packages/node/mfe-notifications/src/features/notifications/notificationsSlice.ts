import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AsyncState, createAsyncState } from '@/shared/types/asyncState';
import { NotificationItem } from '@/app/notifications/api-client';
import { ListUiState, initialListUiState } from '@/shared/store/createListSlice';

export interface NotificationsState {
  notifications: AsyncState<NotificationItem[]> & { ui: ListUiState };
  unreadCount: AsyncState<number>;
}

const initialState: NotificationsState = {
  notifications: {
    ...createAsyncState([]),
    ui: initialListUiState,
  },
  unreadCount: createAsyncState(0),
};

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    setSearchQuery(state, action: PayloadAction<string>) {
      state.notifications.ui.searchQuery = action.payload;
    },
    openModal(state, action: PayloadAction<{ mode?: "create" | "edit"; editingId?: number | null; initialFields?: Record<string, any> }>) {
      state.notifications.ui.isModalOpen = true;
      state.notifications.ui.modalMode = action.payload.mode || "create";
      state.notifications.ui.editingId = action.payload.editingId ?? null;
      if (action.payload.initialFields) {
        state.notifications.ui.formFields = action.payload.initialFields;
      }
    },
    closeModal(state) {
      state.notifications.ui.isModalOpen = false;
      state.notifications.ui.editingId = null;
      state.notifications.ui.formFields = {};
    },
    setFormField(state, action: PayloadAction<{ field: string; value: any }>) {
      state.notifications.ui.formFields[action.payload.field] = action.payload.value;
    },
    setSuccessMessage(state, action: PayloadAction<string>) {
      state.notifications.ui.successMessage = action.payload;
    },
    setLocalError(state, action: PayloadAction<string>) {
      state.notifications.ui.localError = action.payload;
    },
    fetchNotificationsRequest(state, _action: PayloadAction<{ page: number; statusFilter: string }>) {
      state.notifications.status = 'loading';
      state.notifications.error = null;
      state.notifications.lastAction = null;
    },
    fetchNotificationsSuccess(state, action: PayloadAction<any>) {
      state.notifications.status = 'succeeded';
      const payload = action.payload;
      if (Array.isArray(payload)) {
        state.notifications.data = payload;
      } else if (Array.isArray(payload?.notifications)) {
        state.notifications.data = payload.notifications;
      } else if (Array.isArray(payload?.content)) {
        state.notifications.data = payload.content;
      } else {
        state.notifications.data = [];
      }
    },
    fetchNotificationsFailure(state, action: PayloadAction<string>) {
      state.notifications.status = 'failed';
      state.notifications.error = action.payload;
    },
    updateStatusRequest(state, _action: PayloadAction<{ id: number; status: 'READ' | 'UNREAD' }>) {
      const { id, status } = _action.payload;
      if (Array.isArray(state.notifications.data)) {
        const n = state.notifications.data.find(x => x.id === id);
        if (n) n.status = status;
      }
      state.notifications.lastAction = `Marked as ${_action.payload.status.toLowerCase()}.`;
    },
    updateStatusFailure(state, action: PayloadAction<string>) {
      state.notifications.error = action.payload;
    },
    dispatchNotificationRequest(state, _action: PayloadAction<{ userId: number; title: string; message: string; channels: string[] }>) {
      state.notifications.status = 'loading';
      state.notifications.error = null;
      state.notifications.lastAction = null;
    },
    dispatchNotificationSuccess(state) {
      state.notifications.status = 'succeeded';
      state.notifications.lastAction = 'Notification sent successfully!';
      state.notifications.ui.isModalOpen = false;
    },
    dispatchNotificationFailure(state, action: PayloadAction<string>) {
      state.notifications.status = 'failed';
      state.notifications.error = action.payload;
    },
    fetchUnreadCountRequest(state) {
      state.unreadCount.status = 'loading';
    },
    fetchUnreadCountSuccess(state, action: PayloadAction<number>) {
      state.unreadCount.status = 'succeeded';
      state.unreadCount.data = action.payload;
    },
    fetchUnreadCountFailure(state, action: PayloadAction<string>) {
      state.unreadCount.status = 'failed';
      state.unreadCount.error = action.payload;
    },
  },
});

export const notificationsActions = notificationsSlice.actions;
export default notificationsSlice.reducer;
