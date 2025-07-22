# 支付宝支付状态检查问题解决方案

## 🐛 问题分析

### 1. 空指针异常原因
```java
// 错误代码
if (request.getParameter("trade_status").equals("TRADE_SUCCESS"))

// 问题：request.getParameter("trade_status") 可能返回 null
// 当参数不存在时调用 .equals() 会抛出 NullPointerException
```

### 2. 接口使用错误
- `/alipay/notify` 是支付宝**异步回调接口**，不是查询接口
- 前端不应该主动调用回调接口来查询状态
- 需要创建专门的**状态查询接口**

## ✅ 解决方案

### 1. 修复后端空指针异常

```java
@PostMapping("/notify")
public String payNotify(HttpServletRequest request) throws Exception {
    try {
        // ✅ 先检查参数是否存在
        String tradeStatus = request.getParameter("trade_status");
        if (tradeStatus == null) {
            System.out.println("支付回调参数缺失: trade_status 为空");
            return "fail";
        }
        
        if (tradeStatus.equals("TRADE_SUCCESS")) {
            // 处理支付成功逻辑
            Map<String, String> params = new HashMap<>();
            Map<String, String[]> requestParams = request.getParameterMap();
            
            for (String name : requestParams.keySet()) {
                String value = request.getParameter(name);
                if (value != null) { // ✅ 检查每个参数
                    params.put(name, value);
                }
            }
            
            String tradeNo = params.get("out_trade_no");
            if (tradeNo == null) {
                System.out.println("支付回调参数缺失: out_trade_no 为空");
                return "fail";
            }
            
            // 验签和更新订单逻辑...
        }
    } catch (Exception e) {
        System.err.println("支付回调处理异常: " + e.getMessage());
        return "fail";
    }
    
    return "success";
}
```

### 2. 新增支付状态查询接口

```java
@GetMapping("/check-status")
public ResponseEntity<Map<String, Object>> checkPaymentStatus(@RequestParam String tradeNo) {
    Map<String, Object> response = new HashMap<>();
    
    try {
        if (tradeNo == null || tradeNo.trim().isEmpty()) {
            response.put("success", false);
            response.put("message", "交易号不能为空");
            return ResponseEntity.badRequest().body(response);
        }
        
        // 查询订单状态
        TicketOrder order = ticketOrderMapper.selectById(tradeNo.trim());
        
        if (order != null) {
            response.put("success", true);
            response.put("status", order.getStatus().toString());
            response.put("message", "查询成功");
            
            Map<String, Object> orderInfo = new HashMap<>();
            orderInfo.put("tradeNo", order.getId());
            orderInfo.put("totalAmount", order.getTotalAmount());
            orderInfo.put("paymentTime", order.getCheckoutTime());
            response.put("orderInfo", orderInfo);
        } else {
            response.put("success", false);
            response.put("status", "NOT_FOUND");
            response.put("message", "订单不存在，可能支付尚未完成");
        }
        
        return ResponseEntity.ok(response);
    } catch (Exception e) {
        response.put("success", false);
        response.put("message", "查询失败: " + e.getMessage());
        return ResponseEntity.status(500).body(response);
    }
}
```

### 3. 前端接口调用修正

```typescript
// ❌ 错误：调用回调接口
fetch('/alipay/notify?out_trade_no=xxx', { method: 'POST' })

// ✅ 正确：调用查询接口  
fetch('/alipay/check-status?tradeNo=xxx', { method: 'GET' })
```

## 🔄 完整支付流程

### 1. 支付发起
```
用户选择支付宝 → 保存订单数据 → 跳转支付宝 → 完成支付
```

### 2. 支付回调（后端自动处理）
```
支付宝 → POST /alipay/notify → 验签 → 更新订单状态
```

### 3. 状态查询（前端主动）
```
用户点击刷新 → GET /alipay/check-status → 返回订单状态 → 创建订单
```

## 📋 实施步骤

1. **立即修复**：在 `payNotify` 方法中添加空指针检查
2. **添加接口**：创建 `/alipay/check-status` 查询接口
3. **测试验证**：确保支付回调和状态查询都能正常工作

## 🎯 关键要点

- ✅ **回调接口** = 支付宝主动调用，用于通知支付结果
- ✅ **查询接口** = 前端主动调用，用于查询订单状态  
- ✅ **参数检查** = 避免空指针异常
- ✅ **错误处理** = 提供用户友好的错误信息

修复这些问题后，支付流程将更加稳定可靠！
