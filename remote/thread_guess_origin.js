// vim: ts=4 et sts=4 sw=4

import { parse_text } from "./text";
import { send_text, send_confirm, send_locations } from "./actions";
import { place_autocomplete, place_detail } from "./google";
import { set_state, get_state, del_state } from "./state";
import _ from "./l10n";

export async function start(user_id, message) {
    await set_state(user_id, {
        thread_id: "GUESS_ORIGIN",
    });
    return await predict_origin(user_id, message);
}

export async function handle_event(event, state) {
    const { sender: { id: user_id } } = event;
    const { stage_id } = state;

    if (event.message) {
        const { message } = event;
        console.log(">>> Message");
        console.log(JSON.stringify(message));

        switch (stage_id) {
            case "STAGE_USER_RESPOND":
                return await confirm_prediction(user_id, message);
            default:
                return await send_text(user_id, _("generic-error"));
        }
    }

    if (event.postback) {
        return await send_text(user_id, _("unknown-postback"));
    }

    console.error("--- Unknown event: ", event);
}

async function predict_origin(user_id, message) {
    await set_state(user_id, { stage_id: "STAGE_BOT_PREDICT" });

    const [prediction] = await place_autocomplete(message.text);

    if (!prediction) {
        return await reset_search(user_id);
    }

    const { place_id, description } = prediction;

    await set_state(user_id, {
        stage_id: "STAGE_USER_RESPOND",
        place_id
    });

    return await send_confirm(
        user_id, _("thread-guess-confirm", { place: description })
    );
}

async function confirm_prediction(user_id, message) {
    if (message.quick_reply) {
        const { payload } = message.quick_reply;
        switch (payload) {
            case "USER_YES":
                return await search_origin(user_id);
            case "USER_NO":
                return await reset_search(user_id);
            case "USER_CANCEL":
                return await cancel_search(user_id);
            default:
                return await send_confirm(user_id, _("thread-unknown"));
        }
    }

    if (message.text) {
        const command = parse_text(message.text);
        switch (command) {
            case "TEXT_YES":
                return await search_origin(user_id);
            case "TEXT_NO":
                return await reset_search(user_id);
            case "TEXT_CANCEL":
                return await cancel_search(user_id);
            default:
                return await send_confirm(user_id, _("thread-unknown"));
        }
    }

    return await send_confirm(user_id, _("thread-unknown"));
}

async function search_origin(user_id) {
    await set_state(user_id, { stage_id: "STAGE_BOT_SEARCH" });

    const { place_id } = get_state(user_id);
    const detail = await place_detail(place_id);

    if (!detail) {
        await del_state(user_id);
        return await send_text(user_id, _("generic-error"));
    }

    const { geometry: { location } } = detail;

    const origin = {
        latitude: location.lat,
        longitude: location.lng,
    };

    await del_state(user_id);
    return await send_locations(user_id, origin);
}

async function reset_search(user_id) {
    await del_state(user_id);
    return await send_text(user_id, _("thread-guess-try-again"));
}

async function cancel_search(user_id) {
    await del_state(user_id);
    return await send_text(user_id, _("thread-guess-nevermind"));
}
