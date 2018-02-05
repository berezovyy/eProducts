import * as bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";
import { Context } from "../../utils";

export const auth = {
  async signup(parent, args, ctx: Context, info) {
    const password = await bcrypt.hash(args.password, 10);
    const user = await ctx.db.mutation.createUser({
      data: { ...args, password }
    });

    return {
      token: jwt.sign({ userId: user.id }, process.env.APP_SECRET),
      user
    };
  },

  async login(parent, { email, password }, ctx: Context, info) {
    const user = await ctx.db.query.user({ where: { email } });
    if (!user) {
      return {
        error: {
          field: "email",
          msg: "We didn't find any user with this email."
        }
      };
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return {
        error: {
          field: "email",
          msg: "Invalid password. Please, don't try again."
        }
      };
    }

    return {
      payload: {
        token: jwt.sign({ userId: user.id }, process.env.APP_SECRET),
        user
      }
    };
  }
};
