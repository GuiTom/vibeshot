# Azure VM 本地终端连接说明

这台虚拟机的当前信息如下：

- VM 名称：`test`
- 资源组：`test_group`
- 区域：`westus2`
- 管理用户：`azureuser`
- 当前公网 IP：`20.9.192.191`
- SSH 公钥：`~/.ssh/id_1806_github.pub`
- SSH 私钥：`~/.ssh/id_1806_github`

## 1. 在本地终端直接 SSH 登录

先确认私钥存在：

```bash
ls -l ~/.ssh/id_1806_github ~/.ssh/id_1806_github.pub
```

直接登录：

```bash
ssh -i ~/.ssh/id_1806_github azureuser@20.9.192.191
```

首次连接如果提示主机指纹，可用下面这条：

```bash
ssh -i ~/.ssh/id_1806_github -o StrictHostKeyChecking=accept-new azureuser@20.9.192.191
```

## 2. 不进入交互式 shell，直接执行一条命令

```bash
ssh -i ~/.ssh/id_1806_github azureuser@20.9.192.191 'hostname && whoami && uname -a'
```

例如查看磁盘：

```bash
ssh -i ~/.ssh/id_1806_github azureuser@20.9.192.191 'df -h'
```

例如重启服务：

```bash
ssh -i ~/.ssh/id_1806_github azureuser@20.9.192.191 'sudo systemctl restart nginx'
```

## 3. 当前环境的特殊情况

这台 VM 本身是活的，我已经能通过 Azure 官方管理通道进入来宾系统并执行命令。

但你这台电脑到 VM 公网 `22` 端口的 SSH 连接目前仍然会被关闭，表现为：

```text
Connection closed by 20.9.192.191 port 22
```

这通常说明：

- 你的本地网络出口对 `22` 端口有限制
- 本地代理 / VPN / 加速器影响了 SSH 握手
- 公司网络 / 校园网 / 运营商网络路径有干预

所以如果本地 SSH 连不上，优先尝试：

1. 关掉代理、VPN、网络加速器
2. 换手机热点后再试
3. 再执行：

```bash
ssh -i ~/.ssh/id_1806_github -o StrictHostKeyChecking=accept-new azureuser@20.9.192.191
```

## 4. 在本地终端使用 Azure Run Command

如果你本地 SSH 还是不通，可以直接从本地终端通过 Azure CLI 在 VM 内执行命令。

先使用我这次会话里同样的 Azure 配置目录：

```bash
export AZURE_CONFIG_DIR=/private/tmp/azcfg
```

确认当前账号：

```bash
az account show
```

## 4.1 我实际在用的命令

下面这条就是我实际用来“进到虚拟机里执行命令”的命令：

```bash
AZURE_CONFIG_DIR=/private/tmp/azcfg az vm run-command invoke \
  -g test_group \
  -n test \
  --command-id RunShellScript \
  --scripts 'echo === access ===' 'whoami' 'hostname' 'id' 'uname -a'
```

如果你想把输出看得更清楚，可以加 `--query` 只取返回文本：

```bash
AZURE_CONFIG_DIR=/private/tmp/azcfg az vm run-command invoke \
  -g test_group \
  -n test \
  --command-id RunShellScript \
  --scripts 'echo === access ===' 'whoami' 'hostname' 'id' 'uname -a' \
  --query 'value[0].message' \
  -o tsv
```

## 4.2 我常用的排查命令

查看 SSH 服务、监听端口和最近日志：

```bash
AZURE_CONFIG_DIR=/private/tmp/azcfg az vm run-command invoke \
  -g test_group \
  -n test \
  --command-id RunShellScript \
  --scripts \
  'echo === sshd ===' \
  'systemctl is-active ssh || systemctl is-active sshd' \
  'ss -ltnp | grep :22 || true' \
  'echo === auth ===' \
  'tail -n 40 /var/log/auth.log 2>/dev/null || true' \
  'echo === hostkeys ===' \
  'ls -l /etc/ssh/ssh_host_* || true'
```

查看系统信息、磁盘、内存：

```bash
AZURE_CONFIG_DIR=/private/tmp/azcfg az vm run-command invoke \
  -g test_group \
  -n test \
  --command-id RunShellScript \
  --scripts \
  'hostname' \
  'uname -a' \
  'df -h' \
  'free -h'
```

在 VM 内执行一条命令：

```bash
az vm run-command invoke \
  -g test_group \
  -n test \
  --command-id RunShellScript \
  --scripts 'whoami' 'hostname' 'uname -a'
```

查看磁盘和内存：

```bash
az vm run-command invoke \
  -g test_group \
  -n test \
  --command-id RunShellScript \
  --scripts 'df -h' 'free -h'
```

重启 SSH 服务：

```bash
az vm run-command invoke \
  -g test_group \
  -n test \
  --command-id RunShellScript \
  --scripts 'systemctl restart ssh || systemctl restart sshd' 'systemctl is-active ssh || systemctl is-active sshd'
```

## 5. 一次执行多条部署命令

例如更新系统并安装 `nginx`：

```bash
az vm run-command invoke \
  -g test_group \
  -n test \
  --command-id RunShellScript \
  --scripts \
  'apt-get update' \
  'DEBIAN_FRONTEND=noninteractive apt-get install -y nginx' \
  'systemctl enable nginx' \
  'systemctl restart nginx'
```

## 6. 当前推荐做法

在你本地 SSH 还没恢复之前，推荐优先使用：

- 本地终端的 `az vm run-command invoke`
- 或让我继续代你通过 `Run Command` 在 VM 内操作

如果你后面要恢复“像正常 Linux 一样的交互式终端”，再单独处理：

- 本地网络导致的 SSH 问题
- 或重建 Azure Bastion

## 7. `vibeshot.aihelper360.com` 无法访问的排障记录

这次的问题不是源站，也不是 Nginx 或 SSL。

- 现象：`vibeshot.aihelper360.com` 打不开，公网 DNS 解析返回 `NXDOMAIN`
- 排查结果：`music.aihelper360.com` 正常，但 Cloudflare 里没有 `vibeshot` 这条 DNS 记录
- 已确认：Cloudflare 的 `SSL/TLS` 是 `Full`，`Rules` 里也没有针对 `vibeshot` 的拦截规则
- 结论：根因是 DNS 漏配，不是服务器故障

修复方式：

```text
A vibeshot -> 20.9.192.191
Proxy: Proxied
TTL: Auto
```

补完后公网即可正常访问。
