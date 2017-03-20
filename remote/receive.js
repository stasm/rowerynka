// vim: ts=4 et sts=4 sw=4

import { parse_text } from "./text";
import { send_text, send_random_gif, send_locations } from "./actions";
import { guess_origin } from "./google";
import { random_int } from "./util";
import _ from "./l10n";

export default async function handle_event(evt) {
    if (evt.message) {
        return await received_message(evt);
    }

    if (evt.postback) {
        return await received_postback(evt);
    }

    console.error("--- Unknown event: ", evt);
}

async function received_message(event) {
    const { sender: { id: sender_id }, message } = event;

    console.log(">>> Message");
    console.log(JSON.stringify(message));

    if (message.quick_reply) {
        const { payload } = message.quick_reply;
        switch (payload) {
            case "USER_THANKS":
                const i = random_int(1, 5);
                return await send_text(sender_id, _(`acknowledgement-${i}`));
            default:
                return await send_text(sender_id, _("unknown-quick-reply"));
        }
    }

    if (message.text) {
        const command = parse_text(message.text);
        switch (command) {
            case "TEXT_THANKS":
                const i = random_int(1, 5);
                return await send_text(sender_id, _(`acknowledgement-${i}`));
            case "TEXT_HELLO":
                return await send_text(sender_id, _("hello-user"));
            case "TEXT_HELP":
                return await send_text(sender_id, _("help"));
            case "TEXT_START":
                return await send_text(sender_id, _("welcome-new-user"));
            default: {
                const origin = await guess_origin(message.text);

                if (origin) {
                    return await send_locations(sender_id, origin);
                }

                return await send_text(sender_id, _("unknown-message"));
            }
        }
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
                return await send_locations(sender_id, origin);
            }
            case "image":
                return await send_random_gif(sender_id);
            default:
                return await send_text(sender_id, _("unknown-attachment"));
        }
    }
}

async function received_postback(event) {
    const {
        sender: { id: sender_id },
        postback: { payload }
    } = event;

    console.log(">>> Postback");
    console.log(JSON.stringify(payload));

    switch (payload) {
        case "USER_GET_STARTED":
            return await send_text(sender_id, _("welcome-new-user"));
        default:
            return await send_text(sender_id, _("unknown-postback"));
    }
}

