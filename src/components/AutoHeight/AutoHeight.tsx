import { useRef, useState, useEffect, FC, ReactNode } from 'react';
import AnimateHeight, { Height } from 'react-animate-height';

interface AutoHeightProps {
  children: ReactNode;
}

const AutoHeight: FC<AutoHeightProps> = ({ children, ...props }) => {
  const [height, setHeight] = useState<Height>('auto');
  const contentDiv = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const element = contentDiv.current as HTMLDivElement;

    const resizeObserver = new ResizeObserver(() => {
      setHeight(element.clientHeight);
    });

    resizeObserver.observe(element);

    return () => resizeObserver.disconnect();
  }, []);

  return (
    <AnimateHeight
      {...props}
      easing="cubic-bezier(0.25, 0.1, 0.25, 1)"
      duration={400}
      height={height}
      contentClassName="auto-content"
      contentRef={contentDiv}
      disableDisplayNone
    >
      {children}
    </AnimateHeight>
  );
};

export default AutoHeight;
