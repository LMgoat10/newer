# 购物车API迁移完成指南

## 📋 迁移概要

前端购物车服务已成功从本地localStorage迁移到后端API。现在所有购物车操作都通过HTTP请求与后端服务器进行交互。

## 🔧 主要变更

### 1. CartService API 方法变更

所有CartService方法现在都是异步的，返回Promise对象：

| 原方法 | 新方法 | 变更说明 |
|--------|--------|----------|
| `getCartItems()` | `async getCartItems()` | 现在从API获取数据 |
| `addToCart()` | `async addToCart()` | 调用后端添加接口 |
| `updateCartItem()` | `async updateCartItem()` | 调用后端更新接口 |
| `removeFromCart()` | `async removeFromCart()` | 调用后端删除接口 |
| `clearCart()` | `async clearCart()` | 调用后端清空接口 |
| `getCartItemCount()` | `async getCartItemCount()` | 使用专门的计数接口 |

### 2. 新增方法

- `getCartData()` - 获取完整购物车数据（包含汇总信息）
- `getSpotsWithPagination()` - 获取带分页信息的购物车数据
- `parseCartItemDate()` - 解析后端返回的日期字符串

### 3. 数据格式变更

```typescript
// 旧格式（localStorage）
interface CartItem {
  addedAt: Date  // Date对象
}

// 新格式（API）
interface CartItem {
  addedAt: string  // ISO日期字符串
  originalPrice?: number | null  // 可能为null
}
```

## 🌐 后端API接口对应

| 前端方法 | HTTP方法 | 后端接口 | 说明 |
|----------|----------|----------|------|
| `getCartItems()` | GET | `/api/cart/{userId}` | 获取购物车数据 |
| `addToCart()` | POST | `/api/cart/{userId}/add` | 添加商品到购物车 |
| `updateCartItem()` | PUT | `/api/cart/{userId}/update/{cartItemId}?quantity={quantity}` | 更新商品数量 |
| `removeFromCart()` | DELETE | `/api/cart/{userId}/remove/{cartItemId}` | 删除购物车商品 |
| `clearCart()` | DELETE | `/api/cart/{userId}/clear` | 清空购物车 |
| `getCartItemCount()` | GET | `/api/cart/{userId}/count` | 获取商品数量 |

## 📝 后端API响应格式

### 获取购物车数据
```json
{
  "data": {
    "summary": {
      "totalItems": 4,
      "totalSavings": 0,
      "totalPrice": 270.00
    },
    "items": [
      {
        "id": "1",
        "spotId": "1",
        "spotName": "北京故宫",
        "spotImage": "https://...",
        "ticketId": "cart_1_adult",
        "ticketType": "adult", 
        "ticketName": "成人票",
        "price": 60.00,
        "originalPrice": null,
        "quantity": 2,
        "validDays": 1,
        "addedAt": "2025-07-20T14:51:49"
      }
    ]
  },
  "success": true,
  "message": "获取购物车成功"
}
```

### 操作成功响应
```json
{
  "success": true,
  "message": "操作成功"
}
```

### 商品数量响应
```json
{
  "success": true,
  "count": 4
}
```

## 🛠️ 已更新的组件

### 1. SpotDetail.tsx
- `handleAddToCart()` - 改为异步方法，增加错误处理
- `handleBuyNow()` - 改为异步方法，增加错误处理

### 2. CartPage.tsx
- `loadCartData()` - 改为异步方法，使用新API
- `handleQuantityChange()` - 改为异步方法
- `handleRemoveItem()` - 改为异步方法
- `handleClearCart()` - 改为异步方法
- `handleCheckout()` - 改为异步方法
- 日期显示修复：使用`cartService.parseCartItemDate()`

### 3. TopNavigation.tsx
- 购物车数量获取改为异步
- 移除localStorage监听，改为定时轮询（5秒间隔）

## 🔧 环境配置

### 环境变量 (.env)
```bash
VITE_API_URL=http://localhost:8080
```

### 用户ID管理
当前使用localStorage存储用户ID：
```typescript
// 获取当前用户ID
function getCurrentUserId(): number {
  const userId = localStorage.getItem('userId')
  return userId ? parseInt(userId) : 1 // 默认用户ID为1
}
```

## 🔄 错误处理与降级

所有API方法都包含完整的错误处理：

1. **网络错误**：显示用户友好的错误消息
2. **API错误**：记录详细错误日志，显示简化错误信息
3. **数据为空**：返回默认值或空数组

## 🚀 使用示例

```typescript
// 添加商品到购物车
const handleAddToCart = async () => {
  try {
    const success = await cartService.addToCart(spot, ticket, quantity)
    if (success) {
      message.success('添加成功')
    }
  } catch (error) {
    message.error('添加失败')
  }
}

// 获取购物车数据
const loadCart = async () => {
  try {
    const cartData = await cartService.getCartData()
    if (cartData) {
      setCartItems(cartData.items)
      setCartSummary(cartData.summary)
    }
  } catch (error) {
    console.error('加载购物车失败:', error)
  }
}
```

## ✅ 迁移验证

购物车API迁移已完成，包括：

- ✅ 所有API接口已对接
- ✅ 异步操作错误处理
- ✅ UI组件适配完成
- ✅ 数据格式转换
- ✅ 用户体验优化

现在前端已准备好与您的后端服务器进行完整的购物车功能交互！
