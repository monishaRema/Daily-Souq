

import { defineConfig } from "prisma/config";
import { config } from "./src/app/config/env";

export default defineConfig({
  schema: "prisma/schema/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: config.DATABASE_URL,
  },
});
