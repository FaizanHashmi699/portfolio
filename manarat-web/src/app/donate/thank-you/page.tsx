import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Container, Card, Button, ArrowIcon, KhatimPattern } from "@/components/ui";

export const metadata: Metadata = {
  title: "Thank you",
  description: "Your donation to Manarat Foundation.",
  robots: { index: false },
};

export default async function ThankYouPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>;
}) {
  const { ref } = await searchParams;

  const next = [
    {
      title: "A receipt is on its way",
      body: "It goes to the email address you gave at checkout. If it has not arrived within a few minutes, check the junk folder before contacting us.",
    },
    {
      title: "Gift Aid, if you added it",
      body: "We claim the extra 25% directly from HMRC. It costs you nothing and we do not need anything further from you.",
    },
    {
      title: "Confirmed by the provider",
      body: "A donation shows as confirmed once the payment provider notifies us, which is normally immediate.",
    },
  ];

  return (
    <>
      <SiteHeader />
      <main id="main">
        <section className="relative overflow-hidden bg-navy-950 pb-32 pt-20 text-white sm:pt-24">
          <span aria-hidden className="absolute inset-0 text-blue-300">
            <KhatimPattern id="thanks-khatim" opacity={0.07} size={72} />
          </span>
          <span
            aria-hidden
            className="absolute -right-40 -top-32 h-[520px] w-[520px] rounded-full"
            style={{ background: "radial-gradient(circle, rgba(21,145,220,.32), transparent 68%)" }}
          />
          <Container className="relative">
            <div className="mx-auto max-w-2xl text-center">
              <span
                aria-hidden
                className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-brand text-white shadow-brand"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-8 w-8 fill-none stroke-current stroke-[2]"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 12.5 9.5 18 20 7" />
                </svg>
              </span>
              <p className="mt-7 text-[0.7rem] font-bold uppercase tracking-[0.18em] text-blue-300">
                Donation received
              </p>
              <h1 className="mt-4 font-display text-[clamp(2.2rem,5vw,3.4rem)] font-extrabold leading-[1.05]">
                Jazakum Allahu khayran.
              </h1>
              <p className="mt-5 text-[1.05rem] leading-[1.7] text-white/72">
                May Allah accept it from you and multiply it for you. Your support keeps the doors
                open, the classes running and the lights on.
              </p>
            </div>
          </Container>
        </section>

        <section className="relative bg-ground pb-16 sm:pb-20 lg:pb-24">
          <Container>
            <div className="mx-auto -mt-24 max-w-3xl">
              {ref && (
                <Card className="flex flex-wrap items-center justify-between gap-4 p-6 sm:p-7">
                  <div>
                    <p className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-ink-mute">
                      Your reference
                    </p>
                    <p className="mt-1.5 font-mono text-[0.95rem] font-bold tracking-tight text-brand-deep">
                      {ref.slice(0, 32)}
                    </p>
                  </div>
                  <p className="max-w-xs text-sm leading-[1.7] text-ink-soft">
                    Quote this if you ever need to ask us about the donation.
                  </p>
                </Card>
              )}

              <div className={`grid gap-5 sm:grid-cols-3 ${ref ? "mt-5" : ""}`}>
                {next.map((n) => (
                  <Card key={n.title} className="p-6">
                    <h2 className="font-display text-[1.02rem] font-extrabold leading-snug tracking-tight text-brand-deep">
                      {n.title}
                    </h2>
                    <p className="mt-3 text-sm leading-[1.7] text-ink-soft">{n.body}</p>
                  </Card>
                ))}
              </div>

              <div className="mt-10 flex flex-wrap justify-center gap-3">
                <Button href="/appeal" size="lg">
                  See the appeal <ArrowIcon />
                </Button>
                <Button href="/" variant="outline" size="lg">
                  Back to the masjid
                </Button>
              </div>
            </div>
          </Container>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
