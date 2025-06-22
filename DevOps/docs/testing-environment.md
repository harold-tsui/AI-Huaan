# BASB 系统测试环境文档

## 概述

本文档描述了 BASB (Building a Second Brain) 系统的测试环境设置和使用方法。测试环境基于 Jest 测试框架，支持 TypeScript，并配置了适当的测试匹配模式和转换器。

## 测试环境配置

### 技术栈

- **测试框架**: Jest
- **语言支持**: TypeScript (通过 ts-jest)
- **测试文件位置**: `src/__tests__/`
- **测试文件命名规则**: `*.test.ts` 或 `*.spec.ts`

### 配置文件

#### jest.config.js

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: [
    '**/__tests__/**/*.+(ts|tsx|js)',
    '**/?(*.)+(spec|test).+(ts|tsx|js)'
  ],
  transform: {
    '^.+\.(ts|tsx)$': 'ts-jest'
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts'
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  setupFilesAfterEnv: [],
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.test.json'
    }
  }
};
```

#### tsconfig.test.json

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "downlevelIteration": true
  },
  "include": [
    "src/**/*"
  ],
  "exclude": [
    "node_modules",
    "dist"
  ]
}
```

## 测试命令

在 package.json 中定义了以下测试相关的命令：

- **运行所有测试**: `npm test` 或 `npm run test`
- **监视模式运行测试**: `npm run test:watch`
- **生成测试覆盖率报告**: `npm run test:coverage`

## 测试文件结构

测试文件应放置在 `src/__tests__/` 目录下，并以 `.test.ts` 或 `.spec.ts` 为后缀。

### 示例测试文件

#### 环境验证测试 (environment.test.ts)

```typescript
describe('测试环境验证', () => {
  test('sum函数应该正确计算两个数字的和', () => {
    expect(sum(1, 2)).toBe(3);
  });

  test('基本的Jest断言应该正常工作', () => {
    expect(true).toBeTruthy();
    expect([1, 2, 3]).toContain(2);
    // 更多断言...
  });
});
```

#### 服务测试 (knowledge-graph-mcp.test.ts)

```typescript
describe('知识图谱MCP服务', () => {
  let service: MockKnowledgeGraphMCPService;

  beforeEach(() => {
    service = new MockKnowledgeGraphMCPService();
  });

  test('应该能够创建节点', async () => {
    // 测试代码...
  });

  test('应该处理不支持的操作', async () => {
    // 测试代码...
  });
});
```

## 编写测试的最佳实践

1. **测试文件组织**:
   - 每个模块或服务应有对应的测试文件
   - 使用 `describe` 块组织相关测试
   - 使用清晰的测试名称描述预期行为

2. **测试隔离**:
   - 使用 `beforeEach` 和 `afterEach` 设置和清理测试环境
   - 避免测试之间的依赖

3. **模拟外部依赖**:
   - 使用 Jest 的 `jest.mock()` 模拟外部模块
   - 使用 `jest.fn()` 创建模拟函数

4. **异步测试**:
   - 对于异步代码，使用 `async/await` 或返回 Promise
   - 确保异步测试正确完成

5. **测试覆盖率**:
   - 使用 `npm run test:coverage` 生成覆盖率报告
   - 关注关键业务逻辑的测试覆盖

## 故障排除

### 常见问题

1. **测试找不到模块**:
   - 检查 `moduleNameMapper` 配置
   - 确保导入路径正确

2. **TypeScript 类型错误**:
   - 检查 `tsconfig.test.json` 配置
   - 确保类型定义正确

3. **测试超时**:
   - 增加测试超时时间: `test('测试名称', async () => {...}, 10000)`
   - 检查异步代码是否正确完成

## 结论

测试环境已成功搭建，并通过了基本的验证测试。开发人员可以使用此环境编写和运行测试，确保代码质量和功能正确性。