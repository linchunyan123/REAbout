# FocusBoard

一个使用 React、TypeScript 和 Vite 构建的响应式个人工作管理台。

## 功能

- 多页面路由：工作概览、任务管理、个人设置和 404 页面
- 任务管理：创建、编辑、删除、完成、搜索和状态筛选
- 数据持久化：任务与主题偏好自动保存到 `localStorage`
- 数据概览：任务数量、完成率、近期任务和最近动态
- 表单处理：必填项、字段校验和保存反馈
- 主题切换：支持浅色、深色及系统初始偏好
- 响应式布局：适配桌面、平板和移动端
- 基础测试：Vitest + Testing Library

## 开发

```bash
npm install
npm run dev
```

浏览器访问终端输出的本地地址。

## 检查

```bash
npm run lint
npm run test
npm run build
```

## 技术栈

- React 19
- TypeScript
- React Router
- Lucide React
- Vite
- Vitest / Testing Library

## 项目结构

```text
src/
  components/   布局和通用表单
  contexts/     任务与主题状态
  data/         初始示例数据
  pages/        路由页面
  test/         测试配置
  types/        TypeScript 类型
```
