import { Report } from "./report";

export type EntityType = "PHONE" | "BANK" | "USERNAME" | "BUSINESS";
export type RiskLevel = "LOW" | "MEDIUM" | "HIGH";

export interface Entity {
  id: string;
  value: string;
  entityType: EntityType;
  trustScore: number;
  totalReports: number;
  riskLevel: RiskLevel;
  createdAt: string;
  reports?: Report[];
}
