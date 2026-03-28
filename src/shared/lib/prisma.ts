import { PrismaPg } from "@prisma/adapter-pg";
import { config } from "../../app/config/env";


const adapter = new PrismaPg({
    connectionString: config.DATABASE_URL!
})

