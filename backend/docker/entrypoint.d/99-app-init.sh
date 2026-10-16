#!/bin/sh
set -e

ARTISAN="php artisan"

echo "==> Menunggu database siap..."
until $ARTISAN migrate --force > /dev/null 2>&1; do
    echo "    database belum siap, coba lagi dalam 3 detik..."
    sleep 3
done
echo "==> Migrasi selesai."

USER_COUNT=$($ARTISAN tinker --execute 'echo App\Models\User::count();' 2>/dev/null | tail -1)
if [ "$USER_COUNT" = "0" ]; then
    echo "==> Database kosong, menjalankan seeder data dummy..."
    $ARTISAN db:seed --force
else
    echo "==> Database sudah terisi ($USER_COUNT user), lewati seeder."
fi

$ARTISAN config:cache > /dev/null 2>&1 || true
echo "==> Inisialisasi aplikasi selesai."
