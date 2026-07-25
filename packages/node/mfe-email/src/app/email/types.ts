export interface EmailSendRequest {
  recipients: string[];
  subject: string;
  body: string;
}

export interface EmailScheduleRequest extends EmailSendRequest {
  scheduled_for: string;
}

export interface EmailResponse {
  status: string;
  message: string;
}

export interface EmailScheduleResponse {
  id: number;
  recipients: string[];
  subject: string;
  body: string;
  scheduled_for: string;
  status: string;
  created_at: string;
}
