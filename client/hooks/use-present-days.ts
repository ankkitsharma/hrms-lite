"use client";

import { useQuery } from "@tanstack/react-query";
import { presentDaysApi } from "@/lib/api";
import type { PresentDaysListParams } from "@/lib/api";

const PRESENT_DAYS_QUERY_KEY = ["present-days"] as const;

const DEFAULT_LIST_PARAMS: PresentDaysListParams = { limit: 10, offset: 0 };

export function usePresentDays(params?: PresentDaysListParams) {
  const listParams = params ?? DEFAULT_LIST_PARAMS;
  return useQuery({
    queryKey: [...PRESENT_DAYS_QUERY_KEY, listParams],
    queryFn: () => presentDaysApi.list(listParams),
  });
}
