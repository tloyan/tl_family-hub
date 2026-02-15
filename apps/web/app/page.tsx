import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 p-8">
      <h1 className="text-4xl font-bold tracking-tight">Family Hub</h1>
      <p className="text-muted-foreground">Web app is running.</p>

      {/* ShadCN Button variants */}
      <section className="flex flex-col items-center gap-4">
        <h2 className="text-lg font-semibold">ShadCN Buttons</h2>
        <div className="flex flex-wrap gap-3">
          <Button>Default</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
        </div>
      </section>

      {/* FH Token colors — member palette */}
      <section className="flex flex-col items-center gap-4">
        <h2 className="text-lg font-semibold">Member Colors</h2>
        <div className="flex gap-3">
          <div className="flex size-10 items-center justify-center rounded-full bg-fh-member-1 text-sm font-bold text-white">
            1
          </div>
          <div className="flex size-10 items-center justify-center rounded-full bg-fh-member-2 text-sm font-bold text-white">
            2
          </div>
          <div className="flex size-10 items-center justify-center rounded-full bg-fh-member-3 text-sm font-bold text-white">
            3
          </div>
          <div className="flex size-10 items-center justify-center rounded-full bg-fh-member-4 text-sm font-bold text-white">
            4
          </div>
          <div className="flex size-10 items-center justify-center rounded-full bg-fh-member-5 text-sm font-bold text-white">
            5
          </div>
          <div className="flex size-10 items-center justify-center rounded-full bg-fh-member-6 text-sm font-bold text-white">
            6
          </div>
        </div>
      </section>

      {/* FH Token colors — semantic */}
      <section className="flex flex-col items-center gap-4">
        <h2 className="text-lg font-semibold">Semantic Colors</h2>
        <div className="flex gap-3">
          <span className="rounded-md bg-fh-success px-3 py-1 text-sm font-medium text-white">
            Success
          </span>
          <span className="rounded-md bg-fh-warning px-3 py-1 text-sm font-medium text-white">
            Warning
          </span>
          <span className="rounded-md bg-fh-error px-3 py-1 text-sm font-medium text-white">
            Error
          </span>
          <span className="rounded-md bg-fh-info px-3 py-1 text-sm font-medium text-white">
            Info
          </span>
        </div>
      </section>

      {/* FH Token colors — moments */}
      <section className="flex flex-col items-center gap-4">
        <h2 className="text-lg font-semibold">Moment Backgrounds</h2>
        <div className="flex gap-3">
          <div className="flex h-16 w-24 items-center justify-center rounded-lg border border-fh-border-default bg-fh-moment-morning text-xs font-medium">
            Morning
          </div>
          <div className="flex h-16 w-24 items-center justify-center rounded-lg border border-fh-border-default bg-fh-moment-midday text-xs font-medium">
            Midday
          </div>
          <div className="flex h-16 w-24 items-center justify-center rounded-lg border border-fh-border-default bg-fh-moment-evening text-xs font-medium">
            Evening
          </div>
          <div className="flex h-16 w-24 items-center justify-center rounded-lg border border-fh-border-default bg-fh-moment-night text-xs font-medium text-white">
            Night
          </div>
        </div>
      </section>
    </main>
  );
}
