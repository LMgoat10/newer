import React, { useState, useEffect, useCallback } from 'react'
import {
  Card,
  Row,
  Col,
  DatePicker,
  Space,
  Button,
  message,
  Spin,
  Typography,
  Divider,
  Alert,
  Select,
  Statistic
} from 'antd'
import {
  BarChartOutlined,
  ReloadOutlined,
  DollarOutlined,
  ShoppingCartOutlined,
  TrophyOutlined,
  LineChartOutlined
} from '@ant-design/icons'
import ReactECharts from 'echarts-for-react'
import * as echarts from 'echarts'
import dayjs from 'dayjs'
import { 
  reportApiService, 
  type OrderStatisticsDTO,
  type MonthSummary
} from '../../services/reportApiService'
import {
  attractionApiService,
  type AttractionStatisticsSummary
} from '../../services/attractionApiService'

const { Title } = Typography
const { RangePicker } = DatePicker

const ReportsPage: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>([
    dayjs().subtract(7, 'day'),
    dayjs()
  ])
  
  // 时间段选择状态
  const [timeRangeType, setTimeRangeType] = useState<'recent7' | 'recent30' | 'custom'>('recent7')
  
  // 数据状态
  const [dailyStatistics, setDailyStatistics] = useState<OrderStatisticsDTO[]>([])
  const [todayStatistics, setTodayStatistics] = useState<OrderStatisticsDTO | null>(null)
  const [monthSummary, setMonthSummary] = useState<MonthSummary | null>(null)
  const [attractionStatistics, setAttractionStatistics] = useState<AttractionStatisticsSummary | null>(null)
  const [error, setError] = useState<string | null>(null)

  const loadAllData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      // 加载今日统计
      const todayRes = await reportApiService.getTodayStatistics()
      if (todayRes.status === 0) {
        setTodayStatistics(todayRes.data)
      }

      // 加载月度汇总
      const summaryRes = await reportApiService.getOrderSummary()
      if (summaryRes.status === 0) {
        setMonthSummary(summaryRes.data)
      }

      // 如果有自定义日期范围，加载对应的每日统计
      if (dateRange) {
        const startDate = dateRange[0].format('YYYY-MM-DD')
        const endDate = dateRange[1].format('YYYY-MM-DD')
        
        const dailyRes = await reportApiService.getDailyStatistics(startDate, endDate)
        if (dailyRes.status === 0) {
          setDailyStatistics(dailyRes.data)
        }
      }

      // 加载景点统计数据
      try {
        const [topTicketsRes, topRevenueRes, allAttractionsRes] = await Promise.all([
          attractionApiService.getTopAttractionsByTickets(10),
          attractionApiService.getTopAttractionsByRevenue(10),
          attractionApiService.getAllAttractionsSummary()
        ])

        if (topTicketsRes.status === 0 && topRevenueRes.status === 0 && allAttractionsRes.status === 0) {
          const combinedData: AttractionStatisticsSummary = {
            allAttractions: allAttractionsRes.data,
            topByTickets: topTicketsRes.data,
            topByRevenue: topRevenueRes.data,
            monthlyPopular: allAttractionsRes.data.slice(0, 10) // 使用前10个作为月度热门
          }
          setAttractionStatistics(combinedData)
        }
      } catch (attractionError) {
        console.warn('景点统计数据加载失败:', attractionError)
        // 景点统计失败不影响主要数据显示
      }
    } catch (error) {
      console.error('加载报表数据失败:', error)
      const errorMessage = error instanceof Error ? error.message : '加载报表数据失败'
      setError(errorMessage)
      message.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [dateRange])

  useEffect(() => {
    loadAllData()
  }, [loadAllData])

  const handleRefresh = () => {
    loadAllData()
  }

  const handleDateRangeChange = (dates: [dayjs.Dayjs, dayjs.Dayjs] | null) => {
    setDateRange(dates)
    setTimeRangeType('custom')
  }

  // 处理时间段选择
  const handleTimeRangeTypeChange = (type: 'recent7' | 'recent30' | 'custom') => {
    setTimeRangeType(type)
    
    if (type === 'recent7') {
      setDateRange([dayjs().subtract(7, 'day'), dayjs()])
    } else if (type === 'recent30') {
      setDateRange([dayjs().subtract(30, 'day'), dayjs()])
    }
    // 如果是 custom，保持当前的 dateRange
  }

  // 每日订单趋势图配置
  const getDailyTrendsOption = () => {
    const dataToUse = dailyStatistics
    
    // 按日期排序确保从左至右日期递增
    const sortedData = [...dataToUse].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    
    return {
      title: {
        text: '订单流水趋势',
        left: 'center',
        textStyle: { fontSize: 16, fontWeight: 'bold' }
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'cross' },
        formatter: (params: unknown[]) => {
          const orderData = params[0] as { name: string; value: number; axisValue: string }
          const revenueData = params[1] as { name: string; value: number }
          const date = orderData.axisValue
          return `${date}<br/>订单数量: ${orderData.value}<br/>流水金额: ¥${revenueData.value}`
        }
      },
      legend: {
        data: ['订单数量', '流水金额'],
        top: '10%'
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        top: '20%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: sortedData.map(item => dayjs(item.date).format('MM-DD'))
      },
      yAxis: [
        {
          type: 'value',
          name: '订单数量',
          position: 'left'
        },
        {
          type: 'value',
          name: '流水金额(¥)',
          position: 'right'
        }
      ],
      series: [
        {
          name: '订单数量',
          type: 'line',
          yAxisIndex: 0,
          data: sortedData.map(item => item.orderCount),
          smooth: true,
          itemStyle: { color: '#1890ff' },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(24, 144, 255, 0.3)' },
              { offset: 1, color: 'rgba(24, 144, 255, 0.1)' }
            ])
          }
        },
        {
          name: '流水金额',
          type: 'line',
          yAxisIndex: 1,
          data: sortedData.map(item => item.totalAmount),
          smooth: true,
          itemStyle: { color: '#52c41a' },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(82, 196, 26, 0.3)' },
              { offset: 1, color: 'rgba(82, 196, 26, 0.1)' }
            ])
          }
        }
      ]
    }
  }

  // 每日订单柱状图配置
  const getDailyOrdersOption = () => {
    const dataToUse = dailyStatistics
    
    // 按日期排序确保从左至右日期递增
    const sortedData = [...dataToUse].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    
    return {
      title: {
        text: '每日订单统计',
        left: 'center',
        textStyle: { fontSize: 16, fontWeight: 'bold' }
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: (params: unknown[]) => {
          const data = params[0] as { name: string; value: number; axisValue: string }
          const orderData = sortedData.find(item => dayjs(item.date).format('MM-DD') === data.axisValue)
          return `${data.axisValue}<br/>订单数量: ${data.value}<br/>流水金额: ¥${orderData?.totalAmount || 0}<br/>平均金额: ¥${orderData?.averageAmount?.toFixed(2) || 0}`
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: sortedData.map(item => dayjs(item.date).format('MM-DD')),
        axisLabel: {
          rotate: 45,
          fontSize: 10
        }
      },
      yAxis: {
        type: 'value',
        name: '订单数量'
      },
      series: [{
        name: '订单数量',
        type: 'bar',
        data: sortedData.map(item => item.orderCount),
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#1890ff' },
            { offset: 1, color: '#40a9ff' }
          ])
        },
        emphasis: {
          itemStyle: { color: '#096dd9' }
        }
      }]
    }
  }

  // 景点购票数量排行图配置
  const getAttractionTicketsRankingOption = () => {
    if (!attractionStatistics || !attractionStatistics.topByTickets) {
      return {}
    }
    
    const topAttractions = attractionStatistics.topByTickets.slice(0, 10)
    
    return {
      title: {
        text: '景点购票数量排行榜',
        left: 'center',
        textStyle: { fontSize: 16, fontWeight: 'bold' }
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: (params: unknown[]) => {
          const data = params[0] as { name: string; value: number; dataIndex: number }
          const attraction = topAttractions[data.dataIndex]
          return `${attraction.attractionName}<br/>购票数量: ${attraction.totalTickets}<br/>订单数: ${attraction.orderCount}<br/>总收入: ¥${attraction.totalRevenue}`
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'value',
        name: '购票数量'
      },
      yAxis: {
        type: 'category',
        data: topAttractions.map(item => item.attractionName),
        axisLabel: {
          interval: 0,
          fontSize: 10,
          formatter: function(value: string) {
            return value.length > 6 ? value.substring(0, 6) + '...' : value
          }
        }
      },
      series: [{
        name: '购票数量',
        type: 'bar',
        data: topAttractions.map(item => item.totalTickets),
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
            { offset: 0, color: '#ff7875' },
            { offset: 1, color: '#ff4d4f' }
          ])
        },
        emphasis: {
          itemStyle: { color: '#cf1322' }
        }
      }]
    }
  }

  // 景点收入排行图配置
  const getAttractionRevenueRankingOption = () => {
    if (!attractionStatistics || !attractionStatistics.topByRevenue) {
      return {}
    }
    
    const topAttractions = attractionStatistics.topByRevenue.slice(0, 10)
    
    return {
      title: {
        text: '景点收入排行榜',
        left: 'center',
        textStyle: { fontSize: 16, fontWeight: 'bold' }
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: (params: unknown[]) => {
          const data = params[0] as { name: string; value: number; dataIndex: number }
          const attraction = topAttractions[data.dataIndex]
          return `${attraction.attractionName}<br/>总收入: ¥${attraction.totalRevenue}<br/>购票数: ${attraction.totalTickets}<br/>平均票价: ¥${(attraction.totalRevenue / attraction.totalTickets).toFixed(2)}`
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'value',
        name: '收入金额(¥)'
      },
      yAxis: {
        type: 'category',
        data: topAttractions.map(item => item.attractionName),
        axisLabel: {
          interval: 0,
          fontSize: 10,
          formatter: function(value: string) {
            return value.length > 6 ? value.substring(0, 6) + '...' : value
          }
        }
      },
      series: [{
        name: '收入金额',
        type: 'bar',
        data: topAttractions.map(item => item.totalRevenue),
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
            { offset: 0, color: '#73d13d' },
            { offset: 1, color: '#52c41a' }
          ])
        },
        emphasis: {
          itemStyle: { color: '#389e0d' }
        }
      }]
    }
  }

  // 景点热度分布饼图配置
  const getAttractionPopularityPieOption = () => {
    if (!attractionStatistics || !attractionStatistics.allAttractions) {
      return {}
    }
    
    const allAttractions = attractionStatistics.allAttractions.slice(0, 8) // 只显示前8个景点
    
    return {
      title: {
        text: '景点热度分布',
        left: 'center',
        textStyle: { fontSize: 16, fontWeight: 'bold' }
      },
      tooltip: {
        trigger: 'item',
        formatter: (params: unknown) => {
          const data = params as { name: string; value: number; percent: number; dataIndex: number }
          const attraction = allAttractions[data.dataIndex]
          return `${data.name}<br/>购票数: ${data.value}<br/>占比: ${data.percent}%<br/>收入: ¥${attraction.totalRevenue}`
        }
      },
      legend: {
        orient: 'vertical',
        left: 'left',
        top: 'middle',
        textStyle: { fontSize: 10 },
        formatter: function(name: string) {
          return name.length > 8 ? name.substring(0, 8) + '...' : name
        }
      },
      series: [{
        name: '购票数量',
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['60%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 20,
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: allAttractions.map((item, index) => ({
          value: item.totalTickets,
          name: item.attractionName,
          itemStyle: {
            color: [
              '#ff7875', '#ffa940', '#fadb14', '#a0d911', 
              '#52c41a', '#13c2c2', '#1890ff', '#722ed1'
            ][index]
          }
        }))
      }]
    }
  }

  if (error) {
    return (
      <div style={{ padding: '24px' }}>
        <Alert
          message="数据加载失败"
          description={error}
          type="error"
          showIcon
          action={
            <Button size="small" onClick={handleRefresh}>
              重试
            </Button>
          }
        />
      </div>
    )
  }

  return (
    <div style={{ padding: '24px', background: '#f5f5f5', minHeight: '100vh' }}>
      <Spin spinning={loading}>
        {/* 页面标题和操作区 */}
        <div style={{ marginBottom: '24px' }}>
          <Title level={2} style={{ margin: 0 }}>
            <BarChartOutlined style={{ marginRight: '12px', color: '#1890ff' }} />
            订单流水统计
          </Title>
          
          <div style={{ marginTop: '16px' }}>
            <Space wrap>
              <Select
                value={timeRangeType}
                onChange={handleTimeRangeTypeChange}
                style={{ width: 120 }}
              >
                <Select.Option value="recent7">近7天</Select.Option>
                <Select.Option value="recent30">近30天</Select.Option>
                <Select.Option value="custom">自定义</Select.Option>
              </Select>
              <RangePicker
                value={dateRange}
                onChange={(dates) => handleDateRangeChange(dates as [dayjs.Dayjs, dayjs.Dayjs] | null)}
                format="YYYY-MM-DD"
                placeholder={['开始日期', '结束日期']}
                disabled={timeRangeType !== 'custom'}
              />
              <Button type="primary" onClick={handleRefresh} icon={<ReloadOutlined />}>
                刷新数据
              </Button>
            </Space>
          </div>
        </div>

        {/* 今日统计卡片 */}
        {(todayStatistics || monthSummary) && (
          <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
            {todayStatistics && (
              <>
                <Col xs={24} sm={12} lg={6}>
                  <Card>
                    <Statistic
                      title="今日订单数"
                      value={todayStatistics.orderCount}
                      prefix={<ShoppingCartOutlined style={{ color: '#1890ff' }} />}
                      valueStyle={{ color: '#1890ff' }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                  <Card>
                    <Statistic
                      title="今日营业额"
                      value={todayStatistics.totalAmount}
                      precision={2}
                      prefix={<DollarOutlined style={{ color: '#52c41a' }} />}
                      suffix="¥"
                      valueStyle={{ color: '#52c41a' }}
                    />
                  </Card>
                </Col>
              </>
            )}
            {monthSummary && (
              <>
                <Col xs={24} sm={12} lg={6}>
                  <Card>
                    <Statistic
                      title="本月总订单"
                      value={monthSummary.totalOrders}
                      prefix={<TrophyOutlined style={{ color: '#fa8c16' }} />}
                      valueStyle={{ color: '#fa8c16' }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                  <Card>
                    <Statistic
                      title="平均订单价值"
                      value={monthSummary.averageOrderValue}
                      precision={2}
                      prefix={<LineChartOutlined style={{ color: '#722ed1' }} />}
                      suffix="¥"
                      valueStyle={{ color: '#722ed1' }}
                    />
                  </Card>
                </Col>
              </>
            )}
          </Row>
        )}

        {/* 图表区域 */}
        <Row gutter={[16, 16]}>
          {/* 每日订单统计 */}
          <Col xs={24} lg={12}>
            <Card>
              <ReactECharts
                option={getDailyOrdersOption()}
                style={{ height: '400px' }}
                opts={{ renderer: 'canvas' }}
              />
            </Card>
          </Col>

          {/* 订单趋势分析 */}
          <Col xs={24} lg={12}>
            <Card>
              <ReactECharts
                option={getDailyTrendsOption()}
                style={{ height: '400px' }}
                opts={{ renderer: 'canvas' }}
              />
            </Card>
          </Col>
        </Row>

        {/* 景点统计图表区域 */}
        {attractionStatistics && (
          <>
            <Divider style={{ margin: '32px 0' }}>
              <Title level={3} style={{ margin: 0 }}>
                <BarChartOutlined style={{ marginRight: '8px', color: '#fa8c16' }} />
                景点统计分析
              </Title>
            </Divider>
            
            <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
              {/* 景点购票数量排行 */}
              <Col xs={24} lg={12}>
                <Card>
                  <ReactECharts
                    option={getAttractionTicketsRankingOption()}
                    style={{ height: '400px' }}
                    opts={{ renderer: 'canvas' }}
                  />
                </Card>
              </Col>

              {/* 景点收入排行 */}
              <Col xs={24} lg={12}>
                <Card>
                  <ReactECharts
                    option={getAttractionRevenueRankingOption()}
                    style={{ height: '400px' }}
                    opts={{ renderer: 'canvas' }}
                  />
                </Card>
              </Col>
            </Row>

            <Row gutter={[16, 16]}>
              {/* 景点热度分布饼图 */}
              <Col xs={24} lg={12}>
                <Card>
                  <ReactECharts
                    option={getAttractionPopularityPieOption()}
                    style={{ height: '400px' }}
                    opts={{ renderer: 'canvas' }}
                  />
                </Card>
              </Col>

              {/* 景点统计数据表格 */}
              <Col xs={24} lg={12}>
                <Card 
                  title="热门景点数据"
                >
                  <div style={{ maxHeight: '350px', overflow: 'auto' }}>
                    {attractionStatistics.topByTickets.slice(0, 8).map((item, index) => (
                      <div key={item.attractionId} style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        padding: '12px 0',
                        borderBottom: index < 7 ? '1px solid #f0f0f0' : 'none'
                      }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                            #{index + 1} {item.attractionName}
                          </div>
                          <div style={{ fontSize: '12px', color: '#666' }}>
                            {item.orderCount} 个订单 • 平均票价: ¥{(item.totalRevenue / item.totalTickets).toFixed(2)}
                          </div>
                        </div>
                        <div style={{ textAlign: 'right', marginLeft: '12px' }}>
                          <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#1890ff' }}>
                            {item.totalTickets} 张
                          </div>
                          <div style={{ fontSize: '12px', color: '#52c41a' }}>
                            ¥{item.totalRevenue}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </Col>
            </Row>
          </>
        )}

        <Divider />

        {/* 页面底部信息 */}
        <div style={{ textAlign: 'center', color: '#666', marginTop: '24px' }}>
          <p>数据更新时间: {dayjs().format('YYYY-MM-DD HH:mm:ss')}</p>
          <p>统计周期: {dateRange ? `${dateRange[0].format('YYYY-MM-DD')} 至 ${dateRange[1].format('YYYY-MM-DD')}` : '默认时间范围'}</p>
          {todayStatistics && (
            <p>今日统计: {todayStatistics.orderCount} 个订单，营业额 ¥{todayStatistics.totalAmount}，平均订单价值 ¥{(todayStatistics.averageAmount || 0).toFixed(2)}</p>
          )}
          {monthSummary && (
            <p>本月汇总: 总订单 {monthSummary.totalOrders} 个，已支付 {monthSummary.paidOrders} 个，总收入 ¥{monthSummary.totalRevenue}，平均订单价值 ¥{monthSummary.averageOrderValue.toFixed(2)}</p>
          )}
          {attractionStatistics && (
            <p>景点统计: 共 {attractionStatistics.allAttractions.length} 个景点，总购票数 {attractionStatistics.allAttractions.reduce((sum, item) => sum + item.totalTickets, 0)} 张，总收入 ¥{attractionStatistics.allAttractions.reduce((sum, item) => sum + item.totalRevenue, 0).toFixed(2)}</p>
          )}
        </div>
      </Spin>
    </div>
  )
}

export default ReportsPage
