import * as React from 'react'
import { Dimensions, Image, ImageSourcePropType, Platform, View } from 'react-native'
import SwiperFlatList from 'react-native-swiper-flatlist'
import ImageA from '../assets/bring-a-friend.jpeg'
import ImageB from '../assets/bring-a-friend-2.jpeg'
import ImageC from '../assets/bring-a-friend-3.jpeg'

interface CarouselImage {
  image: ImageSourcePropType
  title: string
  secondTitle: string
  subtitle: string
}

const slides: JSX.Element[] = [<InitialSlide key={0} />,
  <ImageSlide
    image={ImageA}
    key={1}
    secondTitle='of your digital assets'
    subtitle='Nobody owns your keys and wallet except you.'
    title='Take full control'
  />,
  <ImageSlide
    image={ImageB}
    key={2}
    secondTitle='potential of your finances'
    subtitle='Transact, liquidity mine, swap and many more features as a fully-decentralized wallet'
    title='Unlock the highest'
  />,
  <ImageSlide
    image={ImageC}
    key={3}
    secondTitle='of up to 90% with DEX'
    subtitle='Supply liquidity to BTC, ETH, and many other pool pairs. You can also withdraw anytime!'
    title='Earn high yields'
  />]

// Needs for it to work on web. Otherwise, it takes full window size
const { width } = Platform.OS === 'web' ? { width: '375px' } : Dimensions.get('window')

export function InitialSlide (): JSX.Element {
  return (
    <View>
    </View>
  )
}

export function ImageSlide ({ image, title, secondTitle, subtitle }: CarouselImage): JSX.Element {
  return (
    <View>
      <View>
      </View>

      <Image
        source={image}
        style={{ width, height: '55%' }}
      />
    </View>
  )
}

export function OnboardingCarousel (): JSX.Element {
  return (
    <SwiperFlatList
      autoplay
      autoplayDelay={30}
      autoplayLoop
      autoplayLoopKeepAnimation
      data={slides}
      index={0}
      paginationActiveColor={'rgba(0, 0, 0, 0.8)'}
      paginationDefaultColor={'rgba(0, 0, 0, 0.1)'}
      renderItem={({ item }) => (
        <View style={{ width }}>
          {
            item
          }
        </View>
      )}
      showPagination
    />
  )
}
