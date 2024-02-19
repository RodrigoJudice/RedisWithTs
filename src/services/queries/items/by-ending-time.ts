import { client } from "$services/redis";
import { itemsByEndingAtKey, itemsKey } from "$services/keys";
import { deserialize } from "./deserialize";

export const itemsByEndingTime = async (
	order: 'DESC' | 'ASC' = 'DESC',
	offset = 0,
	count = 10
) => {
  const ids = await client.zRange(itemsByEndingAtKey(),
    Date.now(),
    '+inf',
    {
      BY: 'SCORE',
      LIMIT: { offset, count}
    }
  );

  const result = await Promise.all(ids.map( id =>  client.hGetAll(itemsKey(id))))

  return result.map((item, i) => deserialize(ids[i], item));

};
