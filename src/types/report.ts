export type ReportStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface Evidence {
  id: string;
  fileUrl: string;
  reportId: string;
  createdAt: string;
}

export interface Report {
  id: string;
  title: string;
  description: string;
  category: string;
  amountLost: number | null;
  incidentDate: string | null;
  isAnonymous: boolean;
  status: ReportStatus;
  createdAt: string;
  userId: string;
  entityId: string;
  evidence?: Evidence[];
}
