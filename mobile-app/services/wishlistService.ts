import { api } from "./api";
import { mapFood } from "./foodService";
import { unwrapCollection, unwrapData } from "../utils/apiHelpers";
import type { Food } from "../types";

export const wishlistService = {
  // Backend returns `{ data: { wishlist: [{ food, ... }] } }`, not a bare Food[].
  list: () =>
    api.get("/wishlist").then((res) => {
      const list = unwrapCollection(res.data, "wishlist");
      return list
        .map((item) => {
          const record = item as { food?: unknown };
          return mapFood(
            record && typeof record === "object" && "food" in record ? record.food : item,
          );
        })
        .filter((food: Food) => Boolean(food.id));
    }),

  add: (foodId: string) =>
    api.post("/wishlist", { foodId }).then((res) => unwrapData(res.data)),

  remove: (foodId: string) =>
    api.delete(`/wishlist/${foodId}`).then((res) => unwrapData(res.data)),
};
