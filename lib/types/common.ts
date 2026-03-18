import { z } from "zod";

export type Brand<K, T> = K & { readonly __brand: T };

/**
 * 빈 문자열과 null을 모두 null로 정규화하는 공용 스키마입니다.
 * applicationNotesSchema, jobDescriptionSchema, interviewLocationSchema 등에서 공유합니다.
 */
export const nullableTextSchema = z
  .string()
  .trim()
  .nullable()
  .transform((value) => {
    if (value === null || value.length === 0) {
      return null;
    }
    return value;
  });
