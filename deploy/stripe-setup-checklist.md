# Stripe 接入配置清单

这份清单对应当前项目里已经接好的 Stripe 代码，目标是让你在 Stripe 后台按步骤配置后，直接跑通支付。

相关代码入口：

- Checkout API: [app/api/billing/checkout/route.ts](/Users/spike/Desktop/proj/VibeShot/app/api/billing/checkout/route.ts)
- Webhook API: [app/api/stripe/webhook/route.ts](/Users/spike/Desktop/proj/VibeShot/app/api/stripe/webhook/route.ts)
- Stripe 配置封装: [lib/stripe.ts](/Users/spike/Desktop/proj/VibeShot/lib/stripe.ts)
- 订阅写库逻辑: [lib/billing.ts](/Users/spike/Desktop/proj/VibeShot/lib/billing.ts)

---

## 1. 先准备数据库

本项目已经给 `User` 增加了 Stripe 相关字段，所以要先跑 Prisma：

本地开发：

```bash
npx prisma migrate dev --name add_stripe_billing
```

线上生产：

```bash
npx prisma migrate deploy
```

如果你只想先快速同步 schema，也可以临时用：

```bash
npx prisma db push
```

---

## 2. 在 Stripe 后台创建产品和价格

你当前价格页是：

- 免费体验：`3` 次
- 月度订阅：`¥39 / 月`
- 年度订阅：`¥299 / 年`

所以建议在 Stripe 后台创建：

### 产品 1：月度订阅

- Product name: `VibeShot Monthly`
- Price:
  - Amount: `39`
  - Currency: `CNY`
  - Billing period: `Monthly`

### 产品 2：年度订阅

- Product name: `VibeShot Yearly`
- Price:
  - Amount: `299`
  - Currency: `CNY`
  - Billing period: `Yearly`

创建完成后，你会拿到两个 `price_...`：

- `STRIPE_MONTHLY_PRICE_ID`
- `STRIPE_YEARLY_PRICE_ID`

---

## 3. 配置环境变量

本地 `.env.local` 和线上 `.env.production` 都需要补：

```env
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
STRIPE_MONTHLY_PRICE_ID=price_xxx
STRIPE_YEARLY_PRICE_ID=price_xxx
```

如果你先在测试模式调试，就先填：

```env
STRIPE_SECRET_KEY=sk_test_xxx
```

等测试通过再切到正式 `live` key。

---

## 4. 配置 Webhook

当前项目需要监听这些事件：

- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`

### 线上 Webhook 地址

```text
https://你的域名/api/stripe/webhook
```

例如：

```text
https://vibeshot.aihelper360.com/api/stripe/webhook
```

### 本地调试 Webhook

建议安装 Stripe CLI：

```bash
brew install stripe/stripe-cli/stripe
```

登录：

```bash
stripe login
```

转发到本地：

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

CLI 会输出一个 `whsec_...`，把它填到本地 `.env.local`：

```env
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

---

## 5. 本地测试顺序

1. 填好 `.env.local`
2. 跑数据库迁移
3. 启动项目：

```bash
npm run dev
```

4. 启动 Stripe Webhook 转发：

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

5. 打开首页价格区，点击：
   - `月度订阅`
   - `年度订阅`

6. Stripe Checkout 支付完成后，检查：
   - 是否跳回首页
   - `/api/account` 是否返回更新后的套餐
   - 账户面板是否显示：
     - `monthly` 或 `yearly`
     - 对应额度 `50` 或 `600`

---

## 6. 线上部署后要验证什么

部署完成后，验证以下几点：

### 6.1 页面按钮能跳转 Checkout

点击 `月度订阅` / `年度订阅` 后应该跳转到 Stripe Checkout。

### 6.2 Webhook 是否成功入库

支付成功后检查：

- 账户套餐是否从 `free` 变成 `monthly` 或 `yearly`
- `creditsRemaining` 是否变成：
  - 月付：`50`
  - 年付：`600`

### 6.3 取消订阅后的回退

当 Stripe 发出 `customer.subscription.deleted` 时，当前代码会把用户回退为：

- `free`
- `3` 次免费额度

---

## 7. 当前代码里的套餐规则

当前代码写死的是：

- `free`: `3`
- `monthly`: `50`
- `yearly`: `600`

位置：

- 免费额度默认值：[store/useAppStore.ts](/Users/spike/Desktop/proj/VibeShot/store/useAppStore.ts:1)
- 支付成功额度映射：[lib/stripe.ts](/Users/spike/Desktop/proj/VibeShot/lib/stripe.ts:1)
- 取消订阅回退逻辑：[lib/billing.ts](/Users/spike/Desktop/proj/VibeShot/lib/billing.ts:1)

如果你后面要改价格或额度，最少需要同步这三处。

---

## 8. 当前支付流程是怎样的

### 前端

价格页按钮点击后：

- 免费档不走 Stripe
- 月度/年度调用 `/api/billing/checkout`
- 服务端创建 Stripe Checkout Session
- 前端跳转到 Stripe Checkout

### Webhook

支付成功后：

- Stripe 调用 `/api/stripe/webhook`
- 后端根据 `metadata.plan` 和 `metadata.userId`
- 更新用户：
  - `subscriptionPlan`
  - `subscriptionStatus`
  - `stripeCustomerId`
  - `stripeSubscriptionId`
  - `creditsRemaining`
  - `creditsTotal`
  - `subscriptionExpiresAt`

---

## 9. 最后上线前建议

上线前最好确认：

1. `AUTH_URL` / `NEXTAUTH_URL` 是正式域名
2. Stripe 用的是 `live` key 不是 `test` key
3. Webhook 用的是正式环境 `whsec`
4. 价格 ID 对应的也是 `live` 环境 price
5. 线上数据库已经做过 Prisma 迁移

只要这五项对上，当前代码就可以跑 Stripe 正常支付闭环。
