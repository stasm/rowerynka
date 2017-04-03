// vim: ts=4 et sts=4 sw=4

import { get_json, post_json } from "./util";

const { MESSENGER_API_URL, MESSENGER_PAGE_ACCESS_TOKEN } = process.env;

export async function send(message) {
    const url = `${MESSENGER_API_URL}/me/messages`;
    const query = { access_token: MESSENGER_PAGE_ACCESS_TOKEN };

    try {
        var {
            recipient_id, message_id
        } = await post_json(url, query, message);
    } catch (err) {
        return console.error("Sending failed: ", err.message);
    }

    return { recipient_id, message_id };
}

export async function get_user_profile(user_id) {
    const url = `${MESSENGER_API_URL}/${user_id}`;
    const query = {
        fields: ["gender"].join(","),
        access_token: MESSENGER_PAGE_ACCESS_TOKEN
    };

    try {
        var { gender = "other" } = await get_json(url, query);
    } catch (err) {
        return console.error("Getting user profile failed: ", err.message);
    }

    return { user_id, gender };
}
