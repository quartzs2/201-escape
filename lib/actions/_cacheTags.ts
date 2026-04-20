export const APPLICATIONS_CACHE_TAG = "applications";

export function getApplicationsCacheTags(userId: string): [string, string] {
  return [APPLICATIONS_CACHE_TAG, userId];
}

export function getApplicationsUserCacheTag(userId: string): string {
  return userId;
}
