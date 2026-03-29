import { prisma } from "../../shared/lib/prisma"

async function getUserByEmail(email:string){
    return await prisma.user.findUnique({
        where:{
           email:email  
        }
    })
}





export const authRepo = () => {
    getUserByEmail
}