#!/usr/bin/env bash
# Prints "true" when learn.heygetonmylevel.com serves this repo's static section
# (the IndexNow key file answers with its key), else "false". Used to keep the search
# loop in proof mode until the subdomain's DNS points at Cloudflare Pages.
key=06acc33193fad58e3b116f69d73bb6c6
body="$(curl -fsS --max-time 20 "https://learn.heygetonmylevel.com/${key}.txt" 2>/dev/null | tr -d '[:space:]')"
[ "$body" = "$key" ] && echo true || echo false
