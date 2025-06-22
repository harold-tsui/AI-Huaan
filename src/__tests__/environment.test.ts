/**
 * 测试环境验证测试
 * 
 * 这个文件用于验证Jest测试环境是否正常工作
 */

// 一个简单的函数，用于测试
function sum(a: number, b: number): number {
  return a + b;
}

describe('测试环境验证', () => {
  test('sum函数应该正确计算两个数字的和', () => {
    expect(sum(1, 2)).toBe(3);
    expect(sum(-1, 1)).toBe(0);
    expect(sum(5, 5)).toBe(10);
  });

  test('基本的Jest断言应该正常工作', () => {
    // 基本断言
    expect(true).toBeTruthy();
    expect(false).toBeFalsy();
    expect(null).toBeNull();
    expect(undefined).toBeUndefined();
    
    // 数组断言
    const arr = [1, 2, 3];
    expect(arr).toContain(2);
    expect(arr).toHaveLength(3);
    
    // 对象断言
    const obj = { name: 'test', value: 42 };
    expect(obj).toHaveProperty('name');
    expect(obj.value).toBe(42);
  });
});