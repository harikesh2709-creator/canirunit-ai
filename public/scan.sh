#!/usr/bin/env bash
# CanIRunIt.ai - Native Hardware Scanner (Linux/macOS)

CODE=$(printf "%06d" $(( $RANDOM % 1000000 )))
ENDPOINT="http://localhost:3000/api/sync"
APP_URL="http://localhost:3000"

echo "🔍 Detecting hardware..."

GPU_NAME="Unknown"
VRAM_GB=8

if command -v nvidia-smi &> /dev/null; then
    GPU_INFO=$(nvidia-smi --query-gpu=name,memory.total --format=csv,noheader,nounits | head -n 1)
    GPU_NAME=$(echo "$GPU_INFO" | awk -F', ' '{print $1}')
    VRAM_MB=$(echo "$GPU_INFO" | awk -F', ' '{print $2}')
    VRAM_GB=$(awk "BEGIN {print int(($VRAM_MB / 1024) + 0.5)}")
elif [[ "$OSTYPE" == "darwin"* ]]; then
    GPU_NAME=$(system_profiler SPDisplaysDataType | awk -F': ' '/Chipset Model/ {print $2}' | xargs)
    if [ -z "$GPU_NAME" ]; then
        GPU_NAME="Apple Silicon"
    fi
    MEM_GB=$(sysctl -n hw.memsize | awk '{print int($1/1024/1024/1024)}')
    VRAM_GB=$MEM_GB
else
    GPU_NAME="Generic Linux GPU"
fi

echo "✅ Detected: $GPU_NAME (${VRAM_GB}GB VRAM)"
echo "🔄 Syncing with web interface..."

curl -s -X POST -H "Content-Type: application/json" \
    -d "{\"code\":\"$CODE\",\"gpuName\":\"$GPU_NAME\",\"vramGB\":$VRAM_GB}" \
    "$ENDPOINT" > /dev/null

SYNC_URL="$APP_URL/?sync=$CODE"
echo "🌐 Opening $SYNC_URL ..."

if command -v xdg-open &> /dev/null; then
    xdg-open "$SYNC_URL"
elif command -v open &> /dev/null; then
    open "$SYNC_URL"
else
    echo "Could not open browser automatically. Please visit:"
    echo "$SYNC_URL"
fi
