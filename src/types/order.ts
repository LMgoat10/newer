// 订单相关类型定义

// 订单状态常量
export const OrderStatus = {
  PAID: 'PAID',           // 已支付
  TICKETED: 'TICKETED',   // 已出票
  REFUND_REQUEST: 'REFUND_REQUEST', // 申请退款
  REFUNDED: 'REFUNDED',   // 已退款
  CANCELLED: 'CANCELLED'  // 已取消
} as const

export type OrderStatusType = typeof OrderStatus[keyof typeof OrderStatus]

// 支付方式常量
export const PayMethod = {
  BALANCE: 'BALANCE',     // 余额支付
  ALIPAY: 'ALIPAY',      // 支付宝
  WECHAT: 'WECHAT'       // 微信支付
} as const

export type PayMethodType = typeof PayMethod[keyof typeof PayMethod]

// 订单状态中文映射
export const OrderStatusText = {
  [OrderStatus.PAID]: '已支付',
  [OrderStatus.TICKETED]: '已出票',
  [OrderStatus.REFUND_REQUEST]: '申请退款',
  [OrderStatus.REFUNDED]: '已退款',
  [OrderStatus.CANCELLED]: '已取消'
}

// 支付方式中文映射
export const PayMethodText = {
  [PayMethod.BALANCE]: '余额支付',
  [PayMethod.ALIPAY]: '支付宝',
  [PayMethod.WECHAT]: '微信支付'
}

// 订单状态颜色映射
export const OrderStatusColor = {
  [OrderStatus.PAID]: 'blue',
  [OrderStatus.TICKETED]: 'green',
  [OrderStatus.REFUND_REQUEST]: 'orange',
  [OrderStatus.REFUNDED]: 'purple',
  [OrderStatus.CANCELLED]: 'red'
}

// 订单接口
export interface TicketOrder {
  orderId: string         // 订单ID (后端字段名)
  orderNumber: string     // 订单号
  userId: number
  attractionId: number
  attractionName?: string // 景点名称
  attractionImage?: string // 景点图片
  visitDate: string
  quantity: number
  unitPrice: number
  totalAmount: number
  contactName?: string
  contactPhone?: string
  contactIdcard?: string
  contactEmail?: string   // 联系邮箱
  address?: string
  status: OrderStatusType
  payMethod?: PayMethodType
  paidAt?: string         // 支付时间
  payAmount?: number      // 支付金额
  refundReason?: string
  refundTime?: string
  refundAmount?: number
  createdAt: string
  updatedAt: string
}

// 创建订单请求接口
export interface CreateOrderRequest {
  attractionId: number
  visitDate: string
  quantity: number
  unitPrice: number
  totalAmount: number
  contactName: string
  contactPhone: string
  contactIdcard?: string
  address?: string
  payMethod: PayMethodType
  cartItemIds: string[] // 购物车项ID列表，用于创建订单后清理购物车
}

// 订单列表查询参数
export interface OrderQueryParams {
  status?: OrderStatusType
  page?: number
  pageSize?: number
  startDate?: string
  endDate?: string
}

// 创建订单响应接口
export interface CreateOrderResponse {
  status: number
  message: string
  data: TicketOrder
}

// 订单列表响应
export interface OrderListResponse {
  status: number
  message: string
  data: {
    content: TicketOrder[]
    currentPage: number
    pageSize: number
    totalElements: number
    totalPages: number
    first: boolean
    last: boolean
    empty: boolean
  }
}

// 订单详情响应
export interface OrderDetailResponse {
  status: number
  message: string
  data: TicketOrder
}

// 退款申请接口
export interface RefundRequest {
  orderId: string
  refundReason: string
}

// API通用响应
export interface ApiResponse {
  status: number
  success: boolean
  message: string
}
