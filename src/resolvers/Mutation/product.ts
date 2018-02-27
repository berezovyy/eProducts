import { createWriteStream } from "fs";
import { forwardTo } from "prisma-binding";
import { getUserId, Context } from "../../utils";
import * as shortid from "shortid";

interface ProductData {
  name?: string;
  price?: number;
  pictureUrl?: string;
}

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

const getNewProductsFields = async ({ name, price, picture }) => {
  const data: ProductData = {};
  if (name) {
    data.name = name;
  }
  if (price) {
    data.price = price;
  }
  if (picture) {
    data.pictureUrl = await processUpload(picture);
  }
  return data;
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
    const product = await ctx.db.query.product(
      { where: { id } },
      `{seller: { id}}`
    );

    const userNotOwner = userId !== product.seller.id;
    if (userNotOwner) {
      throw new Error("Not authorized");
    }

    const newProductFields = await getNewProductsFields({
      name,
      price,
      picture
    });

    return ctx.db.mutation.updateProduct(
      {
        data: newProductFields,
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
