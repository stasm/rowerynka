// vim: ts=4 et sts=4 sw=4

import redis from "redis";

export function create_client() {
    return redis.createClient();
}

function call(client, method, ...args) {
    return new Promise(function(resolve, reject) {
        const callback = (err, res) => err ? reject(err) : resolve(res);
        client[method](...args, callback);
    });
}

export function hmset(client, key, obj) {
    return call(client, "hmset", key, obj);
}

export function hgetall(client, key) {
    return call(client, "hgetall", key);
}

export function del(client, key) {
    return call(client, "del", key);
}
