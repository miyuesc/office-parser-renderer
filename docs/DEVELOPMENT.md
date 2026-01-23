# 开发指南

[English](./DEVELOPMENT.en.md) | 简体中文

欢迎参与 Office Parser Renderer 项目的开发！本文档将帮助你快速上手项目开发。

## 环境准备

### 系统要求

- **Node.js** >= 18.0.0
- **pnpm** >= 8.0.0
- 操作系统：Windows、macOS 或 Linux

### 安装 pnpm

如果你还没有安装 pnpm，可以使用以下命令安装：

```bash
# 使用 npm 安装
npm install -g pnpm

# 或使用 Corepack（Node.js 16.13+）
corepack enable
corepack prepare pnpm@latest --activate
```

### 克隆项目

```bash
git clone https://github.com/yourusername/officeParserRenderer.git
cd officeParserRenderer
```

### 安装依赖

```bash
pnpm install
```

这将安装所有子包的依赖，并建立包之间的链接。

---

## 开发流程

### 启动开发服务器

```bash
pnpm run dev
```

这会启动 Vite 开发服务器，你可以在浏览器中访问 `http://localhost:5173` 查看效果。

### 构建项目

```bash
# 构建所有包
pnpm run build

# 仅构建 docx 包
pnpm --filter @ai-space/docx run build

# 仅构建 xlsx 包
pnpm --filter @ai-space/xlsx run build

# 仅构建 shared 包
pnpm --filter @ai-space/shared run build
```

### 类型检查

```bash
# 检查所有包
pnpm run type-check

# 检查specific包
pnpm --filter @ai-space/docx run type-check
```

### 代码格式化

```bash
# 格式化所有文件
pnpm run format

# 检查格式
pnpm run format:check
```

---

## 代码规范

### TypeScript 规范

1. **使用严格模式**

   项目启用了 TypeScript 严格模式，请确保所有代码符合严格模式要求。

   ```typescript
   // tsconfig.json
   {
     "compilerOptions": {
       "strict": true,
       "noImplicitAny": true,
       "strictNullChecks": true
     }
   }
   ```

2. **避免使用 `any`**

   ```typescript
   // ❌ 不推荐
   function process(data: any) {
     return data;
   }

   // ✅ 推荐
   function process<T>(data: T): T {
     return data;
   }

   // 或使用具体类型
   function process(data: DocxDocument): DocxDocument {
     return data;
   }
   ```

3. **所有函数必须有类型注解**

   ```typescript
   // ❌ 不推荐
   function add(a, b) {
     return a + b;
   }

   // ✅ 推荐
   function add(a: number, b: number): number {
     return a + b;
   }
   ```

4. **使用接口和类型别名**

   ```typescript
   // 接口用于对象结构
   interface DocxRenderOptions {
     pageSize: string;
     scale: number;
   }

   // 类型别名用于联合类型、交叉类型等
   type PageSize = 'A4' | 'A5' | 'A3' | 'Letter' | 'Legal';
   type OptionalOptions = Partial<DocxRenderOptions>;
   ```

### 注释规范

1. **所有注释使用中文**

   ```typescript
   // ✅ 正确
   // 计算页面高度
   function calculateHeight(): number {
     // ...
   }

   // ❌ 错误
   // Calculate page height
   function calculateHeight(): number {
     // ...
   }
   ```

2. **函数必须使用 JSDoc 格式**

   ```typescript
   /**
    * 渲染 DOCX 文档
    *
    * 将解析后的文档对象渲染到指定的 DOM 容器中
    *
    * @param doc - 解析后的文档对象
    * @param container - 目标 DOM 容器
    * @returns 渲染结果，包含页面数量等信息
    * @throws {Error} 如果容器不存在则抛出错误
    * @example
    * ```typescript
    * const result = await renderDocument(doc, container);
    * console.log(`渲染了 ${result.totalPages} 页`);
    * ```
    */
   function renderDocument(
     doc: DocxDocument,
     container: HTMLElement
   ): Promise<RenderResult> {
     // ...
   }
   ```

3. **核心逻辑必须添加注释**

   ```typescript
   function complexCalculation(data: number[]): number {
     // 计算数据的加权平均值
     // 权重随索引递增：weight = index + 1
     const weighted = data.map((value, index) => value * (index + 1));
     const sum = weighted.reduce((a, b) => a + b, 0);
     const totalWeight = (data.length * (data.length + 1)) / 2;
     return sum / totalWeight;
   }
   ```

### 命名规范

1. **类名**：PascalCase

   ```typescript
   class DocxParser { }
   class DocxRenderer { }
   ```

2. **函数名**：camelCase

   ```typescript
   function parseDocument() { }
   function renderParagraph() { }
   ```

3. **常量**：UPPER_SNAKE_CASE

   ```typescript
   const MAX_PAGE_WIDTH = 842;
   const DEFAULT_FONT_SIZE = 12;
   ```

4. **文件名**：PascalCase（类文件）或 camelCase（工具文件）

   ```
   DocxParser.ts       # 类文件
   UnitConverter.ts    # 工具类文件
   colorUtils.ts       # 工具函数文件
   ```

5. **私有成员**：使用 `private` 关键字，而不是下划线前缀

   ```typescript
   class Example {
     // ✅ 推荐
     private data: string;

     // ❌ 不推荐
     private _data: string;
   }
   ```

---

## 项目结构说明

### Monorepo 架构

项目使用 pnpm workspaces 管理多个子包：

- **shared**：共享模块，提供通用功能
- **docx**：DOCX 文档处理
- **xlsx**：XLSX 表格处理

### 添加新包

1. 在 `packages/` 目录下创建新文件夹
2. 添加 `package.json`
3. 在根目录的 `pnpm-workspace.yaml` 中引用
4. 运行 `pnpm install` 建立链接

### 包之间的依赖

```json
// packages/docx/package.json
{
  "dependencies": {
    "@ai-space/shared": "workspace:*"
  }
}
```

---

## 测试指南

### 单元测试

（待添加）

### 端到端测试

1. 准备测试文件：将 DOCX/XLSX 文件放到 `spec/files/` 目录
2. 启动开发服务器：`pnpm run dev`
3. 在浏览器中打开测试页面
4. 加载测试文件并验证渲染效果

### 浏览器测试

使用 `playground` 进行快速测试：

```typescript
// packages/playground/src/main.ts
import { DocxParser, DocxRenderer } from '@ai-space/docx';

const container = document.getElementById('app')!;
const renderer = new DocxRenderer(container);

// 加载测试文件
fetch('/path/to/test.docx')
  .then(res => res.arrayBuffer())
  .then(buffer => new DocxParser().parse(buffer))
  .then(doc => renderer.render(doc));
```

---

## 贡献指南

### 提交规范

我们遵循 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

```
<type>(<scope>): <subject>

<body>

<footer>
```

**类型（type）**：

- `feat`: 新功能
- `fix`: 修复问题
- `docs`: 文档变更
- `style`: 代码格式（不影响功能）
- `refactor`: 重构（既不是新功能也不是修复）
- `perf`: 性能优化
- `test`: 测试相关
- `chore`: 构建/工具变更

**示例**：

```bash
feat(docx): 添加表格边框渲染支持

实现了表格边框的完整渲染，包括单线、双线、虚线等样式。

Closes #123
```

### Pull Request 流程

1. **Fork 项目**

2. **创建分支**

   ```bash
   git checkout -b feature/my-new-feature
   ```

3. **提交代码**

   ```bash
   git add .
   git commit -m "feat: add my new feature"
   ```

4. **推送分支**

   ```bash
   git push origin feature/my-new-feature
   ```

5. **创建 Pull Request**

   在 GitHub 上创建 PR 并描述你的更改

6. **代码审查**

   等待维护者审查并根据反馈修改

7. **合并**

   PR 通过审查后将被合并到主分支

### 代码审查要点

- 代码是否符合规范
- 类型定义是否完整
- 注释是否充分
- 是否有测试覆盖
- 性能影响如何
- 是否向后兼容

---

## 调试技巧

### 使用浏览器开发者工具

1. **查看解析结果**

   在 `DocxParser.parse()` 后打断点，检查生成的 AST：

   ```typescript
   const doc = await parser.parse(buffer);
   console.log('Parsed document:', doc);
   debugger; // 浏览器会在此暂停
   ```

2. **检查渲染输出**

   在 `DocxRenderer.render()` 后检查 DOM 结构：

   ```typescript
   await renderer.render(doc);
   console.log('Container HTML:', container.innerHTML);
   ```

3. **调试样式问题**

   使用 Chrome DevTools 的 Elements 面板检查元素样式

### 日志输出

项目包含日志工具类，可用于调试：

```typescript
import { Logger } from './utils/Logger';

Logger.debug('解析段落', paragraph);
Logger.warn('未知的样式属性', styleName);
Logger.error('解析失败', error);
```

### 性能分析

使用 Chrome DevTools 的 Performance 面板分析渲染性能：

1. 打开 Performance 面板
2. 点击 Record
3. 执行渲染操作
4. 停止 Recording
5. 分析火焰图找出性能瓶颈

---

## 常见问题

### pnpm 安装失败

**问题**：`pnpm install` 失败

**解决**：

```bash
# 清除缓存
pnpm store prune

# 删除 node_modules 和 lock 文件
rm -rf node_modules pnpm-lock.yaml

# 重新安装
pnpm install
```

### 类型错误

**问题**：TypeScript 报告类型错误

**解决**：

```bash
# 重新生成类型文件
pnpm run build --filter @ai-space/shared

# 重启 TypeScript 服务器（VSCode）
Ctrl/Cmd + Shift + P -> "TypeScript: Restart TS Server"
```

### 热更新不工作

**问题**：代码更改后页面不自动刷新

**解决**：

```bash
# 重启开发服务器
pnpm run dev
```

---

## 资源链接

- [Office Open XML 规范](https://www.ecma-international.org/publications-and-standards/standards/ecma-376/)
- [TypeScript 官方文档](https://www.typescriptlang.org/docs/)
- [pnpm 文档](https://pnpm.io/)
- [Vite 文档](https://vitejs.dev/)
- [Conventional Commits](https://www.conventionalcommits.org/)

---

## 获取帮助

如果你遇到问题：

1. 查看本文档和[架构文档](./ARCHITECTURE.md)
2. 搜索已有的 [Issues](https://github.com/yourusername/officeParserRenderer/issues)
3. 创建新的 Issue 描述你的问题
4. 在讨论区提问

我们欢迎所有形式的贡献，无论是代码、文档还是问题报告！
