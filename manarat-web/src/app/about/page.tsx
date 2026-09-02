import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import {
  Container,
  Section,
  Card,
  Button,
  ArrowIcon,
  Figure,
  PageMasthead,
  SectionHead,
} from "@/components/ui";

export const metadata: Metadata = {
  title: "About",
  description:
    "Manarat Foundation — the first purpose-established masjid and Islamic centre for Sheldon and Solihull, founded by scholars in 2012. Registered charity 1148223.",
};

const VALUES = [
  {
    title: "Knowledge before opinion",
    body: "Our teaching is led by qualified scholars. When we do not know, we say so and find someone who does.",
    d: "M4 18V6.5A2.5 2.5 0 0 1 6.5 4H20v13H6.5A2.5 2.5 0 0 0 4 19.5M8 8.5h7",
  },
  {
    title: "Tolerance, plainly stated",
    body: "We reject extremism in all its forms, and we say it out loud rather than leaving it to be assumed.",
    d: "M12 20.4S3.6 15.6 3.6 9.9A4.3 4.3 0 0 1 12 8a4.3 4.3 0 0 1 8.4 1.9c0 5.7-8.4 10.5-8.4 10.5Z",
  },
  {
    title: "The neighbourhood first",
    body: "Sheldon and Solihull are our responsibility. Our work serves whoever lives here, Muslim or not.",
    d: "M3.5 10.5 12 4l8.5 6.5V20a1 1 0 0 1-1 1h-15a1 1 0 0 1-1-1Z M9.5 21v-6h5v6",
  },
];

export default function AboutPage() {
  return (
    <>
      <SiteHeader />
      <main id="main">
        <PageMasthead
          eyebrow="About Manarat"
          title="A lighthouse, which is what the name means."
          lede="Founded in 2012 by a group of dedicated scholars, and the first purpose-established masjid and Islamic centre for the Muslims of Sheldon, Solihull and the surrounding areas."
        />

        <Section tone="ground" className="!pt-0">
          <Container>
            <div className="-mt-20 grid gap-4 sm:grid-cols-3">
              {[
                ["Established", "2012"],
                ["Capacity", "1,000+"],
                ["Registered charity", "1148223"],
              ].map(([k, v]) => (
                <Card key={k} className="p-7">
                  <p className="text-[0.62rem] font-bold uppercase tracking-[0.15em] text-ink-mute">
                    {k}
                  </p>
                  <p className="mt-2 font-display text-[2rem] font-extrabold leading-none text-navy-900">
                    {v}
                  </p>
                </Card>
              ))}
            </div>
          </Container>
        </Section>

        <Section tone="surface">
          <Container>
            <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
              <div>
                <SectionHead
                  eyebrow="Our story"
                  title="Built because there was nowhere else to go."
                />
                <div className="prose-measure mt-6 grid gap-5 text-[1rem] leading-[1.75] text-ink-soft">
                  <p>
                    Before 2012 the Muslims of Sheldon and Solihull travelled into Birmingham for
                    Jumu&rsquo;ah and for their children&rsquo;s classes. A group of scholars decided
                    that was long enough, and Manarat Foundation was established.
                  </p>
                  <p>
                    We later acquired a permanent home at 155 Coventry Road — a spacious building
                    with ample parking that now serves over a thousand worshippers, with a full
                    academy running alongside the five daily prayers.
                  </p>
                  <p>
                    Our commitment has not changed: education, community, and improving the quality
                    of life of our congregation and our neighbours.
                  </p>
                </div>
                <div className="mt-9 flex flex-wrap gap-3">
                  <Button href="/programmes">
                    Our academy <ArrowIcon />
                  </Button>
                  <Button href="/contact" variant="outline">
                    Visit us
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Figure alt="The masjid on Coventry Road" aspect="3/4" seed={4} className="mt-10" />
                <Figure alt="Jumu'ah congregation" aspect="3/4" seed={5} />
              </div>
            </div>
          </Container>
        </Section>

        <Section tone="ground">
          <Container>
            <SectionHead
              eyebrow="What we stand for"
              title="Three things we will not compromise on."
              align="center"
            />
            <div className="mt-12 grid gap-5 sm:grid-cols-3">
              {VALUES.map((v) => (
                <Card key={v.title} className="p-8">
                  <span className="grid h-12 w-12 place-items-center rounded-card bg-brand-wash text-brand">
                    <svg viewBox="0 0 24 24" aria-hidden className="h-6 w-6 fill-none stroke-current stroke-[1.5]" strokeLinecap="round" strokeLinejoin="round">
                      <path d={v.d} />
                    </svg>
                  </span>
                  <h3 className="mt-6 font-display text-[1.15rem] font-extrabold text-navy-900">
                    {v.title}
                  </h3>
                  <p className="mt-2.5 text-[0.93rem] leading-relaxed text-ink-soft">{v.body}</p>
                </Card>
              ))}
            </div>
          </Container>
        </Section>
      </main>
      <SiteFooter />
    </>
  );
}
