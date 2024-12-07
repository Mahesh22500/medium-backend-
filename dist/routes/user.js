import "dotenv/config";
import { Hono } from "hono";
import { PrismaClient } from "@prisma/client";
import { sign, verify } from "hono/jwt";
export const userRouter = new Hono();
userRouter.post("/signup", async (c) => {
    const client = new PrismaClient();
    // console.log("inside signup")
    const body = await c.req.json();
    // console.log("body",body)
    try {
        const { email, username, password, firstName, lastName } = body;
        const user = await client.user.create({
            data: {
                email,
                username,
                password,
                firstName,
                lastName
            },
        });
        // console.log("user added",user)
        // console.log("Port",process.env.PORT)
        // console.log("secret ",process.env.SECRET_KEY)
        // console.log("dbUrl  ",process.env.DATABASE_URL)
        const token = await sign({ id: user.id }, process.env.SECRET_KEY || "");
        // console.log("token",token)
        return c.json({ jwt: token, data: user });
    }
    catch (err) {
        c.status(400);
        // console.log("error",err)
        return c.json(err);
    }
});
userRouter.post("/signin", async (c) => {
    const client = new PrismaClient();
    // console.log("Inside signin")
    try {
        const body = await c.req.json();
        const { email, password } = body;
        const user = await client.user.findFirst({
            where: {
                email,
                password,
            },
        });
        if (!user) {
            c.status(400);
            return c.json({ message: "Incorrect credentials" });
        }
        const token = await sign({ id: user.id }, "secret_key");
        return c.json({ jwt: token, data: user });
    }
    catch (e) {
        c.status(400);
        return c.json({ message: "Failed to login" });
    }
});
