/**
 * Route-level loading state.
 *
 * A skeleton rather than a spinner: it reserves the space the content will occupy, so the
 * page does not jump when it arrives. `aria-busy` and a live region tell screen readers
 * something is happening, which a bare animation does not.
 */
export default function Loading() {
  return (
    <div className="container-page py-16" aria-busy="true">
      <p className="sr-only" role="status">
        Loading
      </p>

      <div className="motion-safe:animate-pulse">
        <div className="bg-border h-4 w-28 rounded-full" />
        <div className="bg-border mt-6 h-10 w-3/4 max-w-2xl rounded-lg" />
        <div className="bg-border mt-4 h-5 w-full max-w-xl rounded-lg" />
        <div className="bg-border mt-2 h-5 w-2/3 max-w-lg rounded-lg" />

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="border-border rounded-card border p-6">
              <div className="bg-border h-5 w-20 rounded-full" />
              <div className="bg-border mt-4 h-6 w-3/4 rounded-lg" />
              <div className="bg-border mt-3 h-4 w-full rounded-lg" />
              <div className="bg-border mt-2 h-4 w-5/6 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
