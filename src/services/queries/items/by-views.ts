import { client } from "$services/redis";
import { itemsByViewsKey, itemsKey } from "$services/keys";

export const itemsByViews = async (order: 'DESC' | 'ASC' = 'DESC', offset = 0, count = 10) => {
  const results = await client.sort(
    itemsByViewsKey(),
    {
      GET: [
        '#',
        `${itemsKey('*')}->name`,
        `${itemsKey('*')}->views`
      ],
      BY: 'score'
    }
  );

};
