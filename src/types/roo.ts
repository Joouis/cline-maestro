export interface TaskHistoryItem {
  id: string;
  number: number;
  ts: number;
  task: string;
  tokensIn: number;
  tokensOut: number;
  cacheWrites?: number;
  cacheReads?: number;
  totalCost: number;
  size?: number;
  workspace?: string;
}
