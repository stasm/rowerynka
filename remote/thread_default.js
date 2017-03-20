// vim: ts=4 et sts=4 sw=4

import { get_thread } from "./threads";
import { del_state } from "./state";
import { send_text, send_random_gif, send_locations } from "./actions";
import { random_int } from "./util";
import patterns from "./patterns";
import _ from "./l10n";

export async function handle_event(event) {
    const { sender: { id: user_id } } = event;

    if (event.message) {
        const { message } = event;
        console.log(">>> Message");
        console.log(JSON.stringify(message));

        return await received_message(user_id, message);
    }

    if (event.postback) {
        const { postback } = event;
        console.log(">>> Postback");
        console.log(JSON.stringify(postback));

        return await received_postback(user_id, postback);
    }

    console.error("--- Unknown event: ", event);
}

async function received_message(user_id, message) {
    if (message.quick_reply) {
        const { payload } = message.quick_reply;
        switch (payload) {
            case "USER_THANKS":
                const i = random_int(1, 5);
                return await send_text(user_id, _(`acknowledgement-${i}`));
            default:
                return await send_text(user_id, _("unknown-quick-reply"));
        }
    }

    if (message.text) {
        const { text } = message;

        if (patterns.thanks.test(text)) {
            const i = random_int(1, 5);
            return await send_text(user_id, _(`acknowledgement-${i}`));
        }

        if (patterns.hello.test(text)) {
            return await send_text(user_id, _("hello-user"));
        }

        if (patterns.help.test(text)) {
            return await send_text(user_id, _("help"));
        }

        if (patterns.start.test(text)) {
            return await send_text(user_id, _("welcome-new-user"));
        }

        const thread = get_thread("GUESS_ORIGIN");
        return await thread.start(user_id, message);
    }

    if (message.attachments) {
        const [attachment] = message.attachments;
        switch (attachment.type) {
            case "location": {
                const { lat, long } = attachment.payload.coordinates;
                const origin = {
                    latitude: lat,
                    longitude: long,
                };
                return await send_locations(user_id, origin);
            }
            case "image":
                return await send_random_gif(user_id);
            default:
                return await send_text(user_id, _("unknown-attachment"));
        }
    }
}

async function received_postback(user_id, postback) {
    const { payload } = postback;

    switch (payload) {
        case "USER_GET_STARTED":
            // If something goes wrong the user might have the idea to delete
            // the convesation and start over.  Delete any previous state.
            await del_state(user_id);
            return await send_text(user_id, _("welcome-new-user"));
        default:
            return await send_text(user_id, _("unknown-postback"));
    }
}
