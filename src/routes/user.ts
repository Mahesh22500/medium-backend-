import "dotenv/config";

import { Hono } from "hono";
import { PrismaClient } from "@prisma/client";
import { sign, verify } from "hono/jwt";
export const userRouter = new Hono();



userRouter.post("/signup", async (c) => {
  const client = new PrismaClient();

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

    const token = await sign({ id: user.id }, process.env.SECRET_KEY || "");

    return c.json({ jwt: token });
  } catch (e) {
    c.status(400);
    return c.json({ message: "Failed to create user" });
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
