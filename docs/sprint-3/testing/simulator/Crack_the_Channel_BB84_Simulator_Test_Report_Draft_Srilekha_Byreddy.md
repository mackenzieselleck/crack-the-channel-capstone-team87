**CRACK THE CHANNEL** 

# **BB84 Simulator Test Report** 

|**Project**|**Crack the Channel — InteractiveQKD(BB84) Learning Platform**|
|---|---|
|**Team**|Team 87 — IBM Cyber Security: Quantum Risks|
|**Prepared by**|Srilekha Byreddy — (BA + Dev)|
|**Feature**|BB84 Simulator|
|**Requirements baseline**|Sprint 2 Final Requirements & User Stories, Revision 3.1|
|**Environment**|Local Next.js app; Chrome; http://localhost:3000/simulator|
|**Test cycle**|Current simulator feature testing|



## **1. Purpose** 

This report defines manual tests for the BB84 simulator against the approved Rev 3.1 requirements. Each test is executed, and the actual result, status, and evidence are recorded. 

## **2. Scope** 

In scope: simulator launch, Alice's transmission choices, Bob's measurement choices, stage navigation, exchange completion, Qiskit-backed execution, Eve interception, QBER display and interpretation, no-Eve baseline comparison, learner-facing explanations, and error handling if the simulator or Qiskit service cannot complete a run. 

Out of scope: authentication, learning-module assessments, badges, Daily Challenges, AI assistant and other features not part of the simulator test cycle. 

## **3. Test environment and preconditions** 

- Run the Next.js application from the project's my-app folder. 

- Open http://localhost:3000/simulator in Chrome. 

- Ensure required environment variables are configured; do not include secret values in this report. 

- Ensure the Qiskit service is available for tests that require a real backend result. 

- Capture screenshots for important outcomes and note the test ID in each evidence filename. 

- For Eve/no-Eve comparison, keep other inputs as similar as practical. BB84 outcomes can be probabilistic, so do not require identical values on every run. 

## **4. Test status definitions** 

- Not Run — test has not yet been executed. 

- Pass — observed behaviour meets the expected result and evidence is captured. 

- Partial Pass – can be fixed to improve 

- Fail — observed behaviour does not meet the expected result; record reproduction steps and evidence. 

- Blocked — test cannot be executed because a dependency or required feature is unavailable. Record the blocker; do not count it as a pass. 

## **5. Test cases** 

|**ID**|**Test**|**Steps**|**Expected result**|**Traceability**|**Status /**<br>**evidence**|
|---|---|---|---|---|---|
|SIM-01|Launch simulator|Open /simulator in Chrome.|Simulator loads without a fatal error and<br>the initial task is visible.|BB84-01|Pass|
|SIM-02|Initial screen and<br>progress|Inspect task title, mission<br>progress, packet cards, role<br>panel and Continue control.|Labels and controls are visible, readable<br>and consistent with the current stage.|UX / BB84-01|Pass|
|SIM-03|Alice bit selection|Choose bit 0 and bit 1 across|Each packet allows a bit choice and the|BB84-02|Pass|



|SIM-04|Alice basis<br>selection|differentphotonpackets.<br>Choose Straight and Diagonal<br>bases across packets.|selected choice is identifiable.<br>Each packet allows a basis choice and<br>the selected basis is identifiable.|FR-05 / US-07|Passs|
|---|---|---|---|---|---|
|SIM-05|Selection<br>retention|Make choices in several<br>packets and inspect cards<br>before continuing.|Selections remain visible and are not<br>unexpectedly reset before<br>submission/navigation.|BB84-02|Pass|
|SIM-06|Incomplete<br>required inputs|Leave a required choice<br>incomplete and attempt to<br>continue.|Progression is blocked with clear<br>guidance, or incomplete input is handled<br>according to the agreed design; no invalid<br>exchange is silently produced.|EDGE-08|Partial Pass|
|SIM-07|Continue to next<br>stage|Complete required visible<br>choices and click Continue.|The next required stage opens and<br>progress updates appropriately.|BB84-01 /<br>BB84-04|Pass|
|SIM-08|Back/navigation<br>behaviour|Use Back if available after<br>advancing; inspect prior<br>inputs.|Navigation is consistent and does not<br>unexpectedly lose or corrupt valid input.|Regression|Pass|
|SIM-09|Bob<br>measurement|At Bob's stage, choose the<br>available measurement<br>bases/actions.|Bob's actions can be completed and are<br>understandable.|BB84-03 / FR-<br>06|Pass|
|SIM-10|Complete<br>exchange|Complete all required stages<br>and request the result.|The exchange completes and presents an<br>outcome without an unhandled error.|BB84-04 / FR-<br>07|Pass|
|SIM-11|Qiskit-backed<br>execution|Run a complete exchange<br>while the service is available.|The result is produced by integrated<br>Qiskit-based processing, not only a static<br>placeholder.|BB84-05 / NFR-<br>03|Pass|
|SIM-12|Result clarity|Inspect the final result and<br>explanatorytext.|The outcome is visible and explained in<br>beginner-friendlylanguage.|BB84-06 / FR-<br>07|Pass|
|SIM-13|Eve mode<br>activation|Locate and enable<br>Eve/interception in the<br>simulator flow.|Eve mode can be enabled and the<br>scenario is clearly indicated.|BB84-07 / FR-<br>08|Pass|
|SIM-14|Eve effect|Run with Eve enabled and<br>inspect trace/result.|The run represents interception and<br>explains its effect. Exact QBER need not<br>be identical on every run because<br>outcomes can vary.|BB84-08 / US-<br>10–11|Pass|
|SIM-15|QBER displayed|Complete an exchange and<br>inspect the result summary.|QBER/error rate is displayed when<br>expected andpresented clearly.|BB84-09 / FR-<br>09|Pass|
|SIM-16|QBER<br>explanation|Read the QBER<br>explanation/help text.|Plain-language explanation states why<br>errors can indicate<br>disturbance/interception and why the<br>rate matters.|BB84-10 / US-<br>12–13|Pass|
|SIM-17|No-Eve baseline|Run with Eve disabled and<br>record outcome/QBER.|A baseline result is available and the no-<br>Eve scenario is clear.|BB84-11 / FR-<br>09|Pass|
|SIM-18|Compare Eve/no-<br>Eve|Run comparable trials with Eve<br>off and on; record results and<br>feedback.|The simulator supports comparison and<br>explains expected trends without<br>requiring every stochastic run to show a<br>fixed value.|BB84-08 /<br>BB84-11|Pass|
|SIM-19|Action/result<br>feedback|Perform a major action and<br>inspect contextual feedback.|Feedback explains what happened and<br>whyin beginner-friendlylanguage.|BB84-12 / FR-<br>10|Pass|
|SIM-20|Qiskit service<br>unavailable|Only if safe in local testing, use<br>a known unavailable endpoint<br>or temporarily make the<br>service unreachable; restore<br>settings afterwards.|The app shows clear recoverable<br>feedback rather than a broken page or<br>misleading successful result.|EDGE-05|Not Run|
|SIM-21|Repeated run|Complete a run, then start<br>another if supported.|The next run starts in a valid state without<br>unintended stale results or selections.|Regression /<br>EDGE-09|Not Run|
|SIM-22|Console/network<br>check|Inspect browser DevTools<br>Console and Network during<br>successful and failed/blocked<br>runs.|No unexplained client errors; failures are<br>handled and secrets are not exposed.|Technical QA|Partial Pass<br>tested when<br>successful)|



## **Evidence:** 

#### **SIM-01:** 



<!-- Start of picture text -->
© http/localhost:3000/simulator<br>1 Cyber<br>@ Canvasinthis Cours... @ LULU & SKYSolid Vine Debugg,<br><!-- End of picture text -->

SIM -02: 



#### SIM-03: 



<!-- Start of picture text -->
Bast simulator<br>wena Encodethe photons<br>axa cs) | (ex )en<br>Sy<br><!-- End of picture text -->

SIM-04, SIM-05: 



SIM-06: 



<!-- Start of picture text -->
MEASURE Bob is measuring<br>Alice<br><!-- End of picture text -->

SIM-07: 



SIM -08: 



SIM-09: 



SIM-10: 



<!-- Start of picture text -->
200 101 ° 00% ‘0 bts<br><!-- End of picture text -->

SIM -11: 



<!-- Start of picture text -->
Baseline vs observed QBER<br>0.0% 0.0%<br>0.0 percentage points<br><!-- End of picture text -->

SIM-12: 



<!-- Start of picture text -->
Baseline vs observed QBER<br>0.0% 0.0%<br>0.0 percentage points<br><!-- End of picture text -->



SIM-13: 



<!-- Start of picture text -->
pnatyse pony quantum channel<br>ice 200 102 bits, 6 51 bits<br>Baseline vs observed QBER<br>0.0% Uuees<br>+11.8 percentage points<br><!-- End of picture text -->

SIM -14: 



<!-- Start of picture text -->
nays Poa quantum channel<br>‘ice 200 102 bits 6 51 bits<br>Baseline vs observed QBER<br>a 0.0% US<br>+11.8 percentage points<br><!-- End of picture text -->

SIM-15: 



<!-- Start of picture text -->
cos Key exchange result<br>200 ‘02 6 119% 51 bits<br><!-- End of picture text -->

SIM-16: 



<!-- Start of picture text -->
ee Analyse the quantum channel<br>ice 200 102 bits 0 51 bits<br>eseline vs observed QOER<br>0.0% 0.0%<br>0.0 percentage points<br><!-- End of picture text -->

SIM -17: 



<!-- Start of picture text -->
oe Key exchange result<br>Basetine run: Eve is disabled<br>200 102 0 0.0% 51 bits<br>te<br><!-- End of picture text -->

SIM-18: 



<!-- Start of picture text -->
TASK<br>MISSION COMPLETE<br>eeI Key exchange result<br>Baseline run: Eve is disabled<br>Alice<br>200 102 0 0.0% 51 bits<br>te<br><!-- End of picture text -->

SIM-19: 



<!-- Start of picture text -->
ears son cour<br>Key exchange result<br>woe Onsctine rm: Evi oabled<br>200 402 ° 00% 51<br>te<br><!-- End of picture text -->



<!-- Start of picture text -->
ANALYSE Analyse the quantum channel<br>z ooo Sune ; ‘eons<br>|—_ 0.0% 15.2%<br>—<br>+15.2 percentage points<br><!-- End of picture text -->

Sim 22: 



<!-- Start of picture text -->
“ER [DB elements Console Sources Network >> acm, @B:<br>BOE wpr © F filter Default levels ¥ 1 issue: 1<br>‘A PMaxListenersexceededWarning: Possible EventEmitter meno contentscript.js:14968<br>ry leak detected. 11 close listeners added. Use emitter.setMaxListeners() to incr<br>ease limit<br>A. > MaxListenersexceedediarning: Possible EventEmitter memo contentscript.js:14068<br>ry leak detected. 11 end listeners added. Use enitter.sethaxListeners() to increa<br>se limit<br>- orphaned data for stream “app-init-  contentscript.js:14095<br>©> objecttultiplex<br>- orphaned data for stream “background- contentscript. js:14095<br>©>liveness” odjectMultiplex<br>forward-logs-shared.ts:128<br>Dountoad the React DevTools for a better development experience:<br>https://react.dev/Link/react-devtools<br>[HMR] connected forward-logs-shared,ts:12@<br>[Fast Refresh] rebuilding forward-logs-shared.ts:128<br>[Fast Refresh] done in 265ms forward-logs-shared.ts:12@<br>>|<br><!-- End of picture text -->

## **6. Defect log** 

**Defect ID:** SIM-DEF-01 

**Title:** Simulator allows progression with an incomplete photon selection **Severity:** Medium — proposed **Steps to reproduce:** 

1. Open the BB84 simulator. 

2. Leave one photon's bit unselected. 

3. Click Continue. 

4. Observe the next-stage validation message. 

**Actual result:** Navigation is allowed, but the next stage reports that a bit has not been selected. 

**Expected result:** Required inputs should be validated before progression, with clear guidance identifying the missing selection. 

**Recommendation:** Validate all required photon selections before advancing, highlight the incomplete packet, and keep the learner on the current stage until the required input is supplied. 

### **Report updates:** 

#### **1. Explanation and clarity improvement** 

Observation: The simulator’s learner-facing explanations and result feedback could be improved to make the BB84 process, QBER results, and the impact of Eve’s interception easier for beginners to understand. Clearer explanations of what the results mean and why they occur would improve the learning experience. 

#### **2. SIM-20 — Qiskit service unavailable** 

   - Status: Not Run — Developer testing required. 

   - Reason: Safely simulating an unavailable Qiskit service requires changing the endpoint or service configuration, which is best handled by the development team in a controlled local environment. 

   - Next action: Developer to test service failure handling and confirm that the application displays clear recovery guidance instead of a broken page or misleading successful result. 

**3. SIM-21 — Repeated run** 

   - Status: Not Run — Developer verification required. 

- Reason: This test has not been executed and is being deferred for developer verification of simulator state management. 

- Next action: Developer to complete a simulation, start another run, and verify that previous selections and results do not unintentionally carry over. 

## **7. Execution summary** 

|**Total test cases**|**22**|
|---|---|
|**Pass**|18|
|**Partial Pass**|2|
|**Fail**|0|
|**Blocked**|0|
|**Not Run**|2|
|**Overall assessment**|Pass,Fix the issues|



## **8. Priority checks from previous sprint review** 

The previous BA/QA review highlighted runtime verification of QBER behaviour, the no-Eve baseline comparison and clarity of the final learnerfacing result explanation. These are priority checks, not assumed failures. 

## **9. Conclusion** 

This draft provides a test checklist for the BB84 simulator against the Sprint 2 Rev 3.1 baseline. Final sign-off should follow execution, evidence capture, defect triage, and retesting of critical failures. Statuses must reflect observed behaviour. 

## **References** 

Internal project documents: Sprint 2 QA Test Cases; Sprint 2 Final BA & QA Validation Review (updated on 04 October 2026). 

