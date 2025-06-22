#!/bin/bash
# BASB 系统自签名 SSL 证书生成脚本
# 文件路径: nginx/ssl/generate-self-signed-cert.sh

# 设置变量
COUNTRY="CN"
STATE="Beijing"
LOCALITY="Beijing"
ORGANIZATION="BASB System"
ORGANIZATIONAL_UNIT="DevOps"
COMMON_NAME="basb.example.com"
EMAIL="admin@basb.example.com"
OUTPUT_CERT="basb.crt"
OUTPUT_KEY="basb.key"
DAYS_VALID=3650

# 生成自签名证书
openssl req -x509 \
    -nodes \
    -newkey rsa:2048 \
    -keyout "$OUTPUT_KEY" \
    -out "$OUTPUT_CERT" \
    -days "$DAYS_VALID" \
    -subj "/C=$COUNTRY/ST=$STATE/L=$LOCALITY/O=$ORGANIZATION/OU=$ORGANIZATIONAL_UNIT/CN=$COMMON_NAME/emailAddress=$EMAIL" \
    -addext "subjectAltName=DNS:$COMMON_NAME,DNS:staging.basb.example.com,DNS:monitoring.basb.example.com,DNS:logs.basb.example.com"

# 设置权限
chmod 600 "$OUTPUT_KEY"
chmod 644 "$OUTPUT_CERT"

echo "自签名 SSL 证书已生成:"
echo "证书: $OUTPUT_CERT"
echo "密钥: $OUTPUT_KEY"
echo "有效期: $DAYS_VALID 天"