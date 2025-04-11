#!/bin/bash

# 设置服务器地址和UUID
if [ -n "$HOSTNAME" ]; then
    SERVER_ADDRESS="${HOSTNAME}-8080.csb.app"
else
    SERVER_ADDRESS="hpd4tt-8080.csb.app"
fi
UUID="de04add9-5c68-8bab-950c-08cd5320df18"

# 设置颜色
GREEN="\033[0;32m"
YELLOW="\033[0;33m"
RED="\033[0;31m"
NC="\033[0m"

echo -e "${GREEN}=== 启动服务 ===${NC}"
echo -e "服务器: ${YELLOW}$SERVER_ADDRESS${NC}, UUID: ${YELLOW}$UUID${NC}"

# 获取脚本目录
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# 检查必要文件
for FILE in "$SCRIPT_DIR/Xray/xray" "$SCRIPT_DIR/Nginx/nginx-static"; do
    if [ ! -f "$FILE" ]; then
        echo -e "${RED}错误: $(basename "$FILE") 不存在${NC}"
        exit 1
    fi
done

# 生成链接
VMESS_LINK=$(echo -n "{\"v\":\"2\",\"ps\":\"VMess-WebSocket-TLS\",\"add\":\"$SERVER_ADDRESS\",\"port\":\"443\",\"id\":\"$UUID\",\"aid\":\"0\",\"net\":\"ws\",\"type\":\"none\",\"host\":\"$SERVER_ADDRESS\",\"path\":\"/assets/js/main.js\",\"tls\":\"tls\"}" | base64 -w 0)
VLESS_LINK="vless://$UUID@$SERVER_ADDRESS:443?encryption=none&security=tls&type=ws&host=$SERVER_ADDRESS&path=/api/data/stream#VLess-WebSocket-TLS"

# 停止已运行的服务
echo -e "${YELLOW}停止已运行的服务...${NC}"
pkill -f xray || true
pkill -f nginx || true
killall -9 nginx xray 2>/dev/null || true

# 释放端口

sleep 2

# 创建日志目录
mkdir -p "$SCRIPT_DIR/Xray/logs" "$SCRIPT_DIR/Nginx/logs"

# 启动Xray
echo -e "${YELLOW}启动Xray...${NC}"
cd "$SCRIPT_DIR/Xray"
./xray -config config.json > /dev/null 2>&1 &
XRAY_PID=$!

# 启动Nginx
echo -e "${YELLOW}启动Nginx...${NC}"
cd "$SCRIPT_DIR/Nginx"
./nginx-static -c nginx.conf > /dev/null 2>&1 &
NGINX_PID=$!

# 检查服务状态
sleep 2
for SERVICE in "Xray:$XRAY_PID:$SCRIPT_DIR/Xray/error.log" "Nginx:$NGINX_PID:$SCRIPT_DIR/Nginx/logs/error.log"; do
    IFS=':' read -r NAME PID LOG <<< "$SERVICE"
    if ! ps -p $PID > /dev/null; then
        echo -e "${RED}错误: $NAME 启动失败${NC}"
        [ -f "$LOG" ] && cat "$LOG"
        exit 1
    else
        echo -e "${GREEN}$NAME 已启动 (PID: $PID)${NC}"
    fi
done

# 显示配置信息
echo -e "\n${GREEN}===配置详情===${NC}"
echo -e "VMess链接: vmess://$VMESS_LINK"
echo -e "VLess链接: $VLESS_LINK"
echo -e "Web界面: ${YELLOW}https://$SERVER_ADDRESS/${NC}"
echo -e "${GREEN}=== 服务启动完成 ===${NC}"
