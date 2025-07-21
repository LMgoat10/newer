# 用户余额支付功能文档

## 🎯 功能概述

新增了完整的用户余额支付系统，支持余额查询、扣款和充值功能，用户可以使用账户余额直接支付订单。

## 🔧 技术实现

### 后端API接口

#### 1. 获取用户余额
```
GET /api/user/balance
Authorization: Bearer {token}

Response:
{
  "status": 0,
  "message": "success",
  "data": {
    "balance": 1000.00
  }
}
```

#### 2. 扣除用户余额
```
POST /api/user/balance/deduct
Authorization: Bearer {token}
Content-Type: application/json

Request Body:
{
  "amount": 120.00,
  "orderId": "order_123",
  "description": "订单支付 - ORDER001"
}

Response:
{
  "status": 0,
  "message": "扣款成功",
  "data": {
    "newBalance": 880.00
  }
}
```

#### 3. 充值用户余额
```
POST /api/user/balance/recharge
Authorization: Bearer {token}
Content-Type: application/json

Request Body:
{
  "amount": 500.00,
  "description": "账户充值"
}

Response:
{
  "status": 0,
  "message": "充值成功",
  "data": {
    "newBalance": 1380.00
  }
}
```

### 前端实现

#### AuthService 扩展
```typescript
// 获取用户余额
static async getUserBalance(): Promise<number>

// 扣除余额
static async deductBalance(
  amount: number, 
  orderId: string, 
  description: string
): Promise<boolean>

// 充值余额
static async rechargeBalance(
  amount: number, 
  description: string
): Promise<boolean>
```

## 📱 用户体验

### 订单确认页面改进

1. **余额显示**
   - 在支付方式选择中显示当前余额
   - 实时更新余额信息

2. **余额验证**
   - 选择余额支付时自动检查余额是否足够
   - 余额不足时给出友好提示

3. **支付流程**
   ```
   选择余额支付 → 验证余额充足 → 创建订单 → 扣除余额 → 更新余额显示
   ```

### 界面展示

支付方式选择界面：
```
○ 余额支付                    余额: ¥1,000.00
○ 支付宝
○ 微信支付
```

## 🔄 支付流程

### 余额支付流程
1. **预检查**: 在提交订单前验证余额是否足够
2. **创建订单**: 调用后端API创建订单
3. **扣除余额**: 订单创建成功后扣除对应金额
4. **更新显示**: 刷新页面上的余额显示
5. **清理购物车**: 移除已下单的商品

### 错误处理
- **余额不足**: 显示当前余额和需要支付的金额
- **扣款失败**: 提示联系客服处理
- **网络错误**: 自动重试或提示用户重新操作

## 💡 安全考虑

1. **权限验证**: 所有余额相关操作需要用户认证
2. **金额验证**: 前后端双重验证金额的有效性
3. **操作记录**: 后端记录所有余额变动日志
4. **并发控制**: 防止余额被重复扣除

## 🚀 未来扩展

1. **余额明细**: 显示余额变动历史记录
2. **自动充值**: 余额不足时引导用户充值
3. **优惠券**: 结合优惠券系统使用
4. **分期支付**: 支持余额+其他支付方式组合

## 🔍 调试信息

控制台会输出详细的支付过程：
```javascript
// 余额检查
console.log('当前余额:', userBalance, '需要支付:', totalAmount)

// 扣款成功
console.log('余额扣除成功，新余额:', newBalance)

// 支付完成
console.log('余额支付成功，已扣除', totalAmount)
```

## 📊 数据流

```
用户选择余额支付
    ↓
前端检查余额是否足够
    ↓
创建订单（后端）
    ↓
扣除余额（后端）
    ↓
更新前端余额显示
    ↓
清理购物车
    ↓
跳转到订单页面
```

这个系统提供了完整的余额支付体验，确保用户可以方便、安全地使用账户余额进行购买。
