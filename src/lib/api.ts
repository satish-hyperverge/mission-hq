import axios from "axios";
import { ApiResponse } from "./types";

export async function fetchAllData(): Promise<ApiResponse> {
  const { data } = await axios.get<ApiResponse>("/api/data");
  if (!data.success) throw new Error(data.error || "Failed to fetch data");
  return data;
}
