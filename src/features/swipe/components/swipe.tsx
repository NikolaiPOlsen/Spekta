import { Swiper, type SwiperCardRefType } from 'rn-swiper-list';
import React, { useRef } from 'react';
import { StyleSheet, View } from 'react-native';

const swipeSpringConfig = {
	damping: 5000,
	stiffness: 5000,
	mass: 0.1,
	overshootClamping: true,
};

type SwipeProps<T> = {
    data: T[];
    renderCard: (item: T, swipeLeft: () => void, swipeRight: () => void) => React.ReactNode;
    onSwipeRight?: (item: T, index: number) => void;
    onSwipeLeft?: (item: T, index: number) => void;
};

export function Swipe<T>({ data, renderCard, onSwipeLeft, onSwipeRight }: SwipeProps<T>) {
    const ref = useRef<SwiperCardRefType | null>(null);

    const swipeLeft = () => ref.current?.swipeLeft?.();
    const swipeRight = () => ref.current?.swipeRight?.();

    return (
        <View style={styles.container}>
            <Swiper
                ref={ref}
                data={data}
                renderCard={(item) => renderCard(item, swipeLeft, swipeRight)}
                cardStyle={styles.card}
                swipeLeftSpringConfig={swipeSpringConfig}
                swipeRightSpringConfig={swipeSpringConfig}
                onSwipeRight={(index: number) => onSwipeRight?.(data[index], index)}
                onSwipeLeft={(index: number) => onSwipeLeft?.(data[index], index)}
                disableBottomSwipe
                disableTopSwipe
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignSelf: 'stretch',
    },
    card: {
        width: '100%',
        height: '100%',
    },
});
