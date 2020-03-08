// vim: ts=4 et sts=4 sw=4

import { create_client, hmset, hgetall, del } from "./redis.js";

const client = create_client();

export async function set_state(user_id, state) {
    const obj = Object.assign(state, {
        last_ts: (new Date()).toString()
    });
    return await hmset(client, user_id, obj);
}

export async function get_state(user_id) {
    return await hgetall(client, user_id);
}

export async function del_state(user_id) {
    return await del(client, user_id);
}
