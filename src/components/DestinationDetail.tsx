import {
  Card,
  Button,
  Typography,
  Space,
  Rate,
  Tag,
  Row,
  Col,
  Image,
  Avatar,
  Divider
} from 'antd'
import {
  ArrowLeftOutlined,
  StarOutlined,
  HeartOutlined,
  ShareAltOutlined,
  EnvironmentOutlined
} from '@ant-design/icons'
import type { Destination } from '../data/destinations'

const { Title, Text, Paragraph } = Typography

interface DestinationDetailPageProps {
  onNavigate: (route: string, params?: Record<string, unknown>) => void
}

// Mock destination data based on Figma design
const mockDestination: Destination & {
  gallery: string[]
  description: string
  highlights: string[]
  reviews: Array<{
    id: string
    name: string
    avatar: string
    rating: number
    comment: string
    date: string
  }>
  tours: Array<{
    id: string
    title: string
    duration: string
    price: string
    rating: number
    image: string
  }>
} = {
  id: '1',
  name: 'Monument of Berlin',
  country: 'Berlin, Germany',
  price: '€99/Day',
  image: 'https://images.unsplash.com/photo-1587330979470-3016b6702d89?w=800&q=80',
  rating: 4.8,
  reviewCount: 245,
  gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  popularityRank: 1,
  tags: ['Historical', 'Culture', 'Architecture'],
  gallery: [
    'https://images.unsplash.com/photo-1587330979470-3016b6702d89?w=800&q=80',
    'https://images.unsplash.com/photo-1590736969955-71cc94901144?w=800&q=80',
    'https://images.unsplash.com/photo-1599946347371-68eb71b16afc?w=800&q=80',
    'https://images.unsplash.com/photo-1528728329032-2972f65dfb3f?w=800&q=80',
    'https://images.unsplash.com/photo-1541532713592-79a0317b6b77?w=800&q=80',
  ],
  description: `Discover the iconic Monument of Berlin, a testament to the rich history and cultural heritage of Germany's capital. This magnificent structure stands as a symbol of unity and resilience, offering visitors an unforgettable journey through time.

The monument showcases stunning architecture and provides breathtaking views of the city. Experience the perfect blend of historical significance and modern urban life as you explore this incredible destination.`,
  highlights: [
    'Historical significance and cultural heritage',
    'Stunning panoramic city views',
    'Professional guided tours available',
    'Photography opportunities',
    'nearby attractions and museums',
    'Traditional German cuisine nearby'
  ],
  reviews: [
    {
      id: '1',
      name: 'John Doe',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80',
      rating: 5,
      comment: 'But I must explain to you how all this mistaken idea of denouncing pleasure and praising pain was born and I will give you a complete account of the system.',
      date: '2023-12-15'
    },
    {
      id: '2',
      name: 'John Smith',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80',
      rating: 5,
      comment: 'The master-builder of human happiness. No one rejects, dislikes, or avoids pleasure itself, because it is pleasure.',
      date: '2023-12-10'
    },
    {
      id: '3',
      name: 'Tamara Bellis',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b47b?w=100&q=80',
      rating: 4,
      comment: 'But because those who do not know how to pursue pleasure rationally encounter consequences that are extremely painful.',
      date: '2023-12-08'
    }
  ],
  tours: [
    {
      id: '1',
      title: 'Paris City Tour',
      duration: '7 Days tour',
      price: '€99/Day',
      rating: 4.8,
      image: 'https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=400&q=80'
    },
    {
      id: '2',
      title: 'London Historical Walk',
      duration: '5 Days tour',
      price: '€79/Day',
      rating: 4.9,
      image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=400&q=80'
    },
    {
      id: '3',
      title: 'Rome Cultural Experience',
      duration: '6 Days tour',
      price: '€89/Day',
      rating: 4.7,
      image: 'https://images.unsplash.com/photo-1552832230-c0197047dc23?w=400&q=80'
    }
  ]
}

function DestinationDetailPage({ onNavigate }: DestinationDetailPageProps) {
  const handleBack = () => {
    onNavigate('/home')
  }

  const handleBookNow = () => {
    onNavigate('/booking', { destination: mockDestination })
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      {/* Header */}
      <div style={{ position: 'relative' }}>
        <Image
          src={mockDestination.image}
          alt={mockDestination.name}
          style={{
            width: '100%',
            height: '300px',
            objectFit: 'cover'
          }}
          preview={false}
        />
        
        {/* Overlay */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0.6) 100%)'
        }} />
        
        {/* Header Controls */}
        <div style={{
          position: 'absolute',
          top: 20,
          left: 20,
          right: 20,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={handleBack}
            style={{
              color: 'white',
              fontSize: '18px',
              background: 'rgba(0,0,0,0.3)',
              borderRadius: '50%',
              width: 40,
              height: 40
            }}
          />
          
          <Space>
            <Button
              type="text"
              icon={<ShareAltOutlined />}
              style={{
                color: 'white',
                background: 'rgba(0,0,0,0.3)',
                borderRadius: '50%',
                width: 40,
                height: 40
              }}
            />
            <Button
              type="text"
              icon={<HeartOutlined />}
              style={{
                color: 'white',
                background: 'rgba(0,0,0,0.3)',
                borderRadius: '50%',
                width: 40,
                height: 40
              }}
            />
          </Space>
        </div>
        
        {/* Title Overlay */}
        <div style={{
          position: 'absolute',
          bottom: 20,
          left: 20,
          right: 20
        }}>
          <Title level={2} style={{ color: 'white', margin: 0 }}>
            {mockDestination.name}
          </Title>
          <Space style={{ color: 'white', marginTop: 8 }}>
            <EnvironmentOutlined />
            <Text style={{ color: 'white', fontSize: '16px' }}>
              {mockDestination.country}
            </Text>
            <Divider type="vertical" style={{ borderColor: 'rgba(255,255,255,0.5)' }} />
            <Rate disabled value={mockDestination.rating} style={{ color: '#ffa940', fontSize: '14px' }} />
            <Text style={{ color: 'white' }}>({mockDestination.reviewCount})</Text>
          </Space>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '20px' }}>
        {/* Price and Book Section */}
        <Card style={{ marginBottom: 20, borderRadius: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <Text type="secondary">From</Text>
              <Title level={3} style={{ margin: 0, color: '#FF7757' }}>
                {mockDestination.price}
              </Title>
            </div>
            <Button
              type="primary"
              size="large"
              onClick={handleBookNow}
              style={{
                background: '#FF7757',
                borderColor: '#FF7757',
                borderRadius: 12,
                padding: '0 40px',
                height: 48
              }}
            >
              Book Now
            </Button>
          </div>
        </Card>

        {/* Description */}
        <Card title="About" style={{ marginBottom: 20, borderRadius: 16 }}>
          <Paragraph style={{ fontSize: 16, lineHeight: 1.6, color: '#666' }}>
            {mockDestination.description}
          </Paragraph>
        </Card>

        {/* Highlights */}
        <Card title="Highlights" style={{ marginBottom: 20, borderRadius: 16 }}>
          <Row gutter={[16, 16]}>
            {mockDestination.highlights.map((highlight, index) => (
              <Col span={12} key={index}>
                <Space>
                  <StarOutlined style={{ color: '#FF7757' }} />
                  <Text>{highlight}</Text>
                </Space>
              </Col>
            ))}
          </Row>
        </Card>

        {/* Photo Gallery */}
        <Card title="Destination Gallery" style={{ marginBottom: 20, borderRadius: 16 }}>
          <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
            Our photo gallery on trip
          </Text>
          <Row gutter={[12, 12]}>
            <Col span={24}>
              <Image
                src={mockDestination.gallery[0]}
                alt="Main gallery"
                style={{ width: '100%', height: 200, objectFit: 'cover', borderRadius: 12 }}
              />
            </Col>
            {mockDestination.gallery.slice(1, 5).map((image, index) => (
              <Col span={12} key={index}>
                <div style={{ position: 'relative' }}>
                  <Image
                    src={image}
                    alt={`Gallery ${index + 2}`}
                    style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 12 }}
                  />
                  {index === 3 && (
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: 'rgba(0,0,0,0.5)',
                      borderRadius: 12,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Text style={{ color: 'white', fontSize: '18px', fontWeight: 'bold' }}>
                        +{mockDestination.gallery.length - 4} more
                      </Text>
                    </div>
                  )}
                </div>
              </Col>
            ))}
          </Row>
        </Card>

        {/* Reviews */}
        <Card title="Traveler's Experiences" style={{ marginBottom: 20, borderRadius: 16 }}>
          <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
            Here some awesome feedback from our travelers
          </Text>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            {mockDestination.reviews.map((review) => (
              <Card key={review.id} size="small" style={{ background: '#f8fafc', border: 'none' }}>
                <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                  <Avatar src={review.avatar} size={40} />
                  <div style={{ flex: 1 }}>
                    <Text strong>{review.name}</Text>
                    <br />
                    <Rate disabled value={review.rating} style={{ fontSize: 12 }} />
                  </div>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {review.date}
                  </Text>
                </div>
                <Paragraph style={{ margin: 0, color: '#666' }}>
                  {review.comment}
                </Paragraph>
              </Card>
            ))}
          </Space>
        </Card>

        {/* Related Tours */}
        <Card title="Trip Planners" style={{ marginBottom: 20, borderRadius: 16 }}>
          <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
            20 years from now you will be more disappointed by the things that you didn't do. Stop regretting and start travelling.
          </Text>
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            {mockDestination.tours.map((tour) => (
              <Card key={tour.id} hoverable style={{ border: '1px solid #f0f0f0' }}>
                <div style={{ display: 'flex', gap: 12 }}>
                  <Image
                    src={tour.image}
                    alt={tour.title}
                    style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8 }}
                    preview={false}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <Tag color="blue" style={{ marginBottom: 4 }}>Guided Tour</Tag>
                        <Title level={5} style={{ margin: 0 }}>{tour.title}</Title>
                        <Space style={{ marginTop: 4 }}>
                          <Rate disabled value={tour.rating} style={{ fontSize: 12 }} />
                          <Text type="secondary">{tour.duration}</Text>
                        </Space>
                      </div>
                      <Text style={{ color: '#FF7757', fontSize: 16, fontWeight: 'bold' }}>
                        {tour.price}
                      </Text>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </Space>
        </Card>
      </div>
    </div>
  )
}

export default DestinationDetailPage
