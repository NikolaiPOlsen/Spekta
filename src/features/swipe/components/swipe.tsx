import { Swiper, type SwiperCardRefType } from 'rn-swiper-list';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import React, { useRef } from 'react';
import { useWindowDimensions } from 'react-native';

type SwipeProps<T> = {
	data: T[];
	renderCard: (item: T, swipeLeft: () => void, swipeRight: () => void) => React.ReactNode;
	onSwipeRight?: (item: T, index: number) => void;
	onSwipeLeft?: (item: T, index: number) => void;
};

export function Swipe<T>({ data, renderCard, onSwipeLeft, onSwipeRight }: SwipeProps<T>) {
	const ref = useRef<SwiperCardRefType | null>(null);

	const { width, height } = useWindowDimensions();
	const cardWidth = width * 1;
	const cardHeight = height * 1;

	const swipeLeft = () => ref.current?.swipeLeft?.();
	const swipeRight = () => ref.current?.swipeRight?.();

	return (
		<GestureHandlerRootView style={{ width: cardWidth, height: cardHeight }}>
			<Swiper
				ref={ref}
				data={data}
				renderCard={(item) => renderCard(item, swipeLeft, swipeRight)}
				cardStyle={{ width: cardWidth, height: cardHeight }}
				onSwipeRight={(index: number) => onSwipeRight?.(data[index], index)}
				onSwipeLeft={(index: number) => onSwipeLeft?.(data[index], index)}
				disableBottomSwipe
				disableTopSwipe
			/>
		</GestureHandlerRootView>
	);
}
