import { call, put, takeLatest } from 'redux-saga/effects';
import { createFetchSaga, createMutateSaga } from '@/shared/store/sagaHelpers';
import {
  operatingHoursApi,
  territoriesApi,
  resourcesApi,
  appointmentsApi,
  FieldServiceApi,
} from '@/app/field-service/api-client';
import {
  operatingHoursSlice,
  territoriesSlice,
  resourcesSlice,
  appointmentsSlice,
  assignResourceRequest,
  assignResourceSuccess,
  assignResourceFailure,
} from './fieldServiceSlice';

import {
  OperatingHours,
  ServiceTerritory,
  ServiceResource,
  ServiceAppointment,
} from '@/app/field-service/types';

const fetchOperatingHoursSaga = createFetchSaga<OperatingHours>(
  operatingHoursApi.list,
  operatingHoursSlice.actions.fetchSuccess as any,
  operatingHoursSlice.actions.fetchFailure as any
);
const createOperatingHoursSaga = createMutateSaga<Omit<OperatingHours, 'id'>, OperatingHours>(
  operatingHoursApi.create,
  operatingHoursSlice.actions.createSuccess as any,
  operatingHoursSlice.actions.createFailure as any
);

const fetchTerritoriesSaga = createFetchSaga<ServiceTerritory>(
  territoriesApi.list,
  territoriesSlice.actions.fetchSuccess as any,
  territoriesSlice.actions.fetchFailure as any
);
const createTerritorySaga = createMutateSaga<Omit<ServiceTerritory, 'id'>, ServiceTerritory>(
  territoriesApi.create,
  territoriesSlice.actions.createSuccess as any,
  territoriesSlice.actions.createFailure as any
);

const fetchResourcesSaga = createFetchSaga<ServiceResource>(
  resourcesApi.list,
  resourcesSlice.actions.fetchSuccess as any,
  resourcesSlice.actions.fetchFailure as any
);
const createResourceSaga = createMutateSaga<Omit<ServiceResource, 'id'>, ServiceResource>(
  resourcesApi.create,
  resourcesSlice.actions.createSuccess as any,
  resourcesSlice.actions.createFailure as any
);

const fetchAppointmentsSaga = createFetchSaga<ServiceAppointment>(
  appointmentsApi.list,
  appointmentsSlice.actions.fetchSuccess as any,
  appointmentsSlice.actions.fetchFailure as any
);
const createAppointmentSaga = createMutateSaga<Omit<ServiceAppointment, 'id'>, ServiceAppointment>(
  appointmentsApi.create,
  appointmentsSlice.actions.createSuccess as any,
  appointmentsSlice.actions.createFailure as any
);

function* assignResourceSaga(action: ReturnType<typeof assignResourceRequest>) {
  try {
    yield call([FieldServiceApi, FieldServiceApi.assignResource], action.payload.appointmentId, action.payload.resourceId);
    yield put(assignResourceSuccess());
    yield put(appointmentsSlice.actions.fetchRequest(undefined));
  } catch (e: any) {
    yield put(assignResourceFailure(e.message));
  }
}

export function* fieldServiceSaga() {
  yield takeLatest(operatingHoursSlice.actions.fetchRequest.type as any, fetchOperatingHoursSaga);
  yield takeLatest(operatingHoursSlice.actions.createRequest.type as any, createOperatingHoursSaga);

  yield takeLatest(territoriesSlice.actions.fetchRequest.type as any, fetchTerritoriesSaga);
  yield takeLatest(territoriesSlice.actions.createRequest.type as any, createTerritorySaga);

  yield takeLatest(resourcesSlice.actions.fetchRequest.type as any, fetchResourcesSaga);
  yield takeLatest(resourcesSlice.actions.createRequest.type as any, createResourceSaga);

  yield takeLatest(appointmentsSlice.actions.fetchRequest.type as any, fetchAppointmentsSaga);
  yield takeLatest(appointmentsSlice.actions.createRequest.type as any, createAppointmentSaga);
  yield takeLatest(assignResourceRequest.type as any, assignResourceSaga);
}
