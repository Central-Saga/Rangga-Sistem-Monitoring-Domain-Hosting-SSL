#!/bin/bash
cd "$(dirname "$0")"
php artisan migrate:fresh --seed --no-interaction >/dev/null 2>&1
podman exec dev-postgres psql -U monitoring -d monitoring_db -t -c "select type, name from assets order by id limit 6;"
