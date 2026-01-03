import { Section, Container, Button } from '@/components/ui';

export default function NotFound() {
  return (
    <Section background="white" className="pt-16 md:pt-24">
      <Container width="default">
        <div className="text-center">
          <div className="text-8xl mb-6">🤔</div>
          <h1 className="mb-4">Page Not Found</h1>
          <p className="text-xl mb-8" style={{ color: 'var(--tdi-charcoal)', opacity: 0.8 }}>
            We couldn't find the page you're looking for. It might have moved or doesn't exist.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button href="/">Go Home</Button>
            <Button href="/contact" variant="secondary">Contact Us</Button>
          </div>
        </div>
      </Container>
    </Section>
  );
}
