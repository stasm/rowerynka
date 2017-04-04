// vim: ts=4 et sts=4 sw=4

import "fluent-intl-polyfill";
import { MessageContext } from "fluent";

const re_newlines = /\r?\n|\r/g;

const cx = new MessageContext("pl");
cx.addMessages(`

[[ Text responses ]]

welcome-new-user =
    Witaj na pokładzie! Aby znaleźć najbliższy wolny rower miejski, wciśnij
    guzik "Wyślij lokalizację".

hello-user =
    Cześć! Aby znaleźć najbliższy wolny rower miejski, wciśnij guzik "Wyślij
    lokalizację".

help =
    Użyj przycisku "Wyślij lokalizację", żeby rozpocząć szukanie rowerów
    miejskich w Twojej okolicy. Możesz też wpisać nazwę ulicy lub miejsca
    — spróbuję znaleźć pasujący adres.


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


[[ Threads ]]

thread-yes = Tak
thread-no = Nie
thread-cancel = Nieważne

thread-unknown =
    Nie rozumiem.

thread-guess-confirm =
    { $gender ->
        [male] Czy miałeś na myśli { $place }?
        [female] Czy miałaś na myśli { $place }?
       *[other] Czy chodziło Ci o { $place }?
    }

thread-guess-no-prediction =
    Hmm, nie rozumiem. Spróbuj podać dokładny adres.

thread-guess-try-again =
    Spróbuj podać bardziej dokładny adres.

thread-guess-nevermind =
    OK, nieważne.


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


[[ Persistent Menu ]]

menu-help =
    Użyj przycisku "Wyślij lokalizację", żeby rozpocząć szukanie rowerów
    miejskich w Twojej okolicy. Możesz też wpisać nazwę ulicy lub miejsca
    — spróbuję znaleźć pasujący adres.

menu-coverage =
    Obecnie działam w Warszawie, Łodzi, Wrocławiu, Poznaniu, Szczecinie,
    Lublinie, Katowicach, Białymstoku, Radomiu, Gliwicach, Opolu, Świdniku,
    Grodzisku Mazowieckim i Michałowicach.

`);

export default function _(id, args) {
    const msg = cx.messages.get(id);

    if (!msg) {
        return id;
    }

    return cx.format(msg, args).replace(re_newlines, " ");
}
