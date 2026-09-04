# 15: The full preset set and a Tenant who picks their own

**What to build:** A Tenant opens the admin, sees a short list of named looks,
previews their own Site's hero in each, picks one, and their Site changes
personality on publish — colours, type, roundness and density together. They can
nudge an individual token, but they cannot write CSS.

**Blocked by:** 12 (Content editing and publish), 06 (Chrome and hero), 07 (Commercial sections), 08 (Trust sections).

**Status:** ready-for-agent

## Design and technology choices

**Six presets, spanning both axes deliberately.** Ticket 02 built two to prove
the token contract; this fills the set out only once the real Sections exist,
because a preset judged against two placeholder Sections is a preset judged
against nothing. Cover the soft/rounded/airy to sharp/dense range and a spread
of accent hues, so the sales conversation has real options rather than six
variations on beige.

**Name them for the client conversation.** A Tenant chooses between "Linen" and
"Slate", not between `preset-3` and `preset-4`. The name is part of the product.

**A preset is a complete set, not a colour swap.** Each one declares light and
dark colour maps, a type pairing, a radius scale, a density scale and a shadow
level. Mixing "Linen's colours with Slate's type" is not offered — that is a
design system with no designer, and it is how a fleet fragments.

**Type pairings are a fixed short list, self-hosted.** Three or four pairings via
the framework's font loader, subset and self-hosted so there is no third-party
request and no cookie — the constraint from ticket 08 still holds. No arbitrary
font name input: a Tenant typing a font they own a licence for is a licensing
and a loading problem the platform cannot solve.

**The preview shows the Tenant's own content, not a mock.** Render their real
hero, a real service row and a real button in the candidate preset. A Tenant
choosing from abstract swatches will choose the one they like as a swatch and
dislike as a website.

**Preview both light and dark.** The Tenant will not think to check dark mode
and half their visitors will see it.

**Token overrides are a sparse map, validated per token.** The Tenant may set
`accent` to their brand colour; the value is parsed as a colour and rejected if
it is anything else, and the map is merged over the preset server-side by the
same emitter from ticket 02. Nothing accepts a raw declaration, a property name
the platform does not define, or anything that could carry a `url(` or a
`;`. Free-form CSS per Tenant is explicitly not permitted, and the shape of this
input is what enforces it.

**Refuse an override that breaks contrast.** This is the one place a Tenant can
make their own Site unreadable. When they override `accent`, recompute the
contrast against `accent-contrast` — and against `surface` for accent-coloured
text — and refuse the save below 4.5:1, explaining why and offering the nearest
passing value. Blocking is right here: an accessible Site is a promise the
Platform Operator made, and the Tenant is not the party who will notice it
broken.

**Store the theme name and overrides on the content document, publish like
anything else.** The Theme is Tenant-editable content and travels the same
save-then-revalidate path from ticket 12. The Site resolves the preset at build,
so there is no runtime theme lookup and no flash.

**Changing preset must not change layout, only look.** If a preset swap breaks a
Section's layout, the Section is reading a token it should not or hardcoding a
size. Sweeping every Section in every preset is what this ticket is for, and it
is the reason ticket 26 exists to make that sweep repeatable.

## Acceptance criteria

- [ ] Six presets exist, each a complete set of light and dark colour maps, type pairing, radius scale, density scale and shadow level, spanning both personality axes
- [ ] Presets carry human names used throughout the admin
- [ ] Type pairings come from a fixed list, self-hosted, with no third-party request and no new cookies
- [ ] The picker previews the Tenant's own hero, a service row and a button in the candidate preset, in both light and dark
- [ ] Selecting a preset and publishing changes the public Site's colours, type, radius and density together within seconds
- [ ] Individual token overrides are accepted only as a sparse map of known tokens with values parsed by type; arbitrary declarations, unknown property names and anything containing a URL or statement separator are rejected
- [ ] An override that drops a required contrast pair below 4.5:1 is refused with an explanation and a suggested passing value
- [ ] Every Section renders correctly in all six presets in both modes, with no layout breakage and no hardcoded colour or size found during the sweep
- [ ] Theme selection travels the same save-and-publish path as other content, and the Site performs no runtime theme lookup
