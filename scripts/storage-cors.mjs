// Lets the /admin page upload videos straight to the "updates" bucket (see presignVideoUpload in api/_lib/storage.js).
// Run once, and again whenever the site moves to a new domain: npm run storage:cors
// Reads NEON_S3_* (or AWS_*) from the environment or .env.local. Prints the rules it set.
import { existsSync, readFileSync } from "node:fs";
import { GetBucketCorsCommand, PutBucketCorsCommand, S3Client } from "@aws-sdk/client-s3";

if (existsSync(".env.local")) {
  for (const line of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*"?([^"]*)"?\s*$/);
    if (match && process.env[match[1]] === undefined) process.env[match[1]] = match[2];
  }
}

// Every origin that serves /admin. Add a custom domain here when there is one.
const ORIGINS = [
  "https://olanrewaju-illias-portfolio.olanrewajuillias.workers.dev",
  "https://*.vercel.app",
  "https://*.netlify.app",
  "http://localhost:8080",
];

const env = process.env;
const endpoint = env.NEON_S3_ENDPOINT || env.AWS_ENDPOINT_URL_S3;
const region = env.NEON_S3_REGION || env.AWS_REGION;
const accessKeyId = env.NEON_S3_ACCESS_KEY_ID || env.AWS_ACCESS_KEY_ID;
const secretAccessKey = env.NEON_S3_SECRET_ACCESS_KEY || env.AWS_SECRET_ACCESS_KEY;
if (!endpoint || !region || !accessKeyId || !secretAccessKey) {
  console.error("Storage credentials are missing (run `neon env pull` first, or set the NEON_S3_* variables).");
  process.exit(1);
}

const s3 = new S3Client({ endpoint, region, forcePathStyle: true, credentials: { accessKeyId, secretAccessKey } });

await s3.send(
  new PutBucketCorsCommand({
    Bucket: "updates",
    CORSConfiguration: {
      CORSRules: [
        // Uploads from /admin.
        { AllowedOrigins: ORIGINS, AllowedMethods: ["PUT"], AllowedHeaders: ["content-type", "cache-control"], MaxAgeSeconds: 3600 },
        // Anyone may read (the bucket is public_read); lets the admin page grab a poster frame from a saved video.
        { AllowedOrigins: ["*"], AllowedMethods: ["GET", "HEAD"], AllowedHeaders: ["*"], MaxAgeSeconds: 3600 },
      ],
    },
  }),
);
const { CORSRules } = await s3.send(new GetBucketCorsCommand({ Bucket: "updates" }));
console.log(JSON.stringify(CORSRules, null, 2));
