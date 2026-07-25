import { combineReducers } from '@reduxjs/toolkit';
import cryptoReducer from '@/features/crypto/cryptoSlice';

export const rootReducer = combineReducers({
  crypto: cryptoReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
