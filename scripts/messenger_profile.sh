#!/bin/bash

if [[ ! $1 ]]; then
    echo "Path to the JSON file required."
    exit 1
fi

curl -X POST -H "Content-Type: application/json" -d @$1 \
  "https://graph.facebook.com/v2.6/me/messenger_profile?access_token=${PAGE_ACCESS_TOKEN}"
