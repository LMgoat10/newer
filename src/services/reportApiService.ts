// 报表统计API服务
import { AuthService } from './authService'

// API基础配置
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

// 类型定义
export interface OrderStatisticsDTO {
  date: string
  orderCount: number
  totalAmount: number
  averageAmount?: number
}

export interface MonthSummary {
  totalOrders: number
  paidOrders: number
  totalRevenue: number
  averageOrderValue: number
}

export interface ApiResponse<T> {
  status: number
  message: string
  data: T
}

// 通用API请求函数
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  }

  // 添加认证token（如果需要）
  const token = AuthService.getAuthToken()
  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    }
  }

  try {
    const response = await fetch(url, config)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return await response.json()
  } catch (error) {
    console.error('API request failed:', error)
    throw error
  }
}

export const reportApiService = {
  // 获取指定日期范围的每日统计
  async getDailyStatistics(startDate: string, endDate: string): Promise<ApiResponse<OrderStatisticsDTO[]>> {
    const params = new URLSearchParams({
      startDate,
      endDate
    })
    return apiRequest<ApiResponse<OrderStatisticsDTO[]>>(`/api/admin/orders/statistics/daily?${params}`)
  },

  // 获取今日统计
  async getTodayStatistics(): Promise<ApiResponse<OrderStatisticsDTO>> {
    return apiRequest<ApiResponse<OrderStatisticsDTO>>('/api/admin/orders/statistics/today')
  },

  // 获取最近N天统计
  async getRecentStatistics(days: number = 7): Promise<ApiResponse<OrderStatisticsDTO[]>> {
    const params = new URLSearchParams({
      days: days.toString()
    })
    return apiRequest<ApiResponse<OrderStatisticsDTO[]>>(`/api/admin/orders/statistics/recent?${params}`)
  },

  // 获取本月统计
  async getThisMonthStatistics(): Promise<ApiResponse<OrderStatisticsDTO[]>> {
    return apiRequest<ApiResponse<OrderStatisticsDTO[]>>('/api/admin/orders/statistics/this-month')
  },

  // 获取订单总览
  async getOrderSummary(): Promise<ApiResponse<MonthSummary>> {
    return apiRequest<ApiResponse<MonthSummary>>('/api/admin/orders/statistics/summary')
  },

  // 管理员接口 - 获取每日统计
  async getAdminDailyStatistics(startDate: string, endDate: string): Promise<ApiResponse<OrderStatisticsDTO[]>> {
    const params = new URLSearchParams({
      startDate,
      endDate
    })
    return apiRequest<ApiResponse<OrderStatisticsDTO[]>>(`/api/admin/orders/statistics/daily?${params}`)
  },

  // 用户接口 - 获取用户每日统计
  async getUserDailyStatistics(startDate: string, endDate: string): Promise<ApiResponse<OrderStatisticsDTO[]>> {
    const params = new URLSearchParams({
      startDate,
      endDate
    })
    return apiRequest<ApiResponse<OrderStatisticsDTO[]>>(`/api/user/orders/statistics/daily?${params}`)
  }
}
