# 景点信息统计API功能说明

## 功能概述
基于订单数据，实现了景点相关的统计分析功能，包括景点购票数量统计、收入分析、热门景点排行等多维度的数据统计。

## 核心统计指标

### 1. 景点基础统计
- **景点ID**: attraction_id，对应景点表的主键
- **景点名称**: 通过JOIN查询获取景点名称
- **订单数量**: 该景点的总订单数
- **购票总数**: 该景点的总购票张数（quantity字段汇总）
- **总收入**: 该景点已支付订单的总金额
- **平均票价**: 总收入 ÷ 购票总数
- **平均每单购票数**: 购票总数 ÷ 订单数量

### 2. 统计维度
- **全时间段统计**: 统计所有历史数据
- **指定日期范围**: 支持按起止日期筛选
- **单个景点分析**: 获取特定景点的详细统计
- **排行榜统计**: 按购票数量或收入排序
- **时间段热门**: 本月/本周最受欢迎的景点

## API接口列表

### 管理员接口 (需要ADMIN权限)

#### 1. 获取所有景点统计
```
GET /api/admin/attractions/statistics/summary
```
**功能**: 获取所有景点的统计信息，按购票数量降序排列

#### 2. 指定日期范围统计
```
GET /api/admin/attractions/statistics/date-range?startDate=2025-07-01&endDate=2025-07-21
```
**参数**:
- `startDate`: 开始日期 (yyyy-MM-dd格式，可选)
- `endDate`: 结束日期 (yyyy-MM-dd格式，可选)

**功能**: 获取指定时间范围内的景点统计数据

#### 3. 单个景点统计
```
GET /api/admin/attractions/{attractionId}/statistics
```
**参数**:
- `attractionId`: 景点ID

**功能**: 获取指定景点的详细统计信息

#### 4. 购票数量排行榜
```
GET /api/admin/attractions/statistics/top-tickets?limit=10
```
**参数**:
- `limit`: 返回条数，默认10条，最多100条

**功能**: 按购票数量排序的景点排行榜

#### 5. 收入排行榜
```
GET /api/admin/attractions/statistics/top-revenue?limit=10
```
**参数**:
- `limit`: 返回条数，默认10条，最多100条

**功能**: 按收入金额排序的景点排行榜

#### 6. 本月热门景点
```
GET /api/admin/attractions/statistics/popular-this-month?limit=10
```
**功能**: 获取本月最受欢迎的景点（按购票数量）

#### 7. 本周热门景点
```
GET /api/admin/attractions/statistics/popular-this-week?limit=10
```
**功能**: 获取最近一周最受欢迎的景点

### 测试接口 (无需认证)

#### 1. 综合景点统计
```
GET /api/test/attractions/statistics
```
**功能**: 获取景点统计的综合数据，包括：
- 所有景点统计
- 购票数量排行榜前5名
- 收入排行榜前5名
- 本月热门景点前5名

#### 2. 单个景点测试
```
GET /api/test/attractions/{attractionId}/statistics
```
**功能**: 测试单个景点的统计信息获取

## 数据库查询逻辑

### 核心SQL查询
```sql
SELECT 
    t.attraction_id as attractionId,
    a.name as attractionName,
    COUNT(*) as orderCount,
    SUM(t.quantity) as totalTickets,
    COALESCE(SUM(CASE WHEN t.status IN ('PAID', 'TICKETED') THEN t.total_amount ELSE 0 END), 0) as totalRevenue
FROM ticket_order t
LEFT JOIN attraction a ON t.attraction_id = a.id
WHERE t.status IN ('PAID', 'TICKETED')
GROUP BY t.attraction_id, a.name
ORDER BY totalTickets DESC
```

### 查询特点
1. **只统计已支付订单**: 过滤status为'PAID'或'TICKETED'的订单
2. **JOIN关联景点表**: 获取景点名称信息
3. **聚合计算**: 使用COUNT、SUM等聚合函数统计数据
4. **COALESCE处理NULL**: 确保数值字段不为空

## 测试结果示例

### 景点统计综合数据
```json
{
  "status": 0,
  "message": "查询成功",
  "data": {
    "allAttractions": [
      {
        "attractionId": 12,
        "attractionName": "新加坡摩天轮观景台",
        "orderCount": 3,
        "totalTickets": 27,
        "totalRevenue": 4563.00
      },
      {
        "attractionId": 1,
        "attractionName": "天安门广场",
        "orderCount": 11,
        "totalTickets": 22,
        "totalRevenue": 1399.00
      }
    ],
    "topByTickets": [...],  // 购票数量排行
    "topByRevenue": [...],  // 收入排行
    "monthlyPopular": [...]  // 本月热门
  }
}
```

### 单个景点统计
```json
{
  "status": 0,
  "message": "查询成功",
  "data": {
    "attractionId": 1,
    "attractionName": "天安门广场",
    "orderCount": 11,
    "totalTickets": 22,
    "totalRevenue": 1399.00,
    "averagePrice": 63.59,
    "averageTicketsPerOrder": 2.0
  }
}
```

## 统计分析洞察

从测试数据可以看出：

### 1. 热门景点排名
1. **新加坡摩天轮观景台** - 27张票，4563.00元收入
2. **天安门广场** - 22张票，1399.00元收入  
3. **故宫博物院** - 8张票，1680.00元收入

### 2. 收入分析
- **高价值景点**: 新加坡摩天轮观景台单票价值最高
- **高频景点**: 天安门广场订单数最多（11个订单）
- **精品路线**: 故宫博物院客单价较高

### 3. 业务建议
- **营销重点**: 推广高收入景点，提升整体客单价
- **产品优化**: 结合热门景点设计旅游套餐
- **库存管理**: 根据统计数据合理分配景点票务资源

## 扩展功能建议

1. **时间趋势分析**: 添加按月、按季度的趋势统计
2. **用户行为分析**: 结合用户数据分析景点偏好
3. **地域分析**: 按地区统计景点受欢迎程度
4. **价格敏感度**: 分析不同价位景点的销售表现
5. **季节性分析**: 统计不同季节的景点热度变化
6. **实时监控**: 添加实时数据更新和预警功能
