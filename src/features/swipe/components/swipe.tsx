import { Swiper, type SwiperCardRefType } from 'rn-swiper-list';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import React, { useRef } from 'react';
import { MovieCard } from './movie-card';
import type { MovieCardProps } from './movie-card';
import { useWindowDimensions } from 'react-native';

type SwipeProps = {
  data: MovieCardProps[];
  onSwipeRight?: (movie: MovieCardProps, index: number) => void;
  onSwipeLeft?: (movie: MovieCardProps, index: number) => void;
};

export function Swipe({ data, onSwipeLeft, onSwipeRight }: SwipeProps) {
    const ref = useRef<SwiperCardRefType | null>(null);

    const { width, height } = useWindowDimensions();
    const cardWidth = width * 0.85;
    const cardHeight = height * 0.65;

    return (
        <GestureHandlerRootView style={{ width: cardWidth, height: cardHeight }}>
            <Swiper
                ref={ref}
                data={data}
                renderCard={(item: MovieCardProps) => <MovieCard {...item} />}
                cardStyle={{ width: cardWidth, height: cardHeight }}
                onSwipeRight={(index: number) => onSwipeRight?.(data[index], index)}
                onSwipeLeft={(index: number) => onSwipeLeft?.(data[index], index)}
                disableBottomSwipe
                disableTopSwipe
            />
        </GestureHandlerRootView>
    );
}
