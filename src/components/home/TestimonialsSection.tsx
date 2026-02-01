import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    id: 1,
    name: "Rashida Begum",
    role: "Patient",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80",
    rating: 5,
    content: "The booking process was so easy! I found a great cardiologist within minutes and got an appointment the very next day. The doctor was very attentive and professional.",
  },
  {
    id: 2,
    name: "Abdul Karim",
    role: "Patient",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80",
    rating: 5,
    content: "I've been using this platform for my family's healthcare needs for over a year now. The quality of doctors and the ease of booking appointments is unmatched.",
  },
  {
    id: 3,
    name: "Nasreen Akhter",
    role: "Patient",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80",
    rating: 5,
    content: "As a working mother, finding time for doctor visits was always challenging. This platform made it so convenient with flexible appointment times and excellent doctors.",
  },
];

export function TestimonialsSection() {
  return (
    <section className="bg-muted/30 py-16 md:py-24">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-primary">
            Testimonials
          </span>
          <h2 className="mt-2 font-display text-3xl font-bold text-foreground md:text-4xl">
            What Our Patients Say
          </h2>
          <p className="mt-4 text-muted-foreground">
            Don't just take our word for it. Here's what our patients have to say 
            about their experience with MediCare.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="relative rounded-xl bg-card p-6 shadow-sm transition-all duration-300 hover:shadow-md"
            >
              {/* Quote icon */}
              <div className="absolute -top-3 left-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Quote className="h-5 w-5" />
                </div>
              </div>

              {/* Content */}
              <div className="mt-4">
                {/* Rating */}
                <div className="flex gap-1">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>

                {/* Text */}
                <p className="mt-4 text-muted-foreground">
                  "{testimonial.content}"
                </p>

                {/* Author */}
                <div className="mt-6 flex items-center gap-4 border-t border-border pt-4">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="font-semibold text-foreground">{testimonial.name}</h4>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default TestimonialsSection;
