export interface Campaign {
  id: number;
  orgId: number;
  name: string;
  status: string;
}

export interface Recipient {
  id: number;
  accountId: number;
  name: string;
  email?: string;
  phone?: string;
}

export interface CampaignSchedule {
  id: number;
  orgId: number;
  campaignId?: number;
  contactId: number;
  templateId?: number;
  scheduledAt: string;
  status?: string;
}
