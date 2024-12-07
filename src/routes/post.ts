import { Hono } from "hono";
import { PrismaClient } from "@prisma/client";
export const postRouter = new Hono<{
  Variables: {
    authorId: string;
  };
}>();

//CRUD

// get all posts

postRouter.get("/", async (c) => {
  const client = new PrismaClient();

  // console.log("Inside get all posts")
  try {
    const posts = await client.post.findMany(
      {
        select:{
          title:true,
          published:true,
          content:true,
          author:true, 
          category:true,
          id:true 
        }
      }
    );

    return c.json({ posts });
  } catch (err) {
    c.status(400);
    return c.json({ message: "No posts" });
  }
});

// create a post
postRouter.post("/", async (c) => {
  const client = new PrismaClient();
  try {
    const body = await c.req.json();

    const { title, content, published, category } = body;
    const authorId = await c.get("authorId");

    const post = await client.post.create({
      data: {
        title,
        category,
        content,
        published,
        authorId,
      },
    });

    return c.json({ post });
  } catch (err) {
    c.status(400);
    return c.json({ message: "failed to create post" });
  }
});

// get post by id
postRouter.get("/:id", async (c) => {
  const client = new PrismaClient();
  try {
    const { id } = c.req.param();

    const post = await client.post.findFirst({
      where: {
        id,
      },select:{
        title:true,
        published:true,
        content:true,
        author:true, 
        category:true,
        id:true 
      }
    });

    return c.json({ post });
  } catch (err) {
    c.status(400);
    return c.json({ message: "No such post exists" });
  }
});

// update a post
postRouter.put("/:id", async (c) => {
  const client = new PrismaClient();
  try {
    const body = await c.req.json();

    const { id } = c.req.param();

    const { title, content, published, category } = body;
    const authorId = c.get("authorId");

    const post = await client.post.update({
      where: {
        id,
      },
      data: {
        title,
        category,
        content,
        published,
        authorId,
      },
    });

    return c.json({ post });
  } catch (err) {
    c.status(400);
    return c.json({ message: "failed to update post" });
  }
});

// delete a post
postRouter.delete("/:id", async (c) => {
  const client = new PrismaClient();
  const { id } = c.req.param();
  try {
    const post = await client.post.delete({
      where: {
        id,
      },
    });

    return c.json({ message: "post deleted" });
  } catch (err) {
    c.status(400);
    return c.json({ message: "failed to delete post" });
  }
});
