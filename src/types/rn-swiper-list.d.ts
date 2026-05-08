declare module 'rn-swiper-list' {
  import type { ComponentType, ReactNode, Ref } from 'react';

  export type SwiperCardRefType = {
    swipeLeft?: () => void;
    swipeRight?: () => void;
  };

  export type SwipeSpringConfig = {
    damping?: number;
    stiffness?: number;
    mass?: number;
    overshootClamping?: boolean;
  };

  export type SwiperProps<T> = {
    ref?: Ref<SwiperCardRefType>;
    data: T[];
    renderCard: (item: T) => ReactNode;
    prerenderItems?: number;
    cardStyle?: object;
    onSwipeRight?: (index: number) => void;
    onSwipeLeft?: (index: number) => void;
    disableBottomSwipe?: boolean;
    disableTopSwipe?: boolean;
    swipeLeftSpringConfig?: SwipeSpringConfig;
    swipeRightSpringConfig?: SwipeSpringConfig;
  };

  export const Swiper: ComponentType<SwiperProps<any>>;
}
