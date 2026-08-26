#!/usr/bin/env bash
#
# Mọi route dưới đây phải từ chối request không có session cookie.
# Chạy khi API đang lên: ./chat-nestjs/scripts/check-auth.sh
#
# 403 là mã AuthenticatedGuard trả về (req.isAuthenticated() === false -> ForbiddenException).
# 401 cũng chấp nhận nếu sau này đổi sang UnauthorizedException.

set -uo pipefail

BASE="${API_BASE:-http://localhost:8001/api}"
failed=0

check() {
  local method="$1" path="$2"
  local code
  code=$(curl -s -o /dev/null -w '%{http_code}' -X "$method" "$BASE$path")
  if [[ "$code" == "401" || "$code" == "403" ]]; then
    printf '  ok   %-6s %-45s %s\n' "$method" "$path" "$code"
  else
    printf '  FAIL %-6s %-45s %s (mong đợi 401/403)\n' "$method" "$path" "$code"
    failed=1
  fi
}

echo "Kiểm tra route không cần đăng nhập vẫn bị chặn — $BASE"

check GET    "/users/search?query=0900000001"
check GET    "/users/check?phoneNumber=0900000001"
check PATCH  "/users/profiles"
check GET    "/users/presence/status"
check GET    "/conversations"
check GET    "/conversations/1"
check GET    "/conversations/1/messages"
check POST   "/conversations/1/messages"
check DELETE "/conversations/1/messages/1"
check PATCH  "/conversations/1/messages/1"
check POST   "/conversations/1/read"
check PATCH  "/conversations/1/state"
check GET    "/groups"
check POST   "/groups"
check GET    "/groups/1"
check GET    "/groups/1/messages"
check POST   "/groups/1/recipients"
check PATCH  "/groups/1/details"
check GET    "/friends"
check DELETE "/friends/1/delete"
check GET    "/friends/requests"
check POST   "/friends/requests"
check GET    "/exists/conversations/1"

if [[ "$failed" -eq 0 ]]; then
  echo "PASS — không route nào rò rỉ."
else
  echo "FAIL — còn route trả dữ liệu khi chưa đăng nhập."
fi
exit "$failed"
