import React, { useEffect, useState } from "react";
import { Image, Dimensions, StyleSheet, View } from "react-native";
import { SwiperFlatList } from "react-native-swiper-flatlist";
import Image1 from "../assets/onboarding/bring-a-friend.jpeg";
import Image2 from "../assets/onboarding/bring-a-friend-2.jpeg";
import Image3 from "../assets/onboarding/bring-a-friend-3.jpeg";
import Sizes from "../config/Sizes";
import { ScaledSize } from "react-native";

export const OnboardingCarousel = () => {
  const paginationItemSize = 10;
  const aspectRatio = 1.77;

  const [width, setWidth] = useState(Dimensions.get("window").width);
  const dimensionListener = ({ window }: { window: ScaledSize }) => setWidth(window.width);
  const appWidth = () => Math.min(width - 2 * Sizes.AppPadding, Sizes.AppWidth);

  useEffect(() => {
    Dimensions.addEventListener("change", dimensionListener);
    return () => Dimensions.removeEventListener("change", dimensionListener);
  }, []);

  const styles = StyleSheet.create({
    container: {
      height: appWidth() / aspectRatio,
    },
    slide: { width },
    imageContainer: {
      flex: 1,
      width: appWidth(),
      justifyContent: "flex-start",
    },
    image: {
      height: "100%",
      resizeMode: "contain",
      width: "100%",
    },
    pagination: {
      marginVertical: 0,
      height: paginationItemSize,
    },
    paginationItem: {
      width: paginationItemSize,
      height: paginationItemSize,
      borderRadius: paginationItemSize / 2,
      marginHorizontal: paginationItemSize,
    },
  });

  return (
    <View style={styles.container}>
      <SwiperFlatList
        autoplay
        autoplayDelay={3}
        autoplayLoop
        showPagination
        paginationStyle={styles.pagination}
        paginationStyleItem={styles.paginationItem}
        data={[Image1, Image2, Image3]}
        renderItem={({ item }) => (
          <View style={styles.slide}>
            <View style={styles.imageContainer}>
              <Image source={item} style={styles.image} />
            </View>
          </View>
        )}
      />
    </View>
  );
};
