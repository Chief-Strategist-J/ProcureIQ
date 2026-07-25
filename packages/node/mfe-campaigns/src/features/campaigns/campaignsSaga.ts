import { takeLatest } from 'redux-saga/effects';
import { campaignsActions, recipientsActions, schedulesActions } from './campaignsSlice';
import { CampaignsApi, RecipientsApi, SchedulesApi } from '@/app/campaigns/api-client';
import { createSagaHandlers } from '@/shared/store/sagaHelpers';

const campaignsHandlers = createSagaHandlers(campaignsActions, CampaignsApi);
const recipientsHandlers = createSagaHandlers(recipientsActions, RecipientsApi);
const schedulesHandlers = createSagaHandlers(schedulesActions, SchedulesApi);

export function* campaignsSaga() {
  yield takeLatest(campaignsActions.fetchRequest.type as any, campaignsHandlers.fetchSaga);
  yield takeLatest(campaignsActions.createRequest.type as any, campaignsHandlers.createSaga);
  yield takeLatest(campaignsActions.updateRequest.type as any, campaignsHandlers.updateSaga);
  yield takeLatest(campaignsActions.deleteRequest.type as any, campaignsHandlers.deleteSaga);

  yield takeLatest(recipientsActions.fetchRequest.type as any, recipientsHandlers.fetchSaga);
  yield takeLatest(recipientsActions.createRequest.type as any, recipientsHandlers.createSaga);
  yield takeLatest(recipientsActions.updateRequest.type as any, recipientsHandlers.updateSaga);
  yield takeLatest(recipientsActions.deleteRequest.type as any, recipientsHandlers.deleteSaga);

  yield takeLatest(schedulesActions.fetchRequest.type as any, schedulesHandlers.fetchSaga);
  yield takeLatest(schedulesActions.createRequest.type as any, schedulesHandlers.createSaga);
  yield takeLatest(schedulesActions.updateRequest.type as any, schedulesHandlers.updateSaga);
  yield takeLatest(schedulesActions.deleteRequest.type as any, schedulesHandlers.deleteSaga);
}
