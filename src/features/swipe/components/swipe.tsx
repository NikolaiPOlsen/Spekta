import { Swiper, type SwiperCardRefType } from 'rn-swiper-list';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import React, { useRef, useState } from 'react';
import { MovieCard } from '@/features/swipe/components';
import type { MovieCardProps } from './movie-card';
import { useWindowDimensions } from 'react-native';

export function Swipe({ data }: { data: MovieCardProps[] }) {
    const ref = useRef<SwiperCardRefType>(null);

    const { width, height } = useWindowDimensions();
    const cardWidth = width * 0.85;
    const cardHeight = height * 0.65;

    return (
        <GestureHandlerRootView style={{ width: cardWidth, height: cardHeight }}>
            <Swiper
                ref={ref}
                data={data}
                renderCard={(item) => <MovieCard {...item} />}
                cardStyle={{ width: cardWidth, height: cardHeight }}
                onSwipeRight={(index) => console.log('Liked', index)}
                onSwipeLeft={(index) => console.log('Passed', index)}
                disableBottomSwipe
                disableTopSwipe
            />
        </GestureHandlerRootView>
    );
}