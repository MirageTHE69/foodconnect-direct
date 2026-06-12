import { Star, Quote, ChevronLeft, ChevronRight } from "lucide-react";
import { useTestimonials } from "@/hooks/useTestimonials";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect, useRef } from "react";

const INSTAGRAM_POSTS = [
  "https://www.instagram.com/p/DY36sykDbjE/",
  "https://www.instagram.com/p/DYwKOapDUv4/",
  "https://www.instagram.com/p/DXTQpJsiA-s/",
  "https://www.instagram.com/p/DXyP-NhkebE/",
  "https://www.instagram.com/p/DX6HS_gAPCS/",
  "https://www.instagram.com/p/DYB0eivCD1a/",
];

const Testimonials = () => {
  const { data: testimonials, isLoading } = useTestimonials();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const visibleTestimonials = testimonials ?? [];

  useEffect(() => {
    if (visibleTestimonials.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((i) => (i + 1) % visibleTestimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [visibleTestimonials.length]);

  const scrollInstagram = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = 340;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Testimonials */}
        <div className="text-center mb-4">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            What Our{" "}
            <span className="bg-primary text-primary-foreground px-2 -skew-x-1 inline-block">
              Users Say
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Trusted by food businesses across India
          </p>
        </div>

        {isLoading ? (
          <div className="max-w-2xl mx-auto mb-16">
            <Skeleton className="h-48 w-full rounded-2xl" />
          </div>
        ) : visibleTestimonials.length > 0 ? (
          <div className="max-w-2xl mx-auto mb-16">
            <div className="relative bg-card rounded-2xl p-8 md:p-10 border border-border/50 shadow-soft">
              <Quote className="w-10 h-10 text-primary/20 absolute top-6 left-6" />
              <div className="pt-6 text-center">
                <p className="text-foreground text-lg leading-relaxed mb-6 italic">
                  "{visibleTestimonials[currentIndex]?.content}"
                </p>
                <div className="flex items-center justify-center gap-3">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={visibleTestimonials[currentIndex]?.avatar_url || ""} />
                    <AvatarFallback className="bg-primary/10 text-primary font-bold">
                      {visibleTestimonials[currentIndex]?.name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-left">
                    <p className="font-semibold text-foreground">
                      {visibleTestimonials[currentIndex]?.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {visibleTestimonials[currentIndex]?.role}
                      {visibleTestimonials[currentIndex]?.company &&
                        `, ${visibleTestimonials[currentIndex]?.company}`}
                    </p>
                  </div>
                </div>
                <div className="flex justify-center gap-1 mt-4">
                  {Array.from({ length: visibleTestimonials[currentIndex]?.rating ?? 5 }).map(
                    (_, i) => (
                      <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                    )
                  )}
                </div>
                {visibleTestimonials.length > 1 && (
                  <div className="flex justify-center gap-2 mt-6">
                    {visibleTestimonials.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentIndex(i)}
                        className={`w-2.5 h-2.5 rounded-full transition-colors ${
                          i === currentIndex ? "bg-primary" : "bg-border"
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <p className="text-center text-muted-foreground mb-16">
            Testimonials coming soon!
          </p>
        )}

        {/* Instagram Section */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl md:text-3xl font-bold text-foreground">
              Follow Us on{" "}
              <span className="bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F77737] bg-clip-text text-transparent">
                Instagram
              </span>
            </h3>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => scrollInstagram("left")}
                className="rounded-full"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => scrollInstagram("right")}
                className="rounded-full"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 snap-x snap-mandatory"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {INSTAGRAM_POSTS.map((postUrl, i) => (
              <div
                key={i}
                className="min-w-[320px] snap-start rounded-2xl overflow-hidden border border-border/50 bg-card"
              >
                <iframe
                  src={`${postUrl}embed`}
                  className="w-[320px] h-[420px] border-0"
                  allowTransparency
                  scrolling="no"
                  loading="lazy"
                  title={`Instagram post ${i + 1}`}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
