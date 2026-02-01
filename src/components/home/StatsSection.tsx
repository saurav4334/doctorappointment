import { useEffect, useState, useRef } from "react";
import { Users, UserCheck, Building2, Calendar } from "lucide-react";

const stats = [
  {
    icon: Users,
    value: 50000,
    suffix: "+",
    label: "Happy Patients",
  },
  {
    icon: UserCheck,
    value: 200,
    suffix: "+",
    label: "Expert Doctors",
  },
  {
    icon: Building2,
    value: 50,
    suffix: "+",
    label: "Partner Hospitals",
  },
  {
    icon: Calendar,
    value: 100000,
    suffix: "+",
    label: "Appointments Booked",
  },
];

function useCountUp(end: number, duration: number = 2000, start: boolean = false) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!start) return;
    
    let startTime: number | null = null;
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, [end, duration, start]);

  return count;
}

export function StatsSection() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section 
      ref={sectionRef}
      className="hero-gradient py-16 md:py-20"
    >
      <div className="container mx-auto px-4">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <StatCard key={stat.label} stat={stat} isVisible={isVisible} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

function StatCard({ 
  stat, 
  isVisible, 
  index 
}: { 
  stat: typeof stats[0]; 
  isVisible: boolean;
  index: number;
}) {
  const count = useCountUp(stat.value, 2000 + index * 200, isVisible);

  return (
    <div className="flex flex-col items-center text-center text-primary-foreground">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-foreground/10">
        <stat.icon className="h-8 w-8" />
      </div>
      <div className="mt-4 font-display text-4xl font-bold md:text-5xl">
        {count.toLocaleString()}{stat.suffix}
      </div>
      <div className="mt-2 text-lg text-primary-foreground/80">
        {stat.label}
      </div>
    </div>
  );
}

export default StatsSection;
