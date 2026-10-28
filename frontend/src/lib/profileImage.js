const MAX_UPLOAD_FILE_SIZE = 10 * 1024 * 1024;
const MAX_COMPRESSED_IMAGE_SIZE = 600 * 1024;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export const processProfileImage = async (file) => {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    throw new Error("Choose a JPG, PNG, or WebP image");
  }
  if (file.size > MAX_UPLOAD_FILE_SIZE) {
    throw new Error("Choose an image smaller than 10 MB");
  }

  const imageBitmap = await createImageBitmap(file);
  const scale = Math.min(1, 512 / Math.max(imageBitmap.width, imageBitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(imageBitmap.width * scale));
  canvas.height = Math.max(1, Math.round(imageBitmap.height * scale));

  const context = canvas.getContext("2d");
  if (!context) {
    imageBitmap.close();
    throw new Error("Unable to process this image");
  }

  context.fillStyle = "#fff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(imageBitmap, 0, 0, canvas.width, canvas.height);
  imageBitmap.close();

  for (const quality of [0.85, 0.7, 0.55, 0.4]) {
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
    if (blob && blob.size <= MAX_COMPRESSED_IMAGE_SIZE) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error("Unable to read the processed image"));
        reader.readAsDataURL(blob);
      });
    }
  }

  throw new Error("This image could not be compressed to a suitable size");
};
