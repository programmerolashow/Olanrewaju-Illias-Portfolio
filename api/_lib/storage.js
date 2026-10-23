// Photo storage for /updates in the Neon Object Storage bucket "updates" (public_read: anyone can view, only we can write).
// Vercel reserves the AWS_* variable names, so on Vercel set NEON_S3_ACCESS_KEY_ID, NEON_S3_SECRET_ACCESS_KEY,
// NEON_S3_ENDPOINT and NEON_S3_REGION. Locally the AWS_* names from `neon env pull` work too.
import { randomUUID } from "node:crypto";
import { DeleteObjectsCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

const BUCKET = "updates";

const config = () => {
  const env = process.env;
  const endpoint = env.NEON_S3_ENDPOINT || env.AWS_ENDPOINT_URL_S3;
  const accessKeyId = env.NEON_S3_ACCESS_KEY_ID || env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = env.NEON_S3_SECRET_ACCESS_KEY || env.AWS_SECRET_ACCESS_KEY;
  const region = env.NEON_S3_REGION || env.AWS_REGION;
  const missing = Object.entries({
    NEON_S3_ENDPOINT: endpoint,
    NEON_S3_REGION: region,
    NEON_S3_ACCESS_KEY_ID: accessKeyId,
    NEON_S3_SECRET_ACCESS_KEY: secretAccessKey,
  })
    .filter(([, value]) => !value)
    .map(([name]) => name);
  if (missing.length) {
    throw Object.assign(new Error(`Photo storage is not configured. Missing environment variables: ${missing.join(", ")}.`), {
      code: "STORAGE_NOT_CONFIGURED",
    });
  }
  return { endpoint: endpoint.replace(/\/$/, ""), accessKeyId, secretAccessKey, region };
};

let client;
const s3 = () => {
  if (!client) {
    const { endpoint, accessKeyId, secretAccessKey, region } = config();
    // Neon requires path-style addressing.
    client = new S3Client({ endpoint, region, forcePathStyle: true, credentials: { accessKeyId, secretAccessKey } });
  }
  return client;
};

/** Every stored photo URL starts with this, which is how validation tells our photos from anything else. */
export const publicBase = () => `${config().endpoint}/${BUCKET}/`;

const IMAGE_TYPES = {
  "image/webp": "webp",
  "image/jpeg": "jpg",
  "image/png": "png",
};

/** Checks the file's leading bytes, so a renamed non-image can't be stored. */
const looksLike = (type, bytes) => {
  if (type === "image/webp") return bytes.subarray(0, 4).toString() === "RIFF" && bytes.subarray(8, 12).toString() === "WEBP";
  if (type === "image/jpeg") return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (type === "image/png") return bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  return false;
};

export const isAllowedImage = (type, bytes) => Boolean(IMAGE_TYPES[type]) && looksLike(type, bytes);

/** Stores a photo under a fresh key and returns its public URL. Keys are never reused, so it can be cached forever. */
export const putImage = async (bytes, type) => {
  const key = `${new Date().toISOString().slice(0, 7)}/${randomUUID()}.${IMAGE_TYPES[type]}`;
  await s3().send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: bytes,
      ContentType: type,
      CacheControl: "public, max-age=31536000, immutable",
    }),
  );
  return `${publicBase()}${key}`;
};

/** Best effort: a leftover photo costs storage, never correctness, so failures are only logged. */
export const deleteImages = async (urls) => {
  const base = publicBase();
  const keys = urls.filter((u) => u.startsWith(base)).map((u) => u.slice(base.length));
  if (keys.length === 0) return;
  try {
    await s3().send(new DeleteObjectsCommand({ Bucket: BUCKET, Delete: { Objects: keys.map((Key) => ({ Key })) } }));
  } catch (error) {
    console.error("Could not delete images", keys, error);
  }
};
