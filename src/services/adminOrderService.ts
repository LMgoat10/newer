// API基础配置
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'
console.log('AdminOrderService API_BASE_URL:', API_BASE_URL)

// 订单状态常量
export const OrderStatus = {
  PAID: 'PAID',
  TICKETED: 'TICKETED', 
  REFUND_REQUEST: 'REFUND_REQUEST',
  REFUNDED: 'REFUNDED',
  CANCELLED: 'CANCELLED'
} as const

export type OrderStatus = typeof OrderStatus[keyof typeof OrderStatus]

// 支付方式常量
export const PaymentMethod = {
  BALANCE: 'BALANCE',
  ALIPAY: 'ALIPAY', 
  WECHAT: 'WECHAT'
} as const

export type PaymentMethod = typeof PaymentMethod[keyof typeof PaymentMethod]

// 订单信息接口
export interface AdminOrder {
  id: string
  userId: number
  userName: string
  attractionId: number
  attractionName: string
  visitDate: string
  quantity: number
  unitPrice: number
  totalAmount: number
  contactName: string
  contactPhone: string
  contactIdcard: string
  address: string
  status: string
  statusName: string
  payMethod: string
  payMethodName: string
  payTime: string
  payAmount: number
  refundReason?: string
  refundTime?: string
  refundAmount?: number
  createdAt: string
  updatedAt: string
}

// 分页响应接口
export interface PageResponse<T> {
  current: number
  size: number
  total: number
  pages: number
  records: T[]
}

// API响应接口
export interface ApiResponse<T = unknown> {
  status: number
  message: string
  data?: T
}

// 订单统计接口
export interface OrderStatistics {
  totalOrders: number
  paidOrders: number
  ticketedOrders: number
  refundRequestOrders: number
  refundedOrders: number
  cancelledOrders: number
}

// 管理员订单服务类
class AdminOrderService {
  
  /**
   * 分页查询订单列表
   */
  async getOrders(
    page = 1, 
    size = 10, 
    keyword = '', 
    status = 'ALL'
  ): Promise<PageResponse<AdminOrder>> {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString()
    })
    
    if (keyword) {
      params.append('keyword', keyword)
    }
    
    if (status && status !== 'ALL') {
      params.append('status', status)
    }
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    }
    
    // 添加管理员认证token
    const token = localStorage.getItem('authToken')
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    
    const response = await fetch(`${API_BASE_URL}/api/admin/orders?${params}`, {
      method: 'GET',
      headers
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const result: ApiResponse<PageResponse<AdminOrder>> = await response.json()
    
    if (result.status !== 200 || !result.data) {
      throw new Error(result.message || '获取订单列表失败')
    }
    
    return result.data
  }
  
  /**
   * 根据订单ID获取订单详情
   */
  async getOrderById(orderId: string): Promise<AdminOrder> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    }
    
    // 添加管理员认证token
    const token = localStorage.getItem('authToken')
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    
    const response = await fetch(`${API_BASE_URL}/api/admin/orders/${orderId}`, {
      method: 'GET',
      headers
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const result: ApiResponse<AdminOrder> = await response.json()
    
    if (result.status !== 200 || !result.data) {
      throw new Error(result.message || '获取订单详情失败')
    }
    
    return result.data
  }
  
  /**
   * 删除未付款订单
   */
  async deleteOrder(orderId: string): Promise<void> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    }
    
    // 添加管理员认证token
    const token = localStorage.getItem('authToken')
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    
    const response = await fetch(`${API_BASE_URL}/api/admin/orders/${orderId}`, {
      method: 'DELETE',
      headers
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const result: ApiResponse = await response.json()
    
    if (result.status !== 200) {
      throw new Error(result.message || '删除订单失败')
    }
  }
  
  /**
   * 放票（发货）
   */
  async releaseTicket(orderId: string): Promise<void> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    }
    
    // 添加管理员认证token
    const token = localStorage.getItem('authToken')
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    
    const response = await fetch(`${API_BASE_URL}/api/admin/orders/${orderId}/release`, {
      method: 'POST',
      headers
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const result: ApiResponse = await response.json()
    
    if (result.status !== 200) {
      throw new Error(result.message || '放票失败')
    }
  }
  
  /**
   * 批量放票
   */
  async batchReleaseTickets(orderIds: string[]): Promise<void> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    }
    
    // 添加管理员认证token
    const token = localStorage.getItem('authToken')
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    
    const response = await fetch(`${API_BASE_URL}/api/admin/orders/batch-release`, {
      method: 'POST',
      headers,
      body: JSON.stringify(orderIds)
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const result: ApiResponse = await response.json()
    
    if (result.status !== 200) {
      throw new Error(result.message || '批量放票失败')
    }
  }
  
  /**
   * 获取订单统计信息
   */
  async getOrderStatistics(): Promise<OrderStatistics> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    }
    
    // 添加管理员认证token
    const token = localStorage.getItem('authToken')
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    
    const response = await fetch(`${API_BASE_URL}/api/admin/orders/statistics`, {
      method: 'GET',
      headers
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const result: ApiResponse<OrderStatistics> = await response.json()
    
    if (result.status !== 200 || !result.data) {
      throw new Error(result.message || '获取统计信息失败')
    }
    
    return result.data
  }
  
  /**
   * 获取状态中文名称
   */
  getStatusText(status: string): string {
    const statusMap: { [key: string]: string } = {
      'PAID': '已支付待放票',
      'TICKETED': '已放票', 
      'REFUND_REQUEST': '退票申请中',
      'REFUNDED': '已退款',
      'CANCELLED': '已取消'
    }
    return statusMap[status] || status
  }
  
  /**
   * 获取状态颜色
   */
  getStatusColor(status: string): string {
    const colorMap: { [key: string]: string } = {
      'PAID': 'green',
      'TICKETED': 'blue', 
      'REFUND_REQUEST': 'orange',
      'REFUNDED': 'purple',
      'CANCELLED': 'red'
    }
    return colorMap[status] || 'default'
  }
  
  /**
   * 获取支付方式中文名称
   */
  getPayMethodText(payMethod: string): string {
    const methodMap: { [key: string]: string } = {
      'BALANCE': '余额支付',
      'ALIPAY': '支付宝',
      'WECHAT': '微信支付'
    }
    return methodMap[payMethod] || payMethod
  }
}

// 导出服务实例
export const adminOrderService = new AdminOrderService()
export default adminOrderService
