## Footer Cleanup

### Requirements

#### REQ-1: Remove Dead Links
Footer must not contain links pointing to non-existent pages.

**Scenarios:**
- All footer links either point to real pages or are removed
- No `href="#"` placeholder links remain

#### REQ-2: Add Legal and Contact Links
Footer must include Privacy Policy, Terms of Service links and a support email.

**Scenarios:**
- Footer contains working links to `/privacy` and `/terms`
- Footer displays a support email address
