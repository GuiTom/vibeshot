# Azure 上部署第二个 Next.js + PostgreSQL 网站复用方案

这份说明适用于你现在这台已经跑着 `VibeShot` 的 Azure VM，再部署一个“技术架构相同”的新站：

- 前端/服务端：`Next.js`
- 数据库：`PostgreSQL`
- 反向代理：`Nginx`
- 进程托管：`systemd`

目标是尽可能复用已部署资源：

- 复用同一台 Azure VM
- 复用同一个 PostgreSQL 实例
- 复用同一个 Nginx
- 每个站点只新增：
  - 一个独立数据库
  - 一个独立 systemd service
  - 一个独立 Nginx site config
  - 一个独立域名解析

---

## 1. 推荐结构

假设第二个站点叫 `siteb`，域名叫 `siteb.example.com`，端口用 `3001`。

在服务器上的结构建议是：

```text
/var/www/vibeshot
/var/www/siteb

/etc/systemd/system/vibeshot.service
/etc/systemd/system/siteb.service

/etc/nginx/sites-available/vibeshot.conf
/etc/nginx/sites-available/siteb.conf

/var/log/vibeshot
/var/log/siteb
```

这样两个站点互不影响，但底层资源共享。

---

## 2. PostgreSQL 复用方式

不要共用同一个数据库名，应该共用同一个 PostgreSQL 服务实例，但给每个网站独立数据库：

```sql
CREATE USER siteb WITH PASSWORD 'StrongPasswordHere';
CREATE DATABASE siteb OWNER siteb;
GRANT ALL PRIVILEGES ON DATABASE siteb TO siteb;
```

第二个站点的 `DATABASE_URL` 写成：

```env
DATABASE_URL=postgresql://siteb:StrongPasswordHere@127.0.0.1:5432/siteb
```

这样优点是：

- 部署成本低
- 备份方式统一
- 站点之间数据不会串

---

## 3. Nginx 复用方式

Nginx 继续只保留一个实例，但每个域名对应一个独立 site config。

例如：

- `vibeshot.aihelper360.com` -> `127.0.0.1:3000`
- `siteb.example.com` -> `127.0.0.1:3001`

第二个站点的 Nginx 配置可直接由模板生成：

```nginx
server {
    listen 80;
    server_name siteb.example.com;

    client_max_body_size 100M;

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

等 DNS 生效后，再跑：

```bash
sudo certbot --nginx -d siteb.example.com
```

这样 `certbot` 会自动把 `80 -> 443` 和证书段写进去。

---

## 4. 域名解析怎么做

如果域名托管在 Route 53：

1. 打开 Hosted Zone
2. 新增一条 `A` 记录
3. 主机名填：

```text
siteb
```

4. 值填 Azure VM 公网 IP，例如：

```text
20.9.192.191
```

最终效果就是：

```text
siteb.example.com -> 20.9.192.191
```

如果是根域名，就直接把根域 `A` 记录指向同一台 VM 的 IP。

---

## 5. 第二个站点怎么部署

### 5.1 准备目录

把第二个项目代码放到：

```bash
/var/www/siteb/current
```

环境变量放到：

```bash
/var/www/siteb/shared/.env.production
```

### 5.2 使用通用脚本部署

本仓库已经提供通用部署脚本：

- [deploy/deploy-nextjs-postgres-app.sh](/Users/spike/Desktop/proj/VibeShot/deploy/deploy-nextjs-postgres-app.sh)
- [deploy/nextjs-postgres-azure-template.service](/Users/spike/Desktop/proj/VibeShot/deploy/nextjs-postgres-azure-template.service)
- [deploy/nextjs-postgres-azure-template.nginx.conf](/Users/spike/Desktop/proj/VibeShot/deploy/nextjs-postgres-azure-template.nginx.conf)
- [deploy/nextjs-postgres-azure-template.env.example](/Users/spike/Desktop/proj/VibeShot/deploy/nextjs-postgres-azure-template.env.example)

在第二个项目目录里执行：

```bash
bash deploy/deploy-nextjs-postgres-app.sh siteb siteb.example.com 3001
```

这会自动：

- 创建 `/var/www/siteb`
- 安装依赖
- 同步 `.env.production`
- `npm run build`
- 生成 `siteb.service`
- 生成 `siteb.conf`
- 重启 `systemd` 与 `nginx`

---

## 6. 第二个站点的环境变量模板

可以参考：

[deploy/nextjs-postgres-azure-template.env.example](/Users/spike/Desktop/proj/VibeShot/deploy/nextjs-postgres-azure-template.env.example)

例如：

```env
NODE_ENV=production
PORT=3001

DATABASE_URL=postgresql://siteb:StrongPasswordHere@127.0.0.1:5432/siteb

AUTH_URL=https://siteb.example.com
NEXTAUTH_URL=https://siteb.example.com
AUTH_SECRET=replace_with_a_long_random_secret
```

---

## 7. 复用资源时最重要的约束

### 必须独立的部分

- 数据库名
- systemd service 名
- Nginx site 文件名
- 监听端口
- 日志目录
- 域名

### 可以复用的部分

- Azure VM
- PostgreSQL 服务实例
- Nginx 进程
- Node.js 运行时
- Certbot

---

## 8. 建议的第二站部署清单

按顺序做：

1. 为第二站确定：
   - `APP_NAME`
   - `DOMAIN`
   - `PORT`
   - `DB_NAME`
   - `DB_USER`
2. 在 PostgreSQL 新建独立数据库和用户
3. 上传第二个项目代码到 `/var/www/<APP_NAME>/current`
4. 写入 `/var/www/<APP_NAME>/shared/.env.production`
5. Route 53 新增 `A` 记录到同一台 Azure VM
6. 运行部署脚本
7. 验证：
   - `systemctl status <APP_NAME>`
   - `curl -I http://127.0.0.1:<PORT>`
   - `curl -I http://<DOMAIN>`
8. 执行：
   - `sudo certbot --nginx -d <DOMAIN>`
9. 再验证：
   - `curl -I https://<DOMAIN>`

---

## 9. 你现在这套环境的建议

你当前最省钱、最省事的方案就是：

- 继续使用现有 Azure VM
- 新站直接走新端口，例如 `3001`
- PostgreSQL 新建第二个数据库
- Nginx 新增第二个域名转发
- Route 53 把新子域名指到同一台 VM

这是你当前架构下性价比最高的做法。
