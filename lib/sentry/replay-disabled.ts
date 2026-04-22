type DisabledIntegration = {
  name: string;
};

export function getReplay() {
  return undefined;
}

export function replayCanvasIntegration(): DisabledIntegration {
  return { name: "ReplayCanvasDisabled" };
}

export function replayIntegration(): DisabledIntegration {
  return { name: "ReplayDisabled" };
}
