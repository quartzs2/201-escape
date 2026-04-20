export const ANALYTICS_EVENTS = {
  // 공고 추가 퍼널
  APPLICATION_ADD_OPENED: "application_add_opened",
  APPLICATION_ADD_RESET: "application_add_reset",
  APPLICATION_ADD_SAVED: "application_add_saved",
  APPLICATION_ADD_SUBMITTED: "application_add_submitted",
  APPLICATION_DELETED: "application_deleted",
  // 지원 관리
  APPLICATION_PREVIEW_OPENED: "application_preview_opened",
  APPLICATION_STATUS_CHANGED: "application_status_changed",
  // 지원 목록 UX
  APPLICATIONS_TAB_CHANGED: "applications_tab_changed",
  // 대시보드 UX
  DASHBOARD_TAB_CHANGED: "dashboard_tab_changed",
  // 면접 관리
  INTERVIEW_ADDED: "interview_added",
  INTERVIEW_DELETED: "interview_deleted",
  INTERVIEW_EDITED: "interview_edited",
  // 콘텐츠 편집
  JOB_DESCRIPTION_SAVED: "job_description_saved",
  // 인증
  LOGIN_ATTEMPTED: "login_attempted",
  LOGOUT_CLICKED: "logout_clicked",
  MEMO_SAVED: "memo_saved",
  // 사용자 활성
  USER_ACTIVE: "user_active",
} as const;

export type AnalyticsEvent =
  (typeof ANALYTICS_EVENTS)[keyof typeof ANALYTICS_EVENTS];
