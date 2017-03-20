// vim: ts=4 et sts=4 sw=4

import { post_json } from "./util";

const { MESSENGER_API_URL, MESSENGER_PAGE_ACCESS_TOKEN } = process.env;

export async function send(message) {
    const query = { access_token: MESSENGER_PAGE_ACCESS_TOKEN };

    try {
        var {
            recipient_id, message_id
        } = await post_json(MESSENGER_API_URL, query, message);
    } catch (err) {
        return console.error("Sending failed: ", err.message);
    }

    return { recipient_id, message_id };
}
