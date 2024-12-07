import { serve } from "@hono/node-server";
import "dotenv/config";
import { Hono } from "hono";
import { postRouter } from "./routes/post.js";
import { userRouter } from "./routes/user.js";
import { verify } from "hono/jwt";
import { cors } from "hono/cors";
const app = new Hono();
app.get("/test", (c) => {
    return c.text("server is running");
});
app.use(cors());
app.use("/post/*", async (c, next) => {
    // console.log("Inside authenticate")
    try {
        const header = c.req.header("Authorization");
        // console.log("header",header);
        const token = header?.split(" ")[1];
        // console.log("token:",token);
        if (token) {
            const res = await verify(token, process.env.SECRET_KEY || "");
            if (res.id) {
                c.set('authorId', res.id.toString());
                await next();
            }
        }
        c.status(403);
        return c.json({ message: "Unauthorized user" });
    }
    catch (err) {
        return c.json({ message: "Failed to authenticate" });
    }
});
app.route("/post", postRouter);
app.route("/user", userRouter);
const port = parseInt(process.env.PORT || "");
// console.log(`Server is running on http://localhost:${port}`);
serve({
    fetch: app.fetch,
    port,
});
