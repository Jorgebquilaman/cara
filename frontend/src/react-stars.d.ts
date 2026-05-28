declare module 'react-stars' {
  import { ComponentType } from 'react';
  interface ReactStarsProps {
    count?: number;
    value?: number;
    onChange?: (newVal: number) => void;
    size?: number;
    color1?: string;
    color2?: string;
    edit?: boolean;
    half?: boolean;
  }
  const ReactStars: ComponentType<ReactStarsProps>;
  export default ReactStars;
}
