import { BaseAdapter } from "@/lib/adapters/BaseAdapter";
import { RECRUIT_SITE_URLS } from "@/lib/constants/recruit-sites";
import {
  JobPost,
  JobId,
  SARAMIN_JOB_DEFAULTS,
} from "@/lib/types/job";
import { z } from "zod";

export class SaraminAdapter extends BaseAdapter {
  supports(url: string): boolean {
    return url.includes(RECRUIT_SITE_URLS.SARAMIN);
  }

  override transform(rawContent: unknown): JobPost {
    const saraminRawSchema = z.object({
      id: z.union([z.string(), z.number()]).optional(),
      job_id: z.union([z.string(), z.number()]).optional(),
      title: z.string().optional(),
      position_title: z.string().optional(),
      job_title: z.string().optional(),
      company_name: z.string().optional(),
      company: z
        .object({
          name: z.string().optional(),
        })
        .optional(),
      url: z.string().optional(),
      detail_url: z.string().optional(),
      link: z.string().optional(),
    });

    const parsed = saraminRawSchema.safeParse(rawContent);
    const data = parsed.success ? parsed.data : {};

    const id =
      (data.id?.toString() as JobId) ??
      (data.job_id?.toString() as JobId) ??
      (crypto.randomUUID() as JobId);
    const title =
      data.title ??
      data.position_title ??
      data.job_title ??
      SARAMIN_JOB_DEFAULTS.title;
    const companyName =
      data.company_name ??
      data.company?.name ??
      SARAMIN_JOB_DEFAULTS.companyName;
    const url =
      data.url ??
      data.detail_url ??
      data.link ??
      SARAMIN_JOB_DEFAULTS.url;

    return {
      id,
      platform: SARAMIN_JOB_DEFAULTS.platform,
      title,
      companyName,
      url,
      status: SARAMIN_JOB_DEFAULTS.status,
      appliedDate: new Date().toISOString(),
    };
  }
}
