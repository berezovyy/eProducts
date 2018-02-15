import { createWriteStream } from "fs";
import { forwardTo } from "prisma-binding";
import { getUserId, Context } from "../../utils";
import * as shortid from "shortid";

const storeUpload = async ({ stream, filename }): Promise<any> => {
  const path = `images/${shortid.generate()}`;

  return new Promise((resolve, reject) =>
    stream
      .pipe(createWriteStream(path))
      .on("finish", () => resolve({ path }))
      .on("error", reject)
  );
};

const processUpload = async upload => {
  const { stream, filename, mimetype, encoding } = await upload;
  const { path } = await storeUpload({ stream, filename });
  return path;
};

export const product = {
  deleteProduct: forwardTo("db"),
  async updateProduct(
    parent,
    { id, name, price, picture },
    ctx: Context,
    info
  ) {
    const userId = getUserId(ctx);
    const product = await ctx.db.query.product({ where: { id } });
    if (userId !== product.seller.id) {
      throw new Error("Not authorized");
    }
    const pictureUrl = picture ? await processUpload(picture) : null;
    return ctx.db.mutation.updateProduct(
      {
        data: {
          name,
          price,
          pictureUrl
        },
        where: {
          id
        }
      },
      info
    );
  },
  async createProduct(parent, { name, price, picture }, ctx: Context, info) {
    const userId = getUserId(ctx);
    const pictureUrl = await processUpload(picture);
    return ctx.db.mutation.createProduct(
      {
        data: {
          name,
          price,
          pictureUrl,
          seller: {
            connect: { id: userId }
          }
        }
      },
      info
    );
  }
};
