// 景点统计API服务
import { AuthService } from './authService'

// API基础配置
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

// 类型定义
export interface AttractionStatisticsDTO {
  attractionId: number
  attractionName: string
  orderCount: number
  totalTickets: number
  totalRevenue: number
  averagePrice?: number
  averageTicketsPerOrder?: number
}

export interface AttractionStatisticsSummary {
  allAttractions: AttractionStatisticsDTO[]
  topByTickets: AttractionStatisticsDTO[]
  topByRevenue: AttractionStatisticsDTO[]
  monthlyPopular: AttractionStatisticsDTO[]
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

export const attractionApiService = {
  // 获取所有景点统计（管理员接口）
  async getAllAttractionsSummary(): Promise<ApiResponse<AttractionStatisticsDTO[]>> {
    return apiRequest<ApiResponse<AttractionStatisticsDTO[]>>('/api/admin/attractions/statistics/summary')
  },

  // 指定日期范围统计
  async getAttractionsByDateRange(startDate?: string, endDate?: string): Promise<ApiResponse<AttractionStatisticsDTO[]>> {
    const params = new URLSearchParams()
    if (startDate) params.set('startDate', startDate)
    if (endDate) params.set('endDate', endDate)
    
    const queryString = params.toString()
    const endpoint = `/api/admin/attractions/statistics/date-range${queryString ? `?${queryString}` : ''}`
    return apiRequest<ApiResponse<AttractionStatisticsDTO[]>>(endpoint)
  },

  // 单个景点统计
  async getSingleAttractionStatistics(attractionId: number): Promise<ApiResponse<AttractionStatisticsDTO>> {
    return apiRequest<ApiResponse<AttractionStatisticsDTO>>(`/api/admin/attractions/${attractionId}/statistics`)
  },

  // 购票数量排行榜
  async getTopAttractionsByTickets(limit: number = 10): Promise<ApiResponse<AttractionStatisticsDTO[]>> {
    const params = new URLSearchParams({
      limit: limit.toString()
    })
    return apiRequest<ApiResponse<AttractionStatisticsDTO[]>>(`/api/admin/attractions/statistics/top-tickets?${params}`)
  },

  // 收入排行榜
  async getTopAttractionsByRevenue(limit: number = 10): Promise<ApiResponse<AttractionStatisticsDTO[]>> {
    const params = new URLSearchParams({
      limit: limit.toString()
    })
    return apiRequest<ApiResponse<AttractionStatisticsDTO[]>>(`/api/admin/attractions/statistics/top-revenue?${params}`)
  },

  // 本月热门景点
  async getPopularAttractionsThisMonth(limit: number = 10): Promise<ApiResponse<AttractionStatisticsDTO[]>> {
    const params = new URLSearchParams({
      limit: limit.toString()
    })
    return apiRequest<ApiResponse<AttractionStatisticsDTO[]>>(`/api/admin/attractions/statistics/popular-this-month?${params}`)
  },

  // 本周热门景点
  async getPopularAttractionsThisWeek(limit: number = 10): Promise<ApiResponse<AttractionStatisticsDTO[]>> {
    const params = new URLSearchParams({
      limit: limit.toString()
    })
    return apiRequest<ApiResponse<AttractionStatisticsDTO[]>>(`/api/admin/attractions/statistics/popular-this-week?${params}`)
  }
}
