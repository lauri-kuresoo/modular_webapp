# 29: A Visitor using a screen reader can book independently

**What to build:** A keyboard-only and screen-reader pass through both booking
flows, end to end, fixing what it finds. The per-Section accessibility work is
already an acceptance criterion on tickets 06 to 09; this is the flow-level pass
those cannot cover — the date picker, the slot list, the hold countdown, the
form errors, the confirmation.

**Blocked by:** 18 (Request confirm and decline), 21 (Visitor cancel and rebook), 24 (Calendar actions).

**Status:** ready-for-agent

## Design and technology choices

**This is a real ticket because the booking flow is where the platform stops
being a document.** Static content with good markup is accessible almost by
default; a date picker with availability state, a slot list, a countdown and a
multi-step form are not. And the story is not "the site is compliant" — it is
that a blind customer can make an appointment without phoning, which is a
functional requirement.

**Do the keyboard pass first, alone, with the mouse physically unplugged or the
pointer ignored.** Most screen-reader failures are keyboard failures wearing a
costume, and the keyboard pass is faster and needs no assistive technology.
Tab, Shift-Tab, Enter, Space, Escape and the arrow keys through: choose a
service, choose a date, choose a time, fill the form, submit, read the
acknowledgement, open the verification link, confirm, and then cancel from the
email link. Both booking modes.

**Then the screen-reader pass with VoiceOver on macOS and iOS.** That is the
realistic assistive technology for the platform's audience and it is available
without extra software. Add NVDA on Windows if it is to hand — it behaves
differently enough around live regions to be worth the extra hour.

**The specific things to check, because a generic sweep finds nothing:**

- *The date picker* announces which dates have availability and which do not, and the distinction is not conveyed by colour alone. A disabled date says why.
- *The slot list* is a real radio group with real labels (ticket 19), so arrow keys move between times and the selection is announced. If it is divs with click handlers, that is the finding.
- *The hold countdown* is a polite live region, not an assertive one, and it never moves focus. An assertive region announcing every second is unusable; announce at meaningful intervals — the first message, a warning near the end — and expose the remaining time on demand.
- *Under reduced motion* the countdown still communicates urgency without animation.
- *Form errors* are associated with their inputs programmatically, summarised at the top of the form, and focus moves to that summary on a failed submit. Not colour-only, and not a toast that disappears before it is read.
- *The acknowledgement and confirmation* announce success without the user having to hunt for it, and the "this is a request, not a confirmation" message is part of what gets announced — the most important sentence on the page must not be the one a screen reader reaches last.
- *Every dialog* — mobile menu, lightbox, verification page, move dialog — traps focus, closes on Escape and returns focus to its trigger.
- *Every interactive element* has an accessible name that makes sense out of context. "Book" is not a name when there are six of them; "Book 60 minute massage" is.
- *Touch targets and focus rings* survive all six presets, including the dense one. A focus ring that vanishes against one preset's surface is a defect in that preset, not in the component.

**Include the Tenant Admin's calendar actions in the pass.** A Tenant may also be
the person using a screen reader, and the calendar and the move dialog are the
densest interfaces in the product.

**Test with the page at 200% zoom and at a 320px viewport**, since reflow
failures and keyboard failures are found by the same walk-through and cost
nothing extra to check while you are there.

**Fix what is quick; file what is not.** Anything that takes an hour, fix in this
ticket. Anything that turns out to need a component redesigned — the slot list
rebuilt, a picker replaced — becomes its own ticket with the finding written
down, because a ticket that tries to absorb an unbounded list of fixes never
closes.

**Record the walk-through in the repo.** Which flows, which technology, which
version, what was found, what was fixed and what was filed. With no automated
tests this record is the only evidence the pass happened, and it is what the
next pass starts from after the next feature lands.

## Acceptance criteria

- [ ] Both booking flows are completed end to end using only the keyboard, in both booking modes, including the verification and cancellation links
- [ ] Both flows are completed with VoiceOver on macOS and on iOS
- [ ] The date picker conveys per-date availability non-visually, and disabled dates explain why
- [ ] The slot list is a native radio group navigable by arrow keys with announced selection
- [ ] The hold countdown uses a polite live region, never steals focus, announces at meaningful intervals rather than continuously, exposes remaining time on demand, and still communicates urgency under reduced motion
- [ ] Form errors are programmatically associated with their inputs, summarised at the top, receive focus on failed submit, and are not conveyed by colour alone
- [ ] Success and the "request, not confirmation" message are announced without the user hunting for them
- [ ] Every dialog in the product traps focus, closes on Escape and restores focus to its trigger
- [ ] Every interactive element has an accessible name that is unambiguous out of context
- [ ] Focus indicators are visible and touch targets adequate in all six presets in both light and dark
- [ ] The Tenant Admin calendar views and the move dialog are included in the pass
- [ ] Both flows are checked at 200% zoom and at a 320px viewport with no loss of content or function
- [ ] Quick fixes are applied in this ticket; anything requiring a component redesign is filed as its own ticket with the finding recorded
- [ ] The walk-through — flows, assistive technology and versions, findings, fixes and filed follow-ups — is recorded in the repo
