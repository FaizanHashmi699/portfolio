"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Field, Input, Select } from "@/components/ui/field";
import { freeZoneEntryCost, recommendFreeZones } from "@/domain/geography/free-zones";
import { formatAed } from "@/lib/utils";

/**
 * Free zone finder.
 *
 * Ranks strictly by the founder's stated constraints, cheapest first. There is no
 * commission field in the underlying data for this to be biased by — that absence is
 * asserted by a test, not just intended.
 */
export function FreeZoneFinder() {
  const [budget, setBudget] = useState(20000);
  const [dubaiOnly, setDubaiOnly] = useState(false);
  const [physical, setPhysical] = useState(false);
  const [visas, setVisas] = useState(1);

  const results = useMemo(
    () =>
      recommendFreeZones({
        budgetAed: budget,
        needsDubaiAddress: dubaiOnly,
        needsPhysicalSpace: physical,
        visasNeeded: visas,
      }),
    [budget, dubaiOnly, physical, visas],
  );

  return (
    <div className="grid gap-8 lg:grid-cols-[20rem_minmax(0,1fr)] lg:items-start">
      <Card className="lg:sticky lg:top-24">
        <CardContent className="space-y-5 pt-6">
          <Field
            label="Budget for year one"
            htmlFor="budget"
            hint="Licence and establishment card, excluding visas."
          >
            <Input
              id="budget"
              type="number"
              min={0}
              step={1000}
              value={budget}
              onChange={(event) =>
                setBudget(Math.max(0, Number(event.target.value) || 0))
              }
            />
          </Field>

          <Field label="Visas needed in year one" htmlFor="visas">
            <Input
              id="visas"
              type="number"
              min={0}
              max={20}
              value={visas}
              onChange={(event) =>
                setVisas(Math.max(0, Number(event.target.value) || 0))
              }
            />
          </Field>

          <Field label="Do you need a Dubai address?" htmlFor="dubai">
            <Select
              id="dubai"
              value={dubaiOnly ? "yes" : "no"}
              onChange={(event) => setDubaiOnly(event.target.value === "yes")}
            >
              <option value="no">Anywhere in the UAE is fine</option>
              <option value="yes">Dubai specifically</option>
            </Select>
          </Field>

          <Field
            label="Do you need physical space?"
            htmlFor="physical"
            hint="Warehousing, a workshop, or a real office your clients visit."
          >
            <Select
              id="physical"
              value={physical ? "yes" : "no"}
              onChange={(event) => setPhysical(event.target.value === "yes")}
            >
              <option value="no">No, remote or flexi-desk is fine</option>
              <option value="yes">Yes, I need premises</option>
            </Select>
          </Field>
        </CardContent>
      </Card>

      <div>
        <p className="text-muted-foreground text-sm" aria-live="polite">
          {results.length === 0
            ? "Nothing matches those constraints. Raising the budget is usually the quickest fix — we would rather show you nothing than recommend a zone that does not fit."
            : `${results.length} zone${results.length === 1 ? "" : "s"} fit, cheapest first.`}
        </p>

        <ul className="mt-5 space-y-4">
          {results.map((zone) => (
            <li key={zone.slug}>
              <Card className="relative">
                <CardContent className="pt-6">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="font-display text-h3">
                        <Link
                          href={`/free-zones/${zone.slug}`}
                          className="hover:text-primary after:absolute after:inset-0"
                        >
                          {zone.name}
                        </Link>
                      </h3>
                      <p className="text-muted-foreground mt-1 text-sm">
                        {zone.emirate} · {zone.setupDays.min}–{zone.setupDays.max} days
                        · {zone.visaQuotaBase} visa{zone.visaQuotaBase === 1 ? "" : "s"}{" "}
                        included
                      </p>
                    </div>
                    <div className="text-end">
                      <p className="font-display text-xl font-semibold tabular-nums">
                        {formatAed(freeZoneEntryCost(zone))}
                      </p>
                      <Badge tone={zone.tier === "budget" ? "success" : "neutral"}>
                        {zone.tier}
                      </Badge>
                    </div>
                  </div>

                  <p className="mt-3 text-sm">{zone.bestFor}</p>

                  <p className="text-muted-foreground mt-3 text-sm">
                    <strong className="text-foreground">Worth knowing:</strong>{" "}
                    {zone.limitations[0]}
                  </p>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
