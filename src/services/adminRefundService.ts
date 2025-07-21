// API基础配置
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'
console.log('AdminRefundService API_BASE_URL:', API_BASE_URL)

// 退票状态常量
export const RefundStatus = {
  PAID: 'PAID',
  TICKETED: 'TICKETED',
  REFUND_REQUEST: 'REFUND_REQUEST',
  REFUNDED: 'REFUNDED',
  CANCELLED: 'CANCELLED'
} as const

export type RefundStatus = typeof RefundStatus[keyof typeof RefundStatus]

// 支付方式常量
export const PaymentMethod = {
  BALANCE: 'BALANCE',
  ALIPAY: 'ALIPAY',
  WECHAT: 'WECHAT'
} as const

export type PaymentMethod = typeof PaymentMethod[keyof typeof PaymentMethod]

// 退票信息接口
export interface AdminRefund {
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
  total: number
  records: T[]
}

// API响应接口
export interface ApiResponse<T = unknown> {
  status: number
  message: string
  data?: T
}

// 退票统计接口
export interface RefundStatistics {
  pendingCount: number
  refundedCount: number
  todayRefundAmount: number
}

class AdminRefundService {
  
  /**
   * 分页查询退票申请列表
   */
  async getRefundRequests(
    page = 1, 
    size = 10, 
    keyword = '', 
    status = 'ALL'
  ): Promise<PageResponse<AdminRefund>> {
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
    
    const response = await fetch(`${API_BASE_URL}/api/admin/refunds?${params}`, {
      method: 'GET',
      headers
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const result: ApiResponse<PageResponse<AdminRefund>> = await response.json()
    
    if (result.status !== 200 || !result.data) {
      throw new Error(result.message || '获取退票申请列表失败')
    }
    
    return result.data
  }
  
  /**
   * 批准退票申请
   */
  async approveRefund(refundId: string): Promise<void> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    }
    
    // 添加管理员认证token
    const token = localStorage.getItem('authToken')
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    
    const response = await fetch(`${API_BASE_URL}/api/admin/refunds/${refundId}/approve`, {
      method: 'POST',
      headers
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const result: ApiResponse = await response.json()
    
    if (result.status !== 200) {
      throw new Error(result.message || '批准退票申请失败')
    }
  }
  
  /**
   * 拒绝退票申请
   */
  async rejectRefund(refundId: string, reason: string): Promise<void> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    }
    
    // 添加管理员认证token
    const token = localStorage.getItem('authToken')
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    
    const response = await fetch(`${API_BASE_URL}/api/admin/refunds/${refundId}/reject`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ reason })
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const result: ApiResponse = await response.json()
    
    if (result.status !== 200) {
      throw new Error(result.message || '拒绝退票申请失败')
    }
  }
  
  /**
   * 获取退票统计信息
   */
  async getRefundStatistics(): Promise<RefundStatistics> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    }
    
    // 添加管理员认证token
    const token = localStorage.getItem('authToken')
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    
    const response = await fetch(`${API_BASE_URL}/api/admin/refunds/statistics`, {
      method: 'GET',
      headers
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const result: ApiResponse<RefundStatistics> = await response.json()
    
    if (result.status !== 200 || !result.data) {
      throw new Error(result.message || '获取退票统计信息失败')
    }
    
    return result.data
  }
  
  /**
   * 获取状态中文名称
   */
  getStatusName(status: string): string {
    const statusMap: Record<string, string> = {
      'PAID': '已支付',
      'TICKETED': '已放票',
      'REFUND_REQUEST': '退票申请中',
      'REFUNDED': '已退款',
      'CANCELLED': '已取消'
    }
    return statusMap[status] || status
  }
  
  /**
   * 获取支付方式中文名称
   */
  getPayMethodName(payMethod: string): string {
    const payMethodMap: Record<string, string> = {
      'BALANCE': '余额支付',
      'ALIPAY': '支付宝',
      'WECHAT': '微信支付'
    }
    return payMethodMap[payMethod] || payMethod
  }
}

// 创建并导出服务实例
const adminRefundService = new AdminRefundService()
export default adminRefundService
