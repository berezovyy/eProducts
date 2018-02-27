import { forwardTo } from "prisma-binding";
import { getUserId, Context } from "../utils";

export const Query = {
  products: (parent, args, ctx: Context, info) => {
    getUserId(ctx);
    return forwardTo("db")(parent, args, ctx, info);
  }
};
