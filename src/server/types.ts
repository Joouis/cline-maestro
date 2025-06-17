import { RooCodeSettings } from "@roo-code/types";
import { TaskHistoryItem } from "../types/roo";

export interface MessageRequest {
  text: string;
  images?: string[];
  configuration?: RooCodeSettings;
  newTab?: boolean;
}

export interface ActionRequest {
  action: "pressPrimaryButton" | "pressSecondaryButton";
}

export interface FileReadRequest {
  path: string;
}

export interface FileReadResponse {
  path: string;
  content: string;
  encoding: string;
  size: number;
  mimeType: string;
}

export interface TaskHistoryResponse {
  data: TaskHistoryItem[];
}
