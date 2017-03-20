// vim: ts=4 et sts=4 sw=4

import { parse_text } from "./text";
import { send_text, send_confirm, send_locations } from "./actions";
import { place_autocomplete, place_detail } from "./google";
import { set_state, get_state, del_state } from "./state";
import _ from "./l10n";

export async function start(user_id, message) {
    await set_state(user_id, { thread_id: "GUESS_ORIGIN", });
    return await goto("STAGE_BOT_PREDICT", user_id, message);
}

export async function handle_event(event, state) {
    const { sender: { id: user_id } } = event;
    const { stage_id } = state;

    if (event.message) {
        const { message } = event;
        console.log(">>> Message");
        console.log(JSON.stringify(message));

        return await goto(stage_id, user_id, message);
    }

    if (event.postback) {
        return await send_text(user_id, _("unknown-postback"));
    }

    console.error("--- Unknown event: ", event);
}

const stages = {
    STAGE_BOT_PREDICT: async function(user_id, message) {
        const [prediction] = await place_autocomplete(message.text);

        if (!prediction) {
            return await end(user_id, _("thread-guess-try-again"));
        }

        const { place_id, description } = prediction;

        await set_state(user_id, {
            stage_id: "STAGE_USER_RESPOND",
            place_id
        });

        return await send_confirm(
            user_id, _("thread-guess-confirm", { place: description })
        );
    },

    STAGE_USER_RESPOND: async function(user_id, message) {
        if (message.quick_reply) {
            const { payload } = message.quick_reply;
            switch (payload) {
                case "USER_YES":
                    return await goto("STAGE_BOT_SEARCH", user_id);
                case "USER_NO":
                    return await end(user_id, _("thread-guess-try-again"));
                case "USER_CANCEL":
                    return await end(user_id, _("thread-guess-nevermind"));
                default:
                    return await send_confirm(user_id, _("thread-unknown"));
            }
        }

        if (message.text) {
            const command = parse_text(message.text);
            switch (command) {
                case "TEXT_YES":
                    return await goto("STAGE_BOT_SEARCH", user_id);
                case "TEXT_NO":
                    return await end(user_id, _("thread-guess-try-again"));
                case "TEXT_CANCEL":
                    return await end(user_id, _("thread-guess-nevermind"));
                default:
                    return await send_confirm(user_id, _("thread-unknown"));
            }
        }

        return await send_confirm(user_id, _("thread-unknown"));
    },

    STAGE_BOT_SEARCH: async function(user_id) {
        const { place_id } = get_state(user_id);
        const detail = await place_detail(place_id);

        if (!detail) {
            return await end(user_id, _("generic-error"));
        }

        const { geometry: { location } } = detail;

        const origin = {
            latitude: location.lat,
            longitude: location.lng,
        };

        await del_state(user_id);
        return await send_locations(user_id, origin);
    }
};

async function goto(stage_id, user_id, message) {
    await set_state(user_id, { stage_id });
    const fn = stages[stage_id];

    if (fn) {
        return await fn(user_id, message);
    }

    return await send_text(user_id, _("generic-error"));
}

async function end(user_id, text) {
    await del_state(user_id);

    if (text) {
        return await send_text(user_id, text);
    }
}
