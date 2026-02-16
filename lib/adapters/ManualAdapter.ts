import { BaseAdapter } from "@/lib/adapters/BaseAdapter";
import { RECRUIT_SITE_URL_LIST } from "@/lib/constants/recruit-sites";
import {
  JobId,
  JobPost,
  MANUAL_JOB_DEFAULTS,
  partialJobPostSchema,
} from "@/lib/types/job";

/**
 * 수동 입력 시 플랫폼 필드를 제외한 스키마
 */
const manualInputSchema = partialJobPostSchema.omit({ platform: true });

/**
 * 사용자가 직접 입력한 데이터를 처리하는 어댑터
 */
export class ManualAdapter extends BaseAdapter {
  async fetch(): Promise<unknown> {
    throw new Error("Manual adapter does not support URL extraction.");
  }

  supports(url: string): boolean {
    const isExternalSite = RECRUIT_SITE_URL_LIST.some((site) => {
      return url.includes(site);
    });

    return url === "" || !isExternalSite;
  }

  /**
   * 수동 입력 데이터를 정규화된 규격으로 반환
   */
  override transform(rawContent: unknown): JobPost {
    const parsed = manualInputSchema.safeParse(rawContent);
    const data = parsed.success ? parsed.data : {};

    return {
      appliedDate: data.appliedDate,
      companyName: data.companyName ?? MANUAL_JOB_DEFAULTS.companyName,
      id: (data.id as JobId) ?? (crypto.randomUUID() as JobId),
      memo: data.memo,
      platform: MANUAL_JOB_DEFAULTS.platform,
      status: data.status ?? MANUAL_JOB_DEFAULTS.status,
      title: data.title ?? MANUAL_JOB_DEFAULTS.title,
      url: data.url ?? MANUAL_JOB_DEFAULTS.url,
    };
  }
}
