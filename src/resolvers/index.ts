import { Query } from "./Query";
import { Subscription } from "./Subscription";
import { auth } from "./Mutation/auth";
import { product } from "./Mutation/product";
import { AuthPayload } from "./AuthPayload";
import { Context } from "../utils";

export default {
  Subscription,
  Query,
  Mutation: {
    ...auth,
    ...product
  },
  AuthPayload
};
