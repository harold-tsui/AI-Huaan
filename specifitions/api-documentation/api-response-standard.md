# API 响应格式标准

## 1. 概述

本文档定义了 BASB (Building a Second Brain) 系统中所有 RESTful API 的标准响应格式。所有 API 端点都应遵循这些准则，以确保一致性、可预测性和易用性。

## 2. 通用响应结构

所有 API 响应都应包含一个顶层 JSON 对象，其中包含以下字段：

- `success` (boolean): 指示请求是否成功处理。`true` 表示成功，`false` 表示失败。
- `code` (integer): HTTP 状态码的补充，用于提供更具体的业务逻辑状态。例如，`20001` 可能表示“创建成功”，而 `40001` 表示“无效的输入参数”。
- `message` (string): 对响应状态的简要描述，可用于向用户显示信息。
- `data` (object | array | null): 仅在请求成功时出现。包含响应的主要数据。如果请求没有返回数据，则为 `null`。
- `error` (object | null): 仅在请求失败时出现。包含有关错误的详细信息。

## 3. 成功响应格式

当 API 请求成功处理时，`success` 字段为 `true`，`error` 字段为 `null`。

### 3.1. 返回单个资源

```json
{
  "success": true,
  "code": 200,
  "message": "资源获取成功",
  "data": {
    "id": "12345",
    "name": "示例资源",
    "description": "这是一个示例资源的描述。"
  }
}
```

### 3.2. 返回资源列表（带分页）

对于返回列表的请求，`data` 对象应包含数据本身以及分页信息。

```json
{
  "success": true,
  "code": 200,
  "message": "资源列表获取成功",
  "data": {
    "items": [
      {
        "id": "1",
        "name": "项目A"
      },
      {
        "id": "2",
        "name": "项目B"
      }
    ],
    "pagination": {
      "total": 100,
      "page": 1,
      "pageSize": 10,
      "totalPages": 10
    }
  }
}
```

### 3.3. 无返回数据的成功响应

对于创建、更新或删除等操作，如果不需要返回数据，`data` 字段可以为 `null` 或一个空对象 `{}`。

```json
{
  "success": true,
  "code": 204,
  "message": "资源删除成功",
  "data": null
}
```

## 4. 错误响应格式

当 API 请求处理失败时，`success` 字段为 `false`，`data` 字段为 `null`。

`error` 对象应包含以下字段：

- `type` (string): 错误的类型，例如 `Validation Error`, `Authentication Error`, `Not Found`。
- `message` (string): 对错误的详细描述。
- `details` (array | object | null): (可选) 提供有关错误的更多具体信息，例如字段验证错误。

### 4.1. 通用错误示例

```json
{
  "success": false,
  "code": 404,
  "message": "请求的资源未找到",
  "error": {
    "type": "Not Found",
    "message": "ID 为 'xyz' 的资源不存在。"
  }
}
```

### 4.2. 验证错误示例

当输入数据验证失败时，`details` 字段可以用来提供每个字段的错误信息。

```json
{
  "success": false,
  "code": 400,
  "message": "输入参数无效",
  "error": {
    "type": "Validation Error",
    "message": "提供的输入数据未通过验证。",
    "details": [
      {
        "field": "email",
        "message": "必须是有效的电子邮件地址。"
      },
      {
        "field": "password",
        "message": "密码长度不能少于8个字符。"
      }
    ]
  }
}
```

## 5. HTTP 状态码

API 应使用标准的 HTTP 状态码来指示请求的结果，同时在响应体中使用业务 `code` 提供更详细的信息。

- **2xx (成功)**: 请求已成功处理。
- **4xx (客户端错误)**: 请求包含错误或无法处理。
- **5xx (服务器错误)**: 服务器在处理请求时发生内部错误。