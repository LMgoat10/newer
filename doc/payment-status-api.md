# 支付状态检查API

## 接口说明
该接口用于检查支付宝支付状态，需要在后端实现。

## 请求信息
- **URL**: `/alipay/check-status`
- **方法**: `GET`
- **参数**: 
  - `tradeNo`: 商户订单号（必需）

## 响应格式

### 成功响应
```json
{
  "success": true,
  "status": "PAID", // 或 "UNPAID", "TRADE_SUCCESS", "TRADE_CLOSED"
  "message": "查询成功",
  "orderInfo": {
    "tradeNo": "ORDER_1234567890",
    "totalAmount": 99.99,
    "paymentTime": "2025-07-22 12:34:56"
  }
}
```

### 失败响应
```json
{
  "success": false,
  "status": "UNPAID",
  "message": "支付未完成"
}
```

## 后端实现建议

```java
@GetMapping("/check-status")
public ResponseEntity<Map<String, Object>> checkPaymentStatus(@RequestParam String tradeNo) {
    Map<String, Object> response = new HashMap<>();
    
    try {
        // 根据 tradeNo 查询订单状态
        TicketOrder order = ticketOrderMapper.selectById(tradeNo);
        
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
            response.put("message", "订单不存在");
        }
        
        return ResponseEntity.ok(response);
    } catch (Exception e) {
        response.put("success", false);
        response.put("status", "ERROR");
        response.put("message", "查询失败: " + e.getMessage());
        return ResponseEntity.status(500).body(response);
    }
}
```

## 注意事项
1. 该接口应该根据支付宝异步通知更新的订单状态来判断支付是否成功
2. 支付成功的状态应该是 `PAID` 或 `TRADE_SUCCESS`
3. 需要处理订单不存在、查询失败等异常情况
