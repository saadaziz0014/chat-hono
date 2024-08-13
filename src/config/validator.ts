import { z } from "zod";

const userScehema = z.object({
    name: z.string(),
    email: z.string().email(),
    password: z.string().min(6),
})

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string()
})


export { userScehema, loginSchema }