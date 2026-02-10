import { BaseAdapter } from "@/lib/adapters/BaseAdapter";
import { RECRUIT_SITE_URLS } from "@/lib/constants/recruit-sites";
import { JobPost, JobId } from "@/lib/types/job";

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
  transform(data: Partial<JobPost>): JobPost {
    return {
      id: data.id ?? (crypto.randomUUID() as JobId),
      platform: "MANUAL",
      title: data.title ?? "제목 없는 공고",
      companyName: data.companyName ?? "회사명 미입력",
      url: data.url ?? "",
      status: data.status ?? "APPLIED",
      appliedDate: data.appliedDate,
      memo: data.memo,
    };
  }
}
