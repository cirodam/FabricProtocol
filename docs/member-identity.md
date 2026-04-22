# Member Identity

## The Problem

The currency system is anchored to real people. Each member receives an endowment based on their person-years in the community; the federal layer (kithe) is issued against community population counts. Both layers depend on one verifiable claim: that a member is a real, unique person who is not simultaneously counted in another community.

This is the Sybil problem — preventing one person from being counted as many.

## Local Verification: In-Person Vouching

At the community level, membership requires in-person sponsorship by existing members. Sponsors stake their standing — if a member they vouched for is later found to be fraudulent or duplicate, sponsors face consequences (reduced standing, clawback of endowments, etc.). This makes the cost of fraud social and local, not just technical.

This works well at community scale. The payoff for creating a fake identity — one person-year's worth of kin in a small community — is low relative to the social risk. It does not scale to adversarial federation-level attacks on its own.

## Federation Verification: Nullifiers

When the federation issues kithe against community population, it needs to know each person is counted only once across all communities — without learning who any of those people are.

The mechanism is a **nullifier**: a value derived deterministically from a member's private key.

```
nullifier = hash(privateKey)
```

The nullifier is:
- **Unique per person** — the same person always produces the same nullifier
- **Opaque** — it reveals nothing about the person's identity, name, or community
- **Collision-detectable** — if the same nullifier appears in two communities, the federation knows someone is double-counted, without knowing who

When a member joins, the community submits their nullifier to the federation registry. The federation maintains a global list. Duplicate nullifiers are rejected. Population counts are audited against the nullifier registry.

## Key Custody

Generating and managing cryptographic keys is not something most members should have to do manually. The community holds each member's keypair on their behalf — the same way a bank holds account credentials.

This is appropriate because:
- The community already knows who the member is
- The key is only secret from the *federation*, not from the community
- It keeps the UX simple for non-technical members

However, members should always have access to their own key on request. This lets a member:
- Take their identity to another community if they leave
- Verify what the community is submitting to the federation on their behalf
- Prove their own uniqueness independently if needed

Custody without transparency becomes control. The key belongs to the member; the community is only holding it.

## Zero-Knowledge Proofs (Optional Enhancement)

For communities that want stronger privacy guarantees, a ZK proof can be attached to the nullifier submission. The proof asserts: "I know a private key that (a) is in this community's membership set, and (b) produced this nullifier" — without revealing the key itself.

This is the same machinery used in privacy-preserving voting systems and privacy coins like Zcash. It is not required for the basic scheme to work, but it closes the gap against a compromised federation that might try to correlate nullifiers with other data.

## Limits

Cryptography handles the honest-but-curious case — where communities are legitimate but privacy from the federation is desired. The adversarial case (colluding communities generating fake keypairs) still requires the social layer: governance audits, cross-community process review, and reputation consequences for communities found to be inflating their counts.

The two layers are complementary. Neither is sufficient alone.
