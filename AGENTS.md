<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

## What Lovable manages

Rules outside this block are the project's own. Change the pieces below in
Lovable, not by hand. With the [Lovable MCP](https://mcp.lovable.dev)
connected, `send_message` asks Lovable to do it; otherwise ask the user to
use the editor.

- **Database.** Do not add or edit `supabase/migrations/` or `drizzle/`.
  Ask Lovable to change the schema.
- **Generated files.** Do not edit a file whose header says it is automatically
  generated.
- **AI gateway.** Keep model calls on Lovable's gateway, and keep
  `LOVABLE_API_KEY` out of browser code.
- **Connectors.** Lovable provides native connectors. `list_connectors` shows
  which are enabled; `add_connector` only returns the dashboard link. When a
  connector is enabled, calls go through the connector gateway and need
  `LOVABLE_API_KEY`. When Lovable does not provide one, users can bring their
  own key and store it in Secrets.
- **Secrets.** Lovable manages them. Do not put secret values in the repo.
<!-- LOVABLE:END -->

## Project rules

- Waves (`gelombang`) and document requirements (`jenis_berkas`) live in the database and are read publicly via `src/lib/ppdb-public.functions.ts`; public RLS exposes only rows with `gelombang.dipublikasikan` / `jenis_berkas.aktif` (never `USING (true)`), staff and linked applicants see the rest; remaining static copy (fees, news, contacts) stays in `src/data/ppdb.ts` until panitia content management exists.
- Wave open/closed status is computed from dates in WIB (`statusGelombang` in the UI, `gelombang_dibuka()` in the DB); never hardcode a status.
- Site header/footer are rendered once in `src/routes/__root.tsx`; pages render only their own content.
- Applicant workflow rules are enforced in Postgres (triggers on `pendaftaran`/`berkas_pendaftaran`, RPC `ajukan_pendaftaran`); the UI mirrors them in `src/lib/pendaftaran-rules.ts` only for feedback. Applicants can never change status/nomor/catatan directly.
- Roles live in `user_roles` (`calon_santri`, `panitia`, `pimpinan`, `super_admin`) checked via `has_role`/`is_staff`; never store roles on profiles.
- Applicant files go to private bucket `berkas-pendaftaran` at `<user_id>/<pendaftaran_id>/<kode>-<timestamp>.<ext>`; the DB trigger validates type/size from storage metadata.
- Signed-in pages live under `src/routes/_authenticated/` (client-only gate redirecting to `/masuk`); one auth listener lives in `AuthProvider` (`src/lib/auth.tsx`).
