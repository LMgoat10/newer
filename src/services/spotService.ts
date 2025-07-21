// 景点服务 - 连接后端API
import type { Destination } from '../data/destinations'

// API基础配置
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

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

  // 添加认证token（如果存在）
  const token = localStorage.getItem('authToken')
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

export interface SpotLocation {
  lat: string
  lon: string
}

export interface SpotTicket {
  id: string
  type: string
  name: string
  price: number
  originalPrice?: number
  description: string
  validDays: number
  stock: number
}

export interface SpotItem {
  id: string
  name: string
  address: string
  areaName: string
  cityName: string
  proName: string
  summary: string
  location: SpotLocation
  picList: string[]
  tickets: SpotTicket[]
  rating: number
  reviewCount: number
  openTime: string
  phone?: string
  website?: string
  tags: string[]
}

export interface SpotSearchParams {
  keyword?: string
  cityName?: string
  proName?: string
  page?: number
  pageSize?: number
}

export interface SpotApiResponse {
  data: {
    total: number
    pageSize: number
    pageNum: number
    attractions: SpotItem[]
    pages: number
  }
  success: boolean
  message: string
}

class SpotService {

  // 获取所有景点
  async getAllSpots(params: SpotSearchParams = {}): Promise<SpotItem[]> {
    try {
      const { keyword, cityName, proName, page = 1, pageSize = 20 } = params
      
      // 构建查询参数
      const queryParams = new URLSearchParams()
      if (keyword) queryParams.append('keyword', keyword)
      if (cityName) queryParams.append('cityName', cityName)
      if (proName) queryParams.append('proName', proName)
      queryParams.append('pageNum', page.toString())
      queryParams.append('pageSize', pageSize.toString())

      const endpoint = `/api/attractions${queryParams.toString() ? '?' + queryParams.toString() : ''}`
      const response = await apiRequest<SpotApiResponse>(endpoint)

      if (response.success) {
        return response.data.attractions
      } else {
        console.error('API返回错误:', response.message)
        return []
      }
    } catch (error) {
      console.error('获取景点列表失败:', error)
      // 发生错误时返回部分mock数据作为降级处理
      return []
    }
  }

  // 根据ID获取景点详情
  async getSpotById(id: string): Promise<SpotItem | null> {
    try {
      const endpoint = `/api/attractions/${id}`
      const response = await apiRequest<{ data: SpotItem; success: boolean; message: string }>(endpoint)
      
      if (response.success) {
        return response.data
      } else {
        console.error('API返回错误:', response.message)
        return null
      }
    } catch (error) {
      console.error('获取景点详情失败:', error)
      // 降级处理：从mock数据中查找
      return null
    }
  }

  // 获取热门景点
  async getPopularSpots(limit: number = 8): Promise<SpotItem[]> {
    try {
      // 获取热门景点，按照评论数或评分排序
      const queryParams = new URLSearchParams()
      queryParams.append('pageNum', '1')
      queryParams.append('pageSize', limit.toString())
      queryParams.append('sortBy', 'reviewCount') // 按评论数排序获取热门景点
      queryParams.append('sortOrder', 'desc')

      const endpoint = `/api/attractions?${queryParams.toString()}`
      const response = await apiRequest<SpotApiResponse>(endpoint)

      if (response.success) {
        return response.data.attractions
      } else {
        console.error('API返回错误:', response.message)
        return []
      }
    } catch (error) {
      console.error('获取热门景点失败:', error)
      return []
    }
  }

  // 搜索景点
  async searchSpots(keyword: string, page: number = 1, pageSize: number = 20): Promise<SpotItem[]> {
    return this.getAllSpots({ keyword, page, pageSize })
  }

  // 获取带分页信息的景点列表
  async getSpotsWithPagination(params: SpotSearchParams = {}): Promise<SpotApiResponse['data'] | null > {
    try {
      const { keyword, cityName, proName, page = 1, pageSize = 20 } = params
      
      // 构建查询参数
      const queryParams = new URLSearchParams()
      if (keyword) queryParams.append('keyword', keyword)
      if (cityName) queryParams.append('cityName', cityName)
      if (proName) queryParams.append('proName', proName)
      queryParams.append('pageNum', page.toString())
      queryParams.append('pageSize', pageSize.toString())

      const endpoint = `/api/attractions${queryParams.toString() ? '?' + queryParams.toString() : ''}`
      const response = await apiRequest<SpotApiResponse>(endpoint)

      if (response.success) {
        return response.data
      } else {
        console.error('API返回错误:', response.message)
        // 返回默认分页数据
        return {
          total: 0,
          pageSize: pageSize,
          pageNum: page,
          attractions: [],
          pages: 0
        }
      }
    } catch (error) {
      console.error('获取景点分页数据失败:', error)
      
      return null
    }
  }

  // 将景点数据转换为Destination格式
  convertSpotToDestination(spot: SpotItem): Destination & { 
    address: string
    summary: string
    location: SpotLocation 
    tickets: SpotTicket[]
  } {
    return {
      id: spot.id,
      name: spot.name,
      country: `${spot.cityName}, ${spot.proName}`,
      price: spot.tickets.length > 0 ? `From ¥${Math.min(...spot.tickets.map(t => t.price))}` : 'Free',
      image: spot.picList[0] || 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=200&fit=crop',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      rating: spot.rating,
      reviewCount: spot.reviewCount,
      popularityRank: 1,
      tags: spot.tags,
      address: spot.address,
      summary: spot.summary,
      location: spot.location,
      tickets: spot.tickets
    }
  }

  // 获取景点分类/标签
  async getSpotCategories(): Promise<string[]> {
    try {
      const response = await apiRequest<{ data: string[]; success: boolean; message: string }>('/api/attractions/categories')
      
      if (response.success) {
        return response.data
      } else {
        console.error('API返回错误:', response.message)
        return []
      }
    } catch (error) {
      console.error('获取景点分类失败:', error)
      // 降级处理：返回常见分类
      return ['自然风光', '历史文化', '主题乐园', '博物馆', '古建筑', '山水景观', '城市观光', '宗教场所']
    }
  }

  // 获取城市列表
  async getCities(): Promise<{ cityName: string; proName: string; count: number }[]> {
    try {
      const response = await apiRequest<{ 
        data: { cityName: string; proName: string; count: number }[]; 
        success: boolean; 
        message: string 
      }>('/api/attractions/cities')
      
      if (response.success) {
        return response.data
      } else {
        console.error('API返回错误:', response.message)
        return []
      }
    } catch (error) {
      console.error('获取城市列表失败:', error)
      return []
    }
  }
}

export const spotService = new SpotService()
export default SpotService
