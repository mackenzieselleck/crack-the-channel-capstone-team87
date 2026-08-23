# Learner Profile & UX Considerations

*Validated with a 25-response student survey*

|                 |                                                                                                                                                                                                                                                                                                |
|-----------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Team**        | Team 87, IBM Cyber Security: Quantum Risks                                                                                                                                                                                                                                                     |
| **Project**     | Crack the Channel, Interactive QKD (BB84) Learning Platform                                                                                                                                                                                                                                    |
| **Client**      | IBM via RMIT Capstone Consultancy                                                                                                                                                                                                                                                              |
| **Task**        | Research the needs, expectations, challenges and characteristics of the target first-year student audience with little or no quantum background, and identify UX considerations for presenting BB84 and quantum eavesdropping concepts in a beginner-friendly interactive learning experience. |
| **Based on**    | Crack the Channel Requirements and User Stories Baseline (Sprint 1), plus a 25-response student survey conducted 22 August 2026                                                                                                                                                                |
| **Prepared by** | Jerome Altamia (UX)                                                                                                                                                                                                                                                                            |
| **Status**      | Validated with primary survey data. Findings ready to share with the team.                                                                                                                                                                                                                     |

## 1. Purpose and Method

This document identifies who the platform is being designed for, what beginner knowledge level to design around, and what that implies for the user experience. The initial version of this document was built from the Sprint 1 requirements baseline alone. This version replaces those assumptions with findings from a short survey of 25 RMIT students, run on 22 August 2026.

The survey was distributed informally (a flyer and word of mouth among Cyber Security students), not as a random sample of all first-years. It also included some 2nd to 4th year respondents alongside the target 1st-year group, which is noted as a limitation in section 7.

## 2. Who Responded

| **Metric**                                                     | **Result**                                              |
|---|---|
| Total responses                                                | 25                                                      |
| 1st-year students                                              | 15 of 25 (60%)                                          |
| Other years (2nd to 4th)                                       | 10 of 25 (40%), included for comparison                 |
| Had prior crypto or quantum coursework                         | 8 of 25 (32%)                                           |
| Average self-rated quantum understanding (1 to 5)              | 1.9 overall / 1.4 among 1st-years only                  |
| Recognised none of "BB84", "qubit", "quantum key distribution" | 14 of 25 (56%) overall / 11 of 15 (73%) among 1st-years |

## 3. Target Learner Characteristics

- Primarily first-year RMIT students in Cyber Security, Information Security, and related IT degrees, consistent with the requirements baseline’s target audience.

- Motivation is mostly intrinsic: curiosity, degree relevance, or wanting a head start, rather than being required to be there. Only one respondent described active disinterest.

- "Success" for most respondents means being able to explain the idea afterwards or predict an outcome themselves, not completing a checklist. Several described wanting a takeaway they could repeat to someone else.

## 4. Beginner Knowledge Level Considered

The "little or no prior quantum knowledge" assumption from the requirements baseline holds, and is stronger among the actual 1st-year respondents than the overall sample.

- Average self-rated understanding of quantum computing: 1.9 out of 5 overall, 1.4 out of 5 among 1st-years specifically.

- 56% of all respondents, and 73% of 1st-years, recognised none of "BB84", "qubit", or "quantum key distribution" before the survey.

- Despite this, every respondent, including everyone who rated themselves 1 or 2 out of 5, gave an accurate, working definition of "eavesdropping" in a cybersecurity context. General security intuition is solid even where quantum-specific knowledge is not, which is a concrete hook the design can use.

## 5. Key UX Needs, Validated

What respondents said worries them most about learning a topic like this. Tied for first place is a genuine finding: interaction feedback is just as big a concern as content difficulty.

| **Biggest worry about learning this topic** | **Responses** |
|---|---|
| Hard to tell if I am doing it right         | 6 of 25       |
| Too abstract or math-heavy                  | 6 of 25       |
| Too complicated or hard to understand       | 5 of 25       |
| Too much jargon                             | 5 of 25       |
| Does not connect to what I already know     | 2 of 25       |
| Other                                       | 1 of 25       |

## 6. Beginner-Friendly Design Considerations

Each consideration below is backed by what respondents actually said, not just inferred from the requirements document.

| **Design consideration**                                                                       | **Evidence**                                                                                                                                                                                                                                                                             | **Maps to**  |
|---|---|---|
| Give feedback after every action, not just at the end                                          | Tied for the single biggest worry (6 of 25): "hard to tell if I am doing it right." In their own words about what builds confidence: "clear error messages that tell me how to fix it," "instant feedback after each action," "a clear indicator of success or failure after each step." | UX-05, UX-06 |
| Anchor BB84 and Eve to the general idea of eavesdropping, not quantum theory first             | Every single respondent, including all 20 who rated their quantum understanding at 1 or 2 out of 5, gave an accurate definition of eavesdropping in a cybersecurity context. The gap is quantum-specific, not security-general.                                                          | LR-03, LR-04 |
| Lead with diagrams and hands-on interaction over text                                          | Diagrams/visuals was the top preference (19 of 25), then hands-on interaction (14), then video (12). Short text explanations came last (8).                                                                                                                                              | LR-05, UX-01 |
| Use plain-language labels, not technical terms, on every control                               | "Too much jargon" was a top-tier worry (5 of 25). Confidence builders named directly: "plain-language labels instead of technical terms," "labelled icons and buttons," "simple instructions written in plain English."                                                                  | LR-02, UX-04 |
| Show a visible progress indicator through the exchange                                         | Named directly as a confidence builder: "a progress indicator or checklist," "a progress bar showing how far along I am," "a short onboarding tutorial."                                                                                                                                 | UX-03        |
| Keep the interface to one clear starting point and a small number of visible options at a time | The most common past point of confusion was interface overload, not content: "too many settings and no clear starting point," "too many options on screen at once," "settings buried in submenus," "didn’t know where to start."                                                         | UX-04, UX-06 |
| Confirm every action with a visible result before moving on                                    | "No feedback when I clicked something" and "the app didn’t explain what to do first" were named as past sources of confusion. Matches the requirement that the learner should never be left in an unexplained state.                                                                     | FR-10, UX-06 |

## 7. Limitations

- Convenience sample, not a random one. Several respondents mention a flyer or a friend in Cyber Security, suggesting recruitment through existing course networks.

- 40% of respondents were 2nd-year or above, outside the primary target group. Their answers are included above but the 1st-year-only figures in section 4 should be weighted more heavily.

- All findings are self-reported. Nobody has yet used an actual prototype, so this reflects stated preference, not observed behaviour. That gap is intended to be closed by the usability testing planned for later sprints.

## 8. Next Steps

- Share these findings with the team for review.

- Use the design considerations table as the basis for early wireframes of onboarding, the Alice/Bob exchange, and Eve mode.

- Revisit after the first usability testing round, once a real prototype exists to observe rather than describe.
