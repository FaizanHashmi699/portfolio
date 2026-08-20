import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Section, SectionHeading } from "@/components/ui/section";
import { averageRating, reviewPlatforms, reviews } from "@/content/reviews";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Reviews",
  description:
    "Why we won't host our own wall of five-star reviews, and where to find independent ones instead.",
  alternates: { canonical: "/reviews" },
};

export default function ReviewsPage() {
  const average = averageRating();

  return (
    <>
      <Section className="pb-8">
        <SectionHeading
          as="h1"
          eyebrow="Reviews"
          title="We don't host our own five-star wall."
          description="Not out of modesty. Self-published, uniformly glowing reviews are now one of the clearest warning signs in this category, and sophisticated buyers discount them on sight."
        />

        <div className="text-lead text-muted-foreground mt-8 max-w-3xl space-y-5">
          <p>
            The pattern is well documented: dozens of five-star ratings, generic
            wording, posted within days of each other, appearing nowhere except the
            company&apos;s own website. Guides written to help people avoid UAE visa
            scams list exactly that as a red flag.
          </p>
          <p className="text-foreground">
            So we won&apos;t build one. When we have real reviews, they will live on
            platforms we do not control, and the unflattering ones will stay where they
            are.
          </p>
        </div>
      </Section>

      <Section className="py-8">
        <h2 className="text-h2">Where to check us</h2>
        <ul className="mt-6 grid max-w-3xl gap-4 sm:grid-cols-2">
          {reviewPlatforms.map((platform) => (
            <li key={platform.name}>
              <Card className="h-full">
                <CardContent className="pt-6">
                  <h3 className="font-display text-h3 flex items-center gap-2">
                    {platform.name}
                    <ExternalLink className="text-muted-foreground size-4" />
                  </h3>
                  <p className="text-muted-foreground mt-2 text-sm">{platform.why}</p>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      </Section>

      <Section className="py-8">
        {reviews.length === 0 ? (
          <Card className="max-w-3xl">
            <CardContent className="py-12 text-center">
              <Star className="text-muted-foreground mx-auto size-10" />
              <h2 className="font-display text-h3 mt-4">No reviews to show yet</h2>
              <p className="text-muted-foreground mx-auto mt-3 max-w-lg text-sm">
                We are new. Rather than invent social proof, we would rather you judged
                us on the things you can verify right now: every fee published in full,
                every rejection reason listed on the service pages, and an eligibility
                check that gives you a real answer without asking for your phone number.
              </p>
              <p className="mt-6">
                <Link
                  href="/pricing"
                  className="text-primary font-medium hover:underline"
                >
                  See every fee →
                </Link>
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            <h2 className="text-h2">
              What people say
              {average !== null && (
                <span className="text-muted-foreground ms-3 text-lg font-normal">
                  {average} average across {reviews.length}
                </span>
              )}
            </h2>
            <ul className="mt-6 grid max-w-4xl gap-4 md:grid-cols-2">
              {reviews.map((review) => (
                <li key={review.id}>
                  <Card className="h-full">
                    <CardContent className="pt-6">
                      <div
                        className="flex items-center gap-1"
                        aria-label={`${review.rating} out of 5`}
                      >
                        {Array.from({ length: 5 }, (_, index) => (
                          <Star
                            key={index}
                            className={
                              index < review.rating
                                ? "fill-sand-500 text-sand-500 size-4"
                                : "text-border-strong size-4"
                            }
                            aria-hidden="true"
                          />
                        ))}
                      </div>
                      <p className="mt-3 text-sm">{review.body}</p>
                      <p className="text-muted-foreground mt-3 text-xs">
                        {review.author} · {formatDate(review.date)} · {review.platform}
                      </p>
                      {review.response && (
                        <p className="border-border text-muted-foreground mt-3 border-t pt-3 text-sm">
                          <strong className="text-foreground">Our reply:</strong>{" "}
                          {review.response}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </li>
              ))}
            </ul>
          </>
        )}
      </Section>
    </>
  );
}
