import axios from "axios";
import { ApiResponse } from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

export async function fetchAllData(): Promise<ApiResponse> {
  if (!API_BASE) throw new Error("API URL not configured. Set NEXT_PUBLIC_API_URL in .env.local");
  const { data } = await axios.get<ApiResponse>(API_BASE, {
    params: { action: "all" },
  });
  if (!data.success) throw new Error("Failed to fetch data");
  return data;
}
