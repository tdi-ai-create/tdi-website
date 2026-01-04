import { cn } from '@/lib/utils';

type SectionBackground = 'white' | 'pink' | 'navy';

interface SectionProps {
  children: React.ReactNode;
  background?: SectionBackground;
  className?: string;
  id?: string;
}

export function Section({
  children,
  background = 'white',
  className,
  id,
}: SectionProps) {
  const bgStyles = {
    white: 'bg-white',
    pink: '',
    navy: '',
  };

  const inlineStyles = {
    white: {},
    pink: { backgroundColor: 'var(--tdi-gray)' },
    navy: { backgroundColor: 'var(--tdi-navy)', color: 'white' },
  };

  return (
    <section
      id={id}
      className={cn('section', bgStyles[background], className)}
      style={inlineStyles[background]}
    >
      {children}
    </section>
  );
}

type ContainerWidth = 'narrow' | 'default' | 'wide';

interface ContainerProps {
  children: React.ReactNode;
  width?: ContainerWidth;
  className?: string;
}

export function Container({
  children,
  width = 'wide',
  className,
}: ContainerProps) {
  const widthStyles = {
    narrow: 'container-narrow',
    default: 'container-default',
    wide: 'container-wide',
  };

  return (
    <div className={cn(widthStyles[width], className)}>
      {children}
    </div>
  );
}
