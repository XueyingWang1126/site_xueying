# 工程评审与架构优化文档（Xueying Wang 作品集网站）

> 本文档用于：① 说明现有项目的过度设计问题；② 给出真正简洁、专业的目标架构；③ 作为重建/改造项目的施工蓝图。
> 核心原则：**页面外观、动画、交互、所有功能 100% 不变，只移除无用的工程外壳。**

---

## 一、原始架构（现状）

当前项目是一个 **Spring Boot Web 应用**，技术栈如下：

| 层 | 使用的技术 | 实际承担的职责 |
|----|-----------|--------------|
| 构建 | Maven (`pom.xml`) | 编译打包 Java |
| 运行时 | Java 21 + JVM | 跑一个 Web 服务器进程 |
| Web 框架 | Spring Boot 2.7.10 (`spring-boot-starter-web`) | 处理 HTTP 请求 |
| 模板引擎 | Thymeleaf | 渲染 HTML（**实际空转**） |
| 监控 | Spring Boot Actuator | 健康检查（作品集用不到） |
| 容器化 | `Dockerfile` (多阶段构建 + JRE 镜像) | 打成镜像部署到 Render |
| 后端代码 | `PortfolioApplication` / `Main` / `HomeController` / `Experience` | 见下方分析 |
| 前端资源 | `static/`（css/js/images/data/files/videos）| 真正承载网站内容 |

请求链路现状：

```
浏览器 → Render 容器 → JVM 启动 Spring Boot → HomeController → 返回 index.html
                                                              ↓
                                          浏览器加载 → main.js fetch /data/projects.json → 渲染卡片
```

---

## 二、过度设计问题与证据（Over-Engineering）

**核心结论：整个后端是一个"空壳"，没有承担任何真实业务职责。网站本质是 100% 静态站点。**

### 证据 1：控制器没有任何业务逻辑

```java
@GetMapping("/")
public String index() {
    return "index";
}
```

它唯一做的事就是把页面名返回出去，**没有向页面传任何数据**（没有 `model.addAttribute(...)`）。

### 证据 2：Thymeleaf 模板引擎完全空转

模板里写了 `th:text="${name}"`、`${title}`、`${summary}` 等动态占位，但由于控制器从不传值，这些表达式**永远取空、永远走旁边的默认 HTML**。例如：

```html
<title th:text="${name} ?: 'Xueying Wang'">Xueying Wang</title>
<link th:href="@{/css/style.css}" href="/css/style.css"/>
```

每个 `th:` 属性旁边都已经有等价的普通 `href`/`src`。也就是说——**就算把 Thymeleaf 整个删掉，页面表现一模一样。**

### 证据 3：内容其实是"浏览器端渲染"

项目卡片不是后端生成的，而是页面加载后由前端 JS 去抓取静态 JSON：

```html
<div class="work-grid" id="work-projects" data-source="/data/projects.json"></div>
```

```js
fetch(source, { cache: 'no-store' })   // main.js
```

这是纯前端行为，**和有没有 Spring Boot 毫无关系**。

### 证据 4：存在"孤儿代码"

`Experience.java` 是一个数据模型类，但全项目**没有任何代码引用它**。它是历史遗留的死代码。

### 证据 5：没有任何需要后端的特性

- ❌ 无数据库
- ❌ 无 REST API
- ❌ 无用户登录 / 会话
- ❌ 无表单提交到服务器
- ❌ 无服务端计算

却背着 JVM 启动成本、Maven 构建、Docker 镜像、容器运行的全部重量。

---

## 三、缺点与错误清单（要改进的点）

| # | 问题 | 影响 | 严重度 |
|---|------|------|--------|
| 1 | **技术选型错配**：用重量级后端框架伺候静态内容 | 工程师视角下是"杀鸡用牛刀"，反映选型判断不足 | 高 |
| 2 | **冷启动体验极差**：JVM + Spring 启动慢，叠加 Render 免费版休眠 | HR/面试官打开要等 30–60 秒，第一印象差 | 高（求职致命）|
| 3 | **无谓的成本与运维**：要么花钱买常驻实例，要么忍受休眠 | 静态站本可完全免费且秒开 | 中 |
| 4 | **可维护性反而下降**：多了 Maven/Docker/JVM 等与内容无关的复杂度 | 改个文案要理解一整套后端构建链 | 中 |
| 5 | **死代码与空转逻辑**：`Experience.java`、空转的 Thymeleaf | 增加阅读负担、误导读者 | 低 |
| 6 | **部署链路过长**：源码 → Maven 编译 → Docker 构建 → 容器启动 | 每次部署慢、出错点多 | 中 |

> 注意：**这不代表你不会后端。** 你真正的后端实力由作品本身证明（`Job Application Tracker`：Spring Boot + PostgreSQL + Docker + MinIO + 分层架构）。作品集首页应当"展示得快、看得爽"，把重型技术留在项目里展示，才是更成熟的工程判断。

---

## 四、目标架构（真正简洁、专业）

**纯静态站点（Static Site）**，无构建、无后端、无容器。

```text
xueying-portfolio/
├── index.html          # 主页（由 templates/index.html 转来，清掉无用 th: 属性）
├── css/                # 原 static/css/（样式拆分文件保持不变）
├── js/
│   └── main.js         # 原 static/js/main.js（一行不改）
├── images/             # 原 static/images/
├── videos/             # 原 static/videos/
├── data/
│   └── projects.json   # 原 static/data/projects.json（一行不改）
├── files/
│   └── resume.pdf      # 原 static/files/resume.pdf
└── README.md
```

请求链路目标：

```
浏览器 → CDN（Vercel/Cloudflare）直接返回 index.html 与静态资源（永久在线，无启动）
```

### 为什么用"平移"而不是重排目录？

你的 CSS/JS 都使用**绝对路径**（`/css/style.css`、`/data/projects.json`、`/images/...`）。
把 `static/` 下的内容**原样平移到站点根目录**，可以让所有绝对路径**零修改**继续生效——这是破坏面最小、最安全的改造方式。

---

## 五、新旧文件迁移对照表

| 原路径 | 目标路径 | 操作 |
|--------|---------|------|
| `src/main/resources/templates/index.html` | `index.html`（根目录） | 移动 + 清理 `th:`（可选） |
| `src/main/resources/static/css/*` | `css/*` | 移动 |
| `src/main/resources/static/js/main.js` | `js/main.js` | 移动 |
| `src/main/resources/static/images/*` | `images/*` | 移动 |
| `src/main/resources/static/videos/*` | `videos/*` | 移动 |
| `src/main/resources/static/data/projects.json` | `data/projects.json` | 移动 |
| `src/main/resources/static/files/*` | `files/*` | 移动 |
| `pom.xml` | — | **删除** |
| `Dockerfile` | — | **删除** |
| `src/main/java/**` | — | **删除（含 `Experience.java` 死代码）** |
| `src/main/resources/application.properties` | — | **删除** |
| `target/**` | — | **删除（构建产物）** |
| `README.md` | `README.md` | 重写 |

> 待你确认的保留项：被标记为"要保留"的 readme/文案（见第八节施工清单）。

---

## 六、为什么必须这样优化（收益）

1. **性能**：CDN 直出，**永久秒开、零冷启动**。从"等 30–60 秒"变成"瞬间打开"。
2. **成本**：Vercel / Cloudflare Pages / GitHub Pages **免费**即可常驻在线，不再需要为常驻实例付费。
3. **正确的工程选型**：用静态托管伺候静态内容，这是行业主流、也是成熟工程师的判断。
4. **可维护性**：改文案只需动 HTML/JSON，不必理解 Maven/Docker/JVM。
5. **部署简化**：`git push` → 平台自动发布，链路短、出错点少、自动 HTTPS + 全球加速。
6. **求职体验**：HR 一点即开，第一印象专业、流畅。

---

## 七、部署方案（目标）

| 平台 | 适配度 | 说明 |
|------|--------|------|
| **Vercel** | ⭐ 推荐 | 前端最主流，连 GitHub 自动部署，免费永久在线 |
| **Cloudflare Pages** | ⭐ 推荐 | 全球 CDN 最快，免费额度大 |
| **GitHub Pages** | 可用 | 最简单，需在仓库根放静态文件 + 可加 `.nojekyll` |

部署流程（以 Vercel 为例）：
1. 代码 `push` 到 GitHub。
2. Vercel 用 GitHub 账号导入该仓库。
3. Framework Preset 选 **Other**，Build Command 留空，Output Directory 设为根目录（`.`）。
4. 部署完成，绑定自定义域名 `xueyingwang.co.uk`（在 Namecheap/GoDaddy 改 DNS 指向 Vercel）。

---

## 八、施工清单（执行顺序）

- [ ] **0. git 安全备份**：提交当前 Spring Boot 版本（旧版永久留在 git 历史，可随时回退）。
- [ ] **1. 平移静态资源**：`static/*` → 根目录对应位置。
- [ ] **2. 处理首页**：`templates/index.html` → 根目录 `index.html`，清理无用 `th:` 属性（功能与外观不变）。
- [ ] **3. 删除后端**：`pom.xml`、`Dockerfile`、`src/`、`application.properties`、`target/`。
- [ ] **4. 保留指定内容**：保留用户标记要保留的 readme/文案（待确认具体文件）。
- [ ] **5. 重写 README.md**：按新静态架构说明项目与部署方式。
- [ ] **6. 覆盖推送 GitHub**。
- [ ] **7. 部署到 Vercel / Cloudflare Pages**，绑定域名。

---

## 九、风险与回退

- 采用**主分支直接改造 + 覆盖**方式，因此改造前**必须**先 `git commit` 当前状态作为还原点。
- 若改造后发现遗漏，可用 `git checkout <旧提交>` 找回任意原始文件。
- 因网站本就是静态，改造不涉及任何运行逻辑变更，功能性回归风险**极低**。
