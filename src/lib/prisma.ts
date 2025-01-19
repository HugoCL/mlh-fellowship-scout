import { PrismaClient } from '@prisma/client'
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { PrismaD1 } from "@prisma/adapter-d1";

let prisma: PrismaClient

declare global {
  var prisma: PrismaClient
}
const adapter = new PrismaD1((await getCloudflareContext()).env['prod-db'])
if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient({ adapter })
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient({ adapter })
  }
  prisma = global.prisma
}

export default prisma