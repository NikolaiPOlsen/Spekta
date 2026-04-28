declare module 'rn-swiper-list' {
  import type { ComponentType, Ref } from 'react';

  export type SwiperCardRefType = {
    swipeLeft?: () => void;
    swipeRight?: () => void;
  };

  export type SwiperProps<T> = {
    ref?: Ref<SwiperCardRefType>;
    data: T[];
    renderCard: (item: T) => React.ReactNode;
    cardStyle?: object;
    onSwipeRight?: (index: number) => void;
    onSwipeLeft?: (index: number) => void;
    disableBottomSwipe?: boolean;
    disableTopSwipe?: boolean;
  };

  export const Swiper: ComponentType<SwiperProps<any>>;
}
