import "dotenv/config";

import { Hono } from "hono";
import { PrismaClient } from "@prisma/client";
import { sign, verify } from "hono/jwt";
export const userRouter = new Hono();



userRouter.post("/signup", async (c) => {
  const client = new PrismaClient();
console.log("inside signup")
  try {
    const body = await c.req.json();
    const { email, name, password } = body;

    

    const user = await client.user.create({
      data: {
        email,
        name,
        password,
      },
    });

    console.log("user added",user)

    console.log("Port",process.env.PORT)
    console.log("secret ",process.env.SECRET_KEY)
    console.log("dbUrl  ",process.env.DATABASE_URL)

    const token = await sign({ id: user.id }, process.env.SECRET_KEY || "");
    console.log("token",token)

    return c.json({ jwt: token });
  } catch (err:any) {
    c.status(400);
    return c.json(err);
  }
});

userRouter.post("/signin", async (c) => {
  const client = new PrismaClient();

  
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

    return c.json({ jwt: token });


  } catch (e) {
    c.status(400);
    return c.json({ message: "Failed to login" });
  }
});
