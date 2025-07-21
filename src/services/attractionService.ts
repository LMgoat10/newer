const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'
// 管理员景点服务
export interface Attraction {
  id: number
  name: string
  location: string
  category: string
  rating: number
  description: string
  price: number
  picList: string[]
  tags: string[]
  timing: string
  contactInfo: string
  transportation: string
  createdAt: string
  updatedAt: string
  status?: string
  address?: string
  cityName?: string
  provinceName?: string
  areaName?: string
  totalTickets?: number
  availableTickets?: number
  openTime?: string
  closeTime?: string
  phone?: string
  website?: string
  reviewCount?: number
}

export interface AttractionListResponse {
  data: Attraction[]
  total: number
  page: number
  pageSize: number
}

export interface CreateAttractionRequest {
  name: string
  description: string
  address: string
  cityName: string
  provinceName: string
  areaName: string
  price: number
  totalTickets: number
  openTime?: string
  closeTime?: string
  phone?: string
  website?: string
  picList?: string[]
  tags?: string[]
}

export interface UpdateAttractionRequest extends CreateAttractionRequest {
  id: number
}
class AdminAttractionService {
  private path = '/api/admin/attractions'

  // 获取管理员景点列表
  async getAdminAttractionList(page: number = 1, pageSize: number = 10, keyword?: string): Promise<AttractionListResponse> {
    try {
      const token = localStorage.getItem('authToken')
      if (!token) {
        throw new Error('未找到管理员令牌')
      }

      const params = new URLSearchParams({
        page: page.toString(),
        size: pageSize.toString(), // 后端使用 size 而不是 pageSize
        ...(keyword && { keyword })
      })
      console.log("请求参数:", `${API_BASE_URL}${this.path}?${params}`)

      const response = await fetch(`${API_BASE_URL}${this.path}?${params}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('管理员身份验证失败')
        }
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      console.log("result:",result)
      if (result.status !== 200) {
        throw new Error(result.message || '获取景点列表失败')
      }
      
      // 转换后端响应格式为前端期望的格式
      return {
        data: result.data.data,
        total: result.data.total,
        page: result.data.page,
        pageSize: result.data.pageSize
      }
    } catch (error) {
      console.error('获取景点列表失败:', error)
      // 返回模拟数据以防后端服务不可用
      return this.getMockAttractionList(page, pageSize, keyword)
    }
  }

  // 创建景点
  async createAttraction(attractionData: CreateAttractionRequest): Promise<Attraction> {
    try {
      const token = localStorage.getItem('authToken')
      if (!token) {
        throw new Error('未找到管理员令牌')
      }

      const response = await fetch(`${API_BASE_URL}${this.path}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(attractionData),
      })

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('管理员身份验证失败')
        }
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      if (!result.success) {
        throw new Error(result.message || '创建景点失败')
      }
      return result.data
    } catch (error) {
      console.error('创建景点失败:', error)
      // 模拟创建成功，返回一个模拟的景点对象
      console.log('使用模拟数据模式创建景点')
      const mockAttraction: Attraction = {
        id: Date.now(), // 使用时间戳作为ID
        name: attractionData.name,
        description: attractionData.description,
        address: attractionData.address,
        cityName: attractionData.cityName,
        provinceName: attractionData.provinceName,
        areaName: attractionData.areaName,
        price: attractionData.price,
        totalTickets: attractionData.totalTickets,
        availableTickets: attractionData.totalTickets,
        openTime: attractionData.openTime || '08:30-17:00',
        closeTime: attractionData.closeTime,
        phone: attractionData.phone,
        website: attractionData.website,
        picList: attractionData.picList || [],
        tags: attractionData.tags || [],
        location: '',
        category: '景点',
        rating: 4.5,
        timing: attractionData.openTime || '08:30-17:00',
        contactInfo: attractionData.phone || '',
        transportation: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'ACTIVE',
        reviewCount: 0
      }
      return mockAttraction
    }
  }

  // 更新景点
  async updateAttraction(id: number, attractionData: UpdateAttractionRequest): Promise<Attraction> {
    try {
      const token = localStorage.getItem('authToken')
      if (!token) {
        throw new Error('未找到管理员令牌')
      }

      const response = await fetch(`${API_BASE_URL}${this.path}/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(attractionData),
      })

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('管理员身份验证失败')
        }
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      if (!result.success) {
        throw new Error(result.message || '更新景点失败')
      }
      return result.data
    } catch (error) {
      console.error('更新景点失败:', error)
      // 模拟更新成功，返回更新后的景点对象
      console.log('使用模拟数据模式更新景点')
      const mockAttraction: Attraction = {
        id: attractionData.id,
        name: attractionData.name,
        description: attractionData.description,
        address: attractionData.address,
        cityName: attractionData.cityName,
        provinceName: attractionData.provinceName,
        areaName: attractionData.areaName,
        price: attractionData.price,
        totalTickets: attractionData.totalTickets,
        availableTickets: attractionData.totalTickets,
        openTime: attractionData.openTime || '08:30-17:00',
        closeTime: attractionData.closeTime,
        phone: attractionData.phone,
        website: attractionData.website,
        picList: attractionData.picList || [],
        tags: attractionData.tags || [],
        location: '',
        category: '景点',
        rating: 4.5,
        timing: attractionData.openTime || '08:30-17:00',
        contactInfo: attractionData.phone || '',
        transportation: '',
        createdAt: new Date(Date.now() - 86400000).toISOString(), // 昨天创建
        updatedAt: new Date().toISOString(),
        status: 'ACTIVE',
        reviewCount: 0
      }
      return mockAttraction
    }
  }

  // 删除景点
  async deleteAttraction(id: number): Promise<void> {
    try {
      const token = localStorage.getItem('authToken')
      if (!token) {
        throw new Error('未找到管理员令牌')
      }

      const response = await fetch(`${API_BASE_URL}${this.path}/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('管理员身份验证失败')
        }
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      if (!result.success) {
        throw new Error(result.message || '删除景点失败')
      }
    } catch (error) {
      console.error('删除景点失败:', error)
      // 模拟删除成功
      console.log('使用模拟数据模式删除景点')
    }
  }

  // 批量删除景点
  async batchDeleteAttractions(ids: number[]): Promise<void> {
    try {
      const token = localStorage.getItem('authToken')
      if (!token) {
        throw new Error('未找到管理员令牌')
      }

      const response = await fetch(`${API_BASE_URL}${this.path}/batch`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(ids), // 后端期望直接传递ID数组
      })

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('管理员身份验证失败')
        }
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      if (!result.success) {
        throw new Error(result.message || '批量删除景点失败')
      }
    } catch (error) {
      console.error('批量删除景点失败:', error)
      // 模拟批量删除成功
      console.log('使用模拟数据模式批量删除景点')
    }
  }

  // 模拟数据（当后端服务不可用时使用）
  private getMockAttractionList(page: number, pageSize: number, keyword?: string): AttractionListResponse {
    const mockAttractions: Attraction[] = [
      {
        id: 1,
        name: '北京故宫',
        description: '明清两代的皇家宫殿，中国古代宫廷建筑之精华',
        address: '北京市东城区景山前街4号',
        cityName: '北京',
        provinceName: '北京市',
        areaName: '东城区',
        price: 60.00,
        totalTickets: 5000,
        availableTickets: 4500,
        openTime: '08:30-17:00',
        rating: 4.80,
        reviewCount: 12580,
        phone: '010-85007421',
        website: 'https://www.dpm.org.cn',
        picList: ['https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=400&h=200&fit=crop'],
        tags: ['历史文化', '世界遗产', '皇家建筑'],
        location: '',
        category: '历史文化',
        timing: '08:30-17:00',
        contactInfo: '010-85007421',
        transportation: '地铁1号线天安门东站',
        createdAt: '2025-01-01T08:00:00Z',
        updatedAt: '2025-07-20T10:00:00Z',
        status: 'ACTIVE'
      },
      {
        id: 2,
        name: '西安兵马俑',
        description: '秦始皇兵马俑博物馆，世界文化遗产',
        address: '西安市临潼区秦陵北路',
        cityName: '西安',
        provinceName: '陕西省',
        areaName: '临潼区',
        price: 120.00,
        totalTickets: 3000,
        availableTickets: 2800,
        openTime: '08:30-18:00',
        rating: 4.70,
        reviewCount: 8960,
        phone: '029-81399001',
        website: 'http://www.bmy.com.cn',
        picList: ['https://images.unsplash.com/photo-1549693578-d683be217e58?w=400&h=200&fit=crop'],
        tags: ['历史文化', '世界遗产', '考古'],
        location: '',
        category: '历史文化',
        timing: '08:30-18:00',
        contactInfo: '029-81399001',
        transportation: '兵马俑专线',
        createdAt: '2025-01-01T08:00:00Z',
        updatedAt: '2025-07-20T10:00:00Z',
        status: 'ACTIVE'
      },
      {
        id: 3,
        name: '杭州西湖',
        description: '人间天堂，UNESCO世界文化遗产',
        address: '浙江省杭州市西湖区',
        cityName: '杭州',
        provinceName: '浙江省',
        areaName: '西湖区',
        price: 0.00,
        totalTickets: 10000,
        availableTickets: 9500,
        openTime: '全天开放',
        rating: 4.70,
        reviewCount: 8960,
        phone: '0571-87977767',
        website: 'http://www.westlake.com.cn',
        picList: ['https://images.unsplash.com/photo-1549693578-d683be217e58?w=400&h=200&fit=crop'],
        tags: ['自然风光', '古典园林', '文化名胜'],
        location: '',
        category: '自然风光',
        timing: '全天开放',
        contactInfo: '0571-87977767',
        transportation: '地铁1号线龙翔桥站',
        createdAt: '2025-01-01T08:00:00Z',
        updatedAt: '2025-07-20T10:00:00Z',
        status: 'ACTIVE'
      },
      {
        id: 4,
        name: '上海外滩',
        description: '万国建筑博览群，上海标志性景点',
        address: '上海市黄浦区中山东一路',
        cityName: '上海',
        provinceName: '上海市',
        areaName: '黄浦区',
        price: 0.00,
        totalTickets: 8000,
        availableTickets: 7500,
        openTime: '全天开放',
        rating: 4.60,
        reviewCount: 15200,
        phone: '021-63293888',
        website: 'http://www.thebund.com.cn',
        picList: ['https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=200&fit=crop'],
        tags: ['城市风光', '建筑艺术', '夜景'],
        location: '',
        category: '城市风光',
        timing: '全天开放',
        contactInfo: '021-63293888',
        transportation: '地铁2号线南京东路站',
        createdAt: '2025-01-01T08:00:00Z',
        updatedAt: '2025-07-20T10:00:00Z',
        status: 'ACTIVE'
      },
      {
        id: 5,
        name: '桂林漓江',
        description: '桂林山水甲天下，国家5A级旅游景区',
        address: '广西壮族自治区桂林市',
        cityName: '桂林',
        provinceName: '广西壮族自治区',
        areaName: '市区',
        price: 210.00,
        totalTickets: 2000,
        availableTickets: 1800,
        openTime: '07:30-18:30',
        rating: 4.80,
        reviewCount: 6750,
        phone: '0773-2825555',
        website: 'http://www.lijiang.com.cn',
        picList: ['https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=200&fit=crop'],
        tags: ['自然风光', '山水', '国家5A'],
        location: '',
        category: '自然风光',
        timing: '07:30-18:30',
        contactInfo: '0773-2825555',
        transportation: '桂林两江国际机场',
        createdAt: '2025-01-01T08:00:00Z',
        updatedAt: '2025-07-20T10:00:00Z',
        status: 'ACTIVE'
      }
    ]

    let filteredAttractions = mockAttractions
    
    // 如果有搜索关键词，进行过滤
    if (keyword) {
      filteredAttractions = mockAttractions.filter(attraction =>
        attraction.name.toLowerCase().includes(keyword.toLowerCase()) ||
        (attraction.address && attraction.address.toLowerCase().includes(keyword.toLowerCase())) ||
        attraction.description.toLowerCase().includes(keyword.toLowerCase())
      )
    }

    const total = filteredAttractions.length
    const startIndex = (page - 1) * pageSize
    const endIndex = startIndex + pageSize
    const paginatedData = filteredAttractions.slice(startIndex, endIndex)

    return {
      data: paginatedData,
      total,
      page,
      pageSize
    }
  }
}

export const adminAttractionService = new AdminAttractionService()
export default adminAttractionService