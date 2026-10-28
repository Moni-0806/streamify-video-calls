export const getStreamUserImage = (image) =>
  typeof image === "string" && image && !/^data:/i.test(image)
    ? image
    : undefined;
