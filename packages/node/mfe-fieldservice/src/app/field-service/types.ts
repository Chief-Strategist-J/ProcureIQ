export interface OperatingHours {
  id: number;
  name: string;
  timezone: string;
}

export interface ServiceTerritory {
  id: number;
  name: string;
  operatingHoursId: number;
  isActive: boolean;
}

export interface ServiceResource {
  id: number;
  name: string;
  resourceType: "technician" | "crew";
  isActive: boolean;
}

export interface ServiceAppointment {
  id: number;
  parentId: number;
  parentType: "work_order" | "work_order_line_item";
  status: string;
  earliestStartPermitted?: string;
  dueDate?: string;
  arrivalWindowStart?: string;
  arrivalWindowEnd?: string;
  scheduledStart?: string;
  scheduledEnd?: string;
  duration?: number;
  assignedResourceId?: number;
}

export interface AssignedResourceResponse {
  id: number;
  serviceAppointmentId: number;
  serviceResourceId: number;
}
