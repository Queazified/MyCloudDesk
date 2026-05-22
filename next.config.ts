import path from "node:path";
import type { NextConfig } from "next";

const parseCommaSeparatedEnvVar = (value: string): string[] =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const allowedDevOrigins = parseCommaSeparatedEnvVar(
  process.env.ALLOWED_DEV_ORIGINS ?? "localhost,127.0.0.1",
);

const nextConfig: NextConfig = {
  allowedDevOrigins,
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
