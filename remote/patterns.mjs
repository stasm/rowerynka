// vim: ts=4 et sts=4 sw=4

export default {
    yes: /^(tak|ta|t)[.!]*$/i,
    no: /^(nie|ni|n)[.!]*$/i,
    cancel: /^nie ?wa[zż]ne[.!]*$/i,
    thanks: /^dzi[eę][nm]?[kx](i|s|uje|uję)?[.!]*$/i,
    hello: /^(hej|czesc|cześć|ha+lo+)[.!]*$/i,
    help: /^(\?|pomocy?|jak.*działa)[.!?]*$/i,
    start: /^(rozpocznij|start)[.!]*$/i,
};
