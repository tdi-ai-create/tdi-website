'use client';

import { useEffect, useState } from 'react';

interface Course {
  id: number;
  name: string;
  description: string;
  course_card_image_url: string;
  slug: string;
}

export function CoursesSection() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchCourses() {
      try {
        const response = await fetch('/api/courses');
        if (!response.ok) throw new Error('Failed to fetch');
        const data = await response.json();
        setCourses(data);
      } catch (err) {
        console.error('Error loading courses:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    fetchCourses();
  }, []);

  const subdomain = process.env.NEXT_PUBLIC_THINKIFIC_SUBDOMAIN || 'tdi';

  if (loading) {
    return (
      <section className="py-16" style={{ backgroundColor: '#80a4ed' }}>
        <div className="container-default">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4" style={{ color: '#ffffff' }}>
            What Educators Are Learning Right Now
          </h2>
          <p className="text-center mb-10 max-w-2xl mx-auto" style={{ color: '#ffffff', opacity: 0.9 }}>
            Join thousands of teachers and paraprofessionals<br />building practical skills they can use tomorrow.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-xl overflow-hidden shadow-sm animate-pulse">
                <div className="h-40 bg-gray-200" />
                <div className="p-4">
                  <div className="h-6 bg-gray-200 rounded mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error || courses.length === 0) {
    return null;
  }

  return (
    <section className="py-16" style={{ backgroundColor: '#80a4ed' }}>
      <div className="container-default">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4" style={{ color: '#ffffff' }}>
          What Educators Are Learning Right Now
        </h2>
        <p className="text-center mb-10 max-w-2xl mx-auto" style={{ color: '#ffffff', opacity: 0.9 }}>
          Join thousands of teachers and paraprofessionals<br />building practical skills they can use tomorrow.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">

          {/* Featured: Course Guide - Always Displayed */}
          <a
            href="https://tdi.thinkific.com/products/digital_downloads/CourseGuide"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white rounded-xl overflow-hidden shadow-sm hover-card group relative"
            style={{ textDecoration: 'none' }}
          >
            {/* Featured Badge */}
            <div
              className="absolute top-3 right-3 z-10 px-3 py-1 rounded-full text-xs font-bold"
              style={{ backgroundColor: '#ffba06', color: '#1e2749' }}
            >
              Updated Monthly
            </div>
            <div className="relative h-40 overflow-hidden">
              <img
                src="/images/course-guide.webp"
                alt="Learning Hub Course Guide"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="p-4">
              <h3 className="font-bold text-lg mb-2 line-clamp-2" style={{ color: '#1e2749' }}>
                Learning Hub Course Guide
              </h3>
              <p className="text-sm line-clamp-2" style={{ color: '#1e2749', opacity: 0.7 }}>
                Your complete guide to everything available in the TDI Learning Hub. Updated monthly.
              </p>
            </div>
          </a>

          {/* Random Courses */}
          {courses.map((course) => (
            <a
              key={course.id}
              href={`https://${subdomain}.thinkific.com/courses/${course.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white rounded-xl overflow-hidden shadow-sm hover-card group"
              style={{ textDecoration: 'none' }}
            >
              <div className="relative h-40 overflow-hidden">
                {course.course_card_image_url ? (
                  <img
                    src={course.course_card_image_url}
                    alt={course.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center"
                    style={{ backgroundColor: '#80a4ed' }}
                  >
                    <svg className="w-12 h-12" fill="white" viewBox="0 0 24 24">
                      <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z"/>
                    </svg>
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-bold text-lg mb-2 line-clamp-2" style={{ color: '#1e2749' }}>
                  {course.name}
                </h3>
                <p
                  className="text-sm line-clamp-2"
                  style={{ color: '#1e2749', opacity: 0.7 }}
                >
                  {course.description?.replace(/<[^>]*>/g, '').slice(0, 100) || 'Explore this course'}...
                </p>
              </div>
            </a>
          ))}
        </div>

        <div className="text-center mt-10">
          <a
            href={`https://${subdomain}.thinkific.com`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-8 py-4 rounded-lg font-bold text-lg transition-all hover-glow"
            style={{ backgroundColor: '#ffba06', color: '#1e2749' }}
          >
            View All Courses
          </a>
        </div>
      </div>
    </section>
  );
}
