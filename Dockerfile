# Math Archaeology 3D — Cloud Run 部署用
#
# 第一段：安裝套件 → 跑全部單元測試 → 打包（測試沒過就不會部署）
# 第二段：只把打包好的靜態檔交給 nginx，映像檔很小

FROM node:22-slim AS build
WORKDIR /app

COPY package*.json ./
RUN npm install --no-audit --no-fund

COPY . .
RUN npm test
RUN npm run build


FROM nginx:stable-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

# Cloud Run 預設把流量送到 8080
EXPOSE 8080
