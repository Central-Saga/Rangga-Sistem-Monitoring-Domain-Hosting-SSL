#!/bin/bash
cd "$(dirname "$0")"
php artisan config:publish cors --no-interaction
grep -E "'paths'|'allowed_origins'|supports_credentials" config/cors.php
