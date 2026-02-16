import { type CheerioAPI } from "cheerio";

export type JsonRecord = Record<string, unknown>;

/**
 * 빈 문자열이 아닌 경우에만 문자열을 반환합니다.
 */
export function asNonEmptyString(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmedValue = value.trim();
  if (trimmedValue.length === 0) {
    return undefined;
  }

  return trimmedValue;
}

/**
 * 우선순위가 높은 문자열부터 확인하여 첫 번째로 존재하는 값을 반환합니다.
 */
export function getFirstString(values: Array<string | undefined>): string | undefined {
  for (const value of values) {
    if (value) {
      return value;
    }
  }

  return undefined;
}

/**
 * 여러 셀렉터 중 가장 먼저 매칭되는 텍스트를 가져옵니다.
 */
export function getFirstTextBySelectors(
  $: CheerioAPI,
  selectors: string[],
): string | undefined {
  for (const selector of selectors) {
    const text = asNonEmptyString($(selector).first().text());
    if (text) {
      return text;
    }
  }

  return undefined;
}

/**
 * 메타 태그의 content 속성 값을 가져옵니다.
 */
export function getMetaContent($: CheerioAPI, selector: string): string | undefined {
  return asNonEmptyString($(selector).attr("content"));
}

/**
 * JSON-LD 객체가 'JobPosting' 타입인지 확인합니다.
 */
export function hasJobPostingType(record: JsonRecord): boolean {
  const typeValue = record["@type"];
  if (typeof typeValue === "string") {
    const normalizedType = typeValue.toLowerCase();
    return normalizedType === "jobposting" || normalizedType.endsWith("/jobposting");
  }

  if (Array.isArray(typeValue)) {
    return typeValue.some(
      (typeItem) =>
        typeof typeItem === "string" &&
        (typeItem.toLowerCase() === "jobposting" || typeItem.toLowerCase().endsWith("/jobposting")),
    );
  }

  return false;
}

/**
 * 값이 객체(Record)인지 확인합니다.
 */
export function isJsonRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null;
}

/**
 * HTML 내의 application/ld+json 스크립트에서 JobPosting 정보를 추출합니다.
 */
export function parseJobPostingJsonLd($: CheerioAPI, processor: (item: JsonRecord) => void): void {
  $("script[type='application/ld+json']").each((_, element) => {
    const scriptText = $(element).text();
    const parsedValue = parseJson(scriptText);
    if (!parsedValue) {
      return;
    }

    const queue = Array.isArray(parsedValue) ? parsedValue : [parsedValue];
    for (const item of queue) {
      if (isJsonRecord(item) && hasJobPostingType(item)) {
        processor(item);
      }
    }
  });
}

/**
 * JSON 문자열을 안전하게 파싱합니다.
 */
export function parseJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}
