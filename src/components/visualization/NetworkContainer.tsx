interface NetworkContainerProps {
  containerRef: React.RefObject<HTMLDivElement>;
}

export function NetworkContainer({ containerRef }: NetworkContainerProps) {
  return (
    <div 
      ref={containerRef} 
      className="w-full h-[600px] bg-muted rounded-lg"
    />
  );
}