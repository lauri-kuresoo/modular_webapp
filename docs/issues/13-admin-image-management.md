# 13: Tenant uploads and reorders its own photographs

**What to build:** A Tenant photographs their new treatment room on their phone,
uploads it from the admin, drags it to the front of the gallery, publishes, and
it is the first image on the Site. They can replace the hero image the same way.

**Blocked by:** 12 (Content editing and publish), 08 (Trust sections).

**Status:** ready-for-agent

## Design and technology choices

**Uploads go through a server action, not a client-side signed URL.** The
platform's invariant is that the browser talks to Firebase for authentication
and nothing else, and a direct-to-Storage upload from the browser breaks it —
it needs either a permissive Storage rule or a signed URL endpoint, and the
first is the exact misconfiguration class ticket 04 designed out. The cost is a
request body size limit on the serverless function, so cap the accepted file at
around 10 MB and resize server-side. That covers a phone photograph
comfortably.

**Derive dimensions and a blur placeholder at upload time, once.** Use a
server-side image library to read intrinsic width and height and produce a tiny
base64 placeholder, and store all three in the content document beside the
Storage path. Tickets 06, 07 and 08 all depend on these being present: they are
what reserve layout space and prevent shift. Probing an image at render time
would mean a network round trip during static generation for every image on
every build.

**Re-encode on upload rather than storing the original.** Cap the longest edge
at something sensible for a hero (2560px), strip EXIF, and convert to a modern
format. Stripping EXIF matters: phone photographs carry GPS coordinates, and a
Tenant's home address embedded in a gallery image is a data leak nobody
intended. This is the one place in the platform where personal data arrives
without anyone typing it.

**Serve through the framework's image optimiser** with the Storage host in the
allowed remote patterns. Storage is origin storage only; it is never the URL in
the markup.

**Ordering is an explicit integer on each entry**, rewritten as a batch on
reorder. Not array position — a partial write to an array is how a gallery ends
up with two images claiming the same slot.

**Drag to reorder, with a keyboard path that is not an afterthought.** Move-up
and move-down buttons on every item, always visible, announced properly. The
drag interaction is the pleasant path; the buttons are the one that works on a
phone, with a screen reader, and when the drag library misbehaves. Do not ship
drag-only.

**Alt text is required and enforced at the point of publishing.** The schema
demands it (ticket 08); this is where the Tenant is made to supply it. Block the
publish, name the offending image, and offer the field inline. Prompt for it in
the Tenant's own words — "describe this photo for someone who cannot see it" —
because "alt text" means nothing to a salon owner.

**Deleting an image removes the Storage object and the content entry in one
action.** If the Storage delete fails, do not remove the entry — an orphaned
object costs cents, but an entry pointing at a deleted object is a broken
image on the public Site.

**Replacing an image writes a new object and a new path.** Never overwrite in
place: the framework's optimiser and every CDN in between will happily serve the
old bytes from cache, and the Tenant will conclude the platform is broken.

**Upload progress and failure are visible.** Multiple files at once, per-file
progress, per-file failure that does not discard the successful ones. A Tenant
uploading eight photographs over a phone connection will hit one failure, and
losing all eight is what makes them stop using the feature.

## Acceptance criteria

- [ ] Images upload through a server action; the browser never receives a Storage credential or signed upload URL
- [ ] Files over the size cap are rejected with a clear message; accepted files are re-encoded, capped in dimension and stripped of EXIF
- [ ] Verify EXIF removal on a real phone photograph containing GPS data
- [ ] Intrinsic width, height and a blur placeholder are computed at upload and stored with the entry
- [ ] Public pages serve images through the framework's optimiser; no raw Storage URL appears in the markup
- [ ] Gallery order is stored as explicit integers and rewritten as a batch on reorder
- [ ] Reordering works by drag and by always-visible move-up/move-down controls, both operable by keyboard and announced
- [ ] Publishing is blocked while any gallery image lacks alt text, naming the image and offering the field inline
- [ ] Deleting an image removes object and entry together, and a failed object delete leaves the entry intact
- [ ] Replacing an image produces a new path; the Site never serves the previous bytes
- [ ] Multi-file upload shows per-file progress and a per-file failure does not discard successful uploads
- [ ] Reordering and republishing changes the order on the public Site within seconds
