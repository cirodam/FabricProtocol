# Social Groups

## Concept

A Social Group is a voluntary association of community members organized around shared values, interests, or practices. It is a social primitive — not a production unit, not a survival function, but the connective tissue of community life.

Examples: a church, a book club, a sports league, a music ensemble, a philosophy circle, a neighborhood council, a parent group.

The commons does not manage social groups. It simply provides a way for them to advertise their existence to the community.

---

## Distinction from Other Structures

| | Social Group | FunctionalUnit | FunctionalDomain |
|---|---|---|---|
| Purpose | Affinity, shared practice | Operational execution | Community mandate |
| Funded by | Optional dues / voluntary | Parent domain or Commons | Commons |
| Produces | Social cohesion | Goods, services, care | Policy, budget |
| Membership | Voluntary | Assigned/elected | Governance-determined |
| Payroll | No | Yes (positions) | Yes (positions) |

---

## Properties

A social group has:
- A **name** and **description**
- A **member roster** — voluntary, open or invite-based at the assembly's discretion
- An optional **Bank account** — for dues, shared expenses, collective purchases
- An optional **Asset ledger** — a meeting space, a library collection, shared equipment
- Internal **governance** — officers, facilitators, meeting rhythm (self-determined, not commons-mandated)

Assemblies are lightweight by design. They do not require positions, payroll, or domain affiliation.

---

## Relationship to the Commons

Social groups are independent of the commons governance structure but exist within the commons community. They:
- Cannot compel members — participation is always voluntary
- May use shared commons spaces or resources without being governed by the Commons
- Are not accountable to the Commons for their internal affairs
- Are visible to the community through a simple listing — name, description, contact — nothing more

## Social Groups as Incubators

Associational groups often become functional over time. A book club focused on food systems starts a community garden. A church becomes the organizing structure for elder care. A neighborhood council evolves into a governance body.

The Social Group form is where new functions incubate before the community decides to formalize them into a FunctionalDomain or FunctionalUnit. No formal transition mechanism is required — it happens organically through governance proposals.

## Implementation Notes (when ready)

- `SocialGroup` class: `id`, `name`, `description`, `contactMemberId: string`
- Deliberately minimal — no Bank account, no ledger, no roster management, no payroll
- Commons registry: `commons.addSocialGroup(group)` / `commons.getSocialGroups()` — a public notice board, not a management tool
- Groups manage their own internal affairs outside the protocol
