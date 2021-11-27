import React, { useState } from 'react';
import { Dimensions, Image, ImageSourcePropType, Platform } from 'react-native'
import Carousel, { Pagination } from 'react-native-snap-carousel'
import ImageA from '../assets/bring-a-friend.jpeg'
import ImageB from '../assets/fiat-gateway.jpeg'
import ImageC from '../assets/dollar-cost-average.png'
import ImageD from '../assets/bring-a-friend-2.jpeg'
import ImageE from '../assets/bring-a-friend-3.jpeg'
import { View } from './index'
import { AppIcon } from './icons/AppIcon'
import { ThemedText } from './themed'
import { useThemeContext } from '../contexts/ThemeProvider'
import { tailwind } from '../tailwind'
import { theme } from '../tailwind.config'
import Colors from '../config/Colors'

interface CarouselImage {
  image: ImageSourcePropType
  title: string
  secondTitle: string
  subtitle: string
}

const slides: JSX.Element[] = [
  <ImageSlide
    image={ImageA}
    key={1}
    secondTitle='1/bring-a-friend.jpeg: of your digital assets'
    subtitle='Nobody owns your keys and wallet except you.'
    title='Take full control'
  />,
  <ImageSlide
    image={ImageB}
    key={2}
    secondTitle='2/fiat-gateway.jpeg: potential of your finances'
    subtitle='Transact, liquidity mine, swap and many more features as a fully-decentralized wallet'
    title='Unlock the highest'
  />,
  <ImageSlide
    image={ImageC}
    key={3}
    secondTitle='3/dollar-cost-average.png: potential of your finances'
    subtitle='Transact, liquidity mine, swap and many more features as a fully-decentralized wallet'
    title='Unlock the highest'
  />,
  <ImageSlide
    image={ImageD}
    key={4}
    secondTitle='4/bring-a-friend-2.jpeg: potential of your finances'
    subtitle='Transact, liquidity mine, swap and many more features as a fully-decentralized wallet'
    title='Unlock the highest'
  />,
  <ImageSlide
    image={ImageE}
    key={5}
    secondTitle='5/bring-a-friend-3.jpeg: of up to 90% with DEX'
    subtitle='Supply liquidity to BTC, ETH, and many other pool pairs. You can also withdraw anytime!'
    title='Earn high yields'
  />]

function ImageSlide ({ image, title, secondTitle, subtitle }: CarouselImage): JSX.Element {
  return (
    <View style={tailwind('w-full h-full items-center justify-center py-8 px-5')}>
      <Image
        source={image}
        style={tailwind('w-full h-full')}
      />
    </View>
  )
}

export function OnboardingCarousel (): JSX.Element {
  // TODO: TypeError: _useThemeContext is undefined
  // const { isLight } = useThemeContext()
  const { isLight } = true
  const windowWidth = Dimensions.get('window').width;
  const caroWidth = (windowWidth < 800) ? windowWidth : 800;
  const [count, setCount] = useState(0);

  return (
    <View style={tailwind('w-full h-full')}>
    <Carousel
      data={slides}

      renderItem={({ item }) => (
        <View style={tailwind('w-full h-full')}>
          {
            item
          }
        </View>
      )}

      sliderWidth={ caroWidth }
      itemWidth={ caroWidth }

      loop
      autoplay
      autoplayDelay={ 1000 }
      autoplayInterval={ 1800 }
      onSnapToItem={(index) => setCount(index) }
    />
    <Pagination
      activeDotIndex={ count }
      dotsLength={ slides.length }
      dotColor={ Colors.White }
      inactiveDotColor={ Colors.LightGrey }
    />
    </View>
  )
}
