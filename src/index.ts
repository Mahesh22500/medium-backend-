import { serve } from "@hono/node-server";
import "dotenv/config";
import { Hono } from "hono";
import { userRouter } from "./routes/user.js";
import { postRouter } from "./routes/post.js";
import { verify } from "hono/jwt";



const app = new Hono<{
  Variables:{
    authorId:string
  }
}>
();

app.use("/post/*", async (c, next) => {
  try {
    const header = c.req.header("Authorization");


    const token = header?.split(" ")[1];


    if(token){
      const res = await verify(token, process.env.SECRET_KEY || "");
    
      if (res.id) {

        c.set('authorId',res.id)
    
        await next();
      }
    }
      

    c.status(403);

    return c.json({ message: "Unauthorized user" });
  } catch (err) {
    return c.json({ message: "Failed to authenticate" });
  }
});

app.route("/post", postRouter);
app.route("/user", userRouter);

const port = parseInt(process.env.PORT || "");

console.log(`Server is running on http://localhost:${port}`);

serve({
  fetch: app.fetch,
  port,
});
