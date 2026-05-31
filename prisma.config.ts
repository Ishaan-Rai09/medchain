import "dotenv/config"

import { defineConfig } from "prisma/config"

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env.DATABASE_URL ?? "mongodb+srv://<username>:<password>@<cluster>.mongodb.net/medchain?retryWrites=true&w=majority",
  },
})