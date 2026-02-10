import { JobPost } from "@/lib/types/job";

/**
 * 신규 플랫폼 확장을 위한 기본 클래스
 */
export abstract class BaseAdapter {
  /**
   * 해당 url을 처리할 수 있는 어댑터인지 확인
   */
  abstract supports(url: string): boolean;

  /**
   * 원본 데이터를 JobPost 형식으로 정규화
   */
  abstract transform(rawContent: unknown): JobPost;
}
