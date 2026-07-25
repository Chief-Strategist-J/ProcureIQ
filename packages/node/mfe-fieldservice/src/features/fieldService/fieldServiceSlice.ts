import { createAction, combineReducers, PayloadAction } from '@reduxjs/toolkit';
import { createListSlice, ListState } from '@/shared/store/createListSlice';
import { OperatingHours, ServiceTerritory, ServiceResource, ServiceAppointment } from '@/app/field-service/types';

export const operatingHoursSlice = createListSlice<OperatingHours>('operatingHours');
export const territoriesSlice = createListSlice<ServiceTerritory>('territories');
export const resourcesSlice = createListSlice<ServiceResource>('resources');


export const assignResourceRequest = createAction<{ appointmentId: number; resourceId: number }>('appointments/assignResourceRequest');
export const assignResourceSuccess = createAction('appointments/assignResourceSuccess');
export const assignResourceFailure = createAction<string>('appointments/assignResourceFailure');

export const appointmentsSlice = createListSlice<ServiceAppointment>('appointments', {
  assignResourceRequest(state, _action: PayloadAction<{ appointmentId: number; resourceId: number }>) {
    state.items.status = 'loading';
    state.lastAction = undefined;
  },
  assignResourceSuccess(state) {
    state.items.status = 'succeeded';
    state.lastAction = { type: 'update', status: 'success' };
  },
  assignResourceFailure(state, action: PayloadAction<string>) {
    state.items.status = 'failed';
    state.items.error = action.payload;
    state.lastAction = { type: 'update', status: 'error', message: action.payload };
  },
});

export const fieldServiceReducer = combineReducers({
  operatingHours: operatingHoursSlice.reducer,
  territories: territoriesSlice.reducer,
  resources: resourcesSlice.reducer,
  appointments: appointmentsSlice.reducer,
});

export default fieldServiceReducer;
