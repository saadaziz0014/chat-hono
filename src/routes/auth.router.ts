import { Hono } from "hono";
import { validator } from 'hono/validator'
import { loginSchema, userScehema } from "../config/validator";
import prismaClient from "../config/prisma";
import bcrypt from 'bcryptjs'
import { UploadService } from "../services/upload";
import { v4 as uuidv4 } from 'uuid'
import { sign } from "hono/jwt";
import { constants } from "../config/constants";


let auth = new Hono();
let uploadService = new UploadService();

auth.post("/register",
    validator('form', (value, c) => {
        const parsed = userScehema.safeParse(value);
        if (!parsed.success) {
            return c.json({ error: parsed.error.issues }, 400)
        }
        return parsed.data
    })
    , async (c) => {
        try {
            let { name, email, password } = c.req.valid('form');
            let data = await prismaClient.user.findUnique({ where: { email: email } });
            if (data) {
                return c.json({ error: "User already exists" }, 400)
            }
            let hashPassword = await bcrypt.hash(password, 10);
            let id = uuidv4();
            let body = await c.req.parseBody();
            let file: File | string = body['file'];
            let fileString = await uploadService.uploadFile(file as File);
            if (fileString == "error") {
                return c.json({ error: "Error uploading file" }, 500)
            }
            let profilePic = fileString != "error" ? fileString : "";
            await prismaClient.user.create({
                data: {
                    id,
                    name,
                    email,
                    password: hashPassword,
                    profilePic: fileString
                }
            })
            let payload = {
                id,
                name,
                email,
                exp: Date.now() + 1000 * 60 * 60 * 24
            }
            let token = await sign(payload, constants?.jwtSecret || 'abcd');
            return c.json({ payload, token })
        } catch (error: any) {
            console.log(error)
            return c.json({ error: error.message }, 500)
        }
    })


auth.post("/login",
    validator('json', (value, c) => {
        const parsed = loginSchema.safeParse(value);
        if (!parsed.success) {
            return c.json({ error: parsed.error.issues }, 400)
        }
        return parsed.data
    })
    , async (c) => {
        try {
            let { email, password } = c.req.valid('json');
            let data = await prismaClient.user.findUnique({ where: { email: email } });
            if (!data) {
                return c.json({ error: "Invalid credentials" }, 400)
            }
            let match = await bcrypt.compare(password, data.password);
            if (!match) {
                return c.json({ error: "Invalid credentials" }, 400)
            }
            let payload = {
                id: data.id,
                name: data.name,
                email: data.email,
                exp: Date.now() + 1000 * 60 * 60 * 24
            }
            let token = await sign(payload, constants?.jwtSecret || 'abcd');
            return c.json({ payload, token })
        } catch (error: any) {
            return c.json({ error: error.message }, 500)
        }
    }

)

export default auth