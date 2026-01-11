import Link from 'next/link';
import { CoursesSection } from '@/components/CoursesSection';
import { BeforeAfterStats } from '@/components/BeforeAfterStats';

export const metadata = {
  title: 'For Teachers | Teachers Deserve It',
  description: 'Practical strategies to save time, reduce stress, and grow as an educator—without sacrificing your evenings and weekends.',
};

export default function ForTeachersPage() {
  return (
    <main>
      {/* Hero Section */}
      <section className="relative h-[400px] md:h-[450px] overflow-hidden">
        {/* Background Image */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "url('/images/hero-rae-background.webp')",
            backgroundSize: 'cover',
            backgroundPosition: 'center 30%',
            backgroundRepeat: 'no-repeat',
            backgroundAttachment: 'fixed',
          }}
        />

        {/* Gradient Overlay */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(180deg, rgba(30, 39, 73, 0.6) 0%, rgba(30, 39, 73, 0.75) 100%)'
          }}
        />

        {/* Content */}
        <div className="relative z-10 h-full flex items-center justify-center">
          <div className="text-center px-4 max-w-3xl mx-auto">
            <h1
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6"
              style={{ color: '#ffffff' }}
            >
              You Became a Teacher to Make a Difference
            </h1>
            <p
              className="text-lg md:text-xl mb-8"
              style={{ color: '#ffffff', opacity: 0.9 }}
            >
              Not to drown in lesson plans, sit through pointless PD,<br />and count down to summer.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a
                href="https://raehughart.substack.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-8 py-4 rounded-lg font-bold text-lg transition-all hover-glow"
                style={{ backgroundColor: '#ffba06', color: '#1e2749' }}
              >
                Join 87,000+ Educators
              </a>
              <a
                href="https://tdi.thinkific.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-8 py-4 rounded-lg font-bold text-lg border-2 transition-all hover-lift"
                style={{ borderColor: '#ffffff', color: '#ffffff' }}
              >
                Explore the Learning Hub
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12" style={{ backgroundColor: '#1e2749' }}>
        <div className="container-default">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <p className="text-4xl md:text-5xl font-bold mb-2" style={{ color: '#ffffff' }}>87,000+</p>
              <p style={{ color: '#ffffff', opacity: 0.8 }}>Educators in<br />Our Community</p>
            </div>
            <div>
              <p className="text-4xl md:text-5xl font-bold mb-2" style={{ color: '#ffffff' }}>65%</p>
              <p style={{ color: '#ffffff', opacity: 0.8 }}>Implementation Rate</p>
              <p className="text-xs mt-1" style={{ color: '#ffba06' }}>vs 10% industry average</p>
            </div>
            <div>
              <p className="text-4xl md:text-5xl font-bold mb-2" style={{ color: '#ffffff' }}>94%</p>
              <p style={{ color: '#ffffff', opacity: 0.8 }}>Would Recommend<br />to a Colleague</p>
            </div>
          </div>
        </div>
      </section>

      {/* What You Get */}
      <section className="py-16 md:py-20" style={{ backgroundColor: '#ffffff' }}>
        <div className="container-default">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4" style={{ color: '#1e2749' }}>
            What TDI Gives You
          </h2>
          <p className="text-center mb-12 max-w-2xl mx-auto" style={{ color: '#1e2749', opacity: 0.7 }}>
            Tools you can use Monday morning. Not theory. Not fluff.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <div className="bg-white p-6 rounded-xl shadow-sm" style={{ borderTop: '4px solid #ffba06' }}>
              <h3 className="font-bold text-lg mb-3" style={{ color: '#1e2749' }}>Time-Saving Strategies</h3>
              <p className="text-sm" style={{ color: '#1e2749', opacity: 0.7 }}>
                Cut your planning time in half with ready-to-use templates, workflows, and systems that actually work.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm" style={{ borderTop: '4px solid #ffba06' }}>
              <h3 className="font-bold text-lg mb-3" style={{ color: '#1e2749' }}>Classroom Management</h3>
              <p className="text-sm" style={{ color: '#1e2749', opacity: 0.7 }}>
                Practical techniques to create a positive learning environment without burning yourself out.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm" style={{ borderTop: '4px solid #ffba06' }}>
              <h3 className="font-bold text-lg mb-3" style={{ color: '#1e2749' }}>Wellness & Self-Care</h3>
              <p className="text-sm" style={{ color: '#1e2749', opacity: 0.7 }}>
                You can't pour from an empty cup. Learn to protect your time and energy.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm" style={{ borderTop: '4px solid #ffba06' }}>
              <h3 className="font-bold text-lg mb-3" style={{ color: '#1e2749' }}>Weekly Strategies</h3>
              <p className="text-sm" style={{ color: '#1e2749', opacity: 0.7 }}>
                Fresh ideas delivered to your inbox 3x a week. Subscribe to our blog and never run out of inspiration.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm" style={{ borderTop: '4px solid #ffba06' }}>
              <h3 className="font-bold text-lg mb-3" style={{ color: '#1e2749' }}>Community Support</h3>
              <p className="text-sm" style={{ color: '#1e2749', opacity: 0.7 }}>
                Join our free Facebook community of 87,000+ educators who get it.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm" style={{ borderTop: '4px solid #ffba06' }}>
              <h3 className="font-bold text-lg mb-3" style={{ color: '#1e2749' }}>On-Demand Learning</h3>
              <p className="text-sm" style={{ color: '#1e2749', opacity: 0.7 }}>
                Access 100+ courses in the Learning Hub. Learn on your schedule, at your pace.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Verified Outcomes Stats - Before/After */}
      <BeforeAfterStats
        title="What Teachers Experience with TDI"
        stats={[
          {
            label: 'Weekly planning time reduction',
            beforeValue: '12 hrs',
            afterValue: '6-8 hrs',
            beforeNum: 12,
          },
          {
            label: 'Reported stress reduction (10-point scale)',
            beforeValue: '9',
            afterValue: '5-7',
            beforeNum: 9,
          },
        ]}
      />

      {/* Testimonials */}
      <section className="py-16 md:py-20" style={{ backgroundColor: '#ffffff' }}>
        <div className="container-default">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12" style={{ color: '#1e2749' }}>
            What Teachers Are Saying
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <div className="p-6 rounded-xl" style={{ backgroundColor: '#E8F0FD' }}>
              <p className="mb-4 italic" style={{ color: '#1e2749' }}>
                "I finally feel like I have strategies that work AND time to breathe. TDI changed how I approach my classroom and myself."
              </p>
              <p className="font-semibold text-sm" style={{ color: '#1e2749' }}>Sarah K.</p>
              <p className="text-sm" style={{ color: '#1e2749', opacity: 0.7 }}>5th Grade Teacher</p>
            </div>
            <div className="p-6 rounded-xl" style={{ backgroundColor: '#E8F0FD' }}>
              <p className="mb-4 italic" style={{ color: '#1e2749' }}>
                "The weekly strategies are gold. I look forward to every email because I know it'll make my week easier."
              </p>
              <p className="font-semibold text-sm" style={{ color: '#1e2749' }}>Marcus T.</p>
              <p className="text-sm" style={{ color: '#1e2749', opacity: 0.7 }}>High School Math Teacher</p>
            </div>
            <div className="p-6 rounded-xl" style={{ backgroundColor: '#E8F0FD' }}>
              <p className="mb-4 italic" style={{ color: '#1e2749' }}>
                "This is the first PD that actually gets it. Made by teachers, for teachers. You can tell the difference."
              </p>
              <p className="font-semibold text-sm" style={{ color: '#1e2749' }}>Jennifer L.</p>
              <p className="text-sm" style={{ color: '#1e2749', opacity: 0.7 }}>Middle School Science Teacher</p>
            </div>
          </div>
        </div>
      </section>

      {/* Courses Section */}
      <CoursesSection />

      {/* Free Resources CTA */}
      <section className="py-16 md:py-20" style={{ backgroundColor: '#80a4ed' }}>
        <div className="container-default text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: '#ffffff' }}>
            Start With Free Resources
          </h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto" style={{ color: '#ffffff', opacity: 0.9 }}>
            Join 87,000+ educators getting practical strategies delivered to their inbox 3x a week.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://raehughart.substack.com"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 rounded-lg font-bold text-lg transition-all hover:scale-105"
              style={{ backgroundColor: '#1e2749', color: '#ffffff' }}
            >
              Subscribe to the Blog
            </a>
            <a
              href="https://www.facebook.com/groups/tdimovement"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 rounded-lg font-bold text-lg border-2 transition-all hover:bg-white/10"
              style={{ borderColor: '#ffffff', color: '#ffffff' }}
            >
              Join the Free Community
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
