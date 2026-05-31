import { cn, initials } from "@/lib/utils";

export function Avatar({ src, name, className }: { src?: string; name?: string; className?: string }) {
  return (
    <span className={cn("grid h-10 w-10 overflow-hidden rounded-full bg-primary text-sm font-bold text-white", className)}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={name ?? "User"} className="h-full w-full object-cover" />
      ) : (
        <span className="m-auto">{initials(name)}</span>
      )}
    </span>
  );
}
