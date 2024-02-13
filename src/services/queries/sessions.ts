import type { Session } from '$services/types';
import { sessionsKey } from '$services/keys';
import { client } from '$services/redis';

export const getSession = async (id: string) => {
	const session = await client.hGetAll(sessionsKey(id));

	return deserialize(id, session);
};

export const saveSession = async (session: Session) => {
	await client.hSet(sessionsKey(session.id), serialize(session));
};

const serialize = (session: Session) => {
	return {
		userId: session.userId,
		username: session.username
	};
};

const deserialize = (id: string, session: { [key: string]: string }) => {
	if (Object.keys(session).length === 0) {
		return null;
	}

	return {
		id,
		userId: session.userId,
		usernane: session.username
	};
};
