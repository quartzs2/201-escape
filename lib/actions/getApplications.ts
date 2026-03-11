"use server";

import type { ApplicationItem } from "@/app/(protected)/dashboard/_components/dashboard-view/types";

import { createClient } from "../supabase/server";

export async function getApplications(): Promise<ApplicationItem[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("applications")
    .select(
      `
      id,
      applied_at,
      status,
      jobs (
        company_name,
        position_title,
        platform
      )
    `,
    )
    .order("applied_at", { ascending: false });

  if (error || !data) {
    return [];
  }

  return data
    .map((row) => {
      const job = Array.isArray(row.jobs) ? row.jobs[0] : row.jobs;

      if (!job) {
        return null;
      }

      return {
        appliedAt: row.applied_at,
        companyName: job.company_name,
        id: row.id,
        platform: job.platform,
        positionTitle: job.position_title,
        status: row.status,
      };
    })
    .filter((item) => item !== null);
}
