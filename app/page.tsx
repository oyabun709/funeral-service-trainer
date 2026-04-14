"use client";

import { useState, useRef, useEffect } from "react";


const C = {
  navy:'#1A2840', navyLight:'#243660', gold:'#C9A84C', goldLight:'#E8C870',
  cream:'#F5F0E8', creamDark:'#EDE5D8', white:'#FFFFFF',
  text:'#1A2840', textMed:'#4A5568', textLight:'#8A7A6A', border:'#E2D9CC',
  green:'#1A7A4A', greenBg:'#F0FAF5', orange:'#B85C00', orangeBg:'#FFF5EB',
  red:'#C0282E', redBg:'#FFF0F0', blue:'#1A4A8A', blueBg:'#EFF4FF',
};

const SCENARIOS = [
  { id:1, title:"Arrangement Conference", subtitle:"First Meeting", category:"Arrangement", difficulty:"Beginner",
    description:"Guide an overwhelmed family through their first arrangement meeting. Practice pacing, compassionate listening, and explaining the process clearly.",
    goals:["Establish rapport and emotional safety","Explain the arrangement process step by step","Ask open-ended questions about the deceased"],
    persona:"You are Maria, 45, who just lost her mother unexpectedly to a stroke this morning. You're overwhelmed but trying to hold it together. You don't know anything about arrangements and feel slightly guilty asking about costs. React warmly to empathy and patience. Become withdrawn or confused if rushed or met with jargon.",
    opening:"Hi... I'm Maria. I got a call saying I should come in and... I don't really know what happens now. My mom just passed this morning." },
  { id:2, title:"FTC Funeral Rule", subtitle:"Price Transparency", category:"Compliance", difficulty:"Intermediate",
    description:"Navigate presenting the General Price List and explaining itemized pricing to a skeptical, financially stressed family member. No pressure — just clarity.",
    goals:["Offer the GPL at the correct moment","Explain itemization without pressure or steering","Use plain language throughout"],
    persona:"You are David, 52, whose father died yesterday. You're financially stressed and suspicious that funeral homes exploit grief. You push back on pricing. You respond well to transparency and feeling in control. You get irritated when you sense any sales pressure.",
    opening:"Look, I want to be upfront — I've heard funeral homes can take advantage of people when they're grieving. I just want to know exactly what everything costs before we go any further." },
  { id:3, title:"Direct Cremation", subtitle:"Explaining the Process", category:"Arrangement", difficulty:"Beginner",
    description:"Answer questions about direct cremation accurately — covering the process, alternative containers, and timing — without steering toward more expensive options.",
    goals:["Explain direct cremation accurately","Mention the alternative container option per FTC rules","Respect the choice without steering"],
    persona:"You are James, 38, designated next of kin for an aunt you barely knew. You want the simplest, least expensive option and feel slightly guilty about your detachment. You relax and open up when the student is non-judgmental and clear.",
    opening:"I was told I should ask about direct cremation. That's basically... you take care of everything and give me the ashes, right? What does that actually involve?" },
  { id:4, title:"Cultural Request", subtitle:"Navigating Uncertainty", category:"Cultural", difficulty:"Intermediate",
    description:"Handle a family request for culturally specific arrangements when the family member doesn't know every detail. Practice respectful clarifying questions — no assumptions.",
    goals:["Ask respectful open-ended clarifying questions","Avoid assumptions about tradition or practice","Document specific preferences clearly"],
    persona:"You are Amara, 34. Your grandmother from Ghana has passed. Your family has specific traditions but you're second-generation and don't know every detail — you just know it has to be 'done right.' You're anxious. You warm up when the student asks thoughtful questions and avoids assumptions.",
    opening:"My grandmother passed away and we need to do this the proper way — our traditional way. I just... I'm not sure I know every single detail of what that means. I need your help." },
  { id:5, title:"Family Conflict", subtitle:"De-Escalation", category:"Conflict", difficulty:"Advanced",
    description:"Manage active disagreement between family members in the arrangement room. De-escalate while remaining neutral and keeping focus on honoring the deceased.",
    goals:["De-escalate without taking sides","Redirect focus to the deceased's wishes","Stay compliant — no promises you can't keep"],
    persona:"You are Sandra, 55. Your mother just passed. You want a full traditional burial with a viewing. You also speak for your brother Kevin (he wants cremation to save money). You're emotional and feel he's being disrespectful. You calm down when the student redirects to Mom's wishes rather than the argument.",
    opening:"I need to tell you upfront — my brother and I don't agree on anything right now. I want a proper burial with a viewing. He wants to just cremate her. I don't know how we're going to get through this." },
  { id:6, title:"Death Certificate Intake", subtitle:"Staying in Your Lane", category:"Legal", difficulty:"Intermediate",
    description:"Collect demographic information for a death certificate while clearly explaining which fields belong to the medical certifier — never speculating on cause of death.",
    goals:["Collect demographic data accurately","Explain the medical certifier's role clearly","Never speculate on cause of death"],
    persona:"You are Robert, 60. Your wife of 35 years died yesterday. You're in shock and confused about paperwork. You keep trying to get the student to confirm what happened medically — the doctor wasn't clear and you're desperate for answers. You calm down when the student acknowledges your grief and explains gently.",
    opening:"They gave me this form to bring in. I don't understand any of it. Can you just... tell me what happened? The doctor wasn't very clear about why she died. Was it her heart?" },
  { id:7, title:"First Call", subtitle:"Removal Authorization", category:"First Call", difficulty:"Beginner",
    description:"Handle the initial phone call from a family, collect necessary information, and explain what happens next with calm, genuine professionalism.",
    goals:["Express sincere condolences","Collect name, location, and authorization info","Explain the next steps clearly"],
    persona:"You are Linda, 50. Your father just passed at home an hour ago. You're in shock and your voice is shaky. You're not even sure calling the funeral home was the right first step. You feel calmer and more in control when the student is patient, warm, and gives clear guidance.",
    opening:"Hello? I... I think I need to call you. My father just passed away at home about an hour ago. I didn't know who to call first. Is this right?" },
  { id:8, title:"Aftercare", subtitle:"What Happens Next", category:"Aftercare", difficulty:"Beginner",
    description:"Walk a family through post-service next steps. Know your lane — provide clear guidance and refer out for legal, financial, and estate matters.",
    goals:["Provide a clear aftercare checklist","Be honest about the funeral home's scope","Offer referrals without giving legal or financial advice"],
    persona:"You are Patricia, 62. Your husband's service just ended. You feel completely lost — there's so much paperwork and nobody is explaining anything. You feel relieved when the student gives you structure, clarity, and knows when to refer you to others.",
    opening:"The service was beautiful, truly. Thank you. But now I'm just standing here and I don't know what I'm supposed to do. There's so much. Where do I even start?" },
];

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
  {id:13,category:"Embalming",term:"Livor Mortis (Lividity)",definition:"Purplish-red discoloration from blood pooling to dependent areas after circulation stops. Becomes fixed (permanent) at approximately 6–12 hours post-death. Fixed lividity has both embalming and forensic significance.",nbe:true},
  {id:14,category:"Embalming",term:"Algor Mortis",definition:"Cooling of the body after death to match ambient temperature. Approximately 1–1.5°F per hour under normal conditions. Affected by body size, clothing, and environment.",nbe:true},
  {id:15,category:"Embalming",term:"Arterial Embalming",definition:"Primary embalming method — embalming fluid injected into the arterial system while blood is drained from the veins. Preserves and sanitizes the body. Usually the first step in the embalming process.",nbe:true},
  {id:16,category:"Embalming",term:"Cavity Embalming",definition:"Aspiration of gases and fluids from body cavities (thorax, abdomen) using a trocar, followed by injection of cavity fluid. Performed after arterial embalming.",nbe:true},
  {id:17,category:"Embalming",term:"Formaldehyde",definition:"Primary preservative in embalming fluid — also a fixative and disinfectant. OSHA PEL: 0.75 ppm (8-hr TWA). STEL: 2 ppm. Action Level: 0.5 ppm. Requires engineering controls and PPE.",nbe:true},
  {id:18,category:"Embalming",term:"Embalming Index",definition:"The percentage of formaldehyde in an embalming solution. Higher index = stronger preservation and firming action. Selection depends on condition of remains and expected viewing timeline.",nbe:true},
  {id:19,category:"Grief & Counseling",term:"Kübler-Ross Five Stages",definition:"Denial → Anger → Bargaining → Depression → Acceptance. From 'On Death and Dying' (1969). Not a linear process — people move between stages non-sequentially and may skip stages.",nbe:true},
  {id:20,category:"Grief & Counseling",term:"Anticipatory Grief",definition:"Grief experienced before an expected loss, such as during a terminal illness diagnosis. Can help families prepare emotionally but does not replace or eliminate post-death grief.",nbe:true},
  {id:21,category:"Grief & Counseling",term:"Complicated Grief",definition:"Prolonged, intense grief that significantly interferes with daily functioning beyond typical timeframes. Also called 'prolonged grief disorder.' May require professional mental health intervention.",nbe:true},
  {id:22,category:"Grief & Counseling",term:"Active Listening",definition:"Giving full, undivided attention to the speaker. Reflecting back what you heard. Avoiding interruption or rushing to solutions. A critical skill during arrangement conferences with grieving families.",nbe:true},
  {id:23,category:"History & Profession",term:"NFDA",definition:"National Funeral Directors Association — largest funeral service trade association in the U.S. Provides continuing education, advocacy, ethical guidance, and professional standards.",nbe:false},
  {id:24,category:"History & Profession",term:"ABFSE",definition:"American Board of Funeral Service Education — the recognized accrediting agency for funeral service and mortuary science education programs in the United States.",nbe:false},
  {id:25,category:"History & Profession",term:"Pre-Need vs At-Need",definition:"Pre-need: arrangements made in advance of death (regulated at state level, may involve trusting or insurance). At-need: arrangements made at time of death. At-need families are in acute grief and need maximum clarity.",nbe:true},
  {id:26,category:"History & Profession",term:"Casket vs. Coffin",definition:"A casket is rectangular, 4-sided, with a split lid. A coffin is 6-sided, tapered at head and foot. In the U.S., 'casket' is the standard professional term.",nbe:false},
  {id:27,category:"Sciences (NBE)",term:"Universal Precautions",definition:"OSHA-mandated approach treating all human blood and body fluids as potentially infectious regardless of diagnosis. Requires gloves, gown, eye protection, and mask for all cases.",nbe:true},
  {id:28,category:"Sciences (NBE)",term:"Putrefaction",definition:"Decomposition caused by microbial action — produces gases (H₂S, methane, ammonia) and liquefaction of tissues. Rate affected by temperature, moisture, and bacterial type.",nbe:true},
  {id:29,category:"Sciences (NBE)",term:"Autolysis",definition:"Self-digestion of cells by their own enzymes after death. Begins immediately at death. Contributes to early decomposition before bacterial putrefaction becomes dominant.",nbe:true},
  {id:30,category:"Sciences (NBE)",term:"Decomposition Stages",definition:"Fresh → Bloat → Active Decay → Advanced Decay → Dry/Skeletal. Driven by autolysis and putrefaction. Affected by temperature, moisture, burial depth, and insect activity.",nbe:true},
  {id:31,category:"Sciences (NBE)",term:"Pathogenic Microorganisms",definition:"Microorganisms capable of causing disease. Primary concerns in funeral service: HIV, Hepatitis B & C, tuberculosis, MRSA. Universal precautions required for every case regardless of known diagnosis.",nbe:true},
  {id:32,category:"Sciences (NBE)",term:"Formaldehyde Action Level",definition:"OSHA action level for formaldehyde is 0.5 ppm — triggers air monitoring, medical surveillance, and hazard communication requirements. The PEL is 0.75 ppm (8-hour TWA).",nbe:true},
];

const QUIZ = [
  {id:1,cat:"FTC & Legal",nbe:"Arts",q:"Under the FTC Funeral Rule, when must a funeral provider give a consumer the General Price List?",opts:["Only when the consumer specifically asks for it","At the beginning of any in-person discussion about funeral goods, services, or prices","Only after a contract has been signed","When the family picks up the remains"],correct:1,exp:"The FTC Funeral Rule requires the GPL to be offered at the start of any in-person discussion — not only when the consumer explicitly requests it."},
  {id:2,cat:"FTC & Legal",nbe:"Arts",q:"A family asks if embalming is legally required. The correct response is:",opts:["Yes, it is always required by federal law","It depends only on the family's religious wishes","It is generally not legally required; some states have specific exceptions (e.g., long-distance transport, delayed disposition)","It is required whenever a viewing is held"],correct:2,exp:"Embalming is generally not legally required. The FTC Funeral Rule prohibits misrepresenting it as required. A funeral director cannot proceed without written authorization."},
  {id:3,cat:"FTC & Legal",nbe:"Arts",q:"Which of the following is a 'cash advance item' under the FTC Funeral Rule?",opts:["A casket selected from the funeral home's inventory","The funeral director's basic services fee","Death certificate fees paid by the funeral home on the family's behalf","Embalming chemicals used in the preparation room"],correct:2,exp:"Cash advance items are paid by the funeral home on the family's behalf — like death certificate fees, obituary notices, or clergy fees. Cannot be marked up without written disclosure."},
  {id:4,cat:"Death Certificates",nbe:"Arts",q:"Which portion of the death certificate does the funeral director complete?",opts:["Cause of death and manner of death","Demographic information: name, address, SSN, occupation","Medical history of the decedent","Contributing conditions to death"],correct:1,exp:"The funeral director completes demographic information only. Cause of death, manner of death, and all medical fields are completed exclusively by the medical certifier."},
  {id:5,cat:"Death Certificates",nbe:"Arts",q:"A family asks you to confirm their father died of a heart attack. What should you do?",opts:["Confirm based on what the hospital told you","Speculate based on his known medical history","Explain that cause of death is determined by the medical certifier and refer them to the physician","Write 'probable cardiac event' as a placeholder"],correct:2,exp:"The funeral director never speculates on, confirms, or completes cause of death. That is exclusively the medical certifier's role. Doing otherwise is both unethical and legally problematic."},
  {id:6,cat:"Embalming",nbe:"Arts",q:"Rigor mortis is caused primarily by:",opts:["Bacterial decomposition of muscle tissue","Blood pooling in dependent body areas","ATP depletion preventing muscle relaxation, with calcium ion accumulation","Dehydration of tissues following death"],correct:2,exp:"Rigor mortis occurs when ATP is depleted after death, preventing myosin heads from detaching from actin filaments. Calcium ions accumulate, maintaining contraction. Typically begins 2–6 hours post-death."},
  {id:7,cat:"Embalming",nbe:"Arts",q:"What is the primary purpose of cavity embalming?",opts:["To improve skin color and texture for viewing","To aspirate gases and fluids from body cavities and inject cavity fluid","To restore facial features altered by disease","To set the expression prior to viewing"],correct:1,exp:"Cavity embalming uses a trocar to aspirate gases, liquids, and semi-solid matter from thoracic and abdominal cavities, then injects cavity fluid. Always performed after arterial embalming."},
  {id:8,cat:"Sciences (NBE)",nbe:"Sciences",q:"OSHA's permissible exposure limit (PEL) for formaldehyde as an 8-hour time-weighted average is:",opts:["0.1 ppm","0.75 ppm","2.0 ppm","5.0 ppm"],correct:1,exp:"OSHA's PEL for formaldehyde is 0.75 ppm (8-hour TWA). The STEL is 2 ppm. The action level is 0.5 ppm, which triggers air monitoring and medical surveillance requirements."},
  {id:9,cat:"Grief & Counseling",nbe:"Arts",q:"Anticipatory grief is best described as:",opts:["Grief that lasts longer than expected after a loss","Grief experienced before an anticipated death, such as during terminal illness","Complete denial of grief following sudden death","Grief that intensifies over time rather than resolving"],correct:1,exp:"Anticipatory grief occurs before a death — common in families of terminally ill patients. It can help families prepare emotionally but does not replace or eliminate post-death grief."},
  {id:10,cat:"Sciences (NBE)",nbe:"Sciences",q:"Livor mortis becomes 'fixed' (permanent) approximately how many hours after death?",opts:["1–2 hours","3–4 hours","6–12 hours","24–48 hours"],correct:2,exp:"Livor mortis (blood pooling discoloration) becomes fixed at approximately 6–12 hours post-death. Fixed lividity cannot be repositioned — this has both embalming and forensic significance."},
  {id:11,cat:"FTC & Legal",nbe:"Arts",q:"A funeral provider tells a family that purchasing a casket is required for cremation. This is:",opts:["Acceptable if the funeral home's policy requires it","A violation of the FTC Funeral Rule","Legal if state regulations permit it","Only a violation if the family formally complains"],correct:1,exp:"Under the FTC Funeral Rule, providers cannot require purchase of a casket for cremation. They must offer an alternative container option. This is non-negotiable."},
  {id:12,cat:"History & Profession",nbe:"Arts",q:"Which organization accredits funeral service education programs in the United States?",opts:["NFDA","ABFSE","FTC","CDC"],correct:1,exp:"The American Board of Funeral Service Education (ABFSE) is the recognized accrediting agency for funeral service and mortuary science education programs in the U.S."},
  {id:13,cat:"Embalming",nbe:"Arts",q:"Which vessels are most commonly used as the primary injection and drainage sites for arterial embalming?",opts:["Femoral artery and vein","Right common carotid artery (injection) and right internal jugular vein (drainage)","Brachial artery and vein","Aorta and vena cava"],correct:1,exp:"The right common carotid artery and right internal jugular vein are the most common primary injection/drainage sites. The femoral vessels are a widely used secondary site, particularly when the neck is not accessible."},
  {id:14,cat:"Sciences (NBE)",nbe:"Sciences",q:"Which of the following is classified as a bloodborne pathogen of primary concern under OSHA's Bloodborne Pathogens Standard?",opts:["Influenza A","Hepatitis B virus (HBV)","MRSA","Clostridium difficile"],correct:1,exp:"OSHA's Bloodborne Pathogens Standard specifically targets HBV, HCV, and HIV as primary bloodborne pathogens. Universal precautions are required for all cases regardless of known diagnosis."},
  {id:15,cat:"FTC & Legal",nbe:"Arts",q:"Under the FTC Funeral Rule, the one fee a provider may make non-declinable is:",opts:["Embalming","Transportation of remains","Basic services of funeral director and staff","Obituary preparation"],correct:2,exp:"The basic services fee (overhead/professional services fee) is the only non-declinable charge permitted under the FTC Funeral Rule. All other goods and services must be individually selectable by the consumer."},
  {id:16,cat:"Death Certificates",nbe:"Arts",q:"Authorization for cremation must be obtained from:",opts:["The attending physician","The legally authorized next of kin in the correct statutory priority order","The medical examiner only","Any adult family member present"],correct:1,exp:"Cremation is irreversible, so authorization must come from the legally authorized next of kin in the order established by state statute (typically spouse → adult children → parents → siblings). Correct authorization is critical."},
  {id:17,cat:"Grief & Counseling",nbe:"Arts",q:"Which behavior best demonstrates active listening during an arrangement conference?",opts:["Taking detailed notes while the family speaks","Preparing your next question while the family talks","Reflecting back what the family said and allowing silence","Moving quickly through topics to avoid prolonged emotion"],correct:2,exp:"Active listening means reflecting back what you heard, making eye contact, and allowing silence. Preparing your next question while the family speaks is a common error — it means you are not truly present with their grief."},
  {id:18,cat:"Embalming",nbe:"Arts",q:"A higher embalming index is used when:",opts:["Minimizing formaldehyde exposure is a priority","The family requests a natural appearance","Stronger preservation and firming are needed (e.g., delayed service, decomposition)","Embalming is performed within 12 hours of death"],correct:2,exp:"Higher embalming index = higher formaldehyde concentration = stronger preservation and firming. Used for cases with delayed services, signs of decomposition, edema, or disease conditions requiring enhanced preservation."},
  {id:19,cat:"Sciences (NBE)",nbe:"Sciences",q:"Autolysis is distinct from putrefaction in that autolysis:",opts:["Begins several hours after death when bacteria activate","Is caused by the body's own cellular enzymes and begins immediately at death","Occurs only after rigor mortis fully resolves","Is driven by insect activity"],correct:1,exp:"Autolysis (self-digestion) is non-bacterial — it begins immediately at death as intracellular enzymes are released. Putrefaction is caused by microbial action and typically begins later. Both contribute to decomposition but through different mechanisms."},
  {id:20,cat:"FTC & Legal",nbe:"Arts",q:"A consumer calls to ask about prices over the phone. Under the FTC Funeral Rule, you must:",opts:["Invite them in before discussing prices","Provide pricing for any specific goods or services they ask about","Give only the total package price","Provide prices only after they identify themselves"],correct:1,exp:"The FTC Funeral Rule requires funeral providers to answer specific pricing questions over the phone. You are not required to proactively read the full GPL, but you must provide prices for any specific items asked about."},
  {id:21,cat:"History & Profession",nbe:"Arts",q:"Pre-need funeral arrangements are primarily regulated by:",opts:["The FTC Funeral Rule","State law","The ABFSE","The CDC"],correct:1,exp:"Pre-need arrangements are regulated at the state level — requirements for trusting, insurance funding, and disclosure vary significantly by state. The FTC Funeral Rule governs at-need (current) arrangements only."},
  {id:22,cat:"Sciences (NBE)",nbe:"Sciences",q:"OSHA's Short Term Exposure Limit (STEL) for formaldehyde is:",opts:["0.5 ppm","0.75 ppm","2.0 ppm","5.0 ppm"],correct:2,exp:"OSHA's STEL for formaldehyde is 2.0 ppm — the maximum allowed for a 15-minute short-term exposure. The 8-hour TWA PEL is 0.75 ppm, and the action level (triggering monitoring and surveillance) is 0.5 ppm."},
  {id:23,cat:"Grief & Counseling",nbe:"Arts",q:"Complicated grief (prolonged grief disorder) is best characterized by:",opts:["Grief that resolves within two weeks","Normal grief that simply takes longer than average","Prolonged, intense grief that significantly impairs daily functioning","Grief that involves only physical symptoms"],correct:2,exp:"Complicated grief involves grief that remains intense well beyond typical timeframes and significantly impairs daily functioning. Funeral directors should recognize it and be prepared to make referrals to mental health professionals."},
  {id:24,cat:"Embalming",nbe:"Arts",q:"Fixed livor mortis has forensic significance primarily because:",opts:["It reveals the precise cause of death","Fixed lividity inconsistent with body position suggests the body was moved after death","It determines exact time of death","It indicates the presence of infectious disease"],correct:1,exp:"Lividity becomes fixed at approximately 6–12 hours post-death. If fixed lividity is inconsistent with the body's final position, it suggests the body was repositioned after fixation — a key forensic indicator funeral directors must observe and preserve."},
  {id:25,cat:"Sciences (NBE)",nbe:"Sciences",q:"The Bloat stage of decomposition is primarily driven by:",opts:["Insect activity consuming soft tissue","Autolysis of skin cells","Gas accumulation from microbial fermentation in the GI tract and body cavities","Dehydration and mummification"],correct:2,exp:"The Bloat stage is characterized by gas (H₂S, methane, ammonia) accumulating from microbial activity, causing visible distension. The Fresh stage precedes it; Active Decay and Advanced Decay follow with tissue loss and eventual skeletonization."},
];

const CAT_COLORS: Record<string, {bg:string;text:string;border:string}> = {
  "Arrangement":{bg:'#F0FAF5',text:'#1A7A4A',border:'#B8EDD6'},
  "Compliance":{bg:'#EFF4FF',text:'#1A4A8A',border:'#BFCFEE'},
  "Cultural":{bg:'#F5F0FF',text:'#5B2D9A',border:'#DDD0FF'},
  "Conflict":{bg:'#FFF0F0',text:'#C0282E',border:'#FFD0D0'},
  "Legal":{bg:'#EFF4FF',text:'#1A4A8A',border:'#BFCFEE'},
  "First Call":{bg:'#F0FAF5',text:'#1A7A4A',border:'#B8EDD6'},
  "Aftercare":{bg:'#FFF8E8',text:'#8A5A00',border:'#F0D890'},
};

export default function App() {

  const [tab, setTab] = useState('home');
  const [sv, setSv] = useState('library');
  const [sel, setSel] = useState<typeof SCENARIOS[0]|null>(null);
  const [msgs, setMsgs] = useState<{role:string;content:string}[]>([]);
  const [inp, setInp] = useState('');
  const [chatL, setChatL] = useState(false);
  const [debL, setDebL] = useState(false);
  const [deb, setDeb] = useState<{empathy:number;clarity:number;compliance:number;strengths:string[];improvements:string[];suggestion:string}|null>(null);
  const [done, setDone] = useState<number[]>([]);
  const [sm, setSm] = useState('menu');
  const [sc, setSc] = useState('All');
  const [ci, setCi] = useState(0);
  const [fl, setFl] = useState(false);
  const [ans, setAns] = useState<Record<number,number>>({});
  const [qSub, setQSub] = useState(false);
  const [qf, setQf] = useState('All');
  const [qHist, setQHist] = useState<{score:number;total:number;filter:string;pct:number}[]>([]);
  const [askM, setAskM] = useState<{role:string;content:string}[]>([]);
  const [askI, setAskI] = useState('');
  const [askL, setAskL] = useState(false);
  const chatEnd = useRef<HTMLDivElement>(null);
  const askEnd = useRef<HTMLDivElement>(null);

  useEffect(() => { chatEnd.current?.scrollIntoView({behavior:'smooth'}); }, [msgs, chatL]);
  useEffect(() => { askEnd.current?.scrollIntoView({behavior:'smooth'}); }, [askM, askL]);

  // Persist progress across page reloads
  useEffect(() => {
    const savedDone = localStorage.getItem('fst_done');
    const savedQHist = localStorage.getItem('fst_qhist');
    if (savedDone) setDone(JSON.parse(savedDone));
    if (savedQHist) setQHist(JSON.parse(savedQHist));
  }, []);
  useEffect(() => { localStorage.setItem('fst_done', JSON.stringify(done)); }, [done]);
  useEffect(() => { localStorage.setItem('fst_qhist', JSON.stringify(qHist)); }, [qHist]);

  // ── non-streaming API call (used for debrief JSON parsing) ──
  const callAPI = async (system: string|null, messages: {role:string;content:string}[]) => {
    const r = await fetch('/api/claude', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ system, messages }),
    });
    const d = await r.json();
    if (d.error) throw new Error(d.error);
    return d.text as string;
  };

  // ── streaming API call — updates a message chunk by chunk ──
  const callAPIStream = async (
    system: string|null,
    messages: {role:string;content:string}[],
    onChunk: (chunk: string) => void
  ) => {
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

  const startScen = (s: typeof SCENARIOS[0]) => { setSel(s); setMsgs([{role:'assistant',content:s.opening}]); setDeb(null); setSv('prebrief'); };

  const send = async () => {
    if (!inp.trim() || chatL || !sel) return;
    const updated = [...msgs, {role:'user',content:inp}];
    setMsgs([...updated, {role:'assistant',content:''}]); setInp(''); setChatL(true);
    try {
      const sys = `You are a grieving family member in a funeral service training simulation.
Persona: ${sel.persona}
Goals the student should achieve: ${sel.goals.join('; ')}
Stay in character at all times. React realistically — warmly to empathetic/clear/compliant responses; confused or distressed to poor ones. Keep responses natural (2–4 sentences max). If the student violates the FTC Funeral Rule or professional ethics, react as a real family member would. Never break character or give hints.`;
      await callAPIStream(sys, updated, (chunk) => {
        setMsgs(p => {
          const next = [...p];
          next[next.length - 1] = {role:'assistant', content: next[next.length - 1].content + chunk};
          return next;
        });
      });
    } catch {
      setMsgs(p => {
        const next = [...p];
        next[next.length - 1] = {role:'assistant', content:'[Connection issue — please try again]'};
        return next;
      });
    }
    setChatL(false);
  };

  const endScen = async () => {
    if (!sel) return;
    setSv('debrief'); setDebL(true);
    if (!msgs.filter(m=>m.role==='user').length) {
      setDeb({empathy:0,clarity:0,compliance:0,strengths:[],improvements:["No responses were recorded."],suggestion:""});
      setDebL(false); return;
    }
    try {
      const t = msgs.map(m=>`${m.role==='user'?'STUDENT':'FAMILY'}: ${m.content}`).join('\n');
      const raw = await callAPI(null, [{role:'user',content:`You are an expert funeral service educator evaluating a student role-play.
Scenario: ${sel.title}. Goals: ${sel.goals.join('; ')}
Transcript:\n${t}
Score 1–5 each: Empathy (acknowledge emotions, create safety, avoid rushing), Clarity (plain language, clear explanations, good pacing), Compliance (FTC Funeral Rule, death cert boundaries, professional ethics).
Respond ONLY in this exact JSON with no extra text:
{"empathy":N,"clarity":N,"compliance":N,"strengths":["specific thing done well","another"],"improvements":["specific thing to improve","another"],"suggestion":"One example of better phrasing they could have used, in quotes"}`}]);
      const parsed = JSON.parse(raw.replace(/```json|```/g,'').trim());
      setDeb(parsed);
      if (!done.includes(sel.id)) setDone(p=>[...p, sel.id]);
    } catch { setDeb({empathy:3,clarity:3,compliance:3,strengths:["Engaged with the scenario"],improvements:["Try again for detailed feedback"],suggestion:""}); }
    setDebL(false);
  };

  const sendAsk = async () => {
    if (!askI.trim() || askL) return;
    const updated = [...askM, {role:'user',content:askI}];
    setAskM([...updated, {role:'assistant',content:''}]); setAskI(''); setAskL(true);
    try {
      const sys = `You are Professor Chen, an expert funeral service educator and licensed funeral director with 25 years of experience. You teach intro-to-funeral-services courses and NBE prep.
Answer student questions clearly and concisely (3–6 sentences). Topics: FTC Funeral Rule, death certificates, embalming, grief counseling, OSHA safety, professional ethics, history of funeral service, NBE Arts and Sciences.
Be warm and encouraging. Always note this is educational only — not legal, medical, or therapeutic advice.`;
      await callAPIStream(sys, updated, (chunk) => {
        setAskM(p => {
          const next = [...p];
          next[next.length - 1] = {role:'assistant', content: next[next.length - 1].content + chunk};
          return next;
        });
      });
    } catch {
      setAskM(p => {
        const next = [...p];
        next[next.length - 1] = {role:'assistant', content:'Connection issue — please try again.'};
        return next;
      });
    }
    setAskL(false);
  };

  const filtCards = sc==='All' ? FLASHCARDS : FLASHCARDS.filter(c=>c.category===sc);
  const filtQs = qf==='All' ? QUIZ : QUIZ.filter(q=>q.cat===qf||q.nbe===qf);
  const submitQuiz = () => { setQSub(true); const s=filtQs.filter(q=>ans[q.id]===q.correct).length; setQHist(p=>[...p,{score:s,total:filtQs.length,filter:qf,pct:Math.round(s/filtQs.length*100)}]); };
  const resetQuiz = () => { setAns({}); setQSub(false); };
  const cats = ['All',...new Set(FLASHCARDS.map(c=>c.category))];

  const card: React.CSSProperties = {background:C.white,borderRadius:'16px',border:`1px solid ${C.border}`,padding:'16px'};
  const H: React.CSSProperties = {fontFamily:"var(--font-playfair), Georgia, serif",fontWeight:700,color:C.navy};
  const B: React.CSSProperties = {fontFamily:"var(--font-dm-sans), system-ui, sans-serif"};
  const badge = (text:string,bg:string,border:string): React.CSSProperties => ({fontSize:'10px',fontWeight:700,color:text,background:bg,border:`1px solid ${border}`,borderRadius:'20px',padding:'2px 8px',display:'inline-block'});
  const btn = (p=true): React.CSSProperties => ({background:p?C.navy:C.white,color:p?C.white:C.navy,border:p?'none':`2px solid ${C.navy}`,borderRadius:'12px',padding:'11px 16px',fontSize:'13px',fontWeight:700,cursor:'pointer',...B});
  const goldBtn: React.CSSProperties = {background:`linear-gradient(135deg,${C.gold},${C.goldLight})`,color:C.navy,border:'none',borderRadius:'12px',padding:'12px 18px',fontSize:'14px',fontWeight:700,cursor:'pointer',...B};
  const TABS = [{id:'home',icon:'⌂',label:'Home'},{id:'scenarios',icon:'◎',label:'Practice'},{id:'study',icon:'◈',label:'Study'},{id:'ask',icon:'⊕',label:'Ask'},{id:'progress',icon:'◉',label:'Progress'}];

  return (
    <div style={{...B,background:C.cream,minHeight:'100vh',maxWidth:'460px',margin:'0 auto'}}>

      {/* HEADER */}
      <div style={{background:`linear-gradient(150deg,${C.navy} 0%,${C.navyLight} 100%)`,padding:'16px 20px 14px',color:C.white}}>
        <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
          <div style={{width:'38px',height:'38px',background:'rgba(201,168,76,0.15)',borderRadius:'10px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'20px'}}>⚘</div>
          <div>
            <h1 style={{...H,fontSize:'17px',margin:0,color:C.white}}>Funeral Service Trainer</h1>
            <p style={{fontSize:'10px',opacity:0.5,margin:0,letterSpacing:'0.05em'}}>Practice · Study · NBE Prep</p>
          </div>
        </div>
      </div>

      <div style={{paddingBottom:'72px'}}>

        {/* HOME */}
        {tab==='home' && (
          <div style={{padding:'20px'}}>
            <div style={{background:`linear-gradient(135deg,${C.gold},${C.goldLight})`,borderRadius:'20px',padding:'22px',marginBottom:'18px'}}>
              <p style={{...H,fontSize:'24px',color:C.navy,margin:'0 0 6px'}}>Ready to practice?</p>
              <p style={{fontSize:'12px',color:C.navy,opacity:0.7,margin:'0 0 14px'}}>{done.length} of {SCENARIOS.length} scenarios · {qHist.length} quizzes taken</p>
              <button onClick={()=>setTab('scenarios')} style={{...btn(false),padding:'10px 18px'}}>Start a Scenario →</button>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px',marginBottom:'18px'}}>
              {[
                {icon:'◎',title:'Role-Play',desc:`${SCENARIOS.length} scenarios`,action:()=>setTab('scenarios')},
                {icon:'◈',title:'Flashcards',desc:`${FLASHCARDS.length} terms`,action:()=>{setTab('study');setSm('flashcard');}},
                {icon:'✎',title:'NBE Quiz',desc:`${QUIZ.length} questions`,action:()=>{setTab('study');setSm('quiz');}},
                {icon:'⊕',title:'Ask Prof.',desc:'AI instructor',action:()=>setTab('ask')},
              ].map((it,i)=>(
                <button key={i} onClick={it.action} style={{...card,textAlign:'left',cursor:'pointer',border:`1px solid ${C.border}`}}>
                  <div style={{fontSize:'22px',color:C.gold,marginBottom:'6px'}}>{it.icon}</div>
                  <div style={{...H,fontSize:'14px'}}>{it.title}</div>
                  <div style={{fontSize:'11px',color:C.textLight,marginTop:'2px'}}>{it.desc}</div>
                </button>
              ))}
            </div>
            <div style={card}>
              <p style={{...H,fontSize:'13px',margin:'0 0 12px'}}>NBE Topic Coverage</p>
              {[{l:'FTC & Legal',p:92},{l:'Embalming (Arts)',p:78},{l:'Sciences',p:72},{l:'Grief & Counseling',p:82},{l:'History & Profession',p:68}].map((it,i)=>(
                <div key={i} style={{marginBottom:i<4?'10px':0}}>
                  <div style={{display:'flex',justifyContent:'space-between',marginBottom:'4px'}}>
                    <span style={{fontSize:'11px',color:C.textMed}}>{it.l}</span>
                    <span style={{fontSize:'11px',color:C.gold,fontWeight:700}}>{it.p}%</span>
                  </div>
                  <div style={{background:C.creamDark,borderRadius:'4px',height:'5px'}}>
                    <div style={{background:`linear-gradient(90deg,${C.gold},${C.goldLight})`,borderRadius:'4px',height:'5px',width:`${it.p}%`}}/>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SCENARIOS */}
        {tab==='scenarios' && (
          <>
            {sv==='library' && (
              <div style={{padding:'20px'}}>
                <h2 style={{...H,fontSize:'22px',margin:'0 0 4px'}}>Scenario Library</h2>
                <p style={{fontSize:'12px',color:C.textLight,margin:'0 0 16px'}}>Practice real family conversations safely</p>
                {SCENARIOS.map(s=>{
                  const cc=CAT_COLORS[s.category]||CAT_COLORS.Arrangement;
                  const isDone=done.includes(s.id);
                  return (
                    <div key={s.id} onClick={()=>startScen(s)} style={{...card,marginBottom:'10px',cursor:'pointer'}}>
                      <div style={{display:'flex',justifyContent:'space-between',marginBottom:'8px'}}>
                        <span style={badge(cc.text,cc.bg,cc.border)}>{s.category}</span>
                        <span style={{fontSize:'10px',fontWeight:700,color:s.difficulty==='Advanced'?C.red:s.difficulty==='Intermediate'?C.orange:C.green}}>{s.difficulty}</span>
                      </div>
                      <p style={{...H,fontSize:'14px',margin:'0 0 2px'}}>{s.title} <span style={{...B,fontSize:'11px',color:C.textLight,fontWeight:400}}>— {s.subtitle}</span></p>
                      <p style={{fontSize:'12px',color:C.textMed,margin:'4px 0 10px',lineHeight:1.5}}>{s.description}</p>
                      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                        <span style={{fontSize:'11px',color:isDone?C.green:C.textLight,fontWeight:isDone?700:400}}>{isDone?'✓ Completed':'○ Not started'}</span>
                        <button style={{...btn(),padding:'6px 14px',fontSize:'12px'}}>Begin →</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            {sv==='prebrief' && sel && (
              <div style={{padding:'20px'}}>
                <button onClick={()=>setSv('library')} style={{background:'none',border:'none',color:C.gold,fontSize:'13px',fontWeight:700,cursor:'pointer',padding:0,marginBottom:'14px',...B}}>← Back</button>
                <div style={{background:C.navy,borderRadius:'20px',padding:'22px',marginBottom:'14px',color:C.white}}>
                  <span style={{fontSize:'10px',color:C.gold,fontWeight:700,letterSpacing:'0.08em',textTransform:'uppercase'}}>{sel.category}</span>
                  <h2 style={{...H,fontSize:'22px',color:C.white,margin:'4px 0 6px'}}>{sel.title}</h2>
                  <p style={{fontSize:'12px',color:'rgba(255,255,255,0.65)',margin:0,lineHeight:1.6}}>{sel.description}</p>
                </div>
                <div style={{...card,marginBottom:'12px'}}>
                  <p style={{...H,fontSize:'11px',color:C.gold,margin:'0 0 10px',letterSpacing:'0.07em',textTransform:'uppercase'}}>Learning Goals</p>
                  {sel.goals.map((g,i)=>(
                    <div key={i} style={{display:'flex',gap:'8px',marginBottom:'6px'}}>
                      <span style={{color:C.gold,fontSize:'12px',flexShrink:0,marginTop:'1px'}}>◆</span>
                      <span style={{fontSize:'12px',color:C.textMed,lineHeight:1.5}}>{g}</span>
                    </div>
                  ))}
                </div>
                <div style={{background:C.orangeBg,borderRadius:'12px',padding:'12px 14px',borderLeft:`3px solid ${C.gold}`,marginBottom:'18px'}}>
                  <p style={{fontSize:'11px',color:C.orange,margin:0,lineHeight:1.5}}><strong>Reminder:</strong> Training simulation only. You are the funeral director. No legal, medical, or financial advice. Lead with empathy, clarity, and compliance.</p>
                </div>
                <button onClick={()=>setSv('roleplay')} style={{...goldBtn,width:'100%',padding:'14px',fontSize:'15px'}}>Begin Scenario →</button>
              </div>
            )}
            {sv==='roleplay' && sel && (
              <div style={{display:'flex',flexDirection:'column',height:'calc(100vh - 130px)'}}>
                <div style={{background:C.navy,padding:'11px 16px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <div>
                    <p style={{fontSize:'9px',color:'rgba(255,255,255,0.4)',margin:0,letterSpacing:'0.06em',textTransform:'uppercase'}}>Active Scenario</p>
                    <p style={{...H,fontSize:'13px',color:C.white,margin:0}}>{sel.title}</p>
                  </div>
                  <button onClick={endScen} style={{background:'rgba(201,168,76,0.15)',color:C.gold,border:`1px solid rgba(201,168,76,0.3)`,borderRadius:'8px',padding:'6px 12px',fontSize:'11px',fontWeight:700,cursor:'pointer',...B}}>End & Debrief</button>
                </div>
                <div style={{flex:1,overflowY:'auto',padding:'16px',display:'flex',flexDirection:'column',gap:'10px',background:C.cream}}>
                  {msgs.map((m,i)=>(
                    <div key={i} style={{display:'flex',justifyContent:m.role==='user'?'flex-end':'flex-start',alignItems:'flex-end',gap:'6px'}}>
                      {m.role==='assistant'&&<div style={{width:'26px',height:'26px',borderRadius:'50%',background:C.creamDark,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'12px',flexShrink:0}}>👤</div>}
                      <div style={{maxWidth:'80%',padding:'10px 13px',borderRadius:m.role==='user'?'14px 14px 3px 14px':'14px 14px 14px 3px',background:m.role==='user'?C.navy:C.white,color:m.role==='user'?C.white:C.text,fontSize:'13px',lineHeight:1.55,boxShadow:'0 1px 4px rgba(0,0,0,0.06)'}}>
                        {m.content}
                      </div>
                    </div>
                  ))}
                  {chatL&&msgs[msgs.length-1]?.role==='user'&&<div style={{display:'flex',alignItems:'flex-end',gap:'6px'}}><div style={{width:'26px',height:'26px',borderRadius:'50%',background:C.creamDark,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'12px'}}>👤</div><div style={{background:C.white,padding:'10px 14px',borderRadius:'14px 14px 14px 3px',fontSize:'13px',color:C.textLight}}>thinking...</div></div>}
                  <div ref={chatEnd}/>
                </div>
                <div style={{padding:'10px 14px',background:C.white,borderTop:`1px solid ${C.border}`,display:'flex',gap:'8px'}}>
                  <textarea value={inp} onChange={e=>setInp(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send();}}} placeholder="Respond as the funeral director..." rows={2} style={{flex:1,border:`1px solid ${C.border}`,borderRadius:'10px',padding:'9px 12px',fontSize:'13px',resize:'none',outline:'none',...B,background:C.cream,color:C.text}}/>
                  <button onClick={send} disabled={chatL||!inp.trim()} style={{background:chatL||!inp.trim()?C.creamDark:C.navy,color:chatL||!inp.trim()?C.textLight:C.white,border:'none',borderRadius:'10px',padding:'0 14px',fontSize:'18px',cursor:chatL||!inp.trim()?'not-allowed':'pointer'}}>↑</button>
                </div>
              </div>
            )}
            {sv==='debrief'&&(
              <div style={{padding:'20px'}}>
                <h2 style={{...H,fontSize:'22px',margin:'0 0 4px'}}>Session Debrief</h2>
                <p style={{fontSize:'12px',color:C.textLight,margin:'0 0 20px'}}>{sel?.title}</p>
                {debL?(<div style={{textAlign:'center',padding:'50px 20px'}}><div style={{fontSize:'40px',marginBottom:'14px'}}>⚘</div><p style={{color:C.textLight,fontSize:'14px'}}>Analyzing your performance...</p></div>)
                :deb&&(
                  <>
                    <div style={{...card,marginBottom:'14px'}}>
                      <p style={{...H,fontSize:'11px',color:C.textLight,textAlign:'center',letterSpacing:'0.07em',textTransform:'uppercase',margin:'0 0 16px'}}>Performance</p>
                      <div style={{display:'flex',justifyContent:'space-around'}}>
                        {[{label:'Empathy',score:deb.empathy,color:'#1A6FAA'},{label:'Clarity',score:deb.clarity,color:C.green},{label:'Compliance',score:deb.compliance,color:C.orange}].map((it,i)=>(
                          <div key={i} style={{textAlign:'center'}}>
                            <div style={{width:'58px',height:'58px',borderRadius:'50%',background:it.color,display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 6px',boxShadow:`0 4px 12px ${it.color}40`}}>
                              <span style={{color:C.white,fontSize:'14px',fontWeight:800,...H}}>{it.score}/5</span>
                            </div>
                            <p style={{fontSize:'11px',color:C.textMed,margin:0,fontWeight:600}}>{it.label}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    {deb.strengths?.length>0&&<div style={{background:C.greenBg,borderRadius:'14px',padding:'14px',marginBottom:'10px',border:`1px solid #B8EDD6`}}><p style={{fontSize:'11px',fontWeight:700,color:C.green,margin:'0 0 8px',textTransform:'uppercase',letterSpacing:'0.06em'}}>✓ What You Did Well</p>{deb.strengths.map((s,i)=><p key={i} style={{fontSize:'12px',color:'#1A5A3A',margin:'0 0 3px',lineHeight:1.5}}>• {s}</p>)}</div>}
                    {deb.improvements?.length>0&&<div style={{background:C.orangeBg,borderRadius:'14px',padding:'14px',marginBottom:'10px',border:`1px solid #F0D0A0`}}><p style={{fontSize:'11px',fontWeight:700,color:C.orange,margin:'0 0 8px',textTransform:'uppercase',letterSpacing:'0.06em'}}>↑ Improve Next Time</p>{deb.improvements.map((s,i)=><p key={i} style={{fontSize:'12px',color:'#7A4000',margin:'0 0 3px',lineHeight:1.5}}>• {s}</p>)}</div>}
                    {deb.suggestion&&<div style={{background:C.blueBg,borderRadius:'14px',padding:'14px',marginBottom:'18px',border:`1px solid #BFCFEE`}}><p style={{fontSize:'11px',fontWeight:700,color:C.blue,margin:'0 0 6px',textTransform:'uppercase',letterSpacing:'0.06em'}}>💬 Better Phrasing</p><p style={{fontSize:'13px',color:C.blue,margin:0,fontStyle:'italic',lineHeight:1.55}}>{deb.suggestion}</p></div>}
                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px'}}>
                      <button onClick={()=>{setMsgs([{role:'assistant',content:sel!.opening}]);setDeb(null);setSv('roleplay');}} style={{...btn(),width:'100%'}}>Try Again</button>
                      <button onClick={()=>{setSv('library');setSel(null);setMsgs([]);setDeb(null);}} style={{...btn(false),width:'100%'}}>All Scenarios</button>
                    </div>
                  </>
                )}
              </div>
            )}
          </>
        )}

        {/* STUDY */}
        {tab==='study'&&(
          <div style={{padding:'20px'}}>
            {sm==='menu'&&(
              <>
                <h2 style={{...H,fontSize:'22px',margin:'0 0 4px'}}>Study Mode</h2>
                <p style={{fontSize:'12px',color:C.textLight,margin:'0 0 18px'}}>Terminology, concepts, and NBE preparation</p>
                {[
                  {icon:'◈',title:'Flashcards',desc:`${FLASHCARDS.length} terms across 6 categories`,sub:'FTC, Embalming, Sciences, Grief + more',action:()=>{setSm('flashcard');setCi(0);setFl(false);setSc('All');}},
                  {icon:'✎',title:'NBE Practice Quiz',desc:`${QUIZ.length} questions · multiple choice`,sub:'Arts (Funeral Directing & Embalming) + Sciences',action:()=>{setSm('quiz');resetQuiz();setQf('All');}},
                ].map((it,i)=>(
                  <div key={i} onClick={it.action} style={{...card,marginBottom:'12px',cursor:'pointer',display:'flex',alignItems:'center',gap:'16px'}}>
                    <div style={{width:'52px',height:'52px',background:'rgba(201,168,76,0.1)',borderRadius:'14px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'24px',color:C.gold,flexShrink:0}}>{it.icon}</div>
                    <div><p style={{...H,fontSize:'15px',margin:'0 0 2px'}}>{it.title}</p><p style={{fontSize:'12px',color:C.textMed,margin:'0 0 2px'}}>{it.desc}</p><p style={{fontSize:'11px',color:C.gold,margin:0,fontWeight:700}}>{it.sub}</p></div>
                  </div>
                ))}
              </>
            )}
            {sm==='flashcard'&&(
              <>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'14px'}}>
                  <button onClick={()=>setSm('menu')} style={{background:'none',border:'none',color:C.gold,fontSize:'13px',fontWeight:700,cursor:'pointer',padding:0,...B}}>← Back</button>
                  <span style={{fontSize:'12px',color:C.textLight}}>{ci+1} / {filtCards.length}</span>
                </div>
                <div style={{display:'flex',gap:'6px',overflowX:'auto',paddingBottom:'10px',marginBottom:'14px'}}>
                  {cats.map(c=><button key={c} onClick={()=>{setSc(c);setCi(0);setFl(false);}} style={{background:sc===c?C.navy:C.white,color:sc===c?C.white:C.textMed,border:`1px solid ${sc===c?C.navy:C.border}`,borderRadius:'20px',padding:'5px 11px',fontSize:'10px',fontWeight:700,cursor:'pointer',whiteSpace:'nowrap',...B}}>{c}</button>)}
                </div>
                {filtCards.length>0&&(
                  <>
                    <div onClick={()=>setFl(!fl)} style={{perspective:'1200px',cursor:'pointer',marginBottom:'16px',height:'230px'}}>
                      <div style={{position:'relative',width:'100%',height:'100%',transformStyle:'preserve-3d',transition:'transform 0.55s cubic-bezier(0.4,0,0.2,1)',transform:fl?'rotateY(180deg)':'rotateY(0deg)'}}>
                        <div style={{position:'absolute',inset:0,backfaceVisibility:'hidden',WebkitBackfaceVisibility:'hidden',background:C.white,borderRadius:'20px',border:`1px solid ${C.border}`,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'24px',boxSizing:'border-box',boxShadow:'0 4px 20px rgba(0,0,0,0.07)'}}>
                          <p style={{fontSize:'10px',fontWeight:700,color:C.gold,margin:'0 0 6px',letterSpacing:'0.08em',textTransform:'uppercase'}}>{filtCards[ci]?.category}{filtCards[ci]?.nbe&&<span style={{marginLeft:'8px',background:'rgba(201,168,76,0.1)',padding:'1px 7px',borderRadius:'8px',color:C.orange}}>NBE</span>}</p>
                          <p style={{...H,fontSize:'21px',textAlign:'center',margin:'4px 0 0',lineHeight:1.3}}>{filtCards[ci]?.term}</p>
                          <p style={{fontSize:'10px',color:C.textLight,margin:'18px 0 0'}}>Tap to reveal →</p>
                        </div>
                        <div style={{position:'absolute',inset:0,backfaceVisibility:'hidden',WebkitBackfaceVisibility:'hidden',transform:'rotateY(180deg)',background:C.navy,borderRadius:'20px',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'22px',boxSizing:'border-box',boxShadow:'0 4px 20px rgba(0,0,0,0.15)'}}>
                          <p style={{fontSize:'10px',fontWeight:700,color:'rgba(201,168,76,0.65)',margin:'0 0 10px',letterSpacing:'0.08em',textTransform:'uppercase'}}>Definition</p>
                          <p style={{fontSize:'13px',color:'rgba(255,255,255,0.9)',textAlign:'center',margin:0,lineHeight:1.65}}>{filtCards[ci]?.definition}</p>
                        </div>
                      </div>
                    </div>
                    <div style={{display:'flex',gap:'10px'}}>
                      <button onClick={()=>{setCi(Math.max(0,ci-1));setFl(false);}} disabled={ci===0} style={{...btn(false),flex:1,opacity:ci===0?0.35:1,cursor:ci===0?'not-allowed':'pointer'}}>← Prev</button>
                      <button onClick={()=>{setCi(Math.min(filtCards.length-1,ci+1));setFl(false);}} disabled={ci===filtCards.length-1} style={{...btn(),flex:1,opacity:ci===filtCards.length-1?0.35:1,cursor:ci===filtCards.length-1?'not-allowed':'pointer'}}>Next →</button>
                    </div>
                  </>
                )}
              </>
            )}
            {sm==='quiz'&&(
              <>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'14px'}}>
                  <button onClick={()=>{setSm('menu');resetQuiz();}} style={{background:'none',border:'none',color:C.gold,fontSize:'13px',fontWeight:700,cursor:'pointer',padding:0,...B}}>← Back</button>
                  {!qSub&&<span style={{fontSize:'12px',color:C.textLight}}>{Object.keys(ans).length} / {filtQs.length} answered</span>}
                </div>
                {!qSub?(
                  <>
                    <div style={{display:'flex',gap:'6px',overflowX:'auto',paddingBottom:'10px',marginBottom:'14px'}}>
                      {['All','Arts','Sciences','FTC & Legal','Embalming','Grief & Counseling'].map(f=><button key={f} onClick={()=>{setQf(f);resetQuiz();}} style={{background:qf===f?C.navy:C.white,color:qf===f?C.white:C.textMed,border:`1px solid ${qf===f?C.navy:C.border}`,borderRadius:'20px',padding:'5px 11px',fontSize:'10px',fontWeight:700,cursor:'pointer',whiteSpace:'nowrap',...B}}>{f}</button>)}
                    </div>
                    {filtQs.map((q,qi)=>(
                      <div key={q.id} style={{...card,marginBottom:'12px'}}>
                        <div style={{display:'flex',gap:'6px',marginBottom:'10px'}}><span style={badge(C.navy,'rgba(27,42,74,0.07)','transparent')}>NBE {q.nbe}</span><span style={badge(C.textLight,'transparent',C.border)}>{q.cat}</span></div>
                        <p style={{fontSize:'13px',fontWeight:600,color:C.text,margin:'0 0 12px',lineHeight:1.55}}>Q{qi+1}. {q.q}</p>
                        {q.opts.map((o,oi)=><button key={oi} onClick={()=>setAns(p=>({...p,[q.id]:oi}))} style={{display:'block',width:'100%',textAlign:'left',background:ans[q.id]===oi?C.blueBg:C.cream,border:`2px solid ${ans[q.id]===oi?'#3B6FCC':'transparent'}`,borderRadius:'10px',padding:'9px 12px',fontSize:'12px',color:C.text,marginBottom:'6px',cursor:'pointer',lineHeight:1.4,...B}}><span style={{fontWeight:700,marginRight:'6px',color:C.gold}}>{['A','B','C','D'][oi]}.</span>{o}</button>)}
                      </div>
                    ))}
                    <button onClick={submitQuiz} disabled={Object.keys(ans).length<filtQs.length} style={{...btn(),width:'100%',fontSize:'14px',padding:'14px',opacity:Object.keys(ans).length<filtQs.length?0.5:1,cursor:Object.keys(ans).length<filtQs.length?'not-allowed':'pointer'}}>{Object.keys(ans).length<filtQs.length?`Answer all ${filtQs.length} to submit`:'Submit Quiz'}</button>
                  </>
                ):(
                  <>
                    <div style={{background:C.navy,borderRadius:'20px',padding:'28px 20px',textAlign:'center',marginBottom:'16px',color:C.white}}>
                      <p style={{fontSize:'11px',opacity:0.55,margin:'0 0 6px',letterSpacing:'0.06em',textTransform:'uppercase'}}>Your Score</p>
                      <p style={{...H,fontSize:'56px',color:C.gold,margin:'0 0 4px',lineHeight:1}}>{filtQs.filter(q=>ans[q.id]===q.correct).length}/{filtQs.length}</p>
                      <p style={{fontSize:'15px',opacity:0.75,margin:0}}>{Math.round(filtQs.filter(q=>ans[q.id]===q.correct).length/filtQs.length*100)}% correct</p>
                    </div>
                    {filtQs.map((q,qi)=>{const ok=ans[q.id]===q.correct;return(<div key={q.id} style={{...card,marginBottom:'10px',borderColor:ok?'#B8EDD6':'#FFD0D0',borderWidth:'2px'}}><div style={{display:'flex',gap:'8px',alignItems:'flex-start',marginBottom:'8px'}}><span style={{fontSize:'14px',flexShrink:0}}>{ok?'✅':'❌'}</span><p style={{fontSize:'12px',fontWeight:600,color:C.text,margin:0,lineHeight:1.5}}>Q{qi+1}. {q.q}</p></div>{!ok&&<p style={{fontSize:'11px',color:C.red,margin:'0 0 5px',background:C.redBg,padding:'5px 9px',borderRadius:'7px'}}>Your answer: {q.opts[ans[q.id]]??'Not answered'}</p>}<p style={{fontSize:'11px',color:C.green,margin:'0 0 6px',background:C.greenBg,padding:'5px 9px',borderRadius:'7px'}}>✓ {q.opts[q.correct]}</p><p style={{fontSize:'11px',color:C.textMed,margin:0,lineHeight:1.5,fontStyle:'italic'}}>{q.exp}</p></div>);})}
                    <button onClick={resetQuiz} style={{...btn(),width:'100%',padding:'14px',fontSize:'14px',marginTop:'4px'}}>Retake Quiz</button>
                  </>
                )}
              </>
            )}
          </div>
        )}

        {/* ASK */}
        {tab==='ask'&&(
          <div style={{display:'flex',flexDirection:'column',height:'calc(100vh - 130px)'}}>
            <div style={{padding:'14px 20px 10px',borderBottom:`1px solid ${C.border}`,background:C.white}}>
              <p style={{...H,fontSize:'16px',margin:'0 0 2px'}}>Ask the Instructor</p>
              <p style={{fontSize:'11px',color:C.textLight,margin:0}}>AI-powered expert — ask anything about funeral service</p>
            </div>
            <div style={{flex:1,overflowY:'auto',padding:'16px',display:'flex',flexDirection:'column',gap:'10px'}}>
              {askM.length===0&&(
                <div style={{display:'flex',flexDirection:'column',gap:'8px',paddingTop:'4px'}}>
                  <div style={{background:C.navy,borderRadius:'16px',padding:'16px',color:C.white,display:'flex',gap:'10px'}}>
                    <span style={{fontSize:'18px',flexShrink:0}}>👨‍🏫</span>
                    <p style={{fontSize:'13px',color:'rgba(255,255,255,0.85)',margin:0,lineHeight:1.55}}>Hello! I'm Professor Chen. Ask me anything — FTC Funeral Rule, embalming, NBE prep, grief counseling, death certificates, OSHA... I'm here to help you succeed.</p>
                  </div>
                  <p style={{fontSize:'11px',color:C.textLight,textAlign:'center',margin:'4px 0'}}>Try asking:</p>
                  {["What's the difference between rigor mortis and livor mortis?","When exactly must I give a family the GPL?","What does the medical certifier complete on a death certificate?"].map((q,i)=><button key={i} onClick={()=>setAskI(q)} style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:'12px',padding:'10px 14px',fontSize:'12px',color:C.navy,cursor:'pointer',textAlign:'left',...B}}>"{q}"</button>)}
                </div>
              )}
              {askM.map((m,i)=>(
                <div key={i} style={{display:'flex',justifyContent:m.role==='user'?'flex-end':'flex-start',alignItems:'flex-end',gap:'8px'}}>
                  {m.role==='assistant'&&<span style={{fontSize:'16px',flexShrink:0,marginBottom:'2px'}}>👨‍🏫</span>}
                  <div style={{maxWidth:'82%',padding:'10px 13px',borderRadius:m.role==='user'?'14px 14px 3px 14px':'14px 14px 14px 3px',background:m.role==='user'?C.navy:C.white,color:m.role==='user'?C.white:C.text,fontSize:'13px',lineHeight:1.55,boxShadow:'0 1px 4px rgba(0,0,0,0.06)'}}>{m.content}</div>
                </div>
              ))}
              {askL&&askM[askM.length-1]?.role==='user'&&<div style={{display:'flex',gap:'8px',alignItems:'flex-end'}}><span style={{fontSize:'16px'}}>👨‍🏫</span><div style={{background:C.white,padding:'10px 14px',borderRadius:'14px 14px 14px 3px',fontSize:'13px',color:C.textLight}}>thinking...</div></div>}
              <div ref={askEnd}/>
            </div>
            <div style={{padding:'10px 14px',background:C.white,borderTop:`1px solid ${C.border}`,display:'flex',gap:'8px'}}>
              <input value={askI} onChange={e=>setAskI(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')sendAsk();}} placeholder="Ask anything about funeral service..." style={{flex:1,border:`1px solid ${C.border}`,borderRadius:'10px',padding:'10px 12px',fontSize:'13px',outline:'none',...B,background:C.cream,color:C.text}}/>
              <button onClick={sendAsk} disabled={askL||!askI.trim()} style={{background:askL||!askI.trim()?C.creamDark:C.gold,color:askL||!askI.trim()?C.textLight:C.navy,border:'none',borderRadius:'10px',padding:'0 14px',fontSize:'18px',fontWeight:700,cursor:askL||!askI.trim()?'not-allowed':'pointer'}}>↑</button>
            </div>
          </div>
        )}

        {/* PROGRESS */}
        {tab==='progress'&&(
          <div style={{padding:'20px'}}>
            <h2 style={{...H,fontSize:'22px',margin:'0 0 16px'}}>Your Progress</h2>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px',marginBottom:'16px'}}>
              {[{icon:'◎',label:'Scenarios Done',value:done.length,total:SCENARIOS.length},{icon:'✎',label:'Quizzes Taken',value:qHist.length,total:null}].map((s,i)=>(
                <div key={i} style={{...card,textAlign:'center'}}>
                  <div style={{fontSize:'22px',color:C.gold,marginBottom:'6px'}}>{s.icon}</div>
                  <div style={{...H,fontSize:'34px',lineHeight:1}}>{s.value}</div>
                  {s.total&&<div style={{fontSize:'11px',color:C.textLight,marginTop:'2px'}}>of {s.total} total</div>}
                  <div style={{fontSize:'11px',color:C.textLight,marginTop:'4px'}}>{s.label}</div>
                </div>
              ))}
            </div>
            {qHist.length>0&&(
              <div style={{...card,marginBottom:'14px'}}>
                <p style={{...H,fontSize:'13px',margin:'0 0 10px'}}>Quiz History</p>
                {qHist.map((h,i)=>(
                  <div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',paddingBottom:'8px',marginBottom:'8px',borderBottom:i<qHist.length-1?`1px solid ${C.border}`:'none'}}>
                    <div><p style={{fontSize:'12px',fontWeight:600,color:C.text,margin:'0 0 2px'}}>{h.filter} Quiz</p><p style={{fontSize:'11px',color:C.textLight,margin:0}}>{h.score}/{h.total} correct</p></div>
                    <span style={{...H,fontSize:'18px',color:h.pct>=80?C.green:h.pct>=60?C.orange:C.red}}>{h.pct}%</span>
                  </div>
                ))}
              </div>
            )}
            <div style={card}>
              <p style={{...H,fontSize:'13px',margin:'0 0 10px'}}>Scenarios</p>
              {SCENARIOS.map((s,i)=>{const isDone=done.includes(s.id);return(<div key={s.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',paddingBottom:'8px',marginBottom:'8px',borderBottom:i<SCENARIOS.length-1?`1px solid ${C.border}`:'none'}}><div><p style={{fontSize:'12px',fontWeight:600,color:C.text,margin:'0 0 2px'}}>{s.title}</p><p style={{fontSize:'11px',color:C.textLight,margin:0}}>{s.category} · {s.difficulty}</p></div><span style={{fontSize:'12px',fontWeight:700,color:isDone?C.green:C.textLight}}>{isDone?'✓ Done':'○'}</span></div>);})}
            </div>
          </div>
        )}
      </div>

      {/* TAB BAR */}
      <div style={{position:'fixed',bottom:0,left:'50%',transform:'translateX(-50%)',width:'100%',maxWidth:'460px',background:C.white,borderTop:`1px solid ${C.border}`,display:'flex',padding:'8px 0 12px',zIndex:100}}>
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>{setTab(t.id);if(t.id==='scenarios')setSv('library');if(t.id==='study')setSm('menu');}} style={{flex:1,background:'none',border:'none',cursor:'pointer',display:'flex',flexDirection:'column',alignItems:'center',gap:'2px',padding:'3px 0',...B}}>
            <span style={{fontSize:'16px',color:tab===t.id?C.gold:C.textLight}}>{t.icon}</span>
            <span style={{fontSize:'9px',fontWeight:tab===t.id?700:500,color:tab===t.id?C.navy:C.textLight,letterSpacing:'0.03em'}}>{t.label}</span>
            {tab===t.id&&<div style={{width:'4px',height:'4px',borderRadius:'50%',background:C.gold}}/>}
          </button>
        ))}
      </div>
    </div>
  );
}
