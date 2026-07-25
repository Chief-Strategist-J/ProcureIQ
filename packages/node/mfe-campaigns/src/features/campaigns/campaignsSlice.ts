import { combineReducers } from '@reduxjs/toolkit';
import { createListSlice } from '@/shared/store/createListSlice';
import { Campaign, Recipient, CampaignSchedule } from '@/app/campaigns/api-client';

export const campaignsSlice = createListSlice<Campaign>('campaigns');
export const recipientsSlice = createListSlice<Recipient>('recipients');
export const schedulesSlice = createListSlice<CampaignSchedule>('schedules');

export const campaignsActions = campaignsSlice.actions;
export const recipientsActions = recipientsSlice.actions;
export const schedulesActions = schedulesSlice.actions;

export default combineReducers({
  list: campaignsSlice.reducer,
  recipients: recipientsSlice.reducer,
  schedules: schedulesSlice.reducer,
});
