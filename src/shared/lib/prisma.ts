import { PrismaPg } from "@prisma/adapter-pg";
import { config } from "../../app/config/env";
import {PrismaClient} from "../../../generated/prisma/client.js"


const adapter = new PrismaPg({
    connectionString: config.DATABASE_URL!
})

export const prisma = new PrismaClient({
    adapter 
})