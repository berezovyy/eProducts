import { Context } from "../utils";

export const Subscription = {
  product: {
    subscribe: async (parent, args, ctx: Context, info) =>
      ctx.db.subscription.product({}, info)
  }
};
