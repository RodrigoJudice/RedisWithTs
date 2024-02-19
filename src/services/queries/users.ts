import type { CreateUserAttrs } from '$services/types';
import { genId } from '$services/utils';
import { client } from '$services/redis';
import { usersKey, userNamesUniqueKey, usernamesKey } from '$services/keys';

export const getUserByUsername = async (username: string) => {
	// Use the username to look up in username sortedset
	const decimalId = await client.zScore(usernamesKey(), username);

	// Make sure we actually got an ID from the lookup
	if (!decimalId) {
		throw new Error('User does not exist');
	}

	// Take de id and convert it back to hex
	const id = decimalId.toString(16);

	// Use the id to look up the user's hash
	const user = await client.hGetAll(usersKey(id));

	//deserialize and return the hash
	return deserialize(id, user);
};

export const getUserById = async (id: string) => {
	const user = await client.hGetAll(usersKey(id));
	return deserialize(id, user);
};

export const createUser = async (attrs: CreateUserAttrs) => {
	const id = genId();

	const exits = await client.sIsMember(userNamesUniqueKey(), attrs.username);

	if (exits) {
		throw new Error('Username is taken');
	}

	await client.hSet(usersKey(id), serialize(attrs));
	await client.sAdd(userNamesUniqueKey(), attrs.username);
	await client.zAdd(usernamesKey(), {
		value: attrs.username,
		score: parseInt(id, 16) // convert to hex
	});

	return id;
};

const serialize = (user: CreateUserAttrs) => {
	return {
		username: user.username,
		password: user.password
	};
};

const deserialize = (id: string, user: { [key: string]: string }) => {
	return {
		id,
		username: user.username,
		password: user.password
	};
};
