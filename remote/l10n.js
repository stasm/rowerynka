// vim: ts=4 et sts=4 sw=4

import "fluent-intl-polyfill";
import { MessageContext } from "fluent";

const cx = new MessageContext("pl");
cx.addMessages(`

[[ Text responses ]]

welcome-new-user =
    Witaj na pokładzie! Prześlij mi swoje położenie,
    a poszukam najbliższego wolnego roweru Veturilo.

hello-user =
    Cześć! Prześlij mi swoją lokalizację, a poszukam
    najbliższego wolnego roweru Veturilo.

help =
    Jestem botem.  Szukam dostępnych rowerów Veturilo.  Użyj przycisku "Wyślij
    lokalizację", żeby zobaczyć, jak działam.


[[ Errors ]]

unknown-message =
    Nie rozumiem.

unknown-attachment =
    Nie rozumiem.

unknown-postback =
    Nie rozumiem.

unknown-quick-reply =
    Nie rozumiem.

generic-error =
    Ups, coś poszło nie tak. Spróbuj ponownie za chwilę.

no-stations-available =
    W pobliżu nie ma żadnych stacji rowerów.

no-bikes-available =
    W pobliżu nie ma żadnych dostępnych rowerów.


[[ Station listing ]]

station-detail =
    { $bikes ->
        [0] Brak wolnych rowerów
        [one] Ostatni wolny rower, { $distance } m
        [few] { $bikes } wolne rowery, { $distance } m
       *[many] { $bikes } wolnych rowerów, { $distance } m
    }

open-map =
    Pokaż trasę

quick-reply-thanks =
    Dzięki

acknowledgement-1 =
    Do usług.

acknowledgement-2 =
    Polecam się.

acknowledgement-3 =
    Spoko.

acknowledgement-4 =
    Żaden kłopot.

acknowledgement-5 =
    Nie ma sprawy.

acknowledgement-6 =
    Nie ma za co.
`);

export default function _(id, args) {
    const msg = cx.messages.get(id);

    if (!msg) {
        return id;
    }

    return cx.format(msg, args).replace("\n", " ");
}
