// 购物车服务 - 连接后端API
import type { SpotItem, SpotTicket } from './spotService'
import { AuthService } from './authService'

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

// 获取当前用户ID的辅助函数
function getCurrentUserId(): number {
  const userId = AuthService.getUserId()
  return userId ? parseInt(userId) : 1 // 默认用户ID为1，实际项目中应该从认证信息获取
}

export interface CartItem {
  id: string
  spotId: string
  spotName: string
  spotImage: string
  ticketId: string
  ticketType: string
  ticketName: string
  price: number
  originalPrice?: number | null
  quantity: number
  validDays: number
  addedAt: string // 后端返回的是字符串格式
}

export interface CartSummary {
  totalItems: number
  totalPrice: number
  totalSavings: number
}

export interface CartData {
  summary: CartSummary
  items: CartItem[]
}

export interface CartApiResponse {
  data: CartData
  success: boolean
  message: string
}

export interface CartItemRequestDTO {
  attractionId: string
  ticketType: string
  ticketPrice: number
  quantity: number
  visitDate: Date
}

class CartService {
  // 获取购物车中的所有商品
  async getCartItems(): Promise<CartItem[]> {
    try {
      const userId = getCurrentUserId()
      const response = await apiRequest<CartApiResponse>(`/api/cart/${userId}`)
      
      if (response.success) {
        return response.data.items
      } else {
        console.error('API返回错误:', response.message)
        return []
      }
    } catch (error) {
      console.error('获取购物车数据失败:', error)
      return []
    }
  }

  // 获取购物车完整数据（包含汇总信息）
  async getCartData(): Promise<CartData | null> {
    try {
      const userId = getCurrentUserId()
      const response = await apiRequest<CartApiResponse>(`/api/cart/${userId}`)
      
      if (response.success) {
        return response.data
      } else {
        console.error('API返回错误:', response.message)
        return null
      }
    } catch (error) {
      console.error('获取购物车数据失败:', error)
      return null
    }
  }

  // 添加商品到购物车
  async addToCart(spot: SpotItem, ticket: SpotTicket, quantity: number = 1): Promise<boolean> {
    try {
      const userId = getCurrentUserId()
      const requestData: CartItemRequestDTO = {
        attractionId: spot.id,
        ticketType: ticket.type,
        ticketPrice: ticket.price,
        quantity: quantity,
        visitDate: new Date()
      }

      const response = await apiRequest<{ success: boolean; message: string }>(
        `/api/cart/${userId}/add`,
        {
          method: 'POST',
          body: JSON.stringify(requestData)
        }
      )

      if (response.success) {
        return true
      } else {
        console.error('添加到购物车失败:', response.message)
        return false
      }
    } catch (error) {
      console.error('添加到购物车失败:', error)
      return false
    }
  }

  // 更新购物车商品数量
  async updateCartItem(itemId: string, quantity: number): Promise<boolean> {
    try {
      const userId = getCurrentUserId()
      const response = await apiRequest<{ success: boolean; message: string }>(
        `/api/cart/${userId}/update/${itemId}?quantity=${quantity}`,
        {
          method: 'PUT'
        }
      )

      if (response.success) {
        return true
      } else {
        console.error('更新购物车失败:', response.message)
        return false
      }
    } catch (error) {
      console.error('更新购物车失败:', error)
      return false
    }
  }

  // 从购物车中删除商品
  async removeFromCart(itemId: string): Promise<boolean> {
    try {
      const userId = getCurrentUserId()
      const response = await apiRequest<{ success: boolean; message: string }>(
        `/api/cart/${userId}/remove/${itemId}`,
        {
          method: 'DELETE'
        }
      )

      if (response.success) {
        return true
      } else {
        console.error('从购物车删除失败:', response.message)
        return false
      }
    } catch (error) {
      console.error('从购物车删除失败:', error)
      return false
    }
  }

  // 清空购物车
  async clearCart(): Promise<boolean> {
    try {
      const userId = getCurrentUserId()
      const response = await apiRequest<{ success: boolean; message: string }>(
        `/api/cart/${userId}/clear`,
        {
          method: 'DELETE'
        }
      )

      if (response.success) {
        return true
      } else {
        console.error('清空购物车失败:', response.message)
        return false
      }
    } catch (error) {
      console.error('清空购物车失败:', error)
      return false
    }
  }

  // 获取购物车汇总信息
  async getCartSummary(): Promise<CartSummary> {
    try {
      const cartData = await this.getCartData()
      if (cartData) {
        return cartData.summary
      }
      return {
        totalItems: 0,
        totalPrice: 0,
        totalSavings: 0
      }
    } catch (error) {
      console.error('获取购物车汇总失败:', error)
      return {
        totalItems: 0,
        totalPrice: 0,
        totalSavings: 0
      }
    }
  }

  // 获取购物车中的商品数量
  async getCartItemCount(): Promise<number> {
    try {
      const userId = getCurrentUserId()
      const response = await apiRequest<{ success: boolean; count: number }>(
        `/api/cart/${userId}/count`
      )

      if (response.success) {
        return response.count
      } else {
        return 0
      }
    } catch (error) {
      console.error('获取购物车商品数量失败:', error)
      return 0
    }
  }

  // 检查商品是否在购物车中
  async isInCart(spotId: string, ticketId: string): Promise<boolean> {
    try {
      const items = await this.getCartItems()
      return items.some(item => item.spotId === spotId && item.ticketId === ticketId)
    } catch (error) {
      console.error('检查购物车商品失败:', error)
      return false
    }
  }

  // 获取特定商品在购物车中的数量
  async getItemQuantity(spotId: string, ticketId: string): Promise<number> {
    try {
      const items = await this.getCartItems()
      const item = items.find(item => item.spotId === spotId && item.ticketId === ticketId)
      return item ? item.quantity : 0
    } catch (error) {
      console.error('获取商品数量失败:', error)
      return 0
    }
  }

  // 根据景点ID获取购物车中的相关商品
  async getCartItemsBySpot(spotId: string): Promise<CartItem[]> {
    try {
      const items = await this.getCartItems()
      return items.filter(item => item.spotId === spotId)
    } catch (error) {
      console.error('获取景点相关购物车商品失败:', error)
      return []
    }
  }

  // 批量删除购物车商品
  async removeBatch(itemIds: string[]): Promise<boolean> {
    try {
      const results = await Promise.all(
        itemIds.map(itemId => this.removeFromCart(itemId))
      )
      return results.every(result => result === true)
    } catch (error) {
      console.error('批量删除购物车商品失败:', error)
      return false
    }
  }

  // 将时间字符串转换为Date对象的辅助方法
  parseCartItemDate(dateString: string): Date {
    return new Date(dateString)
  }
}

export const cartService = new CartService()
export default CartService
