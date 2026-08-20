"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/field";
import { KIND_LABEL, searchEntries, type SearchEntry } from "@/domain/search";

export function SiteSearch({
  index,
  initialQuery = "",
}: {
  index: SearchEntry[];
  initialQuery?: string;
}) {
  const [query, setQuery] = useState(initialQuery);
  const results = useMemo(() => searchEntries(index, query), [index, query]);

  return (
    <div>
      <label htmlFor="site-search" className="sr-only">
        Search the site
      </label>
      <div className="relative">
        <Search className="text-muted-foreground pointer-events-none absolute start-4 top-1/2 size-5 -translate-y-1/2" />
        <Input
          id="site-search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Golden Visa, attestation, IFZA, Pakistan…"
          className="h-14 ps-12 text-base"
          autoFocus
          autoComplete="off"
        />
      </div>

      <p className="text-muted-foreground mt-4 text-sm" aria-live="polite">
        {query.trim() === ""
          ? `Searching ${index.length} pages — services, guides, nationalities, free zones and questions.`
          : results.length === 0
            ? "Nothing matched. Try a single word — “attestation”, “golden”, or a country name."
            : `${results.length} result${results.length === 1 ? "" : "s"}`}
      </p>

      {results.length > 0 && (
        <ul className="border-border mt-6 divide-y divide-[var(--border)] border-y">
          {results.map((entry) => (
            <li key={entry.id}>
              <Link
                href={entry.href}
                className="hover:bg-surface -mx-4 flex items-start justify-between gap-4 px-4 py-4 transition-colors"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone="neutral">{KIND_LABEL[entry.kind]}</Badge>
                    <span className="font-medium">{entry.title}</span>
                  </div>
                  <p className="text-muted-foreground mt-1 text-sm">
                    {entry.description}
                  </p>
                </div>
                {entry.meta && (
                  <span className="text-muted-foreground shrink-0 text-sm tabular-nums">
                    {entry.meta}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
