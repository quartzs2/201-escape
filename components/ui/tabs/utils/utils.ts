const getSanitizedValue = (value: string) => {
  return value.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9_-]/g, "");
};

const toHexString = (value: string) => {
  return Array.from(value)
    .map((char) => char.charCodeAt(0).toString(16))
    .join("");
};

const getSafeIdSuffix = (value: string) => {
  const sanitized = getSanitizedValue(value);

  if (sanitized) {
    return sanitized;
  }

  return `u-${toHexString(value)}`;
};

const getTriggerId = (baseId: string, value: string) => {
  return `${baseId}-trigger-${getSafeIdSuffix(value)}`;
};

const getContentId = (baseId: string, value: string) => {
  return `${baseId}-content-${getSafeIdSuffix(value)}`;
};

export { getContentId, getTriggerId };
