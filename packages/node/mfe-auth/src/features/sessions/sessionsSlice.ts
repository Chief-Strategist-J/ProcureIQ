import { createListSlice } from '@/shared/store/createListSlice';

export interface Session {
  id: number;
  name?: string;
}

const sessionsSlice = createListSlice<Session>('sessions');

export const sessionsActions = sessionsSlice.actions;
export default sessionsSlice.reducer;
