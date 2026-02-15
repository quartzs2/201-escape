import { BaseAdapter } from "@/lib/adapters/BaseAdapter";
import { ManualAdapter } from "@/lib/adapters/ManualAdapter";
import { SaraminAdapter } from "@/lib/adapters/SaraminAdapter";
import { WantedAdapter } from "@/lib/adapters/WantedAdapter";
import { JobPost } from "@/lib/types/job";

export class AdapterFactory {
  private static adapters: BaseAdapter[] = [
    new WantedAdapter(),
    new SaraminAdapter(),
  ];

  /**
   * URL을 분석하여 적절한 어댑터를 반환합니다.
   * 일치하는 플랫폼이 없으면 ManualAdapter를 반환합니다.
   */
  static getAdapter(url: string): BaseAdapter {
    const adapter = this.adapters.find((a) => a.supports(url));

    return adapter ?? new ManualAdapter();
  }

  static async extractFromUrl(url: string): Promise<JobPost> {
    const adapter = this.getAdapter(url);

    if (adapter instanceof ManualAdapter) {
      return adapter.transform({ url });
    }

    const rawContent = await adapter.fetch(url);
    const transformed = adapter.transform(rawContent);

    if (transformed.url.trim().length === 0) {
      return {
        ...transformed,
        url,
      };
    }

    return transformed;
  }
}
