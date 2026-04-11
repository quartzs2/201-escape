import {
  CalendarRangeIcon,
  ChartSplineIcon,
  FolderKanbanIcon,
  type LucideIcon,
} from "lucide-react";

export type LandingFeature = {
  description: string;
  icon: LucideIcon;
  title: string;
};

export type LandingTimelineItem = {
  detail: string;
  label: string;
  value: string;
};

export type LandingWorkflowStep = {
  description: string;
  id: string;
  title: string;
};

export const landingFeatures: LandingFeature[] = [
  {
    description:
      "지원한 회사와 포지션을 단계별로 정리해 다음 액션이 필요한 항목만 빠르게 확인합니다.",
    icon: FolderKanbanIcon,
    title: "공고를 흐름으로 정리",
  },
  {
    description:
      "면접 일정, 라운드 메모, 준비 포인트를 한 화면에서 이어서 관리할 수 있습니다.",
    icon: CalendarRangeIcon,
    title: "일정을 놓치지 않는 기록",
  },
  {
    description:
      "서류, 면접, 합격까지의 변화를 숫자로 확인해 현재 페이스를 현실적으로 판단합니다.",
    icon: ChartSplineIcon,
    title: "지원 현황을 바로 판단",
  },
];

export const landingTimeline: LandingTimelineItem[] = [
  {
    detail: "이번 주 집중 회사",
    label: "Saved",
    value: "08",
  },
  {
    detail: "제출 완료",
    label: "Applied",
    value: "14",
  },
  {
    detail: "예정된 라운드",
    label: "Interview",
    value: "03",
  },
  {
    detail: "기록 유지",
    label: "Offer",
    value: "01",
  },
];

export const landingWorkflowSteps: LandingWorkflowStep[] = [
  {
    description:
      "링크나 수기 입력으로 공고를 저장하고, 기준이 되는 포지션명과 회사를 바로 남깁니다.",
    id: "01",
    title: "공고를 모은다",
  },
  {
    description:
      "지원 단계가 바뀔 때마다 상태와 메모를 업데이트해 지금 해야 할 일을 명확하게 만듭니다.",
    id: "02",
    title: "변화를 기록한다",
  },
  {
    description:
      "면접 일정과 결과를 이어서 보며 준비 순서와 우선순위를 다시 정리합니다.",
    id: "03",
    title: "다음을 결정한다",
  },
];
