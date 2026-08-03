import { createHash } from "crypto";

/**
 * Uploads a single base64 data-URI image to Cloudinary and returns the
 * hosted URL. Returns null if Cloudinary isn't configured or the upload
 * fails — callers should fall back to storing the raw data URI so the
 * feature degrades gracefully instead of breaking device registration.
 *
 * To enable:
 *   1. Sign up free at https://cloudinary.com
 *   2. From the dashboard, copy Cloud name / API Key / API Secret
 *   3. Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET to .env
 *
 * No extra npm package needed — this uses Cloudinary's plain REST upload
 * API with Node's built-in crypto for the signature.
 */
export async function uploadImageToCloudinary(
  dataUri: string,
  folder = "dwp-devices"
): Promise<string | null> {
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;

  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    // eslint-disable-next-line no-console
    console.log("[cloudinary] Not configured — storing image inline instead of uploading.");
    return null;
  }

  try {
    const timestamp = Math.round(Date.now() / 1000);
    const paramsToSign = `folder=${folder}&timestamp=${timestamp}`;
    const signature = createHash("sha1")
      .update(paramsToSign + CLOUDINARY_API_SECRET)
      .digest("hex");

    const form = new FormData();
    form.append("file", dataUri);
    form.append("api_key", CLOUDINARY_API_KEY);
    form.append("timestamp", String(timestamp));
    form.append("signature", signature);
    form.append("folder", folder);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      { method: "POST", body: form }
    );

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      // eslint-disable-next-line no-console
      console.error("[cloudinary] Upload failed:", res.status, errText);
      return null;
    }

    const json = await res.json();
    return json.secure_url ?? null;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("[cloudinary] Upload error:", err);
    return null;
  }
}

/**
 * Uploads every base64 data-URI in the list to Cloudinary, in parallel.
 * Anything that's already a hosted URL (not a data: URI) is passed through
 * unchanged — e.g. when re-saving a device that already has cloud photos.
 * Anything that fails to upload (or Cloudinary isn't configured) falls
 * back to the original data URI rather than being dropped.
 */
export async function uploadImagesToCloudinary(
  dataUris: string[],
  folder = "dwp-devices"
): Promise<string[]> {
  return Promise.all(
    dataUris.map(async (uri) => {
      if (!uri.startsWith("data:")) return uri;
      const url = await uploadImageToCloudinary(uri, folder);
      return url ?? uri;
    })
  );
}

/**
 * Same as uploadImageToCloudinary, but for video files (uses Cloudinary's
 * /video/upload endpoint with resource_type=video).
 */
export async function uploadVideoToCloudinary(
  dataUri: string,
  folder = "dwp-devices"
): Promise<string | null> {
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;

  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    // eslint-disable-next-line no-console
    console.log("[cloudinary] Not configured — storing video inline instead of uploading.");
    return null;
  }

  try {
    const timestamp = Math.round(Date.now() / 1000);
    const paramsToSign = `folder=${folder}&timestamp=${timestamp}`;
    const signature = createHash("sha1")
      .update(paramsToSign + CLOUDINARY_API_SECRET)
      .digest("hex");

    const form = new FormData();
    form.append("file", dataUri);
    form.append("api_key", CLOUDINARY_API_KEY);
    form.append("timestamp", String(timestamp));
    form.append("signature", signature);
    form.append("folder", folder);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/video/upload`,
      { method: "POST", body: form }
    );

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      // eslint-disable-next-line no-console
      console.error("[cloudinary] Video upload failed:", res.status, errText);
      return null;
    }

    const json = await res.json();
    return json.secure_url ?? null;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("[cloudinary] Video upload error:", err);
    return null;
  }
}

/**
 * Uploads every base64 video data-URI in the list to Cloudinary, in parallel.
 * Same pass-through / fallback behavior as uploadImagesToCloudinary.
 */
export async function uploadVideosToCloudinary(
  dataUris: string[],
  folder = "dwp-devices"
): Promise<string[]> {
  return Promise.all(
    dataUris.map(async (uri) => {
      if (!uri.startsWith("data:")) return uri;
      const url = await uploadVideoToCloudinary(uri, folder);
      return url ?? uri;
    })
  );
}