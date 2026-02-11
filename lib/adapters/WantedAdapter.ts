import { BaseAdapter } from "@/lib/adapters/BaseAdapter";
import { RECRUIT_SITE_URLS } from "@/lib/constants/recruit-sites";
import { JobPost, JobId, WANTED_JOB_DEFAULTS } from "@/lib/types/job";
import { z } from "zod";

export class WantedAdapter extends BaseAdapter {
  supports(url: string): boolean {
    return url.includes(RECRUIT_SITE_URLS.WANTED);
  }

  override transform(rawContent: unknown): JobPost {
    const wantedRawSchema = z.object({
      id: z.union([z.string(), z.number()]).optional(),
      title: z.string().optional(),
      job_title: z.string().optional(),
      company_name: z.string().optional(),
      company: z
        .object({
          name: z.string().optional(),
        })
        .optional(),
      url: z.string().optional(),
    });

    const parsed = wantedRawSchema.safeParse(rawContent);
    const data = parsed.success ? parsed.data : {};

    const id = (data.id?.toString() as JobId) ?? (crypto.randomUUID() as JobId);
    const title = data.title ?? data.job_title ?? WANTED_JOB_DEFAULTS.title;
    const companyName =
      data.company_name ??
      data.company?.name ??
      WANTED_JOB_DEFAULTS.companyName;

    return {
      id,
      platform: WANTED_JOB_DEFAULTS.platform,
      title,
      companyName,
      url: data.url ?? WANTED_JOB_DEFAULTS.url,
      status: WANTED_JOB_DEFAULTS.status,
      appliedDate: new Date().toISOString(),
    };
  }
}
