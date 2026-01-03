import { cn } from '@/lib/utils';

type SectionBackground = 'white' | 'peach' | 'navy';

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
    peach: '',
    navy: '',
  };

  const inlineStyles = {
    white: {},
    peach: { backgroundColor: 'var(--tdi-peach)' },
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
