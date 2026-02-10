import { BaseAdapter } from "@/lib/adapters/BaseAdapter";
import { RECRUIT_SITE_URLS } from "@/lib/constants/recruit-sites";
import {
  JobPost,
  JobId,
  MANUAL_JOB_DEFAULTS,
  partialJobPostSchema,
} from "@/lib/types/job";

const manualInputSchema = partialJobPostSchema.omit({ platform: true });

/**
 * 사용자가 직접 입력한 데이터를 처리하는 기본 어댑터
 */
export class ManualAdapter extends BaseAdapter {
  supports(url: string): boolean {
    return url === "" || !RECRUIT_SITE_URLS.some((site) => url.includes(site));
  }

  /**
   * 수동 입력 데이터를 정규화된 규격으로 반환
   */
  override transform(rawContent: unknown): JobPost {
    const parseResult = manualInputSchema.safeParse(rawContent);
    const data = parseResult.success ? parseResult.data : {};

    return {
      id: data.id ? (data.id as JobId) : (crypto.randomUUID() as JobId),
      platform: MANUAL_JOB_DEFAULTS.platform,
      title: data.title ?? MANUAL_JOB_DEFAULTS.title,
      companyName: data.companyName ?? MANUAL_JOB_DEFAULTS.companyName,
      url: data.url ?? MANUAL_JOB_DEFAULTS.url,
      status: data.status ?? MANUAL_JOB_DEFAULTS.status,
      appliedDate: data.appliedDate,
      memo: data.memo,
    };
  }
}
