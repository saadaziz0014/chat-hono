import { Hono } from "hono";
import { bearerAuth } from 'hono/bearer-auth'
import { constants } from "../config/constants";
import { verify } from "hono/jwt";

const chat = new Hono();


chat.use(bearerAuth({
    verifyToken: async (token, c) => {
        try {
            let secret = constants?.jwtSecret || 'abcd';
            let verified = await verify(token, secret);
            if (verified) {
                c.set('jwtPayload', verified)
                return true
            }
            return false
        } catch (error) {
            return false
        }
    }
}))

chat.post("/", async (c) => {
    try {
        let user = c.get('jwtPayload');
        let userID = user?.id;
        return c.json({ userID })
    } catch (error: any) {
        return c.json({ error: error.message }, 500)
    }
})


export default chat