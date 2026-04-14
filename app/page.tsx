"use client";

import { useState, useRef, useEffect } from "react";

// ── Types ─────────────────────────────────────────────────────
type Msg = { role: string; content: string };
type QuizResult = { score: number; total: number; filter: string; pct: number };
type ScScore = { e: number; c: number; co: number; avg: number; date: number };
type Profile = { id: string; name: string };

// ── Colors ────────────────────────────────────────────────────
const C = {
  navy:'#1A2840', navyLight:'#243660', gold:'#C9A84C', goldLight:'#E8C870',
  cream:'#F5F0E8', creamDark:'#EDE5D8', white:'#FFFFFF',
  text:'#1A2840', textMed:'#4A5568', textLight:'#8A7A6A', border:'#E2D9CC',
  green:'#1A7A4A', greenBg:'#F0FAF5', orange:'#B85C00', orangeBg:'#FFF5EB',
  red:'#C0282E', redBg:'#FFF0F0', blue:'#1A4A8A', blueBg:'#EFF4FF',
};

const CAT_COLORS: Record<string, {bg:string;text:string;border:string}> = {
  "Arrangement":{bg:'#F0FAF5',text:'#1A7A4A',border:'#B8EDD6'},
  "Compliance":{bg:'#EFF4FF',text:'#1A4A8A',border:'#BFCFEE'},
  "Cultural":{bg:'#F5F0FF',text:'#5B2D9A',border:'#DDD0FF'},
  "Conflict":{bg:'#FFF0F0',text:'#C0282E',border:'#FFD0D0'},
  "Legal":{bg:'#EFF4FF',text:'#1A4A8A',border:'#BFCFEE'},
  "First Call":{bg:'#F0FAF5',text:'#1A7A4A',border:'#B8EDD6'},
  "Aftercare":{bg:'#FFF8E8',text:'#8A5A00',border:'#F0D890'},
};

// ── Scenarios ─────────────────────────────────────────────────
const SCENARIOS = [
  { id:1, title:"Arrangement Conference", subtitle:"First Meeting", category:"Arrangement", difficulty:"Beginner",
    description:"Guide an overwhelmed family through their first arrangement meeting. Practice pacing, compassionate listening, and explaining the process clearly.",
    goals:["Establish rapport and emotional safety","Explain the arrangement process step by step","Ask open-ended questions about the deceased"],
    persona:"You are Maria, 45, who just lost her mother unexpectedly to a stroke this morning. You're overwhelmed but trying to hold it together. You don't know anything about arrangements and feel slightly guilty asking about costs. React warmly to empathy and patience. Become withdrawn or confused if rushed or met with jargon.",
    opening:"Hi... I'm Maria. I got a call saying I should come in and... I don't really know what happens now. My mom just passed this morning." },
  { id:2, title:"FTC Funeral Rule", subtitle:"Price Transparency", category:"Compliance", difficulty:"Intermediate",
    description:"Navigate presenting the General Price List and explaining itemized pricing to a skeptical, financially stressed family member.",
    goals:["Offer the GPL at the correct moment","Explain itemization without pressure or steering","Use plain language throughout"],
    persona:"You are David, 52, whose father died yesterday. You're financially stressed and suspicious that funeral homes exploit grief. You push back on pricing. You respond well to transparency and feeling in control. You get irritated when you sense any sales pressure.",
    opening:"Look, I want to be upfront — I've heard funeral homes can take advantage of people when they're grieving. I just want to know exactly what everything costs before we go any further." },
  { id:3, title:"Direct Cremation", subtitle:"Explaining the Process", category:"Arrangement", difficulty:"Beginner",
    description:"Answer questions about direct cremation accurately without steering toward more expensive options.",
    goals:["Explain direct cremation accurately","Mention the alternative container option per FTC rules","Respect the choice without steering"],
    persona:"You are James, 38, designated next of kin for an aunt you barely knew. You want the simplest, least expensive option and feel slightly guilty about your detachment. You relax and open up when the student is non-judgmental and clear.",
    opening:"I was told I should ask about direct cremation. That's basically... you take care of everything and give me the ashes, right? What does that actually involve?" },
  { id:4, title:"Cultural Request", subtitle:"Navigating Uncertainty", category:"Cultural", difficulty:"Intermediate",
    description:"Handle a family request for culturally specific arrangements when the family member doesn't know every detail.",
    goals:["Ask respectful open-ended clarifying questions","Avoid assumptions about tradition or practice","Document specific preferences clearly"],
    persona:"You are Amara, 34. Your grandmother from Ghana has passed. Your family has specific traditions but you're second-generation and don't know every detail. You're anxious. You warm up when the student asks thoughtful questions and avoids assumptions.",
    opening:"My grandmother passed away and we need to do this the proper way — our traditional way. I just... I'm not sure I know every single detail of what that means. I need your help." },
  { id:5, title:"Family Conflict", subtitle:"De-Escalation", category:"Conflict", difficulty:"Advanced",
    description:"Manage active disagreement between family members in the arrangement room.",
    goals:["De-escalate without taking sides","Redirect focus to the deceased's wishes","Stay compliant — no promises you can't keep"],
    persona:"You are Sandra, 55. Your mother just passed. You want a full traditional burial with a viewing. You also speak for your brother Kevin who wants cremation to save money. You're emotional and feel he's being disrespectful. You calm down when the student redirects to Mom's wishes rather than the argument.",
    opening:"I need to tell you upfront — my brother and I don't agree on anything right now. I want a proper burial with a viewing. He wants to just cremate her. I don't know how we're going to get through this." },
  { id:6, title:"Death Certificate Intake", subtitle:"Staying in Your Lane", category:"Legal", difficulty:"Intermediate",
    description:"Collect demographic information for a death certificate while explaining which fields belong to the medical certifier.",
    goals:["Collect demographic data accurately","Explain the medical certifier's role clearly","Never speculate on cause of death"],
    persona:"You are Robert, 60. Your wife of 35 years died yesterday. You're in shock and confused about paperwork. You keep trying to get the student to confirm what happened medically. You calm down when the student acknowledges your grief and explains gently.",
    opening:"They gave me this form to bring in. I don't understand any of it. Can you just... tell me what happened? The doctor wasn't very clear about why she died. Was it her heart?" },
  { id:7, title:"First Call", subtitle:"Removal Authorization", category:"First Call", difficulty:"Beginner",
    description:"Handle the initial phone call from a family, collect necessary information, and explain what happens next.",
    goals:["Express sincere condolences","Collect name, location, and authorization info","Explain the next steps clearly"],
    persona:"You are Linda, 50. Your father just passed at home an hour ago. You're in shock and your voice is shaky. You feel calmer and more in control when the student is patient, warm, and gives clear guidance.",
    opening:"Hello? I... I think I need to call you. My father just passed away at home about an hour ago. I didn't know who to call first. Is this right?" },
  { id:8, title:"Aftercare", subtitle:"What Happens Next", category:"Aftercare", difficulty:"Beginner",
    description:"Walk a family through post-service next steps. Know your lane — refer out for legal, financial, and estate matters.",
    goals:["Provide a clear aftercare checklist","Be honest about the funeral home's scope","Offer referrals without giving legal or financial advice"],
    persona:"You are Patricia, 62. Your husband's service just ended. You feel completely lost — there's so much paperwork. You feel relieved when the student gives you structure, clarity, and knows when to refer you to others.",
    opening:"The service was beautiful, truly. Thank you. But now I'm just standing here and I don't know what I'm supposed to do. There's so much. Where do I even start?" },
];

// ── Flashcards ────────────────────────────────────────────────
const FLASHCARDS = [
  {id:1,category:"FTC & Legal",term:"General Price List (GPL)",definition:"A written price list the funeral home must give to anyone who inquires in person about funeral goods or services. Required by the FTC Funeral Rule. Must be offered at the start of any in-person discussion.",nbe:true},
  {id:2,category:"FTC & Legal",term:"FTC Funeral Rule",definition:"Federal Trade Commission regulation (effective 1984) requiring funeral providers to give itemized pricing, make specific disclosures, and not require package purchases. Consumers have the right to choose only what they want.",nbe:true},
  {id:3,category:"FTC & Legal",term:"Cash Advance Items",definition:"Goods or services the funeral home pays for on behalf of the family (e.g., death certificates, obituary fees, clergy fees). Cannot charge more than actual cost without prior written disclosure.",nbe:true},
  {id:4,category:"FTC & Legal",term:"Alternative Container",definition:"An unfinished wood box or other non-metal receptacle for cremation. Funeral homes must offer this option. They cannot require purchase of a casket for direct cremation.",nbe:true},
  {id:5,category:"FTC & Legal",term:"Direct Cremation",definition:"Disposition by cremation without formal viewing, visitation, or ceremony with the body present. Must be listed on the GPL with a complete price.",nbe:true},
  {id:6,category:"FTC & Legal",term:"Immediate Burial",definition:"Disposition by burial without formal viewing or visitation. Must be separately itemized on the GPL.",nbe:true},
  {id:7,category:"FTC & Legal",term:"Outer Burial Container",definition:"A grave liner or vault placed around the casket. NOT required by federal law — though cemeteries may require it. If not legally required, this must be clearly disclosed to the family.",nbe:true},
  {id:8,category:"FTC & Legal",term:"Embalming Disclosure",definition:"Funeral providers cannot represent embalming as legally required when it is not. Must obtain written permission before embalming and disclose that it is not legally required in most circumstances.",nbe:true},
  {id:9,category:"Death Certificates",term:"Funeral Director's Portion",definition:"The funeral director completes: decedent's name, age, DOB, address, SSN, race/ethnicity, education, occupation, veteran status, place of death, and final disposition information.",nbe:true},
  {id:10,category:"Death Certificates",term:"Medical Certifier's Portion",definition:"Physician, coroner, or medical examiner completes: cause of death, manner of death, and injury information. The funeral director must NEVER speculate on or attempt to complete these fields.",nbe:true},
  {id:11,category:"Death Certificates",term:"Authorization for Disposition",definition:"Legal document authorizing the funeral home to proceed with burial, cremation, or other final disposition. Must be obtained from the legally authorized next of kin before any disposition.",nbe:true},
  {id:12,category:"Embalming",term:"Rigor Mortis",definition:"Temporary stiffening of muscles after death due to ATP depletion and calcium ion buildup in muscle fibers. Begins 2–6 hours post-death, peaks around 12 hours, resolves within 24–48 hours.",nbe:true},
  {id:13,category:"Embalming",term:"Livor Mortis (Lividity)",definition:"Purplish-red discoloration from blood pooling to dependent areas after circulation stops. Becomes fixed (permanent) at approximately 6–12 hours post-death.",nbe:true},
  {id:14,category:"Embalming",term:"Algor Mortis",definition:"Cooling of the body after death to match ambient temperature. Approximately 1–1.5°F per hour under normal conditions.",nbe:true},
  {id:15,category:"Embalming",term:"Arterial Embalming",definition:"Primary embalming method — embalming fluid injected into the arterial system while blood is drained from the veins. Usually the first step in the embalming process.",nbe:true},
  {id:16,category:"Embalming",term:"Cavity Embalming",definition:"Aspiration of gases and fluids from body cavities (thorax, abdomen) using a trocar, followed by injection of cavity fluid. Performed after arterial embalming.",nbe:true},
  {id:17,category:"Embalming",term:"Formaldehyde",definition:"Primary preservative in embalming fluid — also a fixative and disinfectant. OSHA PEL: 0.75 ppm (8-hr TWA). STEL: 2 ppm. Action Level: 0.5 ppm.",nbe:true},
  {id:18,category:"Embalming",term:"Embalming Index",definition:"The percentage of formaldehyde in an embalming solution. Higher index = stronger preservation and firming. Selection depends on condition of remains and expected viewing timeline.",nbe:true},
  {id:19,category:"Grief & Counseling",term:"Kübler-Ross Five Stages",definition:"Denial → Anger → Bargaining → Depression → Acceptance. Not a linear process — people move between stages non-sequentially and may skip stages.",nbe:true},
  {id:20,category:"Grief & Counseling",term:"Anticipatory Grief",definition:"Grief experienced before an expected loss, such as during a terminal illness diagnosis. Does not replace or eliminate post-death grief.",nbe:true},
  {id:21,category:"Grief & Counseling",term:"Complicated Grief",definition:"Prolonged, intense grief that significantly interferes with daily functioning beyond typical timeframes. Also called 'prolonged grief disorder.' May require professional mental health intervention.",nbe:true},
  {id:22,category:"Grief & Counseling",term:"Active Listening",definition:"Giving full, undivided attention to the speaker. Reflecting back what you heard. Avoiding interruption. A critical skill during arrangement conferences with grieving families.",nbe:true},
  {id:23,category:"History & Profession",term:"NFDA",definition:"National Funeral Directors Association — largest funeral service trade association in the U.S. Provides continuing education, advocacy, ethical guidance, and professional standards.",nbe:false},
  {id:24,category:"History & Profession",term:"ABFSE",definition:"American Board of Funeral Service Education — the recognized accrediting agency for funeral service and mortuary science education programs in the United States.",nbe:false},
  {id:25,category:"History & Profession",term:"Pre-Need vs At-Need",definition:"Pre-need: arrangements made in advance of death (regulated at state level). At-need: arrangements made at time of death. At-need families are in acute grief and need maximum clarity.",nbe:true},
  {id:26,category:"History & Profession",term:"Casket vs. Coffin",definition:"A casket is rectangular, 4-sided, with a split lid. A coffin is 6-sided, tapered at head and foot. In the U.S., 'casket' is the standard professional term.",nbe:false},
  {id:27,category:"Sciences (NBE)",term:"Universal Precautions",definition:"OSHA-mandated approach treating all human blood and body fluids as potentially infectious regardless of diagnosis. Requires gloves, gown, eye protection, and mask for all cases.",nbe:true},
  {id:28,category:"Sciences (NBE)",term:"Putrefaction",definition:"Decomposition caused by microbial action — produces gases (H₂S, methane, ammonia) and liquefaction of tissues. Rate affected by temperature, moisture, and bacterial type.",nbe:true},
  {id:29,category:"Sciences (NBE)",term:"Autolysis",definition:"Self-digestion of cells by their own enzymes after death. Begins immediately at death. Contributes to early decomposition before bacterial putrefaction becomes dominant.",nbe:true},
  {id:30,category:"Sciences (NBE)",term:"Decomposition Stages",definition:"Fresh → Bloat → Active Decay → Advanced Decay → Dry/Skeletal. Driven by autolysis and putrefaction.",nbe:true},
  {id:31,category:"Sciences (NBE)",term:"Pathogenic Microorganisms",definition:"Microorganisms capable of causing disease. Primary concerns: HIV, Hepatitis B & C, tuberculosis, MRSA. Universal precautions required for every case.",nbe:true},
  {id:32,category:"Sciences (NBE)",term:"Formaldehyde Action Level",definition:"OSHA action level for formaldehyde is 0.5 ppm — triggers air monitoring, medical surveillance, and hazard communication requirements. The PEL is 0.75 ppm (8-hour TWA).",nbe:true},
];

// ── Quiz (75 questions) ───────────────────────────────────────
const QUIZ = [
  {id:1,cat:"FTC & Legal",nbe:"Arts",q:"Under the FTC Funeral Rule, when must a funeral provider give a consumer the General Price List?",opts:["Only when the consumer specifically asks for it","At the beginning of any in-person discussion about funeral goods, services, or prices","Only after a contract has been signed","When the family picks up the remains"],correct:1,exp:"The FTC Funeral Rule requires the GPL to be offered at the start of any in-person discussion — not only when the consumer explicitly requests it."},
  {id:2,cat:"FTC & Legal",nbe:"Arts",q:"A family asks if embalming is legally required. The correct response is:",opts:["Yes, it is always required by federal law","It depends only on the family's religious wishes","It is generally not legally required; some states have specific exceptions","It is required whenever a viewing is held"],correct:2,exp:"Embalming is generally not legally required. The FTC Funeral Rule prohibits misrepresenting it as required. A funeral director cannot proceed without written authorization."},
  {id:3,cat:"FTC & Legal",nbe:"Arts",q:"Which of the following is a 'cash advance item' under the FTC Funeral Rule?",opts:["A casket selected from the funeral home's inventory","The funeral director's basic services fee","Death certificate fees paid by the funeral home on the family's behalf","Embalming chemicals used in the preparation room"],correct:2,exp:"Cash advance items are paid by the funeral home on the family's behalf — like death certificate fees. Cannot be marked up without written disclosure."},
  {id:4,cat:"Death Certificates",nbe:"Arts",q:"Which portion of the death certificate does the funeral director complete?",opts:["Cause of death and manner of death","Demographic information: name, address, SSN, occupation","Medical history of the decedent","Contributing conditions to death"],correct:1,exp:"The funeral director completes demographic information only. Cause of death, manner of death, and all medical fields are completed exclusively by the medical certifier."},
  {id:5,cat:"Death Certificates",nbe:"Arts",q:"A family asks you to confirm their father died of a heart attack. What should you do?",opts:["Confirm based on what the hospital told you","Speculate based on his known medical history","Explain that cause of death is determined by the medical certifier and refer them to the physician","Write 'probable cardiac event' as a placeholder"],correct:2,exp:"The funeral director never speculates on, confirms, or completes cause of death. That is exclusively the medical certifier's role."},
  {id:6,cat:"Embalming",nbe:"Arts",q:"Rigor mortis is caused primarily by:",opts:["Bacterial decomposition of muscle tissue","Blood pooling in dependent body areas","ATP depletion preventing muscle relaxation, with calcium ion accumulation","Dehydration of tissues following death"],correct:2,exp:"Rigor mortis occurs when ATP is depleted after death, preventing myosin heads from detaching from actin filaments. Typically begins 2–6 hours post-death."},
  {id:7,cat:"Embalming",nbe:"Arts",q:"What is the primary purpose of cavity embalming?",opts:["To improve skin color and texture for viewing","To aspirate gases and fluids from body cavities and inject cavity fluid","To restore facial features altered by disease","To set the expression prior to viewing"],correct:1,exp:"Cavity embalming uses a trocar to aspirate gases, liquids, and semi-solid matter from thoracic and abdominal cavities, then injects cavity fluid. Always performed after arterial embalming."},
  {id:8,cat:"Sciences (NBE)",nbe:"Sciences",q:"OSHA's permissible exposure limit (PEL) for formaldehyde as an 8-hour time-weighted average is:",opts:["0.1 ppm","0.75 ppm","2.0 ppm","5.0 ppm"],correct:1,exp:"OSHA's PEL for formaldehyde is 0.75 ppm (8-hour TWA). The STEL is 2 ppm. The action level is 0.5 ppm."},
  {id:9,cat:"Grief & Counseling",nbe:"Arts",q:"Anticipatory grief is best described as:",opts:["Grief that lasts longer than expected after a loss","Grief experienced before an anticipated death, such as during terminal illness","Complete denial of grief following sudden death","Grief that intensifies over time rather than resolving"],correct:1,exp:"Anticipatory grief occurs before a death — common in families of terminally ill patients. It does not replace or eliminate post-death grief."},
  {id:10,cat:"Sciences (NBE)",nbe:"Sciences",q:"Livor mortis becomes 'fixed' (permanent) approximately how many hours after death?",opts:["1–2 hours","3–4 hours","6–12 hours","24–48 hours"],correct:2,exp:"Livor mortis becomes fixed at approximately 6–12 hours post-death. Fixed lividity cannot be repositioned — this has both embalming and forensic significance."},
  {id:11,cat:"FTC & Legal",nbe:"Arts",q:"A funeral provider tells a family that purchasing a casket is required for cremation. This is:",opts:["Acceptable if the funeral home's policy requires it","A violation of the FTC Funeral Rule","Legal if state regulations permit it","Only a violation if the family formally complains"],correct:1,exp:"Under the FTC Funeral Rule, providers cannot require purchase of a casket for cremation. They must offer an alternative container option."},
  {id:12,cat:"History & Profession",nbe:"Arts",q:"Which organization accredits funeral service education programs in the United States?",opts:["NFDA","ABFSE","FTC","CDC"],correct:1,exp:"The American Board of Funeral Service Education (ABFSE) is the recognized accrediting agency for funeral service and mortuary science education programs in the U.S."},
  {id:13,cat:"Embalming",nbe:"Arts",q:"Which vessels are most commonly used as the primary injection and drainage sites for arterial embalming?",opts:["Femoral artery and vein","Right common carotid artery (injection) and right internal jugular vein (drainage)","Brachial artery and vein","Aorta and vena cava"],correct:1,exp:"The right common carotid artery and right internal jugular vein are the most common primary injection/drainage sites. The femoral vessels are a widely used secondary site."},
  {id:14,cat:"Sciences (NBE)",nbe:"Sciences",q:"Which is classified as a bloodborne pathogen of primary concern under OSHA's Bloodborne Pathogens Standard?",opts:["Influenza A","Hepatitis B virus (HBV)","MRSA","Clostridium difficile"],correct:1,exp:"OSHA's BBP Standard specifically targets HBV, HCV, and HIV. Universal precautions are required for all cases regardless of known diagnosis."},
  {id:15,cat:"FTC & Legal",nbe:"Arts",q:"Under the FTC Funeral Rule, the one fee a provider may make non-declinable is:",opts:["Embalming","Transportation of remains","Basic services of funeral director and staff","Obituary preparation"],correct:2,exp:"The basic services fee is the only non-declinable charge permitted under the FTC Funeral Rule. All other goods and services must be individually selectable."},
  {id:16,cat:"Death Certificates",nbe:"Arts",q:"Authorization for cremation must be obtained from:",opts:["The attending physician","The legally authorized next of kin in the correct statutory priority order","The medical examiner only","Any adult family member present"],correct:1,exp:"Cremation is irreversible, so authorization must come from the legally authorized next of kin in the order established by state statute."},
  {id:17,cat:"Grief & Counseling",nbe:"Arts",q:"Which behavior best demonstrates active listening during an arrangement conference?",opts:["Taking detailed notes while the family speaks","Preparing your next question while the family talks","Reflecting back what the family said and allowing silence","Moving quickly through topics to avoid prolonged emotion"],correct:2,exp:"Active listening means reflecting back what you heard, making eye contact, and allowing silence. Preparing your next question while the family speaks is a common error."},
  {id:18,cat:"Embalming",nbe:"Arts",q:"A higher embalming index is used when:",opts:["Minimizing formaldehyde exposure is a priority","The family requests a natural appearance","Stronger preservation and firming are needed (e.g., delayed service, decomposition)","Embalming is performed within 12 hours of death"],correct:2,exp:"Higher embalming index = higher formaldehyde concentration = stronger preservation and firming. Used for cases with delayed services, decomposition, edema, or disease."},
  {id:19,cat:"Sciences (NBE)",nbe:"Sciences",q:"Autolysis is distinct from putrefaction in that autolysis:",opts:["Begins several hours after death when bacteria activate","Is caused by the body's own cellular enzymes and begins immediately at death","Occurs only after rigor mortis fully resolves","Is driven by insect activity"],correct:1,exp:"Autolysis (self-digestion) is non-bacterial — it begins immediately at death. Putrefaction is caused by microbial action and typically begins later."},
  {id:20,cat:"FTC & Legal",nbe:"Arts",q:"A consumer calls to ask about prices over the phone. Under the FTC Funeral Rule, you must:",opts:["Invite them in before discussing prices","Provide pricing for any specific goods or services they ask about","Give only the total package price","Provide prices only after they identify themselves"],correct:1,exp:"The FTC Funeral Rule requires funeral providers to answer specific pricing questions over the phone."},
  {id:21,cat:"History & Profession",nbe:"Arts",q:"Pre-need funeral arrangements are primarily regulated by:",opts:["The FTC Funeral Rule","State law","The ABFSE","The CDC"],correct:1,exp:"Pre-need arrangements are regulated at the state level. The FTC Funeral Rule governs at-need (current) arrangements only."},
  {id:22,cat:"Sciences (NBE)",nbe:"Sciences",q:"OSHA's Short Term Exposure Limit (STEL) for formaldehyde is:",opts:["0.5 ppm","0.75 ppm","2.0 ppm","5.0 ppm"],correct:2,exp:"OSHA's STEL for formaldehyde is 2.0 ppm — the maximum allowed for a 15-minute short-term exposure. The 8-hour TWA PEL is 0.75 ppm."},
  {id:23,cat:"Grief & Counseling",nbe:"Arts",q:"Complicated grief (prolonged grief disorder) is best characterized by:",opts:["Grief that resolves within two weeks","Normal grief that simply takes longer than average","Prolonged, intense grief that significantly impairs daily functioning","Grief that involves only physical symptoms"],correct:2,exp:"Complicated grief involves grief that remains intense well beyond typical timeframes and significantly impairs daily functioning."},
  {id:24,cat:"Embalming",nbe:"Arts",q:"Fixed livor mortis has forensic significance primarily because:",opts:["It reveals the precise cause of death","Fixed lividity inconsistent with body position suggests the body was moved after death","It determines exact time of death","It indicates the presence of infectious disease"],correct:1,exp:"Lividity becomes fixed at approximately 6–12 hours post-death. If fixed lividity is inconsistent with the body's final position, it suggests the body was repositioned after fixation."},
  {id:25,cat:"Sciences (NBE)",nbe:"Sciences",q:"The Bloat stage of decomposition is primarily driven by:",opts:["Insect activity consuming soft tissue","Autolysis of skin cells","Gas accumulation from microbial fermentation in the GI tract and body cavities","Dehydration and mummification"],correct:2,exp:"The Bloat stage is characterized by gas accumulation from microbial activity, causing visible distension."},
  {id:26,cat:"FTC & Legal",nbe:"Arts",q:"The FTC Funeral Rule requires a funeral home to disclose that an outer burial container is NOT required by law:",opts:["Only when the family specifically asks","Whenever a burial is being arranged and no cemetery requirement exists","Only in states that do not require outer burial containers","Only for cremation cases"],correct:1,exp:"The FTC Funeral Rule requires funeral providers to disclose when an outer burial container is not required by law. Cemeteries may require them, but federal law does not."},
  {id:27,cat:"FTC & Legal",nbe:"Arts",q:"If a family brings a casket purchased elsewhere, the funeral home:",opts:["May refuse to use it","May charge a handling fee but must disclose it on the GPL","Must accept it with no additional charge","May charge any amount they choose for handling"],correct:1,exp:"Funeral homes may charge a casket handling fee for third-party caskets, but this fee must be disclosed on the General Price List. They cannot refuse an acceptable third-party casket or impose undisclosed fees."},
  {id:28,cat:"FTC & Legal",nbe:"Arts",q:"'Combination packages' (pre-selected bundles of goods and services) under the FTC Funeral Rule:",opts:["Are prohibited entirely","Are permitted if they are priced lower than buying items individually","Are permitted but individual itemized prices must also be available","Are permitted and itemized prices need not be disclosed"],correct:2,exp:"The FTC Funeral Rule permits package pricing, but providers must also make individual itemized prices available. Packages cannot be the only option."},
  {id:29,cat:"FTC & Legal",nbe:"Arts",q:"A consumer visits the funeral home without specifically asking for the GPL. The funeral director should:",opts:["Wait until the consumer asks for it","Offer it at the start of any in-person discussion about funeral arrangements, services, or prices","Give it only after a contract is signed","Mail it to them after the meeting"],correct:1,exp:"The GPL must be offered proactively at the beginning of any in-person discussion. The consumer does not need to ask for it."},
  {id:30,cat:"FTC & Legal",nbe:"Arts",q:"A funeral home that sells caskets must provide:",opts:["A verbal price quote only","A written Casket Price List before or at the time caskets are shown","Prices only upon written request","A package price that includes the casket"],correct:1,exp:"The FTC Funeral Rule requires a separate written Casket Price List that must be made available before or at the time caskets are shown."},
  {id:31,cat:"FTC & Legal",nbe:"Arts",q:"The FTC Funeral Rule became effective in:",opts:["1964","1977","1984","1990"],correct:2,exp:"The FTC Funeral Rule became effective in 1984, following FTC investigations in the 1970s that revealed widespread deceptive practices."},
  {id:32,cat:"FTC & Legal",nbe:"Arts",q:"Funeral providers must give consumers an itemized written statement of goods and services selected:",opts:["At the time of arrangement","Before any contract is signed","At the conclusion of the arrangement conference","Before the body is released"],correct:2,exp:"Funeral providers must give an itemized written statement at the end of the arrangement conference, before the consumer is obligated to pay."},
  {id:33,cat:"FTC & Legal",nbe:"Arts",q:"'Immediate burial' under the FTC Funeral Rule is defined as:",opts:["Burial within 24 hours of death","Disposition by burial without formal viewing, visitation, or funeral ceremony","Burial before the death certificate is filed","Burial that occurs at the graveside only"],correct:1,exp:"Immediate burial is disposition by burial without any formal viewing, visitation, or funeral ceremony. It must be separately itemized on the GPL."},
  {id:34,cat:"FTC & Legal",nbe:"Arts",q:"Which businesses must comply with the FTC Funeral Rule?",opts:["Cemeteries only","Funeral homes only","Funeral providers who sell funeral goods or services to the public","Only licensed funeral directors"],correct:2,exp:"The FTC Funeral Rule applies to 'funeral providers' — any person, partnership, or corporation that sells both funeral goods and funeral services to the public."},
  {id:35,cat:"FTC & Legal",nbe:"Arts",q:"A family calls and says they want 'just the basics.' Your best response is:",opts:["Describe a standard package","Offer to send pricing information","Invite them in and walk through the GPL itemized options so they can choose only what they need","Recommend the least expensive pre-selected package"],correct:2,exp:"The FTC Funeral Rule exists so consumers can select only the services they want. Walking them through the GPL empowers informed decision-making rather than defaulting to packages."},
  {id:36,cat:"Embalming",nbe:"Arts",q:"The primary purpose of a pre-injection fluid is to:",opts:["Preserve and firm tissue before arterial embalming","Cleanse the vascular system and condition tissue to accept arterial fluid","Provide cosmetic color enhancement","Sanitize instruments before use"],correct:1,exp:"Pre-injection fluids cleanse, condition, and prime the vascular system before the main arterial solution is injected, helping remove blood and improve distribution."},
  {id:37,cat:"Embalming",nbe:"Arts",q:"A co-injection fluid is typically used to:",opts:["Replace the primary arterial fluid","Supplement the primary arterial fluid to enhance distribution and tissue conditioning","Clean instruments after embalming","Treat body surface discolorations"],correct:1,exp:"Co-injection fluids are injected simultaneously with the primary arterial embalming solution to enhance tissue penetration and conditioning. They complement rather than replace the arterial solution."},
  {id:38,cat:"Embalming",nbe:"Arts",q:"When embalming a jaundiced body, the embalmer should be aware that:",opts:["Higher index fluid always corrects jaundice discoloration","Jaundice indicates liver failure which may complicate fluid distribution and tissue preservation","Embalming is contraindicated in jaundiced cases","Only cavity embalming is required"],correct:1,exp:"Jaundice (elevated bilirubin) can interfere with embalming fluid distribution due to vascular damage. Special considerations include fluid selection, concentration, and potential for poor preservation."},
  {id:39,cat:"Embalming",nbe:"Arts",q:"Restricted cervical injection is indicated when:",opts:["The body shows signs of decomposition","Edema or trauma makes access to neck vessels difficult","The family requests a more natural appearance","The carotid artery is inaccessible due to surgical intervention or disease"],correct:3,exp:"Restricted cervical injection is used when the neck vessels are inaccessible due to surgery, disease, or trauma. Alternative injection sites (femoral, axillary) are used instead."},
  {id:40,cat:"Embalming",nbe:"Arts",q:"In arterial embalming, the rate of flow refers to:",opts:["The concentration of formaldehyde in the solution","The speed at which embalming fluid is injected into the vascular system","The number of injection points used","The volume of fluid injected per case"],correct:1,exp:"Rate of flow is the speed (volume per unit time) at which embalming fluid moves through the vascular system. Controlling rate of flow and pressure is critical for effective distribution."},
  {id:41,cat:"Embalming",nbe:"Arts",q:"Setting the mouth before embalming primarily serves to:",opts:["Sanitize the oral cavity","Create a natural, restful facial expression for viewing","Prevent rigor mortis from affecting the jaw","Allow cavity embalming to proceed"],correct:1,exp:"Setting the mouth involves wiring or using a mouth former to achieve a natural, closed expression before embalming fluid firming fixes the features."},
  {id:42,cat:"Embalming",nbe:"Arts",q:"Eye closure during embalming is accomplished using:",opts:["Adhesive tape only","Eyecaps placed under the eyelids to maintain natural contour and keep eyes closed","Sutures through the eyelids","Wax applied over the eyelids"],correct:1,exp:"Eyecaps are placed under the eyelids to maintain natural eye contour and hold the eyelids closed. They prevent the sunken appearance that can occur without support."},
  {id:43,cat:"Embalming",nbe:"Arts",q:"Surface embalming techniques are used primarily for:",opts:["Bodies that cannot be arterially embalmed","Treating surface discolorations, abrasions, and decomposition on accessible skin areas","Replacing arterial embalming in decomposed cases","Disinfecting the preparation room"],correct:1,exp:"Surface embalming involves applying embalming chemicals directly to skin surfaces. It treats surface discolorations, abrasions, trauma, and decomposition without accessing the vascular system."},
  {id:44,cat:"Embalming",nbe:"Arts",q:"Hypodermic injection in embalming is used to:",opts:["Inject arterial fluid at higher pressure","Treat areas difficult to reach by arterial distribution by injecting chemicals directly into tissue","Replace cavity embalming","Distribute fluid to the lower extremities"],correct:1,exp:"Hypodermic injection delivers embalming chemicals directly into subcutaneous tissue. It treats areas inadequately reached by arterial distribution — such as fingers, toes, and face."},
  {id:45,cat:"Embalming",nbe:"Arts",q:"Formaldehyde in embalming fluid acts primarily as a:",opts:["Solvent only","Germicide only","Fixative and preservative — cross-linking proteins to resist decomposition","Colorant to improve skin appearance"],correct:2,exp:"Formaldehyde cross-links amino groups in proteins, forming permanent bonds that resist decomposition. It is also a germicide. This protein fixation gives embalmed tissue its firm, preserved quality."},
  {id:46,cat:"Sciences (NBE)",nbe:"Sciences",q:"Of the bloodborne pathogens, which is most resistant to drying and can survive on environmental surfaces for days?",opts:["HIV","Hepatitis C (HCV)","Hepatitis B (HBV)","MRSA"],correct:2,exp:"HBV can survive on surfaces for up to 7 days at room temperature. HIV is far less durable outside the body. This makes HBV a particular environmental contamination risk in the preparation room."},
  {id:47,cat:"Sciences (NBE)",nbe:"Sciences",q:"OSHA's Bloodborne Pathogens Standard requires, at minimum, which PPE when preparing a body?",opts:["Gloves only","Gloves, gown, and eye protection","Gloves and face shield only","Full hazmat suit"],correct:1,exp:"OSHA's BBP Standard requires gloves, protective clothing (gown/apron), and eye/face protection when exposure to blood or OPIM is anticipated — as in all embalming procedures."},
  {id:48,cat:"Sciences (NBE)",nbe:"Sciences",q:"Which environmental factor most significantly accelerates decomposition?",opts:["Low humidity","High temperature","Low temperature","Presence of clothing"],correct:1,exp:"Temperature is the most significant factor — higher temperatures dramatically accelerate microbial activity and enzymatic decomposition. Refrigeration significantly slows decomposition."},
  {id:49,cat:"Sciences (NBE)",nbe:"Sciences",q:"OSHA requires that contaminated sharps be disposed of in:",opts:["Regular trash after recapping","Puncture-resistant, leak-proof, labeled sharps containers","Any sealed container","A regular biohazard trash bag"],correct:1,exp:"OSHA's Bloodborne Pathogens Standard requires immediate disposal of contaminated sharps in puncture-resistant, leak-proof, properly labeled sharps containers. Recapping by hand is prohibited."},
  {id:50,cat:"Sciences (NBE)",nbe:"Sciences",q:"Saponification (adipocere formation) is characterized by:",opts:["Rapid desiccation and mummification of tissue","Conversion of body fat to a waxy, soap-like substance in moist conditions","Acceleration of putrefaction in warm climates","Crystallization of tissue proteins"],correct:1,exp:"Saponification occurs when body fat hydrolyzes in moist, anaerobic conditions, creating a waxy substance. The resulting adipocere can preserve body shape for extended periods and has forensic significance."},
  {id:51,cat:"Sciences (NBE)",nbe:"Sciences",q:"Mummification as a form of preservation occurs when:",opts:["A body is buried in waterlogged soil","A body decomposes in a warm, dry environment with good air circulation causing rapid desiccation","A body is embalmed with high-index fluid","A body is frozen immediately after death"],correct:1,exp:"Mummification occurs through rapid desiccation in warm, dry, well-ventilated environments. Removal of moisture inhibits microbial activity."},
  {id:52,cat:"Sciences (NBE)",nbe:"Sciences",q:"Which route of formaldehyde exposure is considered the primary occupational concern for embalmers?",opts:["Skin absorption","Ingestion","Inhalation of vapors","Eye contact alone"],correct:2,exp:"Inhalation of formaldehyde vapors is the primary occupational concern. OSHA's PEL, STEL, and action level all relate to airborne concentration. Engineering controls (exhaust ventilation) are the primary protective measure."},
  {id:53,cat:"Sciences (NBE)",nbe:"Sciences",q:"A disinfectant classified as a 'tuberculocide' is effective against:",opts:["HIV only","Spore-forming bacteria only","Mycobacterium tuberculosis — indicating broad-spectrum antimicrobial activity","Hepatitis B virus only"],correct:2,exp:"Tuberculocidal disinfectants are effective against Mycobacterium tuberculosis, one of the most resistant non-spore-forming bacteria. This indicates a high level of germicidal activity — a common standard for preparation room disinfectants."},
  {id:54,cat:"Sciences (NBE)",nbe:"Sciences",q:"In the context of infection control, 'standard precautions' treat:",opts:["Only cases with known infectious disease diagnoses","All blood and body fluids from all patients as potentially infectious, regardless of diagnosis","Only blood — not other body fluids","Only cases involving HIV and hepatitis"],correct:1,exp:"Standard precautions require treating all blood, body fluids, secretions, and excretions as potentially infectious regardless of diagnosis."},
  {id:55,cat:"Grief & Counseling",nbe:"Arts",q:"Worden's first task of mourning is:",opts:["To adjust to a world without the deceased","To emotionally relocate the deceased and move on","To accept the reality of the loss","To work through the pain of grief"],correct:2,exp:"Worden's Task 1 is to accept the reality of the loss — moving from intellectual acknowledgment to full emotional acceptance that the death has occurred and the person will not return."},
  {id:56,cat:"Grief & Counseling",nbe:"Arts",q:"The Dual Process Model of grief suggests that bereaved individuals:",opts:["Move linearly through defined stages","Oscillate between loss-oriented coping and restoration-oriented coping","Experience grief only when thinking about the deceased","Must complete all stages before resuming normal functioning"],correct:1,exp:"Stroebe and Schut's Dual Process Model proposes that healthy grieving involves oscillating between loss-orientation (confronting grief) and restoration-orientation (rebuilding life)."},
  {id:57,cat:"Grief & Counseling",nbe:"Arts",q:"Disenfranchised grief refers to grief that:",opts:["Occurs before the death (anticipatory)","Is not acknowledged or socially recognized — the griever cannot openly mourn","Is experienced by children who don't understand death","Intensifies over time rather than resolving"],correct:1,exp:"Disenfranchised grief occurs when a loss is not recognized, validated, or supported by social norms — such as grief for an ex-spouse, a pet, or a stigmatized death."},
  {id:58,cat:"Grief & Counseling",nbe:"Arts",q:"'Secondary losses' in grief refer to:",opts:["The death of a second family member shortly after the first","Additional losses that result from the primary death — such as loss of income, identity, or companionship","Grief experienced by extended family members","Losses experienced months after the initial death"],correct:1,exp:"Secondary losses are the cascading losses that follow a death — financial security, social roles, identity, companionship, home. Recognizing them helps families understand why grief can feel overwhelming."},
  {id:59,cat:"Grief & Counseling",nbe:"Arts",q:"When helping families with children, funeral directors should know that children under age 5–7 typically:",opts:["Fully understand death as permanent and universal","Experience grief the same way as adults","Lack a full concept of death's permanence and may expect the deceased to return","Are not affected by death and should not attend services"],correct:2,exp:"Children under approximately age 5–7 typically lack a full understanding of death as permanent, universal, and inevitable. Age-appropriate, honest explanations and inclusion in rituals are generally recommended."},
  {id:60,cat:"Grief & Counseling",nbe:"Arts",q:"A memorial service differs from a funeral service in that:",opts:["A memorial service always involves cremation","A memorial service is held without the body present","A memorial service must be held in a church","A memorial service cannot include eulogies"],correct:1,exp:"A memorial service is conducted without the body present. A funeral service has the body present. Memorial services may be held days, weeks, or months after death."},
  {id:61,cat:"Grief & Counseling",nbe:"Arts",q:"Funeral home aftercare programs primarily serve to:",opts:["Generate additional revenue","Provide ongoing grief support and resources to families after services are complete","Comply with FTC requirements","Address legal matters related to the estate"],correct:1,exp:"Aftercare programs provide follow-up grief support — mailings, support groups, anniversary calls, resource referrals. They reflect the profession's commitment to care beyond the immediate service."},
  {id:62,cat:"Death Certificates",nbe:"Arts",q:"The 'manner of death' on a death certificate is classified as:",opts:["Natural, accidental, suicide, homicide, undetermined, or pending","Living, deceased, or unknown","Sudden, expected, or traumatic","Medical, surgical, or environmental"],correct:0,exp:"Manner of death is classified as: Natural, Accident, Suicide, Homicide, Undetermined, or Pending investigation. This is distinct from cause of death (the specific disease or injury)."},
  {id:63,cat:"Death Certificates",nbe:"Arts",q:"Most states require death certificates to be filed within:",opts:["24 hours of death","72 hours of death","3–5 business days of death","30 days of death"],correct:2,exp:"While requirements vary by state, most require death certificates within 3–5 business days of death or before final disposition. The funeral director is typically responsible for timely filing."},
  {id:64,cat:"Death Certificates",nbe:"Arts",q:"The primary difference between a coroner and a medical examiner is:",opts:["A coroner only works on homicide cases","A coroner is typically an elected official who may not be a physician; a medical examiner is a physician appointed to the position","A coroner works for the state while a medical examiner works for the county","A medical examiner can only certify natural deaths"],correct:1,exp:"Coroners are often elected officials who may not be physicians. Medical examiners are physician appointments (often forensic pathologists) who investigate and certify deaths. Requirements vary by jurisdiction."},
  {id:65,cat:"Death Certificates",nbe:"Arts",q:"'Cause of death' on a death certificate refers to:",opts:["The manner in which death occurred (accident, homicide, etc.)","The disease, injury, or condition that directly caused the death","The time elapsed between injury and death","The location where death occurred"],correct:1,exp:"Cause of death is the specific disease, injury, or condition that led directly to death. It is distinct from manner of death (how the death occurred in a legal sense). Both are completed by the medical certifier."},
  {id:66,cat:"History & Profession",nbe:"Arts",q:"The practice of embalming became widespread in the United States primarily due to:",opts:["Ancient Egyptian influence on American culture","The Civil War — the need to return soldiers' bodies home for burial","A federal mandate in 1880","The influence of immigrant European embalmers"],correct:1,exp:"The Civil War drove the widespread adoption of embalming in the U.S. The need to preserve and transport soldiers' remains long distances created demand for arterial embalming. Dr. Thomas Holmes embalmed thousands of soldiers."},
  {id:67,cat:"History & Profession",nbe:"Arts",q:"Jessica Mitford's 'The American Way of Death' (1963) is significant because:",opts:["It established the first state funeral licensing laws","It exposed alleged deceptive practices in the funeral industry and influenced development of the FTC Funeral Rule","It introduced modern embalming techniques","It created the NFDA's code of ethics"],correct:1,exp:"Mitford's 1963 exposé criticized the funeral industry for exploiting grieving families. It sparked public debate that ultimately contributed to the FTC Funeral Rule of 1984."},
  {id:68,cat:"History & Profession",nbe:"Arts",q:"Green (natural) burial is characterized by:",opts:["Burial in a biodegradable container without embalming, allowing natural decomposition","Burial with rapidly-biodegrading embalming fluid","Cremation with ashes scattered in nature","Burial in a cemetery with native plants only"],correct:0,exp:"Green burial focuses on minimal environmental impact: no embalming (or only with non-toxic preservatives), biodegradable containers, and burial that allows natural decomposition and returns the body to the earth."},
  {id:69,cat:"History & Profession",nbe:"Arts",q:"Funeral service licensure in the United States is primarily regulated by:",opts:["The federal government through the FTC","Individual state licensing boards","The NFDA","The ABFSE"],correct:1,exp:"Funeral service licensure is regulated at the state level — each state has its own licensing board, requirements, and disciplinary processes. There is no federal funeral director license."},
  {id:70,cat:"History & Profession",nbe:"Arts",q:"The NBE (National Board Examination) is administered by:",opts:["The NFDA","The ABFSE","The FTC","The International Conference of Funeral Service Examining Boards (ICFSEB)"],correct:3,exp:"The NBE is administered by the International Conference of Funeral Service Examining Boards (ICFSEB). It is not the ABFSE (which accredits schools) or the NFDA (trade association). Most states accept NBE scores for licensure."},
  {id:71,cat:"FTC & Legal",nbe:"Arts",q:"The Social Security Administration should be notified of a death:",opts:["Only if the deceased received Social Security benefits","Only if the deceased had dependent survivors","As a standard step — SSA uses death records to prevent fraud","Only if requested by the family"],correct:2,exp:"SSA must be notified of all deaths to remove the deceased from benefit rolls and prevent fraud. The funeral home typically transmits this information through the state vital records system."},
  {id:72,cat:"Embalming",nbe:"Arts",q:"The first procedural step after selecting the injection site is typically:",opts:["Beginning drainage immediately","Raising the vessels and positioning injection instruments","Mixing embalming chemicals","Massaging the body to soften rigor mortis"],correct:1,exp:"After selecting the injection site, the embalmer raises (incises to expose) the vessels, then positions the arterial tube for injection and the drain tube in the vein for drainage."},
  {id:73,cat:"Sciences (NBE)",nbe:"Sciences",q:"The 'fresh' stage of decomposition begins:",opts:["When visible bloating appears","Immediately at the moment of death, with onset of autolysis","After insects colonize the body","When ambient temperature exceeds 70°F"],correct:1,exp:"The Fresh stage begins immediately at death with cessation of circulation and onset of autolysis. The body does not yet show visible decomposition. Primary changes are cellular."},
  {id:74,cat:"Grief & Counseling",nbe:"Arts",q:"A key difference between normal grief and clinical depression is:",opts:["Normal grief never involves sadness","In normal grief, capacity for pleasure returns and self-esteem is generally preserved","Normal grief resolves in exactly 12 months","Clinical depression cannot occur in bereaved individuals"],correct:1,exp:"While grief and depression share symptoms, normal grievers typically retain capacity for pleasure and preserve self-esteem. In clinical depression, these are persistently impaired. Both can coexist."},
  {id:75,cat:"FTC & Legal",nbe:"Arts",q:"Under the FTC Funeral Rule, a funeral provider may NOT:",opts:["Charge a fee for basic services","Offer combination packages","Represent embalming as legally required when it is not","List prices for outer burial containers"],correct:2,exp:"The FTC Funeral Rule explicitly prohibits misrepresenting embalming as legally required. A provider also cannot embalm without written authorization from the next of kin."},
];

// ── App ───────────────────────────────────────────────────────
export default function App() {
  // ── Profile state ──
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [pid, setPid] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [newName, setNewName] = useState<string | null>(null);

  // ── App state ──
  const [tab, setTab] = useState('home');
  const [sv, setSv] = useState('library');
  const [sel, setSel] = useState<typeof SCENARIOS[0] | null>(null);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [inp, setInp] = useState('');
  const [chatL, setChatL] = useState(false);
  const [debL, setDebL] = useState(false);
  const [deb, setDeb] = useState<{empathy:number;clarity:number;compliance:number;strengths:string[];improvements:string[];suggestion:string} | null>(null);
  const [sm, setSm] = useState('menu');
  const [sc, setSc] = useState('All');
  const [ci, setCi] = useState(0);
  const [fl, setFl] = useState(false);
  const [ans, setAns] = useState<Record<number, number>>({});
  const [qSub, setQSub] = useState(false);
  const [qf, setQf] = useState('All');
  const chatEnd = useRef<HTMLDivElement>(null);
  const askEnd = useRef<HTMLDivElement>(null);

  // ── Per-profile progress ──
  const [done, setDone] = useState<number[]>([]);
  const [qHist, setQHist] = useState<QuizResult[]>([]);
  const [scores, setScores] = useState<Record<number, ScScore[]>>({});
  const [askM, setAskM] = useState<Msg[]>([]);
  const [askI, setAskI] = useState('');
  const [askL, setAskL] = useState(false);

  // ── Load profiles on mount ──
  useEffect(() => {
    const p = localStorage.getItem('fst_profiles');
    const active = localStorage.getItem('fst_pid');
    if (p) {
      const parsed = JSON.parse(p) as Profile[];
      setProfiles(parsed);
      if (active && parsed.find(pr => pr.id === active)) setPid(active);
    }
    setLoaded(true);
  }, []);

  // ── Load per-profile data when pid changes ──
  useEffect(() => {
    if (!pid) return;
    const d = localStorage.getItem(`fst_done_${pid}`);
    const q = localStorage.getItem(`fst_qhist_${pid}`);
    const s = localStorage.getItem(`fst_scores_${pid}`);
    setDone(d ? JSON.parse(d) : []);
    setQHist(q ? JSON.parse(q) : []);
    setScores(s ? JSON.parse(s) : {});
    setAskM([]);
  }, [pid]);

  // ── Persist ──
  useEffect(() => { localStorage.setItem('fst_profiles', JSON.stringify(profiles)); }, [profiles]);
  useEffect(() => { if (pid) localStorage.setItem('fst_pid', pid); }, [pid]);
  useEffect(() => { if (pid) localStorage.setItem(`fst_done_${pid}`, JSON.stringify(done)); }, [done, pid]);
  useEffect(() => { if (pid) localStorage.setItem(`fst_qhist_${pid}`, JSON.stringify(qHist)); }, [qHist, pid]);
  useEffect(() => { if (pid) localStorage.setItem(`fst_scores_${pid}`, JSON.stringify(scores)); }, [scores, pid]);

  // ── Auto-scroll ──
  useEffect(() => { chatEnd.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs, chatL]);
  useEffect(() => { askEnd.current?.scrollIntoView({ behavior: 'smooth' }); }, [askM, askL]);

  // ── Profile actions ──
  const createProfile = (name: string) => {
    const id = `p_${Date.now()}`;
    const p = { id, name };
    setProfiles(prev => [...prev, p]);
    setPid(id);
    setNewName(null);
  };

  // ── API helpers ──
  const callAPI = async (system: string | null, messages: Msg[]) => {
    const r = await fetch('/api/claude', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ system, messages }),
    });
    const d = await r.json();
    if (d.error) throw new Error(d.error);
    return d.text as string;
  };

  const callAPIStream = async (system: string | null, messages: Msg[], onChunk: (c: string) => void) => {
    const r = await fetch('/api/claude', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ system, messages, stream: true }),
    });
    if (!r.ok || !r.body) throw new Error('Stream failed');
    const reader = r.body.getReader();
    const decoder = new TextDecoder();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      onChunk(decoder.decode(value));
    }
  };

  // ── Scenario handlers ──
  const startScen = (s: typeof SCENARIOS[0]) => {
    setSel(s); setMsgs([{ role: 'assistant', content: s.opening }]);
    setDeb(null); setSv('prebrief');
  };

  const send = async () => {
    if (!inp.trim() || chatL || !sel) return;
    const updated = [...msgs, { role: 'user', content: inp }];
    setMsgs([...updated, { role: 'assistant', content: '' }]);
    setInp(''); setChatL(true);
    try {
      const sys = `You are a grieving family member in a funeral service training simulation.
Persona: ${sel.persona}
Goals the student should achieve: ${sel.goals.join('; ')}
Stay in character at all times. React realistically — warmly to empathetic/clear/compliant responses; confused or distressed to poor ones. Keep responses natural (2–4 sentences max). If the student violates the FTC Funeral Rule or professional ethics, react as a real family member would. Never break character or give hints.`;
      await callAPIStream(sys, updated, (chunk) => {
        setMsgs(p => { const n = [...p]; n[n.length - 1] = { role: 'assistant', content: n[n.length - 1].content + chunk }; return n; });
      });
    } catch {
      setMsgs(p => { const n = [...p]; n[n.length - 1] = { role: 'assistant', content: '[Connection issue — please try again]' }; return n; });
    }
    setChatL(false);
  };

  const endScen = async () => {
    if (!sel) return;
    setSv('debrief'); setDebL(true);
    if (!msgs.filter(m => m.role === 'user').length) {
      setDeb({ empathy: 0, clarity: 0, compliance: 0, strengths: [], improvements: ["No responses were recorded."], suggestion: "" });
      setDebL(false); return;
    }
    try {
      const t = msgs.map(m => `${m.role === 'user' ? 'STUDENT' : 'FAMILY'}: ${m.content}`).join('\n');
      const raw = await callAPI(null, [{ role: 'user', content: `You are an expert funeral service educator evaluating a student role-play.
Scenario: ${sel.title}. Goals: ${sel.goals.join('; ')}
Transcript:\n${t}
Score 1–5 each: Empathy, Clarity, Compliance.
Respond ONLY in this exact JSON with no extra text:
{"empathy":N,"clarity":N,"compliance":N,"strengths":["specific thing done well","another"],"improvements":["specific thing to improve","another"],"suggestion":"One example of better phrasing they could have used, in quotes"}` }]);
      const parsed = JSON.parse(raw.replace(/```json|```/g, '').trim());
      setDeb(parsed);
      if (!done.includes(sel.id)) setDone(p => [...p, sel.id]);
      const entry: ScScore = {
        e: parsed.empathy, c: parsed.clarity, co: parsed.compliance,
        avg: Math.round((parsed.empathy + parsed.clarity + parsed.compliance) / 3 * 10) / 10,
        date: Date.now(),
      };
      setScores(prev => ({ ...prev, [sel.id]: [...(prev[sel.id] ?? []), entry] }));
    } catch {
      setDeb({ empathy: 3, clarity: 3, compliance: 3, strengths: ["Engaged with the scenario"], improvements: ["Try again for detailed feedback"], suggestion: "" });
    }
    setDebL(false);
  };

  const sendAsk = async () => {
    if (!askI.trim() || askL) return;
    const updated = [...askM, { role: 'user', content: askI }];
    setAskM([...updated, { role: 'assistant', content: '' }]);
    setAskI(''); setAskL(true);
    try {
      const sys = `You are Professor Chen, an expert funeral service educator and licensed funeral director with 25 years of experience. You teach intro-to-funeral-services courses and NBE prep.
Answer student questions clearly and concisely (3–6 sentences). Topics: FTC Funeral Rule, death certificates, embalming, grief counseling, OSHA safety, professional ethics, history of funeral service, NBE Arts and Sciences.
Be warm and encouraging. Always note this is educational only — not legal, medical, or therapeutic advice.`;
      await callAPIStream(sys, updated, (chunk) => {
        setAskM(p => { const n = [...p]; n[n.length - 1] = { role: 'assistant', content: n[n.length - 1].content + chunk }; return n; });
      });
    } catch {
      setAskM(p => { const n = [...p]; n[n.length - 1] = { role: 'assistant', content: 'Connection issue — please try again.' }; return n; });
    }
    setAskL(false);
  };

  // ── Quiz helpers ──
  const filtCards = sc === 'All' ? FLASHCARDS : FLASHCARDS.filter(c => c.category === sc);
  const filtQs = qf === 'All' ? QUIZ : QUIZ.filter(q => q.cat === qf || q.nbe === qf);
  const submitQuiz = () => {
    setQSub(true);
    const s = filtQs.filter(q => ans[q.id] === q.correct).length;
    setQHist(p => [...p, { score: s, total: filtQs.length, filter: qf, pct: Math.round(s / filtQs.length * 100) }]);
  };
  const resetQuiz = () => { setAns({}); setQSub(false); };
  const cats = ['All', ...new Set(FLASHCARDS.map(c => c.category))];

  // ── Styles ──
  const H: React.CSSProperties = { fontFamily: "var(--font-playfair), Georgia, serif", fontWeight: 700, color: C.navy };
  const B: React.CSSProperties = { fontFamily: "var(--font-dm-sans), system-ui, sans-serif" };
  const card: React.CSSProperties = { background: C.white, borderRadius: '16px', border: `1px solid ${C.border}`, padding: '16px' };
  const badge = (text: string, bg: string, border: string): React.CSSProperties => ({ fontSize: '10px', fontWeight: 700, color: text, background: bg, border: `1px solid ${border}`, borderRadius: '20px', padding: '2px 8px', display: 'inline-block' });
  const btn = (p = true): React.CSSProperties => ({ background: p ? C.navy : C.white, color: p ? C.white : C.navy, border: p ? 'none' : `2px solid ${C.navy}`, borderRadius: '12px', padding: '11px 16px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', ...B });
  const goldBtn: React.CSSProperties = { background: `linear-gradient(135deg,${C.gold},${C.goldLight})`, color: C.navy, border: 'none', borderRadius: '12px', padding: '12px 18px', fontSize: '14px', fontWeight: 700, cursor: 'pointer', ...B };
  const TABS = [{ id: 'home', icon: '⌂', label: 'Home' }, { id: 'scenarios', icon: '◎', label: 'Practice' }, { id: 'study', icon: '◈', label: 'Study' }, { id: 'ask', icon: '⊕', label: 'Ask' }, { id: 'progress', icon: '◉', label: 'Progress' }];

  const ap = profiles.find(p => p.id === pid);

  // ── Loading ──
  if (!loaded) return <div style={{ minHeight: '100dvh', background: C.navy }} />;

  // ── Profile Picker ──
  if (!pid) return (
    <div style={{ ...B, minHeight: '100dvh', background: C.navy, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', boxSizing: 'border-box' }}>
      <div style={{ width: '52px', height: '52px', background: 'rgba(201,168,76,0.15)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', marginBottom: '16px' }}>⚘</div>
      <h1 style={{ ...H, fontSize: '22px', color: C.white, margin: '0 0 4px', textAlign: 'center' }}>Funeral Service Trainer</h1>
      <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', margin: '0 0 36px', textAlign: 'center' }}>Practice · Study · NBE Prep</p>
      {profiles.length > 0 && (
        <>
          <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', marginBottom: '12px', letterSpacing: '0.07em', textTransform: 'uppercase' }}>Who&apos;s studying?</p>
          {profiles.map(p => {
            const d = JSON.parse(localStorage.getItem(`fst_done_${p.id}`) ?? '[]') as number[];
            const q = JSON.parse(localStorage.getItem(`fst_qhist_${p.id}`) ?? '[]') as QuizResult[];
            return (
              <button key={p.id} onClick={() => setPid(p.id)} style={{ width: '100%', maxWidth: '320px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '14px', padding: '14px 18px', marginBottom: '10px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', ...B }}>
                <div style={{ textAlign: 'left' }}>
                  <p style={{ fontSize: '15px', fontWeight: 700, color: C.white, margin: '0 0 2px' }}>{p.name}</p>
                  <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', margin: 0 }}>{d.length}/{SCENARIOS.length} scenarios · {q.length} quizzes</p>
                </div>
                <span style={{ fontSize: '18px', color: C.gold }}>→</span>
              </button>
            );
          })}
          <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', width: '100%', maxWidth: '320px', margin: '8px 0 20px' }} />
        </>
      )}
      {newName !== null ? (
        <div style={{ width: '100%', maxWidth: '320px' }}>
          <input autoFocus value={newName} onChange={e => setNewName(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && newName.trim()) createProfile(newName.trim()); }}
            placeholder="Enter your name..." style={{ width: '100%', background: 'rgba(255,255,255,0.1)', border: `1px solid rgba(201,168,76,0.5)`, borderRadius: '12px', padding: '13px 16px', fontSize: '15px', color: C.white, outline: 'none', boxSizing: 'border-box', ...B }} />
          <button onClick={() => { if (newName.trim()) createProfile(newName.trim()); }}
            style={{ ...goldBtn, width: '100%', marginTop: '10px', padding: '13px', fontSize: '15px' }}>
            Start Training →
          </button>
          {profiles.length > 0 && <button onClick={() => setNewName(null)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: '13px', cursor: 'pointer', marginTop: '12px', width: '100%', ...B }}>← Back</button>}
        </div>
      ) : (
        <button onClick={() => setNewName('')} style={{ ...goldBtn, padding: '13px 28px', fontSize: '15px' }}>
          {profiles.length === 0 ? 'Get Started →' : '+ New Student'}
        </button>
      )}
    </div>
  );

  // ── Main App ──
  return (
    <div style={{ ...B, background: C.cream, minHeight: '100dvh', maxWidth: '460px', margin: '0 auto' }}>

      {/* HEADER */}
      <div style={{ background: `linear-gradient(150deg,${C.navy} 0%,${C.navyLight} 100%)`, padding: '16px 20px 14px', color: C.white }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '38px', height: '38px', background: 'rgba(201,168,76,0.15)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>⚘</div>
            <div>
              <h1 style={{ ...H, fontSize: '17px', margin: 0, color: C.white }}>Funeral Service Trainer</h1>
              <p style={{ fontSize: '10px', opacity: 0.5, margin: 0, letterSpacing: '0.05em' }}>Practice · Study · NBE Prep</p>
            </div>
          </div>
          <button onClick={() => setPid(null)} style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', padding: '5px 10px', color: 'rgba(255,255,255,0.7)', fontSize: '11px', cursor: 'pointer', ...B }}>
            {ap?.name ?? '?'} ↓
          </button>
        </div>
      </div>

      <div style={{ paddingBottom: 'calc(72px + env(safe-area-inset-bottom, 0px))' }}>

        {/* HOME */}
        {tab === 'home' && (
          <div style={{ padding: '20px' }}>
            <div style={{ background: `linear-gradient(135deg,${C.gold},${C.goldLight})`, borderRadius: '20px', padding: '22px', marginBottom: '18px' }}>
              <p style={{ ...H, fontSize: '24px', color: C.navy, margin: '0 0 6px' }}>Ready to practice?</p>
              <p style={{ fontSize: '12px', color: C.navy, opacity: 0.7, margin: '0 0 14px' }}>{done.length} of {SCENARIOS.length} scenarios · {qHist.length} quizzes taken</p>
              <button onClick={() => setTab('scenarios')} style={{ ...btn(false), padding: '10px 18px' }}>Start a Scenario →</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '18px' }}>
              {[
                { icon: '◎', title: 'Role-Play', desc: `${SCENARIOS.length} scenarios`, action: () => setTab('scenarios') },
                { icon: '◈', title: 'Flashcards', desc: `${FLASHCARDS.length} terms`, action: () => { setTab('study'); setSm('flashcard'); } },
                { icon: '✎', title: 'NBE Quiz', desc: `${QUIZ.length} questions`, action: () => { setTab('study'); setSm('quiz'); } },
                { icon: '⊕', title: 'Ask Prof.', desc: 'AI instructor', action: () => setTab('ask') },
              ].map((it, i) => (
                <button key={i} onClick={it.action} style={{ ...card, textAlign: 'left', cursor: 'pointer', border: `1px solid ${C.border}` }}>
                  <div style={{ fontSize: '22px', color: C.gold, marginBottom: '6px' }}>{it.icon}</div>
                  <div style={{ ...H, fontSize: '14px' }}>{it.title}</div>
                  <div style={{ fontSize: '11px', color: C.textLight, marginTop: '2px' }}>{it.desc}</div>
                </button>
              ))}
            </div>
            <div style={card}>
              <p style={{ ...H, fontSize: '13px', margin: '0 0 12px' }}>NBE Topic Coverage</p>
              {[{ l: 'FTC & Legal', p: 92 }, { l: 'Embalming (Arts)', p: 85 }, { l: 'Sciences', p: 80 }, { l: 'Grief & Counseling', p: 88 }, { l: 'History & Profession', p: 75 }].map((it, i) => (
                <div key={i} style={{ marginBottom: i < 4 ? '10px' : 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '11px', color: C.textMed }}>{it.l}</span>
                    <span style={{ fontSize: '11px', color: C.gold, fontWeight: 700 }}>{it.p}%</span>
                  </div>
                  <div style={{ background: C.creamDark, borderRadius: '4px', height: '5px' }}>
                    <div style={{ background: `linear-gradient(90deg,${C.gold},${C.goldLight})`, borderRadius: '4px', height: '5px', width: `${it.p}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SCENARIOS */}
        {tab === 'scenarios' && (
          <>
            {sv === 'library' && (
              <div style={{ padding: '20px' }}>
                <h2 style={{ ...H, fontSize: '22px', margin: '0 0 4px' }}>Scenario Library</h2>
                <p style={{ fontSize: '12px', color: C.textLight, margin: '0 0 16px' }}>Practice real family conversations safely</p>
                {SCENARIOS.map(s => {
                  const cc = CAT_COLORS[s.category] || CAT_COLORS.Arrangement;
                  const isDone = done.includes(s.id);
                  const sc_scores = scores[s.id] ?? [];
                  const best = sc_scores.length ? sc_scores.reduce((a, b) => a.avg > b.avg ? a : b) : null;
                  return (
                    <div key={s.id} onClick={() => startScen(s)} style={{ ...card, marginBottom: '10px', cursor: 'pointer' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={badge(cc.text, cc.bg, cc.border)}>{s.category}</span>
                        <span style={{ fontSize: '10px', fontWeight: 700, color: s.difficulty === 'Advanced' ? C.red : s.difficulty === 'Intermediate' ? C.orange : C.green }}>{s.difficulty}</span>
                      </div>
                      <p style={{ ...H, fontSize: '14px', margin: '0 0 2px' }}>{s.title} <span style={{ ...B, fontSize: '11px', color: C.textLight, fontWeight: 400 }}>— {s.subtitle}</span></p>
                      <p style={{ fontSize: '12px', color: C.textMed, margin: '4px 0 10px', lineHeight: 1.5 }}>{s.description}</p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <span style={{ fontSize: '11px', color: isDone ? C.green : C.textLight, fontWeight: isDone ? 700 : 400 }}>{isDone ? '✓ Completed' : '○ Not started'}</span>
                          {best && <span style={{ fontSize: '10px', color: C.gold, marginLeft: '8px', fontWeight: 700 }}>Best: {best.avg}/5</span>}
                        </div>
                        <button style={{ ...btn(), padding: '6px 14px', fontSize: '12px' }}>Begin →</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            {sv === 'prebrief' && sel && (
              <div style={{ padding: '20px' }}>
                <button onClick={() => setSv('library')} style={{ background: 'none', border: 'none', color: C.gold, fontSize: '13px', fontWeight: 700, cursor: 'pointer', padding: 0, marginBottom: '14px', ...B }}>← Back</button>
                <div style={{ background: C.navy, borderRadius: '20px', padding: '22px', marginBottom: '14px', color: C.white }}>
                  <span style={{ fontSize: '10px', color: C.gold, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{sel.category}</span>
                  <h2 style={{ ...H, fontSize: '22px', color: C.white, margin: '4px 0 6px' }}>{sel.title}</h2>
                  <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.65)', margin: 0, lineHeight: 1.6 }}>{sel.description}</p>
                </div>
                <div style={{ ...card, marginBottom: '12px' }}>
                  <p style={{ ...H, fontSize: '11px', color: C.gold, margin: '0 0 10px', letterSpacing: '0.07em', textTransform: 'uppercase' }}>Learning Goals</p>
                  {sel.goals.map((g, i) => (
                    <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '6px' }}>
                      <span style={{ color: C.gold, fontSize: '12px', flexShrink: 0, marginTop: '1px' }}>◆</span>
                      <span style={{ fontSize: '12px', color: C.textMed, lineHeight: 1.5 }}>{g}</span>
                    </div>
                  ))}
                </div>
                {(scores[sel.id]?.length ?? 0) > 0 && (
                  <div style={{ ...card, marginBottom: '12px', background: C.blueBg }}>
                    <p style={{ ...H, fontSize: '11px', color: C.blue, margin: '0 0 8px', letterSpacing: '0.07em', textTransform: 'uppercase' }}>Your Past Attempts</p>
                    {scores[sel.id].slice(-3).map((sc, i) => (
                      <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '4px', alignItems: 'center' }}>
                        <span style={{ fontSize: '11px', color: C.textLight, minWidth: '60px' }}>Attempt {scores[sel.id].length - (scores[sel.id].slice(-3).length - 1 - i)}</span>
                        {[{ l: 'E', v: sc.e }, { l: 'C', v: sc.c }, { l: 'Co', v: sc.co }].map(x => (
                          <span key={x.l} style={{ fontSize: '10px', fontWeight: 700, color: x.v >= 4 ? C.green : x.v >= 3 ? C.orange : C.red, background: x.v >= 4 ? C.greenBg : x.v >= 3 ? C.orangeBg : C.redBg, padding: '2px 6px', borderRadius: '6px' }}>{x.l}: {x.v}</span>
                        ))}
                        <span style={{ fontSize: '10px', color: C.textLight }}>avg {sc.avg}</span>
                      </div>
                    ))}
                  </div>
                )}
                <div style={{ background: C.orangeBg, borderRadius: '12px', padding: '12px 14px', borderLeft: `3px solid ${C.gold}`, marginBottom: '18px' }}>
                  <p style={{ fontSize: '11px', color: C.orange, margin: 0, lineHeight: 1.5 }}><strong>Reminder:</strong> Training simulation only. You are the funeral director. No legal, medical, or financial advice. Lead with empathy, clarity, and compliance.</p>
                </div>
                <button onClick={() => setSv('roleplay')} style={{ ...goldBtn, width: '100%', padding: '14px', fontSize: '15px' }}>Begin Scenario →</button>
              </div>
            )}
            {sv === 'roleplay' && sel && (
              <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100dvh - 130px)' }}>
                <div style={{ background: C.navy, padding: '11px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
                  <div>
                    <p style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)', margin: 0, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Active Scenario</p>
                    <p style={{ ...H, fontSize: '13px', color: C.white, margin: 0 }}>{sel.title}</p>
                  </div>
                  <button onClick={endScen} style={{ background: 'rgba(201,168,76,0.15)', color: C.gold, border: `1px solid rgba(201,168,76,0.3)`, borderRadius: '8px', padding: '6px 12px', fontSize: '11px', fontWeight: 700, cursor: 'pointer', ...B }}>End & Debrief</button>
                </div>
                <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px', background: C.cream }}>
                  {msgs.map((m, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start', alignItems: 'flex-end', gap: '6px' }}>
                      {m.role === 'assistant' && <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: C.creamDark, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', flexShrink: 0 }}>👤</div>}
                      <div style={{ maxWidth: '80%', padding: '10px 13px', borderRadius: m.role === 'user' ? '14px 14px 3px 14px' : '14px 14px 14px 3px', background: m.role === 'user' ? C.navy : C.white, color: m.role === 'user' ? C.white : C.text, fontSize: '13px', lineHeight: 1.55, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                        {m.content || <span style={{ opacity: 0.4 }}>▌</span>}
                      </div>
                    </div>
                  ))}
                  {chatL && msgs[msgs.length - 1]?.role === 'user' && <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px' }}><div style={{ width: '26px', height: '26px', borderRadius: '50%', background: C.creamDark, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>👤</div><div style={{ background: C.white, padding: '10px 14px', borderRadius: '14px 14px 14px 3px', fontSize: '13px', color: C.textLight }}>thinking...</div></div>}
                  <div ref={chatEnd} />
                </div>
                <div style={{ padding: '10px 14px', background: C.white, borderTop: `1px solid ${C.border}`, display: 'flex', gap: '8px', flexShrink: 0 }}>
                  <textarea value={inp} onChange={e => setInp(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }} placeholder="Respond as the funeral director..." rows={2} style={{ flex: 1, border: `1px solid ${C.border}`, borderRadius: '10px', padding: '9px 12px', fontSize: '13px', resize: 'none', outline: 'none', ...B, background: C.cream, color: C.text }} />
                  <button onClick={send} disabled={chatL || !inp.trim()} style={{ background: chatL || !inp.trim() ? C.creamDark : C.navy, color: chatL || !inp.trim() ? C.textLight : C.white, border: 'none', borderRadius: '10px', padding: '0 14px', fontSize: '18px', cursor: chatL || !inp.trim() ? 'not-allowed' : 'pointer' }}>↑</button>
                </div>
              </div>
            )}
            {sv === 'debrief' && (
              <div style={{ padding: '20px' }}>
                <h2 style={{ ...H, fontSize: '22px', margin: '0 0 4px' }}>Session Debrief</h2>
                <p style={{ fontSize: '12px', color: C.textLight, margin: '0 0 20px' }}>{sel?.title}</p>
                {debL ? (<div style={{ textAlign: 'center', padding: '50px 20px' }}><div style={{ fontSize: '40px', marginBottom: '14px' }}>⚘</div><p style={{ color: C.textLight, fontSize: '14px' }}>Analyzing your performance...</p></div>)
                  : deb && (
                    <>
                      <div style={{ ...card, marginBottom: '14px' }}>
                        <p style={{ ...H, fontSize: '11px', color: C.textLight, textAlign: 'center', letterSpacing: '0.07em', textTransform: 'uppercase', margin: '0 0 16px' }}>Performance</p>
                        <div style={{ display: 'flex', justifyContent: 'space-around' }}>
                          {[{ label: 'Empathy', score: deb.empathy, color: '#1A6FAA' }, { label: 'Clarity', score: deb.clarity, color: C.green }, { label: 'Compliance', score: deb.compliance, color: C.orange }].map((it, i) => (
                            <div key={i} style={{ textAlign: 'center' }}>
                              <div style={{ width: '58px', height: '58px', borderRadius: '50%', background: it.color, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 6px', boxShadow: `0 4px 12px ${it.color}40` }}>
                                <span style={{ color: C.white, fontSize: '14px', fontWeight: 800, ...H }}>{it.score}/5</span>
                              </div>
                              <p style={{ fontSize: '11px', color: C.textMed, margin: 0, fontWeight: 600 }}>{it.label}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                      {deb.strengths?.length > 0 && <div style={{ background: C.greenBg, borderRadius: '14px', padding: '14px', marginBottom: '10px', border: `1px solid #B8EDD6` }}><p style={{ fontSize: '11px', fontWeight: 700, color: C.green, margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>✓ What You Did Well</p>{deb.strengths.map((s, i) => <p key={i} style={{ fontSize: '12px', color: '#1A5A3A', margin: '0 0 3px', lineHeight: 1.5 }}>• {s}</p>)}</div>}
                      {deb.improvements?.length > 0 && <div style={{ background: C.orangeBg, borderRadius: '14px', padding: '14px', marginBottom: '10px', border: `1px solid #F0D0A0` }}><p style={{ fontSize: '11px', fontWeight: 700, color: C.orange, margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>↑ Improve Next Time</p>{deb.improvements.map((s, i) => <p key={i} style={{ fontSize: '12px', color: '#7A4000', margin: '0 0 3px', lineHeight: 1.5 }}>• {s}</p>)}</div>}
                      {deb.suggestion && <div style={{ background: C.blueBg, borderRadius: '14px', padding: '14px', marginBottom: '18px', border: `1px solid #BFCFEE` }}><p style={{ fontSize: '11px', fontWeight: 700, color: C.blue, margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>💬 Better Phrasing</p><p style={{ fontSize: '13px', color: C.blue, margin: 0, fontStyle: 'italic', lineHeight: 1.55 }}>{deb.suggestion}</p></div>}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        <button onClick={() => { setMsgs([{ role: 'assistant', content: sel!.opening }]); setDeb(null); setSv('roleplay'); }} style={{ ...btn(), width: '100%' }}>Try Again</button>
                        <button onClick={() => { setSv('library'); setSel(null); setMsgs([]); setDeb(null); }} style={{ ...btn(false), width: '100%' }}>All Scenarios</button>
                      </div>
                    </>
                  )}
              </div>
            )}
          </>
        )}

        {/* STUDY */}
        {tab === 'study' && (
          <div style={{ padding: '20px' }}>
            {sm === 'menu' && (
              <>
                <h2 style={{ ...H, fontSize: '22px', margin: '0 0 4px' }}>Study Mode</h2>
                <p style={{ fontSize: '12px', color: C.textLight, margin: '0 0 18px' }}>Terminology, concepts, and NBE preparation</p>
                {[
                  { icon: '◈', title: 'Flashcards', desc: `${FLASHCARDS.length} terms across 6 categories`, sub: 'FTC, Embalming, Sciences, Grief + more', action: () => { setSm('flashcard'); setCi(0); setFl(false); setSc('All'); } },
                  { icon: '✎', title: 'NBE Practice Quiz', desc: `${QUIZ.length} questions · multiple choice`, sub: 'Arts (Funeral Directing & Embalming) + Sciences', action: () => { setSm('quiz'); resetQuiz(); setQf('All'); } },
                ].map((it, i) => (
                  <div key={i} onClick={it.action} style={{ ...card, marginBottom: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '52px', height: '52px', background: 'rgba(201,168,76,0.1)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', color: C.gold, flexShrink: 0 }}>{it.icon}</div>
                    <div><p style={{ ...H, fontSize: '15px', margin: '0 0 2px' }}>{it.title}</p><p style={{ fontSize: '12px', color: C.textMed, margin: '0 0 2px' }}>{it.desc}</p><p style={{ fontSize: '11px', color: C.gold, margin: 0, fontWeight: 700 }}>{it.sub}</p></div>
                  </div>
                ))}
              </>
            )}
            {sm === 'flashcard' && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <button onClick={() => setSm('menu')} style={{ background: 'none', border: 'none', color: C.gold, fontSize: '13px', fontWeight: 700, cursor: 'pointer', padding: 0, ...B }}>← Back</button>
                  <span style={{ fontSize: '12px', color: C.textLight }}>{ci + 1} / {filtCards.length}</span>
                </div>
                <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '10px', marginBottom: '14px' }}>
                  {cats.map(c => <button key={c} onClick={() => { setSc(c); setCi(0); setFl(false); }} style={{ background: sc === c ? C.navy : C.white, color: sc === c ? C.white : C.textMed, border: `1px solid ${sc === c ? C.navy : C.border}`, borderRadius: '20px', padding: '5px 11px', fontSize: '10px', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap', ...B }}>{c}</button>)}
                </div>
                {filtCards.length > 0 && (
                  <>
                    <div onClick={() => setFl(!fl)} style={{ perspective: '1200px', cursor: 'pointer', marginBottom: '16px', height: '230px' }}>
                      <div style={{ position: 'relative', width: '100%', height: '100%', transformStyle: 'preserve-3d', transition: 'transform 0.55s cubic-bezier(0.4,0,0.2,1)', transform: fl ? 'rotateY(180deg)' : 'rotateY(0deg)' }}>
                        <div style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', background: C.white, borderRadius: '20px', border: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', boxSizing: 'border-box', boxShadow: '0 4px 20px rgba(0,0,0,0.07)' }}>
                          <p style={{ fontSize: '10px', fontWeight: 700, color: C.gold, margin: '0 0 6px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{filtCards[ci]?.category}{filtCards[ci]?.nbe && <span style={{ marginLeft: '8px', background: 'rgba(201,168,76,0.1)', padding: '1px 7px', borderRadius: '8px', color: C.orange }}>NBE</span>}</p>
                          <p style={{ ...H, fontSize: '21px', textAlign: 'center', margin: '4px 0 0', lineHeight: 1.3 }}>{filtCards[ci]?.term}</p>
                          <p style={{ fontSize: '10px', color: C.textLight, margin: '18px 0 0' }}>Tap to reveal →</p>
                        </div>
                        <div style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: 'rotateY(180deg)', background: C.navy, borderRadius: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '22px', boxSizing: 'border-box', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}>
                          <p style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(201,168,76,0.65)', margin: '0 0 10px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Definition</p>
                          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.9)', textAlign: 'center', margin: 0, lineHeight: 1.65 }}>{filtCards[ci]?.definition}</p>
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button onClick={() => { setCi(Math.max(0, ci - 1)); setFl(false); }} disabled={ci === 0} style={{ ...btn(false), flex: 1, opacity: ci === 0 ? 0.35 : 1, cursor: ci === 0 ? 'not-allowed' : 'pointer' }}>← Prev</button>
                      <button onClick={() => { setCi(Math.min(filtCards.length - 1, ci + 1)); setFl(false); }} disabled={ci === filtCards.length - 1} style={{ ...btn(), flex: 1, opacity: ci === filtCards.length - 1 ? 0.35 : 1, cursor: ci === filtCards.length - 1 ? 'not-allowed' : 'pointer' }}>Next →</button>
                    </div>
                  </>
                )}
              </>
            )}
            {sm === 'quiz' && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <button onClick={() => { setSm('menu'); resetQuiz(); }} style={{ background: 'none', border: 'none', color: C.gold, fontSize: '13px', fontWeight: 700, cursor: 'pointer', padding: 0, ...B }}>← Back</button>
                  {!qSub && <span style={{ fontSize: '12px', color: C.textLight }}>{Object.keys(ans).length} / {filtQs.length} answered</span>}
                </div>
                {!qSub ? (
                  <>
                    <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '10px', marginBottom: '14px' }}>
                      {['All', 'Arts', 'Sciences', 'FTC & Legal', 'Embalming', 'Grief & Counseling', 'Death Certificates', 'History & Profession'].map(f => <button key={f} onClick={() => { setQf(f); resetQuiz(); }} style={{ background: qf === f ? C.navy : C.white, color: qf === f ? C.white : C.textMed, border: `1px solid ${qf === f ? C.navy : C.border}`, borderRadius: '20px', padding: '5px 11px', fontSize: '10px', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap', ...B }}>{f}</button>)}
                    </div>
                    {filtQs.map((q, qi) => (
                      <div key={q.id} style={{ ...card, marginBottom: '12px' }}>
                        <div style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}><span style={badge(C.navy, 'rgba(27,42,74,0.07)', 'transparent')}>NBE {q.nbe}</span><span style={badge(C.textLight, 'transparent', C.border)}>{q.cat}</span></div>
                        <p style={{ fontSize: '13px', fontWeight: 600, color: C.text, margin: '0 0 12px', lineHeight: 1.55 }}>Q{qi + 1}. {q.q}</p>
                        {q.opts.map((o, oi) => <button key={oi} onClick={() => setAns(p => ({ ...p, [q.id]: oi }))} style={{ display: 'block', width: '100%', textAlign: 'left', background: ans[q.id] === oi ? C.blueBg : C.cream, border: `2px solid ${ans[q.id] === oi ? '#3B6FCC' : 'transparent'}`, borderRadius: '10px', padding: '9px 12px', fontSize: '12px', color: C.text, marginBottom: '6px', cursor: 'pointer', lineHeight: 1.4, ...B }}><span style={{ fontWeight: 700, marginRight: '6px', color: C.gold }}>{['A', 'B', 'C', 'D'][oi]}.</span>{o}</button>)}
                      </div>
                    ))}
                    <button onClick={submitQuiz} disabled={Object.keys(ans).length < filtQs.length} style={{ ...btn(), width: '100%', fontSize: '14px', padding: '14px', opacity: Object.keys(ans).length < filtQs.length ? 0.5 : 1, cursor: Object.keys(ans).length < filtQs.length ? 'not-allowed' : 'pointer' }}>{Object.keys(ans).length < filtQs.length ? `Answer all ${filtQs.length} to submit` : 'Submit Quiz'}</button>
                  </>
                ) : (
                  <>
                    <div style={{ background: C.navy, borderRadius: '20px', padding: '28px 20px', textAlign: 'center', marginBottom: '16px', color: C.white }}>
                      <p style={{ fontSize: '11px', opacity: 0.55, margin: '0 0 6px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Your Score</p>
                      <p style={{ ...H, fontSize: '56px', color: C.gold, margin: '0 0 4px', lineHeight: 1 }}>{filtQs.filter(q => ans[q.id] === q.correct).length}/{filtQs.length}</p>
                      <p style={{ fontSize: '15px', opacity: 0.75, margin: 0 }}>{Math.round(filtQs.filter(q => ans[q.id] === q.correct).length / filtQs.length * 100)}% correct</p>
                    </div>
                    {filtQs.map((q, qi) => { const ok = ans[q.id] === q.correct; return (<div key={q.id} style={{ ...card, marginBottom: '10px', borderColor: ok ? '#B8EDD6' : '#FFD0D0', borderWidth: '2px' }}><div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', marginBottom: '8px' }}><span style={{ fontSize: '14px', flexShrink: 0 }}>{ok ? '✅' : '❌'}</span><p style={{ fontSize: '12px', fontWeight: 600, color: C.text, margin: 0, lineHeight: 1.5 }}>Q{qi + 1}. {q.q}</p></div>{!ok && <p style={{ fontSize: '11px', color: C.red, margin: '0 0 5px', background: C.redBg, padding: '5px 9px', borderRadius: '7px' }}>Your answer: {q.opts[ans[q.id]] ?? 'Not answered'}</p>}<p style={{ fontSize: '11px', color: C.green, margin: '0 0 6px', background: C.greenBg, padding: '5px 9px', borderRadius: '7px' }}>✓ {q.opts[q.correct]}</p><p style={{ fontSize: '11px', color: C.textMed, margin: 0, lineHeight: 1.5, fontStyle: 'italic' }}>{q.exp}</p></div>); })}
                    <button onClick={resetQuiz} style={{ ...btn(), width: '100%', padding: '14px', fontSize: '14px', marginTop: '4px' }}>Retake Quiz</button>
                  </>
                )}
              </>
            )}
          </div>
        )}

        {/* ASK */}
        {tab === 'ask' && (
          <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100dvh - 130px)' }}>
            <div style={{ padding: '14px 20px 10px', borderBottom: `1px solid ${C.border}`, background: C.white, flexShrink: 0 }}>
              <p style={{ ...H, fontSize: '16px', margin: '0 0 2px' }}>Ask the Instructor</p>
              <p style={{ fontSize: '11px', color: C.textLight, margin: 0 }}>AI-powered expert — ask anything about funeral service</p>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {askM.length === 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '4px' }}>
                  <div style={{ background: C.navy, borderRadius: '16px', padding: '16px', color: C.white, display: 'flex', gap: '10px' }}>
                    <span style={{ fontSize: '18px', flexShrink: 0 }}>👨‍🏫</span>
                    <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.85)', margin: 0, lineHeight: 1.55 }}>Hello! I&apos;m Professor Chen. Ask me anything — FTC Funeral Rule, embalming, NBE prep, grief counseling, death certificates, OSHA... I&apos;m here to help you succeed.</p>
                  </div>
                  <p style={{ fontSize: '11px', color: C.textLight, textAlign: 'center', margin: '4px 0' }}>Try asking:</p>
                  {["What's the difference between rigor mortis and livor mortis?", "When exactly must I give a family the GPL?", "What does the medical certifier complete on a death certificate?"].map((q, i) => <button key={i} onClick={() => setAskI(q)} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '10px 14px', fontSize: '12px', color: C.navy, cursor: 'pointer', textAlign: 'left', ...B }}>&ldquo;{q}&rdquo;</button>)}
                </div>
              )}
              {askM.map((m, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start', alignItems: 'flex-end', gap: '8px' }}>
                  {m.role === 'assistant' && <span style={{ fontSize: '16px', flexShrink: 0, marginBottom: '2px' }}>👨‍🏫</span>}
                  <div style={{ maxWidth: '82%', padding: '10px 13px', borderRadius: m.role === 'user' ? '14px 14px 3px 14px' : '14px 14px 14px 3px', background: m.role === 'user' ? C.navy : C.white, color: m.role === 'user' ? C.white : C.text, fontSize: '13px', lineHeight: 1.55, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                    {m.content || <span style={{ opacity: 0.4 }}>▌</span>}
                  </div>
                </div>
              ))}
              {askL && askM[askM.length - 1]?.role === 'user' && <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}><span style={{ fontSize: '16px' }}>👨‍🏫</span><div style={{ background: C.white, padding: '10px 14px', borderRadius: '14px 14px 14px 3px', fontSize: '13px', color: C.textLight }}>thinking...</div></div>}
              <div ref={askEnd} />
            </div>
            <div style={{ padding: '10px 14px', background: C.white, borderTop: `1px solid ${C.border}`, display: 'flex', gap: '8px', flexShrink: 0 }}>
              <input value={askI} onChange={e => setAskI(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') sendAsk(); }} placeholder="Ask anything about funeral service..." style={{ flex: 1, border: `1px solid ${C.border}`, borderRadius: '10px', padding: '10px 12px', fontSize: '13px', outline: 'none', ...B, background: C.cream, color: C.text }} />
              <button onClick={sendAsk} disabled={askL || !askI.trim()} style={{ background: askL || !askI.trim() ? C.creamDark : C.gold, color: askL || !askI.trim() ? C.textLight : C.navy, border: 'none', borderRadius: '10px', padding: '0 14px', fontSize: '18px', fontWeight: 700, cursor: askL || !askI.trim() ? 'not-allowed' : 'pointer' }}>↑</button>
            </div>
          </div>
        )}

        {/* PROGRESS */}
        {tab === 'progress' && (
          <div style={{ padding: '20px' }}>
            <h2 style={{ ...H, fontSize: '22px', margin: '0 0 4px' }}>Progress</h2>
            <p style={{ fontSize: '12px', color: C.textLight, margin: '0 0 16px' }}>{ap?.name}</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '16px' }}>
              {[
                { icon: '◎', label: 'Scenarios', value: `${done.length}/${SCENARIOS.length}` },
                { icon: '✎', label: 'Quizzes', value: String(qHist.length) },
                { icon: '◈', label: 'Best Quiz', value: qHist.length ? `${Math.max(...qHist.map(h => h.pct))}%` : '—' },
              ].map((s, i) => (
                <div key={i} style={{ ...card, textAlign: 'center', padding: '12px 8px' }}>
                  <div style={{ fontSize: '18px', color: C.gold, marginBottom: '4px' }}>{s.icon}</div>
                  <div style={{ ...H, fontSize: '20px', lineHeight: 1 }}>{s.value}</div>
                  <div style={{ fontSize: '10px', color: C.textLight, marginTop: '3px' }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Scenario scores */}
            <div style={{ ...card, marginBottom: '14px' }}>
              <p style={{ ...H, fontSize: '13px', margin: '0 0 12px' }}>Scenarios</p>
              {SCENARIOS.map((s, i) => {
                const isDone = done.includes(s.id);
                const sc_scores = scores[s.id] ?? [];
                const best = sc_scores.length ? sc_scores.reduce((a, b) => a.avg > b.avg ? a : b) : null;
                return (
                  <div key={s.id} style={{ paddingBottom: '10px', marginBottom: '10px', borderBottom: i < SCENARIOS.length - 1 ? `1px solid ${C.border}` : 'none' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: '12px', fontWeight: 600, color: C.text, margin: '0 0 2px' }}>{s.title}</p>
                        <p style={{ fontSize: '11px', color: C.textLight, margin: 0 }}>{s.category} · {sc_scores.length} attempt{sc_scores.length !== 1 ? 's' : ''}</p>
                      </div>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: isDone ? C.green : C.textLight, marginLeft: '8px' }}>{isDone ? '✓' : '○'}</span>
                    </div>
                    {best && (
                      <div style={{ display: 'flex', gap: '6px', marginTop: '6px', flexWrap: 'wrap' }}>
                        {[{ l: 'Empathy', v: best.e }, { l: 'Clarity', v: best.c }, { l: 'Compliance', v: best.co }].map(x => (
                          <span key={x.l} style={{ fontSize: '10px', fontWeight: 700, color: x.v >= 4 ? C.green : x.v >= 3 ? C.orange : C.red, background: x.v >= 4 ? C.greenBg : x.v >= 3 ? C.orangeBg : C.redBg, padding: '2px 7px', borderRadius: '6px' }}>{x.l}: {x.v}/5</span>
                        ))}
                        <span style={{ fontSize: '10px', color: C.textLight, padding: '2px 0' }}>avg {best.avg}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Quiz history */}
            {qHist.length > 0 && (
              <div style={card}>
                <p style={{ ...H, fontSize: '13px', margin: '0 0 10px' }}>Quiz History</p>
                {qHist.slice().reverse().slice(0, 10).map((h, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '8px', marginBottom: '8px', borderBottom: i < Math.min(qHist.length, 10) - 1 ? `1px solid ${C.border}` : 'none' }}>
                    <div><p style={{ fontSize: '12px', fontWeight: 600, color: C.text, margin: '0 0 2px' }}>{h.filter} Quiz</p><p style={{ fontSize: '11px', color: C.textLight, margin: 0 }}>{h.score}/{h.total} correct</p></div>
                    <span style={{ ...H, fontSize: '18px', color: h.pct >= 80 ? C.green : h.pct >= 60 ? C.orange : C.red }}>{h.pct}%</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* TAB BAR */}
      <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: '460px', background: C.white, borderTop: `1px solid ${C.border}`, display: 'flex', paddingTop: '8px', paddingBottom: 'calc(12px + env(safe-area-inset-bottom, 0px))', zIndex: 100 }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => { setTab(t.id); if (t.id === 'scenarios') setSv('library'); if (t.id === 'study') setSm('menu'); }} style={{ flex: 1, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', padding: '3px 0', ...B }}>
            <span style={{ fontSize: '16px', color: tab === t.id ? C.gold : C.textLight }}>{t.icon}</span>
            <span style={{ fontSize: '9px', fontWeight: tab === t.id ? 700 : 500, color: tab === t.id ? C.navy : C.textLight, letterSpacing: '0.03em' }}>{t.label}</span>
            {tab === t.id && <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: C.gold }} />}
          </button>
        ))}
      </div>
    </div>
  );
}
