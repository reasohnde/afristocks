// types/react-simple-typewriter.d.ts
declare module 'react-simple-typewriter' {
  export interface TypewriterProps {
    words: string[];
    loop?: number | boolean;
    typeSpeed?: number;
    deleteSpeed?: number;
    delaySpeed?: number;
    cursor?: boolean;
    cursorStyle?: string;
    cursorBlinking?: boolean;
    onLoopDone?: () => void;
    onType?: (count: number) => void;
    onDelay?: () => void;
    onDelete?: () => void;
  }

  export function Typewriter(props: TypewriterProps): JSX.Element;
  export function useTypewriter(props: TypewriterProps): [string, { isType: boolean; isDelete: boolean; isDelay: boolean }];
}