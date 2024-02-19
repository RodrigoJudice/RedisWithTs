import type { CreateItemAttrs } from '$services/types';
import { itemsKey, itemsByViewsKey , itemsByEndingAtKey } from '$services/keys';
import { client } from '$services/redis';
import { serialize } from './serialize';
import { deserialize } from './deserialize';
import { genId } from '$services/utils';

export const getItem = async (id: string) => {
	const item = await client.hGetAll(itemsKey(id));
	return deserialize(id, item);
};

export const getItems = async (ids: string[]) => {
	const commands = ids.map((id) => {
		return client.hGetAll(itemsKey(id));
	});
	const results = await Promise.all(commands);
	return results.map((result, i) => deserialize(ids[i], result));
};

export const createItem = async (attrs: CreateItemAttrs, userId: string) => {
	const id = genId();
	const serialized = serialize(attrs);

	//pipeline
	await Promise.all([
		client.hSet(itemsKey(id), serialized),
		client.zAdd(itemsByViewsKey(), {
			value: id,
			score: 0
		}),
		client.zAdd(itemsByEndingAtKey(), {
		  value: id,
		  score: attrs.endingAt.toMillis()
		})
	]);
	return id;
};
