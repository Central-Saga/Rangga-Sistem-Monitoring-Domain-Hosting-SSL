#!/bin/bash
# Tes end-to-end API Monitoring Infra
BASE=http://127.0.0.1:8000/api
cd "$(dirname "$0")"

echo "=== 1. Login admin ==="
LOGIN=$(curl -s -X POST "$BASE/auth/login" -H "Content-Type: application/json" -H "Accept: application/json" \
  -d '{"email":"admin@example.com","password":"password"}')
TOKEN=$(echo "$LOGIN" | php -r '$d=json_decode(stream_get_contents(STDIN),true); echo $d["token"] ?? "";')
if [ -z "$TOKEN" ]; then echo "GAGAL login:"; echo "$LOGIN"; exit 1; fi
echo "Token OK: ${TOKEN:0:20}..."
AUTH="Authorization: Bearer $TOKEN"

echo ""
echo "=== 2. Dashboard summary ==="
curl -s "$BASE/dashboard/summary" -H "$AUTH" -H "Accept: application/json" | php -r '$d=json_decode(stream_get_contents(STDIN),true); print_r($d["summary"] ?? $d);'

echo ""
echo "=== 3. Assets expiring in 7 days ==="
curl -s "$BASE/assets?expiring_in=7&per_page=3" -H "$AUTH" -H "Accept: application/json" | php -r '$d=json_decode(stream_get_contents(STDIN),true); foreach(($d["data"]??[]) as $a){ echo "- {$a["name"]} ({$a["type"]}) expired {$a["expired_date"]} sisa {$a["days_until_expiry"]} hari\n"; } echo "total: ".($d["meta"]["total"]??"?")."\n";'

echo ""
echo "=== 4. Jalankan command cek expired ==="
timeout 60 php artisan assets:check-expiry

echo ""
echo "=== 5. Notifikasi (setelah queue diproses) ==="
timeout 90 php artisan queue:work redis --queue=notifications --stop-when-empty >/dev/null 2>&1
curl -s "$BASE/notifications?per_page=5" -H "$AUTH" -H "Accept: application/json" | php -r '$d=json_decode(stream_get_contents(STDIN),true); foreach(($d["data"]??[]) as $n){ echo "- [{$n["data"]["level"]}] {$n["data"]["message"]}\n"; } echo "unread: ".($d["unread_count"]??"?")."\n";'

echo ""
echo "=== 6. PDF laporan expiring ==="
curl -s -o /tmp/report.pdf -w "HTTP %{http_code}, %{size_download} bytes\n" "$BASE/reports/expiring-assets/pdf?days=30" -H "$AUTH"
file /tmp/report.pdf

echo ""
echo "=== 7. PDF invoice renewal #1 ==="
curl -s -o /tmp/invoice.pdf -w "HTTP %{http_code}, %{size_download} bytes\n" "$BASE/renewals/1/invoice/pdf" -H "$AUTH"
file /tmp/invoice.pdf

echo ""
echo "=== 8. RBAC: staff tidak boleh kelola users ==="
SLOGIN=$(curl -s -X POST "$BASE/auth/login" -H "Content-Type: application/json" -H "Accept: application/json" \
  -d '{"email":"client1@example.com","password":"password"}')
STOKEN=$(echo "$SLOGIN" | php -r '$d=json_decode(stream_get_contents(STDIN),true); echo $d["token"] ?? "";')
curl -s -o /dev/null -w "client akses /users: HTTP %{http_code} (harus 403)\n" "$BASE/users" -H "Authorization: Bearer $STOKEN"
curl -s "$BASE/assets?per_page=2" -H "Authorization: Bearer $STOKEN" -H "Accept: application/json" | php -r '$d=json_decode(stream_get_contents(STDIN),true); echo "client lihat assets miliknya: ".count($d["data"]??[])." item, total ".($d["meta"]["total"]??"?")."\n";'

echo ""
echo "=== SELESAI ==="
