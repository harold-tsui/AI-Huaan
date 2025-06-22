import http from 'k6/http';
import { sleep, check } from 'k6';
import { Counter, Rate, Trend } from 'k6/metrics';
import { randomString } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';

// 自定义指标
const errors = new Counter('errors');
const apiCallDuration = new Trend('api_call_duration');
const successRate = new Rate('success_rate');

// 测试配置
export const options = {
  // 基本配置
  vus: 50,              // 虚拟用户数
  duration: '5m',       // 测试持续时间
  
  // 阶段性负载配置
  stages: [
    { duration: '1m', target: 50 },   // 逐步增加到 50 个用户
    { duration: '3m', target: 50 },   // 保持 50 个用户 3 分钟
    { duration: '1m', target: 0 },    // 逐步减少到 0 个用户
  ],
  
  // 阈值配置
  thresholds: {
    http_req_duration: ['p(95)<500'],  // 95% 的请求应该在 500ms 内完成
    'http_req_duration{name:apiHealth}': ['p(99)<100'],  // 健康检查应该非常快
    'http_req_duration{name:searchQuery}': ['p(95)<1000'],  // 搜索查询应该在 1s 内完成
    'http_req_duration{name:documentUpload}': ['p(95)<2000'],  // 文档上传应该在 2s 内完成
    'success_rate': ['rate>0.95'],  // 成功率应该大于 95%
  },
};

// 初始化函数 - 在测试开始前执行一次
export function setup() {
  // 登录并获取令牌
  const loginRes = http.post('https://basb-system.com/api/auth/login', {
    username: 'performance_test_user',
    password: 'test_password',
  });
  
  check(loginRes, {
    'login successful': (r) => r.status === 200 && r.json('token') !== '',
  });
  
  return {
    token: loginRes.json('token'),
  };
}

// 默认函数 - 每个虚拟用户循环执行
export default function(data) {
  const baseUrl = 'https://basb-system.com';
  const headers = {
    'Authorization': `Bearer ${data.token}`,
    'Content-Type': 'application/json',
  };
  
  // 健康检查
  const healthRes = http.get(`${baseUrl}/api/health`, {
    headers: headers,
    tags: { name: 'apiHealth' },
  });
  
  check(healthRes, {
    'health check successful': (r) => r.status === 200 && r.json('status') === 'ok',
  }) || errors.add(1);
  
  apiCallDuration.add(healthRes.timings.duration, { endpoint: 'health' });
  successRate.add(healthRes.status === 200);
  
  sleep(1);
  
  // 搜索笔记
  const searchTerm = `performance test ${randomString(5)}`;
  const searchRes = http.post(`${baseUrl}/api/search`, JSON.stringify({
    query: searchTerm,
    limit: 10,
  }), {
    headers: headers,
    tags: { name: 'searchQuery' },
  });
  
  check(searchRes, {
    'search successful': (r) => r.status === 200,
    'search results returned': (r) => Array.isArray(r.json('results')),
  }) || errors.add(1);
  
  apiCallDuration.add(searchRes.timings.duration, { endpoint: 'search' });
  successRate.add(searchRes.status === 200);
  
  sleep(2);
  
  // 创建笔记
  const noteTitle = `Performance Test Note ${randomString(8)}`;
  const noteContent = `This is a test note created during performance testing. Random content: ${randomString(50)}`;
  
  const createNoteRes = http.post(`${baseUrl}/api/notes`, JSON.stringify({
    title: noteTitle,
    content: noteContent,
    tags: ['performance', 'test', randomString(5)],
  }), {
    headers: headers,
    tags: { name: 'createNote' },
  });
  
  check(createNoteRes, {
    'note creation successful': (r) => r.status === 201,
    'note id returned': (r) => r.json('id') !== undefined,
  }) || errors.add(1);
  
  apiCallDuration.add(createNoteRes.timings.duration, { endpoint: 'createNote' });
  successRate.add(createNoteRes.status === 201);
  
  const noteId = createNoteRes.json('id');
  
  sleep(1);
  
  // 获取笔记详情
  if (noteId) {
    const getNoteRes = http.get(`${baseUrl}/api/notes/${noteId}`, {
      headers: headers,
      tags: { name: 'getNote' },
    });
    
    check(getNoteRes, {
      'get note successful': (r) => r.status === 200,
      'correct note returned': (r) => r.json('title') === noteTitle,
    }) || errors.add(1);
    
    apiCallDuration.add(getNoteRes.timings.duration, { endpoint: 'getNote' });
    successRate.add(getNoteRes.status === 200);
    
    sleep(1);
    
    // 更新笔记
    const updateNoteRes = http.put(`${baseUrl}/api/notes/${noteId}`, JSON.stringify({
      title: `${noteTitle} (Updated)`,
      content: `${noteContent} Updated content: ${randomString(20)}`,
      tags: ['performance', 'test', 'updated', randomString(5)],
    }), {
      headers: headers,
      tags: { name: 'updateNote' },
    });
    
    check(updateNoteRes, {
      'update note successful': (r) => r.status === 200,
    }) || errors.add(1);
    
    apiCallDuration.add(updateNoteRes.timings.duration, { endpoint: 'updateNote' });
    successRate.add(updateNoteRes.status === 200);
    
    sleep(1);
  }
  
  // 模拟文档上传 (使用小型文档)
  const documentData = randomString(1024 * 10); // 10KB 的随机数据
  const documentRes = http.post(`${baseUrl}/api/documents/upload`, documentData, {
    headers: {
      'Authorization': `Bearer ${data.token}`,
      'Content-Type': 'application/octet-stream',
      'X-Document-Name': `test-document-${randomString(8)}.txt`,
    },
    tags: { name: 'documentUpload' },
  });
  
  check(documentRes, {
    'document upload successful': (r) => r.status === 201 || r.status === 200,
  }) || errors.add(1);
  
  apiCallDuration.add(documentRes.timings.duration, { endpoint: 'documentUpload' });
  successRate.add(documentRes.status === 201 || documentRes.status === 200);
  
  sleep(3);
}

// 清理函数 - 在测试结束后执行一次
export function teardown(data) {
  // 登出
  const logoutRes = http.post('https://basb-system.com/api/auth/logout', {}, {
    headers: {
      'Authorization': `Bearer ${data.token}`,
    },
  });
  
  check(logoutRes, {
    'logout successful': (r) => r.status === 200,
  });
}