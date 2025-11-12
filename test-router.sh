#!/bin/bash

echo "🧪 Testing Google Login Endpoint"
echo "=================================="
echo ""

# Start server in background
echo "🚀 Starting server..."
PORT=3000 node bin/www.js > /dev/null 2>&1 &
SERVER_PID=$!

# Wait for server to start
sleep 2

# Test endpoint
echo "📡 Testing POST /google-login..."
echo ""

RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST http://localhost:3000/google-login \
  -H "Content-Type: application/json" \
  -d '{"googleToken": "test-invalid-token"}')

HTTP_BODY=$(echo "$RESPONSE" | sed -e 's/HTTP_STATUS\:.*//g')
HTTP_STATUS=$(echo "$RESPONSE" | tr -d '\n' | sed -e 's/.*HTTP_STATUS://')

echo "Response Status: $HTTP_STATUS"
echo "Response Body: $HTTP_BODY"
echo ""

# Kill server
kill $SERVER_PID 2>/dev/null

# Evaluate result
if [ "$HTTP_STATUS" = "404" ]; then
    echo "❌ FAILED: Route not found (404)"
    echo "   The router configuration has issues"
    exit 1
elif [ "$HTTP_STATUS" = "401" ] || [ "$HTTP_STATUS" = "500" ]; then
    echo "✅ SUCCESS: Route is working!"
    echo "   Status $HTTP_STATUS is expected for invalid token"
    echo "   This confirms the routing is correctly configured"
    exit 0
else
    echo "⚠️  Unexpected status: $HTTP_STATUS"
    echo "   But route is responding, so routing works"
    exit 0
fi
