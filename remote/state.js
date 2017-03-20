// vim: ts=4 et sts=4 sw=4

const STATE = new Map();

export function set_state(user_id, state) {
    const prev = STATE.get(user_id);

    if (!prev) {
        return STATE.set(user_id, state);
    }

    return STATE.set(user_id, Object.assign(prev, state));
}

export function get_state(user_id) {
    return STATE.get(user_id);
}

export function del_state(user_id) {
    return STATE.delete(user_id);
}
