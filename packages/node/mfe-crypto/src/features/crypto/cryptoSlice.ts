import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface CryptoState {
  symbol: string;
  currency: string;
  isReminderModalOpen: boolean;
  targetPrice: string;
  dueAt: string;
  channel: string;
  reminderSuccess: string | null;
}

const initialState: CryptoState = {
  symbol: 'BTCUSDT',
  currency: 'USD',
  isReminderModalOpen: false,
  targetPrice: '',
  dueAt: '',
  channel: 'SMS',
  reminderSuccess: null,
};

const cryptoSlice = createSlice({
  name: 'crypto',
  initialState,
  reducers: {
    setSymbol(state, action: PayloadAction<string>) {
      state.symbol = action.payload;
    },
    setCurrency(state, action: PayloadAction<string>) {
      state.currency = action.payload;
    },
    openReminderModal(state) {
      state.isReminderModalOpen = true;
      state.reminderSuccess = null;
    },
    closeReminderModal(state) {
      state.isReminderModalOpen = false;
      state.targetPrice = '';
      state.dueAt = '';
      state.reminderSuccess = null;
    },
    setTargetPrice(state, action: PayloadAction<string>) {
      state.targetPrice = action.payload;
    },
    setDueAt(state, action: PayloadAction<string>) {
      state.dueAt = action.payload;
    },
    setChannel(state, action: PayloadAction<string>) {
      state.channel = action.payload;
    },
    setReminderSuccess(state, action: PayloadAction<string | null>) {
      state.reminderSuccess = action.payload;
    },
  },
});

export const cryptoActions = cryptoSlice.actions;
export default cryptoSlice.reducer;
