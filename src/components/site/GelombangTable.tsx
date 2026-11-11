import { gelombang } from "@/data/ppdb";
import { statusGelombang, tanggalPendek, type GelombangStatus } from "@/lib/gelombang";
import { cn } from "@/lib/utils";

export function StatusBadge({ status }: { status: GelombangStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 eyebrow",
        status === "Dibuka" && "text-primary",
        status === "Belum Dibuka" && "text-muted-foreground",
        status === "Ditutup" && "text-muted-foreground line-through",
      )}
    >
      <span
        className={cn(
          "size-2 rounded-full",
          status === "Dibuka" ? "bg-primary ring-4 ring-primary/15" : "border border-muted-foreground",
        )}
      />
      {status}
    </span>
  );
}

export function GelombangTable({ detail = false }: { detail?: boolean }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] border-collapse text-left">
        <thead>
          <tr className="border-b border-foreground/80 eyebrow text-muted-foreground">
            <th className="py-3 pr-4 font-normal">Gelombang</th>
            <th className="py-3 pr-4 font-normal">Periode daftar</th>
            {detail ? <th className="py-3 pr-4 font-normal">Seleksi</th> : null}
            {detail ? <th className="py-3 pr-4 font-normal">Pengumuman</th> : null}
            <th className="py-3 pr-4 text-right font-normal">Kuota</th>
            <th className="py-3 text-right font-normal">Status</th>
          </tr>
        </thead>
        <tbody>
          {gelombang.map((g) => {
            const s = statusGelombang(g);
            return (
              <tr key={g.nama} className={cn("border-b border-border", s === "Dibuka" && "bg-card")}>
                <td className="py-5 pr-4 font-display text-2xl">{g.nama}</td>
                <td className="py-5 pr-4 font-mono text-sm">
                  {tanggalPendek(g.mulai)} — {tanggalPendek(g.selesai)}
                </td>
                {detail ? <td className="py-5 pr-4 font-mono text-sm">{tanggalPendek(g.seleksi)}</td> : null}
                {detail ? <td className="py-5 pr-4 font-mono text-sm">{tanggalPendek(g.pengumuman)}</td> : null}
                <td className="py-5 pr-4 text-right font-mono text-sm">{g.kuota} santri</td>
                <td className="py-5 text-right">
                  <StatusBadge status={s} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
