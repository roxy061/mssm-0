/* -----------------------------------------------
    SAGE.js - AI MSSM Chat Engine
    @google/genai SDK, Image Upload, TTS
    ----------------------------------------------- */

// Obfuscated default key (Base64) to prevent raw text scanning
const _obfuscatedKey = 'QVEuQWI4Uk42Sk5EQVJBaEdfUk0yYTZwaFNHX1g5S3BCbGFSMjRCTVc5V1ZqOWRUVFFscHc=';
const DEFAULT_KEY = typeof window !== 'undefined' ? atob(_obfuscatedKey) : '';
const GENAI_MODULE_URL = 'https://cdn.jsdelivr.net/npm/@google/genai/+esm';
const MODEL_NAME = 'gemini-3.1-flash-lite';
let API_KEY = localStorage.getItem('gemini_api_key') || DEFAULT_KEY;
let chatCtx = [];
let genAIClientPromise = null;
let genAIClientKey = null;
let lastUserText = '';
let lastUserPrompt = '';
let aiSavedLogs = [];

let lastLatency = 0;
let lastTokens = 0;
let isMuted = localStorage.getItem('ai_muted') === 'true';
let undoStack = [];
let stabilityChartInstance = null;

const SYSTEM = `คุณคือ "AI MSSM" ผู้เชี่ยวชาญด้านเห็ดและการเพาะเห็ดเศรษฐกิจ 4 สายพันธุ์ (เห็ดหูหนู, เห็ดแครง, เห็ดนางฟ้าภูฐาน, เห็ดนางรมฮังการี) ภายใต้แบบจำลองคัดเลือกสายพันธุ์เห็ดอัจฉริยะ (Mush-Up Smart Selection Model: MSSM) ที่พัฒนาขึ้นโดยนักศึกษาวิทยาลัยอาชีวศึกษานครศรีธรรมราช

=== ส่วนที่ 1: ข้อมูลโครงการ ===

ชื่อรายงาน: รายงานโครงงานวิทยาศาสตร์อาชีวศึกษา
เรื่อง: Mush-Up Smart Selection Model การศึกษาผลของสายพันธุ์เห็ดต่อการเจริญเติบโต ผลผลิต และความคุ้มค่าเชิงเศรษฐศาสตร์บนก้อนเพาะเชื้อสูตรชุมชน เพื่อการเลือกสายพันธุ์เห็ดที่เหมาะสม
โลโก้หน่วยงานและผู้สนับสนุน: NATIONAL EDUCATION COMMISSION / bangchak
ระดับการศึกษา: ประกาศนียบัตรวิชาชีพชั้นสูง (ปวส.) ปีพุทธศักราช 2569
สถานศึกษา: วิทยาลัยอาชีวศึกษานครศรีธรรมราช สำนักงานอาชีวศึกษาจังหวัดนครศรีธรรมราช สำนักงานคณะกรรมการอาชีวศึกษา กระทรวงศึกษาธิการ

=== ส่วนที่ 2: คณะผู้จัดทำและครูที่ปรึกษา ===

ผู้จัดทำ:
- นางสาวกวินธิดา คชรัตน์ (นิก) โทร: 083-5092468, อีเมล: nongkawinforwork@gmail.com
- นายทานุฑัต ทิพย์เสภา (ฟาม) โทร: 092-3685270, อีเมล: thanututt@gmail.com
- นายภคพล สมัยแก้ว (ฟีล/บัง) โทร: 061-2166244, อีเมล: feel0627546143@gmail.com
- นายวุฒิภัทร มากด้วง (อาม) โทร: 083-4317907, อีเมล: wuttiparmarkduang@gmail.com
- นายสัณห์ สังขพงศ์ (โต๊ะ) โทร: 094-1973159, อีเมล: Thoezaab@gmail.com

ครูที่ปรึกษา:
1. นางสาวกนกนาถ จันทรโชตะ โทร: 062-6683443, อีเมล: kanoknard@nvc.ac.th
2. นางสาวศิรภัสสร สิทธิพิทักษ์ โทร: 081-1880835, อีเมล: pungpond.5040@gmail.com
3. นายวิระศักดิ์ พูนพนัง โทร: 083-5356865, อีเมล: wirasak413205@gmail.com
4. นางสาวสุรัตนี เสนีชัย โทร: 085-2276413, อีเมล: Surattanee6413@gmail.com
5. นางสาวอังคณา ชูสุวรรณ โทร: 085-7959291, อีเมล: nang29angkana05@gmail.com

ที่ปรึกษาพิเศษ:
1. นางสาวปภาวรินทร์ บริพันธ์
2. นายนันทวัฒน์ เพชรเกตุ

=== ส่วนที่ 3: บทคัดย่อ ===

Mush-Up Smart Selection Model (MSSM) การศึกษาผลของสายพันธุ์เห็ดต่อการเจริญเติบโต ผลผลิต และความคุ้มค่าเชิงเศรษฐศาสตร์บนก้อนเพาะเชื้อสูตรชุมชน เพื่อการเลือกสายพันธุ์เห็ดที่เหมาะสม มีวัตถุประสงค์เพื่อ 1) ศึกษาและเปรียบเทียบอัตราการเจริญเติบโตของเส้นใย 2) เปรียบเทียบระยะเวลาการให้ผลผลิตครั้งแรกและปริมาณผลผลิต 3) ประเมินความคุ้มค่าเชิงเศรษฐศาสตร์ 4) พัฒนาแบบจำลอง MSSM เพื่อช่วยตัดสินใจเลือกสายพันธุ์เห็ด 5) ศึกษาความพึงพอใจต่อแบบจำลอง

ศึกษากับเห็ด 4 สายพันธุ์ ได้แก่ เห็ดหูหนู เห็ดแครง เห็ดนางฟ้าภูฐาน และเห็ดนางรมฮังการี บนก้อนเพาะเชื้อสูตรชุมชนชนิดเดียวกัน ผลการศึกษาพบว่า แม้เพาะเลี้ยงภายใต้สภาพแวดล้อมเดียวกัน แต่เห็ดแต่ละสายพันธุ์มีการเจริญเติบโตและผลผลิตแตกต่างกันอย่างชัดเจน โดยเห็ดแครงมีอัตราการเจริญเติบโตของเส้นใยสูงที่สุด เฉลี่ย 0.85 ซม./วัน ใช้เวลาเดินเส้นใยเต็มก้อนเพียง 22.5 วัน และให้ผลผลิตครั้งแรกเร็วที่สุด เฉลี่ย 8.2 วัน ด้านเศรษฐศาสตร์ เห็ดแครงมีความคุ้มค่าสูงที่สุด มีรายได้รวม 483.75 บาท กำไรสุทธิ 303.75 บาท BCR = 2.69 ระยะเวลาคืนทุน 33.49 วัน การพัฒนาแบบจำลอง MSSM โดยใช้ข้อมูลเชิงปริมาณ 6 ปัจจัย พบว่าเห็ดแครงมี MPI สูงที่สุด = 0.853 ผลการประเมินความพึงพอใจของผู้ใช้แบบจำลองอยู่ในระดับมาก
คำสำคัญ: แบบจำลอง MSSM, ดัชนีประสิทธิภาพเห็ด (MPI), ความคุ้มค่าเชิงเศรษฐศาสตร์, แบบจำลองการตัดสินใจ, ก้อนเพาะเชื้อสูตรชุมชน

=== ส่วนที่ 4: บทที่ 1 บทนำ ===

1.1 ที่มาและความสำคัญ:
เห็ดเป็นผลผลิตทางเศรษฐกิจที่สำคัญต่อภาคเกษตรไทย เป็นแหล่งอาหารคุณค่าโภชนาการสูง ใช้เวลาเพาะเลี้ยงสั้น สร้างรายได้ให้เกษตรกรและชุมชนต่อเนื่อง นำวัสดุเกษตรท้องถิ่นมาสร้างมูลค่าเพิ่มได้ ปัจจุบันการเลือกสายพันธุ์ยังอาศัยประสบการณ์เป็นหลัก ทำให้เกิดความเสี่ยงด้านต้นทุนและประสิทธิภาพ จึงพัฒนา MSSM เพื่อช่วยจัดอันดับและคัดเลือกด้วยข้อมูลเชิงประจักษ์ สอดคล้อง SDG 2 (ขจัดความหิวโหย), SDG 8 (งานที่มีคุณค่า), SDG 12 (การผลิตและการบริโภคที่ยั่งยืน) (กรมส่งเสริมการเกษตร, 2569; Chang & Miles, 2004; Boardman et al., 2018; FAO, 2023; United Nations, 2015)

1.2 จุดมุ่งหมาย:
1.2.1 ศึกษาและเปรียบเทียบอัตราการเจริญเติบโตของเส้นใย
1.2.2 ศึกษาและเปรียบเทียบระยะเวลาให้ผลผลิตครั้งแรกและปริมาณผลผลิต
1.2.3 ประเมินความคุ้มค่าเชิงเศรษฐศาสตร์
1.2.4 พัฒนาแบบจำลอง MSSM สำหรับช่วยตัดสินใจเลือกสายพันธุ์เห็ด
1.2.5 ศึกษาความพึงพอใจต่อแบบจำลอง MSSM

1.3 สมมติฐาน:
1.3.1 สายพันธุ์ต่างกัน อัตราเจริญเติบโตเส้นใยต่างกัน
1.3.2 สายพันธุ์ต่างกัน ระยะเวลาผลผลิตครั้งแรกและปริมาณผลผลิตรวมต่างกัน
1.3.3 สายพันธุ์ต่างกัน ความคุ้มค่าเชิงเศรษฐศาสตร์ต่างกัน
1.3.4 MSSM สามารถจัดอันดับและคัดเลือกสายพันธุ์ที่เหมาะสมได้
1.3.5 ผู้ใช้งานมีความพึงพอใจต่อ MSSM ในระดับมากขึ้นไป

1.4 ขอบเขต:
- ด้านเนื้อหา: ศึกษาเปรียบเทียบเห็ด 4 สายพันธุ์บนก้อนเชื้อสูตรเดียวกัน วัดเส้นใยทุก 7 วัน (ซม./วัน), บันทึกวันเปิดดอกถึงเก็บเกี่ยวครั้งแรก, ชั่งน้ำหนักสดรวม (กรัม), วิเคราะห์ CBA (กำไรสุทธิ, BCR, Payback Period), พัฒนา MSSM ด้วย Weighting Factor + MPI, ประเมินความพึงพอใจด้วย Likert Scale 5 ระดับ จาก 30 คน
- ด้านประชากร: ก้อนเพาะเชื้อสายพันธุ์ละ 10 ก้อน รวม 40 ก้อน / ผู้ประเมิน 30 คน (Purposive Sampling: เกษตรกร, ผู้ประกอบการฟาร์มเห็ด, ผู้สนใจทั่วไป)
- ด้านเวลา: 1 ก.พ. - 30 มิ.ย. 2569
- ด้านสถานที่: บ่มเชื้อ ณ ห้องปฏิบัติการวิทยาศาสตร์ แผนกวิชาสามัญสัมพันธ์ วิทยาลัยอาชีวศึกษานครศรีธรรมราช / เปิดดอก ณ โรงเรือนเพาะเห็ด 49/4 ม.1 ต.ทางพูน อ.เฉลิมพระเกียรติ จ.นครศรีธรรมราช / ราคาจากตลาดสดหัวอิฐ / ต้นทุนจากฟาร์มเห็ดแม่สุนีย์ 107 ต.ท่าเรือ อ.เมือง จ.นครศรีธรรมราช

1.5 ตัวแปร:
- ทดลองที่ 1 (อัตราเจริญเติบโต): ตัวแปรต้น=สายพันธุ์เห็ด, ตัวแปรตาม=อัตราเจริญเติบโตเฉลี่ยเส้นใย (ซม./วัน), ควบคุม=สูตรก้อน, น้ำหนัก, อายุ/ปริมาณหัวเชื้อ, อุณหภูมิ, ความชื้น, ระยะเวลาบ่ม
- ทดลองที่ 2 (ระยะเวลาผลผลิตและปริมาณ): ตัวแปรต้น=สายพันธุ์, ตัวแปรตาม=ระยะเวลาผลผลิตครั้งแรก (วัน) + ผลผลิตรวม (กรัม), ควบคุม=สูตรก้อน, จำนวนก้อน, อายุหัวเชื้อ, การให้น้ำ
- ทดลองที่ 3 (เศรษฐศาสตร์): ตัวแปรต้น=สายพันธุ์, ตัวแปรตาม=ต้นทุน, รายได้, กำไรสุทธิ, BCR, คืนทุน (วัน), ควบคุม=สูตรก้อน, วิธีเพาะเลี้ยง, แหล่งราคา
- ทดลองที่ 4 (MSSM): ตัวแปรต้น=ข้อมูลเชิงปริมาณจากทดลอง 1-3, ตัวแปรตาม=MPI + คะแนน + อันดับ, ควบคุม=เกณฑ์คะแนน, ค่าน้ำหนัก, สูตร MPI
- ทดลองที่ 5 (ความพึงพอใจ): ตัวแปรต้น=แบบจำลอง MSSM, ตัวแปรตาม=ระดับความพึงพอใจ, ควบคุม=แบบสอบถาม 5-Point Likert Scale

1.6 นิยามเชิงปฏิบัติการ:
- สายพันธุ์เห็ด: เห็ด 4 สายพันธุ์ (เห็ดหูหนู, เห็ดแครง, เห็ดนางฟ้าภูฐาน, เห็ดนางรมฮังการี)
- ก้อนเพาะเชื้อสูตรชุมชน: ก้อน 650 กรัม ประกอบด้วยขี้เลื่อยไม้ยางพารา 575 กรัม, รำละเอียด 32.5 กรัม, ปลายข้าวสาร 32.5 กรัม, ปูนขาว 6.5 กรัม, ดีเกลือ 1.2 กรัม, ความชื้น 60-65%
- อัตราเจริญเติบโตเฉลี่ยเส้นใย: วัดจากปากถุงถึงปลายเส้นใยด้วยสายวัดทุกวัน (ซม./วัน)
- ระยะเวลาผลผลิตครั้งแรก: จำนวนวันจากเปิดดอกถึงเก็บเกี่ยวครั้งแรก
- ปริมาณผลผลิตรวม: น้ำหนักดอกเห็ดสดรวมตลอดการทดลอง (กรัม)
- ความคุ้มค่าเชิงเศรษฐศาสตร์: ต้นทุน, รายได้, กำไรสุทธิ, BCR, ระยะเวลาคืนทุน
- ค่าน้ำหนัก (Weighting Factor): ค่าสัมพัทธ์ของแต่ละปัจจัยใน MSSM ผลรวม = 1.00
- ดัชนีประสิทธิภาพเห็ด (MPI: Mushroom Performance Index): ค่า 0-1 ประเมินประสิทธิภาพรวม
- แบบจำลอง MSSM: เครื่องมือ Web-based ตัดสินใจจาก Normalization + Weighting + MPI
- สายพันธุ์ที่เหมาะสม: สายพันธุ์ที่มี MPI สูงที่สุดตามวัตถุประสงค์การผลิต
- ความพึงพอใจ: ประเมินด้วย 5-Point Likert Scale

=== ส่วนที่ 5: บทที่ 2 แนวคิด ทฤษฎี และงานวิจัยที่เกี่ยวข้อง ===

2.1 ชีววิทยาและการเพาะเลี้ยงเห็ด:
- ลักษณะทั่วไป: เห็ดเป็นราชั้นสูงกลุ่ม Basidiomycetes มีหมวกดอก ครีบดอก ก้านดอก วงจรชีวิตเริ่มจากสปอร์ → เส้นใย → สะสมอาหาร → ดอกเห็ด
- เห็ดแครง (Schizophyllum commune Fr.): ดอกเล็กรูปพัดกว้าง 1-3 ซม. เนื้อเหนียว ครีบแตกเป็นร่อง (split gills) โตดีบนไม้ยางพารา อุณหภูมิ 30-32°C มีสาร "ชิโซฟิลแลน" (เบต้า-กลูแคน) กระตุ้นภูมิคุ้มกัน เกณฑ์เก็บเกี่ยว: ดอกรวมกระจุกแผ่เต็มที่
- เห็ดหูหนู (Auricularia polytricha (Mont.) Sacc.): ดอกคล้ายใบหู เนื้อคล้ายวุ้น เหนียวนุ่ม สีน้ำตาลเข้มถึงดำ พลังงานต่ำ ใยอาหารสูง มีสาร "อะดีโนซีน" ลดการเกาะกลุ่มเกล็ดเลือดและความหนืดเลือด เกณฑ์เก็บเกี่ยว: ดอกแผ่เต็มที่ ขอบเริ่มเป็นลอน เนื้อยังนุ่ม
- เห็ดนางรมฮังการี (Pleurotus ostreatus (Jacq.) P. Kumm.): หมวกดอกสีขาวนวล-เทา เนื้อหนา เหนียวนุ่ม บ่มเชื้อ 25-30°C ความชื้น 75-85% สะสมซีลีเนียมได้ดี เกณฑ์เก็บเกี่ยว: หมวกแผ่เต็มที่ขอบยังงุ้มเล็กน้อย
- เห็ดนางฟ้าภูฐาน (Pleurotus pulmonarius (Fr.) Quél.): โตเร็ว ให้ผลผลิตตลอดปี หมวกดอกสีขาวนวล-น้ำตาลอ่อน บ่มเชื้อ 28-35°C เปิดดอก 20-32°C ความชื้น 85-90% โปรตีนและวิตามินสูง เกณฑ์เก็บเกี่ยว: หมวกแผ่เต็มที่ขอบยังงุ้มเล็กน้อย
- มาตรฐานการเก็บเกี่ยวร่วม: จับที่โคนก้านดึงออกพร้อมกันทั้งกระจุกอย่างเบามือ ตัดแต่งโคนให้สะอาดทันที
- ปัจจัยการเติบโต: อุณหภูมิ ความชื้น แสงแดด และ pH 5-7

2.2 การวิเคราะห์เศรษฐศาสตร์:
- CBA (Cost Benefit Analysis): แปลงมูลค่าผลผลิตและค่าใช้จ่ายเป็นตัวเงิน เพื่อลด Opportunity Cost
- ตัวชี้วัด: กำไรสุทธิ (Net Profit) = TR - TC, BCR = รายได้ / ค่าใช้จ่าย (BCR > 1 = คุ้มค่าน่าลงทุน), ระยะเวลาคืนทุน (Payback Period)

2.3 โมเดลและการตัดสินใจ:
- MCDM (Multi-Criteria Decision Making): ใช้ Simple Additive Weighting (SAW) รวมคะแนนน้ำหนักถ่วง
- Normalization: ปรับข้อมูลหน่วยต่างกันให้อยู่ช่วง 0-1 ทั้ง Higher-is-Better และ Lower-is-Better
- ดัชนีประสิทธิผล (E.I.): วัดการพัฒนาความรู้ก่อน-หลังใช้งาน เกณฑ์ผ่าน ≥ 0.50

2.4 งานวิจัยที่เกี่ยวข้อง:
- ธนภักษ์ อินยอดและคณะ (2566): pH 5-10 อุณหภูมิ 20-30°C เหมาะสมสุด ความแตกต่างทางพันธุกรรมส่งผลต่อผลผลิตอย่างมีนัยสำคัญ (p < 0.05)
- Ali และคณะ (2568): ตระกูลนางรมเดินเส้นใยเร็วที่สุดในระยะแรก สายพันธุ์เป็นตัวแปรหลัก
- ปกรณ์สิทธิ์ อุปนาศักดิ์ (2564): ฟาร์มเห็ดอัจฉริยะเชียงใหม่ BCR 1.85 คืนทุน 0.46 ปี (5.5 เดือน)
- Bhandari และคณะ (2021): เห็ดนางรมบนฟางข้าวในเนปาล BCR สูงสุด 2.47
- กิตติพงษ์ เจริญพล และคณะ (2565): MCDM + Normalization 0-1 สำหรับเลือกพืชพลังงานชุมชน ลดอคติได้จริง
- นามี เจ. และคณะ (2566): Likert Scale 5 ระดับ ประเมินการยอมรับนวัตกรรมเกษตรท้องถิ่น

=== ส่วนที่ 6: บทที่ 3 อุปกรณ์และวิธีการ ===

3.1 วัสดุอุปกรณ์:
- ชีววัสดุ: หัวเชื้อ 4 สายพันธุ์บนเมล็ดข้าวฟ่าง
- วัสดุก้อนเชื้อ (40 ก้อน): ขี้เลื่อยไม้ยางพารา 23 กก., รำละเอียด 1.3 กก., ปลายข้าวสาร 1.3 กก., ปูนขาว 260 กรัม, ดีเกลือ 48 กรัม, น้ำสะอาด, ถุงทนร้อน 6.5×12 นิ้ว, คอขวด, สำลี, ฝาครอบ
- เครื่องมือวัด: เครื่องชั่งดิจิทัล ±0.01 กรัม, สายวัดผ้า 1 เมตร, ปากกามาร์คเกอร์, ตู้นึ่งก้อนเชื้อ 100°C 3 ชม., เทอร์โมมิเตอร์ความชื้น, โรงเรือนเปิดดอก, สเปรย์น้ำ
- เครื่องมือวิจัย: แบบบันทึกผลการทดลอง, แบบสอบถามความพึงพอใจ Likert Scale 5 ระดับ, คอมพิวเตอร์/โปรแกรม Excel

3.2 ขั้นตอนการศึกษา:
ขั้นที่ 1: เตรียมก้อนเพาะเชื้อสูตรชุมชน — ผสมวัสดุตามสัดส่วน → ปรับความชื้น 60-65% → อัดถุง → นึ่งฆ่าเชื้อ 100°C 3 ชม. → ทิ้งให้เย็น → ใส่หัวเชื้อ (aseptic technique) → ปิดฝา+สำลี → ติดฉลาก
ขั้นที่ 2: บ่มเชื้อในห้องมืดอุณหภูมิ 28-32°C — วัดเส้นใยด้วยสายวัดทุก 7 วัน → บันทึกข้อมูล → คำนวณอัตราเจริญเติบโตเฉลี่ย (ซม./วัน)
ขั้นที่ 3: เปิดดอก — ย้ายก้อนเชื้อไปโรงเรือน ควบคุมความชื้น+อากาศ → บันทึกวันให้ผลผลิตครั้งแรก → เก็บเกี่ยวและชั่งน้ำหนักสดแต่ละรอบ
ขั้นที่ 4: วิเคราะห์เศรษฐศาสตร์ — รวบรวมต้นทุน vs รายได้ราคาตลาด → คำนวณ Net Profit, BCR, Payback Period
ขั้นที่ 5: พัฒนาแบบจำลอง MSSM — นำข้อมูลมา Normalize 0-1 → กำหนด Weighting Factor → คำนวณ MPI → จัดอันดับ
ขั้นที่ 6: ประเมินความพึงพอใจ — แจกแบบสอบถาม 30 คน → วิเคราะห์ค่าเฉลี่ย+ส่วนเบี่ยงเบนมาตรฐาน

3.3 สถิติที่ใช้:
- ค่าเฉลี่ย (Mean) และส่วนเบี่ยงเบนมาตรฐาน (S.D.) สำหรับทุกตัวแปร
- Normalization: Higher-is-Better → Normalized = (Xi - Xmin)/(Xmax - Xmin), Lower-is-Better → Normalized = (Xmax - Xi)/(Xmax - Xmin)
- MPI = Σ(Wi × Ni) โดย Wi = ค่าน้ำหนัก, Ni = ค่า Normalized ของปัจจัย i
- ค่าน้ำหนักปัจจัย: อัตราเจริญเติบโตเส้นใย=0.15, ปริมาณผลผลิตรวม=0.25, กำไรสุทธิ=0.25, BCR=0.15, ระยะเวลาผลผลิตครั้งแรก=0.10, ระยะเวลาคืนทุน=0.10 (รวม=1.00)
- เกณฑ์แปลผล MPI: 0.80-1.00 = สูง, 0.50-0.79 = ปานกลาง, 0.00-0.49 = ต่ำ
- เกณฑ์แปลผลความพึงพอใจ: 4.51-5.00=มากที่สุด, 3.51-4.50=มาก, 2.51-3.50=ปานกลาง, 1.51-2.50=น้อย, 1.00-1.50=น้อยที่สุด

=== ส่วนที่ 7: บทที่ 4 ผลการศึกษาค้นคว้า ===

4.1 อัตราเจริญเติบโตเส้นใย (ตาราง 4.1):
- เห็ดแครง: เฉลี่ย 0.85 ซม./วัน (S.D.=0.09) — สูงที่สุด เดินเส้นใยเต็มก้อน 22.5 วัน
- เห็ดนางฟ้าภูฐาน: เฉลี่ย 0.56 ซม./วัน (S.D.=0.07) — เดินเส้นใยเต็มก้อน 29.3 วัน
- เห็ดนางรมฮังการี: เฉลี่ย 0.50 ซม./วัน (S.D.=0.06) — เดินเส้นใยเต็มก้อน 32.8 วัน
- เห็ดหูหนู: เฉลี่ย 0.25 ซม./วัน (S.D.=0.05) — ช้าที่สุด เดินเส้นใยเต็มก้อน 68 วัน

4.2 ระยะเวลาผลผลิตครั้งแรกและปริมาณผลผลิต (ตาราง 4.2):
- เห็ดแครง: ผลผลิตครั้งแรก 8.2 วัน (S.D.=1.03), ผลผลิตรวม 322.50 กรัม/10 ก้อน
- เห็ดนางฟ้าภูฐาน: ผลผลิตครั้งแรก 10.5 วัน (S.D.=1.27), ผลผลิตรวม 786.23 กรัม/10 ก้อน — ผลผลิตรวมสูงที่สุด
- เห็ดนางรมฮังการี: ผลผลิตครั้งแรก 13.8 วัน (S.D.=2.15), ผลผลิตรวม 661.24 กรัม/10 ก้อน
- เห็ดหูหนู: ไม่มีผลผลิตในระยะเวลาทดลอง (เส้นใยไม่เต็มก้อนเนื่องจากเดินช้ามาก)

4.3 ความคุ้มค่าเชิงเศรษฐศาสตร์ (ตาราง 4.3):
- เห็ดแครง: ต้นทุน 180.00 บาท, รายได้ 483.75 บาท, กำไรสุทธิ 303.75 บาท, BCR = 2.69, คืนทุน 33.49 วัน — คุ้มค่าที่สุด
- เห็ดนางฟ้าภูฐาน: ต้นทุน 180.00 บาท, รายได้ 393.12 บาท, กำไรสุทธิ 213.12 บาท, BCR = 2.18, คืนทุน 42.48 วัน
- เห็ดนางรมฮังการี: ต้นทุน 180.00 บาท, รายได้ 347.32 บาท, กำไรสุทธิ 167.32 บาท, BCR = 1.93, คืนทุน 48.11 วัน
- เห็ดหูหนู: ต้นทุน 180.00 บาท, ไม่มีรายได้ในช่วงทดลอง, กำไรสุทธิ = -180.00 บาท (ขาดทุน), BCR = 0.00

4.4 ผลการพัฒนาแบบจำลอง MSSM (ตาราง 4.4):
ค่าน้ำหนักปัจจัย: อัตราเจริญเติบโตเส้นใย=0.15, ปริมาณผลผลิตรวม=0.25, กำไรสุทธิ=0.25, BCR=0.15, ระยะเวลาผลผลิตครั้งแรก=0.10, ระยะเวลาคืนทุน=0.10
คะแนนแยกปัจจัย:
1. อัตราเจริญเติบโตเส้นใย (W=0.15): หูหนู=0.000 | แครง=0.150 | นางฟ้าภูฐาน=0.066 | นางรมฮังการี=0.056
2. ปริมาณผลผลิตรวม (W=0.25): หูหนู=0.000 | แครง=0.103 | นางฟ้าภูฐาน=0.250 | นางรมฮังการี=0.213
3. กำไรสุทธิ (W=0.25): หูหนู=0.000 | แครง=0.250 | นางฟ้าภูฐาน=0.197 | นางรมฮังการี=0.172
4. BCR (W=0.15): หูหนู=0.000 | แครง=0.150 | นางฟ้าภูฐาน=0.119 | นางรมฮังการี=0.102
5. ระยะเวลาผลผลิตครั้งแรก (W=0.10): หูหนู=0.000 | แครง=0.100 | นางฟ้าภูฐาน=0.076 | นางรมฮังการี=0.063
6. ระยะเวลาคืนทุน (W=0.10): หูหนู=0.000 | แครง=0.100 | นางฟ้าภูฐาน=0.089 | นางรมฮังการี=0.083
สรุป MPI:
**อันดับ 1 เห็ดแครง**: MPI = 0.853 (ระดับ: สูง)
**อันดับ 2 เห็ดนางฟ้าภูฐาน**: MPI = 0.797 (ระดับ: สูง)
**อันดับ 3 เห็ดนางรมฮังการี**: MPI = 0.689 (ระดับ: ปานกลาง)
**อันดับ 4 เห็ดหูหนู**: MPI = 0.000 (ระดับ: ต่ำ)

4.5 ความพึงพอใจต่อ MSSM (ตาราง 4.5):
- ด้านเนื้อหา: ค่าเฉลี่ย 4.36 (S.D.=0.67) ระดับ "มาก"
- ด้านการนำเสนอ: ค่าเฉลี่ย 4.42 (S.D.=0.62) ระดับ "มาก"
- ด้านการนำไปใช้ประโยชน์: ค่าเฉลี่ย 4.48 (S.D.=0.58) ระดับ "มาก"
- ภาพรวม: ค่าเฉลี่ย 4.42 (S.D.=0.62) ระดับ "มาก"

=== ส่วนที่ 8: บทที่ 5 สรุปและอภิปรายผล ===

5.1 สรุปผล:
1. สายพันธุ์ต่างกันมีอัตราเจริญเติบโตต่างกันชัดเจน เห็ดแครงเร็วที่สุด (0.85 ซม./วัน, 22.5 วัน) เห็ดหูหนูช้าที่สุด (0.25 ซม./วัน, 68 วัน)
2. เห็ดนางฟ้าภูฐานให้ผลผลิตรวมสูงสุด (786.23 ก.) แต่เห็ดแครงให้ผลผลิตครั้งแรกเร็วสุด (8.2 วัน)
3. เห็ดแครงคุ้มค่าสุด (BCR 2.69, กำไร 303.75 บาท, คืนทุน 33.49 วัน)
4. MSSM จัดอันดับได้สอดคล้องกับข้อมูลเชิงประจักษ์ เห็ดแครง MPI สูงสุด 0.853
5. ผู้ใช้พึงพอใจระดับ "มาก" (ค่าเฉลี่ย 4.42)

5.2 อภิปรายผล:
- เห็ดแครงโตเร็วสุดเพราะธรรมชาติเป็นเชื้อราบนไม้ที่ปรับตัวเข้ากับขี้เลื่อยไม้ยางพาราได้ดี ย่อยสลายลิกนินและเซลลูโลสอย่างมีประสิทธิภาพ สอดคล้องกับ Ali และคณะ (2568) ที่พบว่าสายพันธุ์เป็นตัวแปรหลักควบคุมประสิทธิภาพ
- เห็ดหูหนูเดินเส้นใยช้ามาก เพราะต้องการเวลานาน+สภาพแวดล้อมเฉพาะ ไม่มีผลผลิตในระยะทดลอง สอดคล้องกับลักษณะทางชีววิทยาที่โตช้ากว่าเห็ดกลุ่มอื่น
- BCR ของเห็ดแครง (2.69) สูงกว่า Bhandari และคณะ (2021) ที่พบเห็ดนางรม BCR 2.47 บนฟางข้าว แสดงว่าเห็ดแครงบนก้อนเชื้อสูตรชุมชนมีศักยภาพเศรษฐกิจสูง
- MSSM ใช้หลัก MCDM/SAW + Normalization สอดคล้องกับ กิตติพงษ์ เจริญพล (2565) ช่วยลดอคติและเพิ่มความโปร่งใสในการตัดสินใจ

5.3 คุณค่าและประโยชน์:
- เป็นฐานข้อมูลเชิงประจักษ์สำหรับเกษตรกรและผู้ประกอบการ
- ลดความเสี่ยงจากการเลือกสายพันธุ์ด้วยประสบการณ์อย่างเดียว
- เป็นต้นแบบนวัตกรรม Web-based สำหรับชุมชน
- ส่งเสริมเศรษฐกิจฐานราก การใช้ทรัพยากรท้องถิ่น และ Zero Waste
- ใช้เป็นสื่อการเรียนการสอนวิทยาศาสตร์อาชีวศึกษาได้

5.4 ข้อเสนอแนะ:
- ควรขยายจำนวนก้อนเชื้อและสายพันธุ์ที่ศึกษาเพิ่มเติม
- ควรทดลองกับสูตรก้อนเพาะเชื้อหลายสูตรเพื่อเปรียบเทียบ
- ควรศึกษาผลกระทบของฤดูกาลต่อผลผลิต
- ควรพัฒนา MSSM ให้รองรับข้อมูลแบบ Real-time
- ควรขยายผลไปยังชุมชนอื่นเพื่อทดสอบความยั่งยืนของแบบจำลอง

=== ส่วนที่ 9: กิตติกรรมประกาศ ===

โครงงานสำเร็จได้ด้วยความอนุเคราะห์จาก คณะผู้บริหารวิทยาลัยอาชีวศึกษานครศรีธรรมราช, ครูที่ปรึกษาทั้ง 5 ท่านและที่ปรึกษาพิเศษ 2 ท่าน, คณะผู้ปกครอง, นักเรียน นักศึกษา บุคลากรวิทยาลัย และผู้ตอบแบบสำรวจความพึงพอใจทุกท่าน — คณะผู้จัดทำ มิถุนายน 2569

=== กฎสำคัญ ===

1. ตอบเฉพาะเรื่องเห็ด วิทยาศาสตร์การเพาะเห็ด ผลการวิจัย MSSM ข้อมูลผู้จัดทำ/ครูที่ปรึกษาเท่านั้น หากถามเรื่องอื่นที่ไม่เกี่ยวข้อง ตอบสุภาพว่า "ขออภัยครับ ผมเป็นผู้เชี่ยวชาญเฉพาะด้านเห็ดวิทยา แบบจำลอง MSSM และข้อมูลผู้จัดทำโครงการ/ครูที่ปรึกษาเท่านั้น ไม่สามารถตอบคำถามนอกเหนือจากนี้ได้ครับ 🍄"
2. เมื่อได้รับภาพ ให้วิเคราะห์ชนิดและลักษณะเห็ดตามข้อมูลสัณฐานวิทยาข้างต้น และบอกคุณสมบัติการนำไปใช้/มาตรฐานการเพาะเลี้ยงตาม MSSM
3. ใช้ภาษาไทยเป็นมิตร ชัดเจน มี Emoji ประกอบ เว้นวรรคอ่านง่าย
4. ให้ข้อมูลถูกต้องตามหลักวิชาการและเนื้อหาโครงการเป็นหลัก หากถามรายละเอียดสูตร ส่วนผสม ผลการประเมิน สถานที่ทดลอง ให้ตอบตามข้อมูลข้างต้นอย่างถูกต้อง`;

async function getGenAIClient() {
    if (!genAIClientPromise || genAIClientKey !== API_KEY) {
        genAIClientKey = API_KEY;
        genAIClientPromise = import(GENAI_MODULE_URL).then(({ GoogleGenAI }) => new GoogleGenAI({ apiKey: API_KEY }));
    }

    return genAIClientPromise;
}

function handleEnter(e) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }

function toBase64(file) {
    return new Promise((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => resolve(r.result);
        r.onerror = reject;
        r.readAsDataURL(file);
    });
}

function previewImage(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const preview = document.getElementById('imagePreview');
    const img = document.getElementById('previewImg');
    if (!preview || !img) return;
    const r = new FileReader();
    r.onload = () => { img.src = r.result; preview.classList.remove('hidden'); };
    r.readAsDataURL(file);
}

function clearImage() {
    document.getElementById('imagePreview')?.classList.add('hidden');
    const inp = document.getElementById('imageInput');
    if (inp) inp.value = '';
}

let isSending = false;
async function send() {
    if (isSending) return;
    const input = document.getElementById('userInput');
    const msg = input?.value.trim();
    const fileInput = document.getElementById('imageInput');
    const file = fileInput?.files?.[0];
    if (!msg && !file) return;

    lastUserText = msg;
    lastUserPrompt = msg;

    if (!API_KEY) {
        addMsg('ai', `
        <div class="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 text-center my-2 max-w-sm mx-auto animate-pop-in">
            <div class="text-4xl mb-2 text-amber-500 animate-pulse">🔑</div>
            <h4 class="font-extrabold text-amber-600 dark:text-amber-400 text-sm mb-1">ยังไม่ได้ตั้งค่า API Key</h4>
            <p class="text-xs text-gray-500 dark:text-gray-400 mb-3 leading-relaxed">กรุณากรอกและบันทึก API Key ของ Gemini ในเมนูตั้งค่าก่อนเริ่มต้นการแชทครับ</p>
            <button onclick="openSettings()" class="px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-amber-500 to-amber-600 rounded-full hover:shadow-md hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"><i class="fas fa-cog"></i> ตั้งค่า API Key</button>
        </div>
        `);
        return;
    }

    isSending = true;
    toggleChatLoading(true);

    const parts = [];
    let userText = msg;
    if (!msg && file) userText = 'ช่วยวิเคราะห์ภาพเห็ดนี้หน่อยครับ';
    if (userText) parts.push({ text: userText });

    if (file) {
        try {
            const b64 = await toBase64(file);
            const base64Data = typeof b64 === 'string' ? b64.split(',')[1] : '';
            if (!base64Data) {
                throw new Error('ไม่สามารถแปลงไฟล์ภาพเป็น base64 ได้');
            }
            const { createPartFromBase64 } = await import(GENAI_MODULE_URL);
            parts.push(createPartFromBase64(base64Data, file.type || 'image/jpeg'));
        } catch (e) {
            addMsg('ai', '⚠️ <strong>ผิดพลาด:</strong> ไม่สามารถอ่านไฟล์ภาพได้');
            isSending = false;
            toggleChatLoading(false);
            return;
        }
    }

    addMsg('user', userText + (file ? ' <span class="text-xs opacity-70">📷 แนบภาพ</span>' : ''));
    input.value = '';
    input.style.height = 'auto';
    clearImage();
    const typing = document.getElementById('typingIndicator');
    if (typing) typing.classList.remove('hidden');
    scroll();

    const userMessage = { role: 'user', parts: parts };
    const startTime = performance.now();
    try {
        const ai = await getGenAIClient();
        const res = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: [...chatCtx, userMessage],
            config: { systemInstruction: SYSTEM }
        });
        const endTime = performance.now();
        lastLatency = Math.round(endTime - startTime);

        if (typing) typing.classList.add('hidden');

        const reply = res.text?.trim() || res.candidates?.[0]?.content?.parts?.map(part => part.text || '').join('').trim();
        if (!reply) {
            addMsg('ai', 'ขออภัยครับ ระบบมีปัญหา ⚠️');
            return;
        }

        lastTokens = Math.round(((userText || '').length + (reply || '').length) / 3.2) + 12;

        chatCtx.push(userMessage);
        chatCtx.push({ role: 'model', parts: [{ text: reply }] });
        addMsg('ai', fmt(reply));
    } catch (e) {
        if (typing) typing.classList.add('hidden');
        addMsg('ai', `
        <div class="p-4 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 text-center my-2 max-w-sm mx-auto animate-pop-in">
            <div class="text-4xl mb-2 text-red-500 animate-bounce">📡</div>
            <h4 class="font-extrabold text-red-600 dark:text-red-400 text-sm mb-1">ไม่สามารถเชื่อมต่อ AI ได้</h4>
            <p class="text-xs text-gray-500 dark:text-gray-400 mb-3 leading-relaxed">กรุณาตรวจสอบความเสถียรของอินเทอร์เน็ต คีย์ API ในส่วนการตั้งค่า หรือเครือข่ายของคุณ</p>
            <button onclick="retrySend()" class="px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full hover:shadow-md hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"><i class="fas fa-arrows-rotate"></i> ลองเชื่อมต่อใหม่อีกครั้ง</button>
        </div>
        `);
    } finally {
        isSending = false;
        toggleChatLoading(false);
    }
}

function injectMemberPhotos(text) {
    const mappings = [
        { keys: ["วุฒิภัทร", "อาม", "wuttiphar", "wuttiphat"], img: "assets/images/member2.jpg", name: "นายวุฒิภัทร มากด้วง (อาม)" },
        { keys: ["กวินธิดา", "นิก", "kawinthida"], img: "assets/images/member4.jpg", name: "นางสาวกวินธิดา คชรัตน์ (นิก)" },
        { keys: ["ศิรภัสสร", "ปังปอนด์", "ปอนด์", "sirapassorn"], img: "assets/images/member5.jpg", name: "นางสาวศิรภัสสร สิทธิพิทักษ์" },
        { keys: ["ทานุฑัต", "ฟาม", "thanututt", "thanutut"], img: "assets/images/member3.jpg", name: "นายทานุฑัต ทิพย์เสภา (ฟาม)" },
        { keys: ["สัณห์", "โต๊ะ", "โต็ะ", "san", "thoezaab"], img: "assets/images/member1.jpg", name: "นายสัณห์ สังขพงศ์ (โต๊ะ)" },
        { keys: ["ภคพล", "ฟีล", "บัง", "feel", "pakapon"], img: "assets/images/member6.jpg", name: "นายภคพล สมัยแก้ว (ฟีล / บัง)" }
    ];
    
    let injected = '';
    mappings.forEach(m => {
        // Only show the photo when the user specifically asked for that person's name or nickname in their prompt!
        const asked = m.keys.some(k => lastUserPrompt.toLowerCase().includes(k.toLowerCase()));
        if (asked) {
            injected += `
            <div class="mt-3 block border-t border-gray-155 dark:border-gray-700/50 pt-2.5">
                <span class="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block mb-1">รูปภาพผู้จัดทำ/ที่ปรึกษา: ${m.name}</span>
                <img src="${m.img}" alt="${m.name}" class="max-h-44 w-auto rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 object-cover hover:scale-[1.02] transition-all">
            </div>`;
        }
    });
    
    return injected;
}



function addMsg(sender, text) {
    const box = document.getElementById('chatHistory');
    if (!box) return;
    const row = document.createElement('div');
    row.className = `flex ${sender === 'user' ? 'justify-end' : 'justify-start'} animate-pop-in`;
    const plainText = text.replace(/<[^>]*>/g, '').replace(/&[^;]+;/g, ' ').replace(/\s+/g, ' ').trim();
    const currentMode = document.getElementById('studyMode')?.value || 'General';
    
    let displayHtml = text;
    let visualContainerId = "";
    
    const containsGreenhouse = /โรงเรือน|โครงสร้าง|หลังคา|bcr|mpi/i.test(text);
    if (sender === 'ai' && containsGreenhouse) {
        visualContainerId = `visual-container-${Date.now()}-${Math.floor(Math.random()*1000)}`;
        displayHtml = text + `
            <div class="mt-4 p-3 rounded-xl bg-slate-900 border border-slate-800 text-white overflow-hidden shadow-inner">
                <div class="flex items-center justify-between mb-2">
                    <span class="text-[10px] font-black tracking-wider uppercase text-emerald-400 flex items-center gap-1">
                        <i class="fas fa-cubes"></i> MSSM AI Visualizer
                    </span>
                    <span class="text-[9px] text-slate-500 font-bold">
                        Mode: ${localStorage.getItem('globalRenderMode') === '3d' ? '3D Render' : '2D Specs'}
                    </span>
                </div>
                <div id="${visualContainerId}" class="w-full min-h-[160px] md:min-h-[200px] flex items-center justify-center relative"></div>
            </div>
        ` + injectMemberPhotos(text);
    } else if (sender === 'ai') {
        displayHtml = text + injectMemberPhotos(text);
    }
    
    row.innerHTML = `<div class="max-w-[85%] md:max-w-[75%] p-3 md:p-4 rounded-2xl text-sm md:text-base leading-relaxed ${
        sender === 'user'
            ? 'bg-gradient-to-br from-amber-500 to-amber-600 text-white rounded-br-md shadow-lg'
            : 'bg-gray-100 dark:bg-gray-800/80 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700 rounded-bl-md'
    }">${displayHtml}${
        sender === 'ai'
            ? `<div class="flex justify-end gap-2 mt-2 pt-2 border-t border-gray-200 dark:border-gray-700/50">
                  <button onclick="speak(this)" data-text="${plainText.replace(/"/g, '&quot;')}" class="text-[10px] px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-800/60 transition-all flex items-center gap-1 cursor-pointer"><i class="fas fa-volume-up text-[10px]"></i> ฟังเสียง</button>
                  <button onclick="saveAICardToLog(this)" data-text="${plainText.replace(/"/g, '&quot;')}" data-latency="${lastLatency}" data-tokens="${lastTokens}" data-mode="${currentMode}" class="text-[10px] px-2.5 py-1 rounded-lg bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 hover:bg-amber-200 dark:hover:bg-amber-800/60 transition-all flex items-center gap-1 cursor-pointer"><i class="fas fa-save"></i> บันทึกลงตาราง</button>
               </div>`
            : ''
    }</div>`;
    box.appendChild(row);
    scroll();
    
    if (visualContainerId) {
        setTimeout(() => {
            const mode = localStorage.getItem('globalRenderMode') || '2d';
            if (mode === '3d') {
                render3DVisualizer(visualContainerId);
            } else {
                render2DVisualizer(visualContainerId);
            }
        }, 50);
    }
}

function render2DVisualizer(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = `
        <div class="w-full text-left space-y-2.5 text-xs text-slate-300 font-semibold animate-pop-in">
            <div class="grid grid-cols-2 gap-2">
                <div class="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                    <span class="text-[9px] text-slate-500 block uppercase">ขนาดแนะนำ (Recommended Size)</span>
                    <strong class="text-sm text-slate-200 font-mono">4.0 x 6.0 x 3.0 m</strong>
                </div>
                <div class="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                    <span class="text-[9px] text-slate-500 block uppercase">โครงสร้างหลังคา (Roof Skeleton)</span>
                    <strong class="text-sm text-slate-200">หน้าจั่ว / พลาสติกใส PE กัน UV</strong>
                </div>
                <div class="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                    <span class="text-[9px] text-emerald-500 block uppercase">ประสิทธิภาพดัชนี (MPI Score)</span>
                    <strong class="text-sm text-emerald-400 font-mono">0.853 (อันดับ 1: เห็ดแครง)</strong>
                </div>
                <div class="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                    <span class="text-[9px] text-blue-500 block uppercase">ความคุ้มทุนการผลิต (BCR Ratio)</span>
                    <strong class="text-sm text-blue-400 font-mono">2.69 (คุ้มค่าเชิงพาณิชย์สูง)</strong>
                </div>
            </div>
            <div class="bg-slate-950/40 p-2.5 rounded-xl border border-slate-800 flex items-center gap-2">
                <div class="w-7 h-7 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center text-sm"><i class="fas fa-lightbulb"></i></div>
                <div class="flex-1 text-[10px] leading-relaxed text-slate-400">
                    คำแนะนำจากแบบจำลอง MSSM: เหมาะสำหรับการบ่มเพาะเห็ดแครงในสภาพอุณหภูมิเฉลี่ย 30-32°C และติดตั้งสเปรย์หมอกลดความร้อนสะสม
                </div>
            </div>
        </div>
    `;
}

function render3DVisualizer(containerId) {
    const container = document.getElementById(containerId);
    if (!container || !window.THREE) return;

    // Create Canvas
    const canvas = document.createElement('canvas');
    canvas.className = "w-full h-full rounded-xl cursor-grab active:cursor-grabbing";
    container.appendChild(canvas);

    const width = container.clientWidth;
    const height = container.clientHeight || 200;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Scene
    const scene = new THREE.Scene();

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(6, 4, 8);

    // Controls
    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2; // Don't go below floor

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(5, 10, 7);
    scene.add(dirLight);

    // Helpers
    const grid = new THREE.GridHelper(10, 10, 0x4f46e5, 0x334155);
    grid.position.y = -1.5;
    scene.add(grid);

    // Create 3D Greenhouse Model
    const ghGroup = new THREE.Group();

    // Floor / Ground
    const floorGeo = new THREE.BoxGeometry(6, 0.1, 8);
    const floorMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.position.y = -1.55;
    ghGroup.add(floor);

    // Pillars / Frames (Metal skeleton)
    const frameMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.8, roughness: 0.2 });
    
    // Box skeletal outline
    const makePillar = (w, h, d, x, z) => {
        const geo = new THREE.BoxGeometry(w, h, d);
        const mesh = new THREE.Mesh(geo, frameMat);
        mesh.position.set(x, h/2 - 1.5, z);
        ghGroup.add(mesh);
    };

    // Columns
    makePillar(0.1, 3, 0.1, -2.5, -3.5);
    makePillar(0.1, 3, 0.1, 2.5, -3.5);
    makePillar(0.1, 3, 0.1, -2.5, 3.5);
    makePillar(0.1, 3, 0.1, 2.5, 3.5);
    makePillar(0.1, 3, 0.1, -2.5, 0);
    makePillar(0.1, 3, 0.1, 2.5, 0);

    // Horizontal Rails
    const makeRail = (w, h, d, x, y, z) => {
        const geo = new THREE.BoxGeometry(w, h, d);
        const mesh = new THREE.Mesh(geo, frameMat);
        mesh.position.set(x, y, z);
        ghGroup.add(mesh);
    };
    makeRail(5, 0.1, 0.1, 0, 1.5, -3.5);
    makeRail(5, 0.1, 0.1, 0, 1.5, 3.5);
    makeRail(0.1, 0.1, 7, -2.5, 1.5, 0);
    makeRail(0.1, 0.1, 7, 2.5, 1.5, 0);
    makeRail(5, 0.1, 0.1, 0, -1.4, -3.5);
    makeRail(5, 0.1, 0.1, 0, -1.4, 3.5);

    // Gabled Roof
    const roofMat = new THREE.MeshStandardMaterial({ color: 0x3b82f6, transparent: true, opacity: 0.35, side: THREE.DoubleSide });
    const roofGeom = new THREE.BufferGeometry();
    const vertices = new Float32Array([
        -2.5, 1.5, -3.5,
         0, 2.3, -3.5,
         2.5, 1.5, -3.5,
        -2.5, 1.5,  3.5,
         0, 2.3,  3.5,
         2.5, 1.5,  3.5,
    ]);
    const indices = [
        0, 1, 3,  1, 4, 3, // left side
        1, 2, 4,  2, 5, 4  // right side
    ];
    roofGeom.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    roofGeom.setIndex(indices);
    roofGeom.computeVertexNormals();
    const roofMesh = new THREE.Mesh(roofGeom, roofMat);
    ghGroup.add(roofMesh);

    // Shelves (ภายใน)
    const shelfMat = new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.6 });
    const makeShelf = (w, h, d, x, y, z) => {
        const geo = new THREE.BoxGeometry(w, h, d);
        const mesh = new THREE.Mesh(geo, shelfMat);
        mesh.position.set(x, y, z);
        ghGroup.add(mesh);
    };
    // Let's make some simple shelves on sides
    makeShelf(0.8, 0.05, 6, -2.0, -0.8, 0);
    makeShelf(0.8, 0.05, 6, -2.0, 0.1, 0);
    makeShelf(0.8, 0.05, 6, 2.0, -0.8, 0);
    makeShelf(0.8, 0.05, 6, 2.0, 0.1, 0);

    // Spinning Fan (พัดลมระบายอากาศ)
    const fanGroup = new THREE.Group();
    const fanCasingGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.1, 16);
    const fanCasingMat = new THREE.MeshStandardMaterial({ color: 0x475569 });
    const fanCasing = new THREE.Mesh(fanCasingGeo, fanCasingMat);
    fanCasing.rotation.x = Math.PI / 2;
    fanGroup.add(fanCasing);

    const bladeGeo = new THREE.BoxGeometry(0.7, 0.08, 0.02);
    const bladeMat = new THREE.MeshStandardMaterial({ color: 0xf43f5e });
    const blade1 = new THREE.Mesh(bladeGeo, bladeMat);
    const blade2 = new THREE.Mesh(bladeGeo, bladeMat);
    blade2.rotation.z = Math.PI / 2;
    fanGroup.add(blade1);
    fanGroup.add(blade2);

    fanGroup.position.set(0, 1.0, -3.5);
    ghGroup.add(fanGroup);

    scene.add(ghGroup);

    // Resize Handler
    const handleResize = () => {
        if (!container || !canvas) return;
        const w = container.clientWidth;
        const h = container.clientHeight || 200;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Animation Loop
    let animationId;
    const animate = () => {
        animationId = requestAnimationFrame(animate);
        
        // Spin fan
        blade1.rotation.z += 0.15;
        blade2.rotation.z += 0.15;

        // Auto rotate scene slowly if not interacting
        ghGroup.rotation.y += 0.005;

        controls.update();
        renderer.render(scene, camera);
    };
    animate();

    // Clean up
    container.addEventListener('remove', () => {
        cancelAnimationFrame(animationId);
        window.removeEventListener('resize', handleResize);
    });
}

function speak(btn) {
    if (!('speechSynthesis' in window)) return;
    const text = btn?.getAttribute('data-text');
    if (!text) return;
    
    if (isMuted) return;

    if (window.speechSynthesis.speaking && btn.innerHTML.includes('หยุด')) {
        window.speechSynthesis.cancel();
        return;
    }

    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'th-TH';
    u.rate = 0.85;
    u.pitch = 1.0;
    u.volume = 1.0;
    u.onstart = () => { 
        btn.innerHTML = '<i class="fas fa-stop text-[10px]"></i> หยุด'; 
        btn.classList.add('bg-red-100', 'dark:bg-red-900/40', 'text-red-600', 'dark:text-red-400'); 
        btn.classList.remove('bg-emerald-100', 'dark:bg-emerald-900/40', 'text-emerald-600', 'dark:text-emerald-400'); 
    };
    u.onend = u.onerror = () => { 
        btn.innerHTML = '<i class="fas fa-volume-up text-[10px]"></i> ฟังเสียง'; 
        btn.classList.remove('bg-red-100', 'dark:bg-red-900/40', 'text-red-600', 'dark:text-red-400'); 
        btn.classList.add('bg-emerald-100', 'dark:bg-emerald-900/40', 'text-emerald-600', 'dark:text-emerald-400'); 
    };
    window.speechSynthesis.speak(u);
}

function toggleMute() {
    isMuted = !isMuted;
    localStorage.setItem('ai_muted', isMuted);
    updateMuteUI();
    if (isMuted) {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }
        document.querySelectorAll('[onclick="speak(this)"]').forEach(btn => {
            btn.innerHTML = '<i class="fas fa-volume-up text-[10px]"></i> ฟังเสียง';
            btn.classList.remove('bg-red-100', 'dark:bg-red-900/40', 'text-red-600', 'dark:text-red-400');
            btn.classList.add('bg-emerald-100', 'dark:bg-emerald-900/40', 'text-emerald-600', 'dark:text-emerald-400');
        });
    }
}

function updateMuteUI() {
    const icon = document.getElementById('muteIcon');
    const text = document.getElementById('muteText');
    const btn = document.getElementById('muteToggleBtn');
    if (btn && icon && text) {
        if (isMuted) {
            icon.textContent = '🔇';
            text.textContent = 'ปิดเสียง';
            btn.classList.add('bg-red-50', 'dark:bg-red-950/20', 'border-red-200', 'dark:border-red-900/40');
        } else {
            icon.textContent = '🔊';
            text.textContent = 'เปิดเสียง';
            btn.classList.remove('bg-red-50', 'dark:bg-red-950/20', 'border-red-200', 'dark:border-red-900/40');
        }
    }
}

function saveAICardToLog(btn) {
    const text = btn.getAttribute('data-text');
    const latency = parseInt(btn.getAttribute('data-latency') || '0', 10);
    const tokens = parseInt(btn.getAttribute('data-tokens') || '0', 10);
    const mode = btn.getAttribute('data-mode') || 'General';

    aiSavedLogs.push({
        prompt: lastUserPrompt || 'คำถามทั่วไป/แนบภาพ',
        reply: text,
        latency: latency,
        tokens: tokens,
        mode: mode
    });
    saveAICache();
    renderAIChatTable();
    if (typeof playClick === 'function') playClick();

    btn.innerHTML = '<i class="fas fa-check"></i> บันทึกแล้ว';
    btn.className = 'text-[10px] px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 transition-all flex items-center gap-1 cursor-default';
    btn.disabled = true;
    btn.onclick = null;
}

function deleteLog(index) {
    const deletedItem = aiSavedLogs[index];
    undoStack.push({
        index: index,
        item: deletedItem
    });
    
    aiSavedLogs.splice(index, 1);
    saveAICache();
    renderAIChatTable();
    
    showUndoToast(`ลบการทดลองที่ ${index + 1} แล้ว`);
}

function undoDelete() {
    if (undoStack.length === 0) return;
    const lastDeleted = undoStack.pop();
    aiSavedLogs.splice(lastDeleted.index, 0, lastDeleted.item);
    saveAICache();
    renderAIChatTable();
    
    const toast = document.getElementById('undoToast');
    if (toast) toast.remove();
}

function showUndoToast(message) {
    const existing = document.getElementById('undoToast');
    if (existing) existing.remove();
    
    const container = document.getElementById('toastContainer');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.id = 'undoToast';
    toast.className = 'pointer-events-auto bg-gray-900/95 dark:bg-white/95 text-white dark:text-gray-900 px-4 py-3 rounded-2xl shadow-2xl flex items-center justify-between gap-4 border border-gray-800 dark:border-gray-200 text-xs md:text-sm animate-pop-in min-w-[280px] max-w-sm';
    toast.innerHTML = `
        <div class="flex items-center gap-2">
            <span class="text-amber-400">🗑️</span>
            <span class="font-semibold">${message}</span>
        </div>
        <button onclick="undoDelete()" class="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-black transition-all">กู้คืน (Undo)</button>
    `;
    container.appendChild(toast);
    
    setTimeout(() => {
        if (toast && toast.parentNode) {
            toast.classList.add('opacity-0', 'translate-y-2', 'transition-all', 'duration-300');
            setTimeout(() => toast.remove(), 300);
        }
    }, 4500);
}

function updateStats(visibleLogs) {
    const runsSpan = document.getElementById('statTotalRuns');
    const latencySpan = document.getElementById('statMeanLatency');
    const volatilitySpan = document.getElementById('statVolatility');
    
    if (!runsSpan || !latencySpan || !volatilitySpan) return;
    
    const count = visibleLogs.length;
    runsSpan.textContent = `${count} ครั้ง`;
    
    if (count === 0) {
        latencySpan.textContent = `0 ms`;
        volatilitySpan.textContent = `Min: 0 / Max: 0`;
        return;
    }
    
    let totalLatency = 0;
    let tokens = [];
    
    visibleLogs.forEach(log => {
        const lat = log.latency || 0;
        const tok = log.tokens || 0;
        totalLatency += lat;
        tokens.push(tok);
    });
    
    const meanLatency = Math.round(totalLatency / count);
    latencySpan.textContent = `${meanLatency.toLocaleString()} ms`;
    
    const minToken = Math.min(...tokens);
    const maxToken = Math.max(...tokens);
    volatilitySpan.textContent = `Min: ${minToken} / Max: ${maxToken}`;
}

function filterLogs() {
    const searchQuery = (document.getElementById('logSearch')?.value || '').toLowerCase().trim();
    const selectedMode = document.getElementById('logFilterMode')?.value || 'All';
    
    const tbody = document.getElementById('aiLogBody');
    if (!tbody) return;
    
    const filtered = aiSavedLogs.map((item, index) => ({ ...item, originalIndex: index }))
        .filter(item => {
            const matchesSearch = !searchQuery || 
                (item.prompt || '').toLowerCase().includes(searchQuery) ||
                (item.reply || '').toLowerCase().includes(searchQuery);
            const matchesMode = selectedMode === 'All' || item.mode === selectedMode;
            return matchesSearch && matchesMode;
        });
    
    if (filtered.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="p-6 text-center text-gray-400 dark:text-gray-500 italic">
                    <i class="fas fa-search-minus mb-1 block text-lg"></i> ไม่พบข้อมูลที่ตรงกับตัวกรอง
                </td>
            </tr>
        `;
        updateStats([]);
        updateStabilityChart([]);
        return;
    }
    
    tbody.innerHTML = '';
    filtered.forEach((item, index) => {
        const tr = document.createElement('tr');
        tr.className = 'border-b border-gray-100 dark:border-gray-800/80 hover:bg-gray-50/50 dark:hover:bg-gray-800/20 text-gray-700 dark:text-gray-300';
        
        let badgeClass = 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
        if (item.mode === 'Researcher') badgeClass = 'bg-purple-100 text-purple-800 dark:bg-purple-950/40 dark:text-purple-400';
        else if (item.mode === 'Economics') badgeClass = 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400';
        else if (item.mode === 'Zero Waste') badgeClass = 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400';
        
        tr.innerHTML = `
            <td class="p-2 text-center font-bold text-gray-400 dark:text-gray-500">${index + 1}</td>
            <td class="p-2 text-center hidden sm:table-cell">
                <span class="px-2 py-0.5 rounded-full text-[9px] font-bold ${badgeClass}">${item.mode || 'General'}</span>
            </td>
            <td class="p-2 leading-relaxed space-y-0.5 min-w-0">
                <div class="font-bold text-gray-600 dark:text-gray-400 truncate text-[10px]" title="${item.prompt}">${item.prompt}</div>
                <div class="line-clamp-2 text-[10px] opacity-80" title="${item.reply}">${item.reply}</div>
            </td>
            <td class="p-2 text-center font-mono text-gray-500 dark:text-gray-400 hidden md:table-cell">${item.latency ? item.latency.toLocaleString() : '0'} ms</td>
            <td class="p-2 text-center font-mono text-gray-500 dark:text-gray-400 hidden md:table-cell">${item.tokens || 0}</td>
            <td class="p-2 text-center">
                <button onclick="openLogModal(${item.originalIndex})" class="w-6 h-6 rounded-lg bg-emerald-50 hover:bg-emerald-500 text-emerald-600 hover:text-white transition-all flex items-center justify-center cursor-pointer mx-auto">
                    <i class="fas fa-magnifying-glass text-[10px]"></i>
                </button>
            </td>
            <td class="p-2 text-center">
                <button onclick="deleteLog(${item.originalIndex})" class="w-6 h-6 rounded-lg bg-red-50 hover:bg-red-500 text-red-500 hover:text-white transition-all flex items-center justify-center cursor-pointer mx-auto">
                    <i class="fas fa-trash text-[10px]"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
    
    updateStats(filtered);
    updateStabilityChart(filtered);
}

function updateStabilityChart(filteredLogs) {
    const logs = filteredLogs || aiSavedLogs;
    const canvas = document.getElementById('stabilityChart');
    if (!canvas) return;
    
    const labels = logs.map((_, idx) => `Run ${idx + 1}`);
    const datasetData = logs.map(l => l.latency || 0);
    
    const dark = document.documentElement.classList.contains('dark');
    const textClr = dark ? '#e2e8f0' : '#334155';
    const gridClr = dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)';
    
    if (stabilityChartInstance) {
        stabilityChartInstance.data.labels = labels;
        stabilityChartInstance.data.datasets[0].data = datasetData;
        stabilityChartInstance.options.scales.x.ticks.color = textClr;
        stabilityChartInstance.options.scales.y.ticks.color = textClr;
        stabilityChartInstance.options.scales.y.grid.color = gridClr;
        stabilityChartInstance.update();
    } else {
        stabilityChartInstance = new Chart(canvas.getContext('2d'), {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'เวลาประมวลผล (ms)',
                    data: datasetData,
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    borderWidth: 2,
                    pointBackgroundColor: '#2563eb',
                    pointBorderColor: '#fff',
                    pointHoverRadius: 6,
                    tension: 0.2,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: ctx => ` ความเร็ว: ${ctx.parsed.y} ms`
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { color: textClr },
                        grid: { color: gridClr }
                    },
                    x: {
                        ticks: { color: textClr },
                        grid: { display: false }
                    }
                }
            }
        });
    }
}

function renderAIChatTable() {
    filterLogs();
}

function exportAIChatCSV() {
    if (aiSavedLogs.length === 0) {
        alert('กรุณาบันทึกข้อมูลคำถาม-คำตอบลงตารางอย่างน้อย 1 รายการก่อนทำการส่งออกครับ');
        return;
    }

    const headers = ['ลำดับ', 'โหมด', 'หัวข้อคำถาม (Input)', 'สรุปคำตอบของ AI (Output)', 'เวลาประมวลผล (ms)', 'Tokens'];
    const rows = [headers];

    aiSavedLogs.forEach((item, index) => {
        rows.push([
            index + 1,
            item.mode || 'General',
            item.prompt,
            item.reply,
            item.latency || 0,
            item.tokens || 0
        ]);
    });

    let csvContent = "\ufeff"; // BOM for UTF-8 Excel support in Thai
    rows.forEach(row => {
        csvContent += row.map(v => `"${(v + '').replace(/"/g, '""')}"`).join(",") + "\r\n";
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `mssm_ai_insights_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function clearAIChatTable() {
    window.showMushroomConfirm('คุณต้องการลบข้อมูลทั้งหมดในตารางสะสมข้อมูลใช่หรือไม่?', () => {
        aiSavedLogs = [];
        localStorage.removeItem('mssm_ai_saved_logs');
        renderAIChatTable();
    });
}

function resetChat() {
    window.showMushroomConfirm('คุณต้องการรีเซ็ตประวัติการสนทนาทั้งหมดใช่หรือไม่?', () => {
        chatCtx = [];
        const box = document.getElementById('chatHistory');
        if (box) {
            box.innerHTML = `
                <div class="flex justify-start animate-pop-in">
                    <div class="max-w-[85%] md:max-w-[75%] p-3 md:p-4 rounded-2xl text-sm md:text-base leading-relaxed bg-gradient-to-br from-emerald-50 to-white dark:from-gray-800 dark:to-gray-800/60 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700 rounded-bl-md shadow-sm">
                        <div class="flex items-center gap-2 mb-2"><span class="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white text-xs"><i class="fas fa-robot"></i></span><strong class="text-emerald-600 dark:text-emerald-400">AI MSSM</strong></div>
                        สวัสดีครับ! ผมคือผู้ช่วยของคุณ 🍄<br><br>
                        ผมมีความเชี่ยวชาญด้านเห็ดทั้ง 4 ชนิด การวิเคราะห์เศรษฐศาสตร์ และแนวคิด Zero Waste<br>
                        <strong class="text-emerald-600 dark:text-emerald-400">พิมพ์ถามได้เลยครับ!</strong>
                    </div>
                </div>
            `;
        }
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }
    });
}

function saveAICache() {
    localStorage.setItem('mssm_ai_saved_logs', JSON.stringify(aiSavedLogs));
}

function loadAICache() {
    const saved = localStorage.getItem('mssm_ai_saved_logs');
    if (saved) {
        try {
            aiSavedLogs = JSON.parse(saved);
        } catch (e) {
            console.error("Error loading AI log cache", e);
        }
    }
}

scroll = function() { const el = document.getElementById('chatHistory'); if (el) el.scrollTop = el.scrollHeight; }
function fmt(t) { return t.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>'); }

document.addEventListener('DOMContentLoaded', () => {
    const ta = document.getElementById('userInput');
    if (ta) ta.addEventListener('input', () => { ta.style.height = 'auto'; ta.style.height = Math.min(ta.scrollHeight, 120) + 'px'; });

    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('openSettings') === 'true') {
        openSettings();
    }
    
    updateMuteUI();
    loadAICache();
    renderAIChatTable();
    initProvinceDropdown();
    fetchWeather();
});

window.addEventListener('themechanged', () => {
    updateStabilityChart();
});

// === SETTINGS MODAL FUNCTIONS ===
function openSettings() {
    const modal = document.getElementById('settingsModal');
    const input = document.getElementById('apiKeyInput');
    if (modal && input) {
        input.value = localStorage.getItem('gemini_api_key') || '';
        modal.classList.remove('hidden');
    }
}

function closeSettings() {
    const modal = document.getElementById('settingsModal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

async function saveSettings() {
    const val = document.getElementById('apiKeyInput')?.value.trim();
    if (val) {
        localStorage.setItem('gemini_api_key', val);
        API_KEY = val;
    } else {
        localStorage.removeItem('gemini_api_key');
        API_KEY = DEFAULT_KEY;
    }
    closeSettings();
}

async function retrySend() {
    const input = document.getElementById('userInput');
    if (input) {
        input.value = lastUserText;
        send();
    }
}

function toggleChatLoading(loading) {
    const userInput = document.getElementById('userInput');
    const sendBtn = document.getElementById('sendBtn');
    const attachBtn = document.getElementById('attachBtn');
    if (userInput) userInput.disabled = loading;
    if (sendBtn) {
        sendBtn.disabled = loading;
        if (loading) {
            sendBtn.innerHTML = '<i class="fas fa-spinner animate-spin"></i>';
            sendBtn.classList.add('opacity-70', 'cursor-not-allowed');
        } else {
            sendBtn.innerHTML = '<i class="fas fa-paper-plane"></i>';
            sendBtn.classList.remove('opacity-70', 'cursor-not-allowed');
        }
    }
}

let recognition = null;
let isListening = false;

function toggleSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        alert("ขออภัยครับ เบราว์เซอร์ของคุณไม่สนับสนุนระบบสั่งการด้วยเสียง (Web Speech API)");
        return;
    }

    const micBtn = document.getElementById('micBtn');
    const micIcon = document.getElementById('micIcon');
    const userInput = document.getElementById('userInput');

    if (isListening) {
        if (recognition) recognition.stop();
        return;
    }

    if (!recognition) {
        recognition = new SpeechRecognition();
        recognition.lang = 'th-TH';
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onstart = () => {
            isListening = true;
            if (micBtn) {
                micBtn.classList.remove('bg-gray-100', 'dark:bg-gray-800', 'text-gray-500', 'dark:text-gray-400');
                micBtn.classList.add('bg-red-500', 'text-white', 'animate-pulse');
            }
            if (micIcon) {
                micIcon.classList.remove('fa-microphone');
                micIcon.classList.add('fa-microphone-slash');
            }
        };

        recognition.onresult = (event) => {
            const text = event.results[0][0].transcript;
            if (userInput) {
                userInput.value = (userInput.value ? userInput.value + ' ' : '') + text;
                userInput.style.height = 'auto';
                userInput.style.height = Math.min(userInput.scrollHeight, 120) + 'px';
            }
        };

        recognition.onerror = (event) => {
            console.error("Speech recognition error", event.error);
            stopRecognitionUI();
        };

        recognition.onend = () => {
            stopRecognitionUI();
        };
    }

    try {
        recognition.start();
    } catch (e) {
        console.error(e);
        stopRecognitionUI();
    }

    function stopRecognitionUI() {
        isListening = false;
        if (micBtn) {
            micBtn.classList.add('bg-gray-100', 'dark:bg-gray-800', 'text-gray-500', 'dark:text-gray-400');
            micBtn.classList.remove('bg-red-500', 'text-white', 'animate-pulse');
        }
        if (micIcon) {
            micIcon.classList.add('fa-microphone');
            micIcon.classList.remove('fa-microphone-slash');
        }
    }
}

function openLogModal(idx) {
    const item = aiSavedLogs[idx];
    if (!item) return;

    const modeEl = document.getElementById('modalLogMode');
    const promptEl = document.getElementById('modalLogPrompt');
    const replyEl = document.getElementById('modalLogReply');
    const latencyEl = document.getElementById('modalLogLatency');
    const tokensEl = document.getElementById('modalLogTokens');

    if (modeEl) modeEl.textContent = item.mode || 'General';
    if (promptEl) promptEl.textContent = item.prompt || '';
    if (replyEl) replyEl.textContent = item.reply || '';
    if (latencyEl) latencyEl.textContent = (item.latency ? item.latency.toLocaleString() : '0') + ' ms';
    if (tokensEl) tokensEl.textContent = item.tokens || '0';

    const imgArea = document.getElementById('modalLogImageArea');
    const imgEl = document.getElementById('modalLogImg');
    if (imgArea && imgEl) {
        if (item.image) {
            imgEl.src = item.image;
            imgArea.classList.remove('hidden');
        } else {
            imgEl.src = '';
            imgArea.classList.add('hidden');
        }
    }

    const modal = document.getElementById('logDetailModal');
    if (modal) modal.classList.remove('hidden');
}

function closeLogModal() {
    const modal = document.getElementById('logDetailModal');
    if (modal) modal.classList.add('hidden');
}

const THAI_PROVINCES = {
    "กรุงเทพมหานคร": { lat: 13.7563, lon: 100.5018 },
    "กระบี่": { lat: 8.0584, lon: 98.9198 },
    "กาญจนบุรี": { lat: 14.0041, lon: 99.5492 },
    "กาฬสินธุ์": { lat: 16.4353, lon: 103.5042 },
    "กำแพงเพชร": { lat: 16.4831, lon: 99.5224 },
    "ขอนแก่น": { lat: 16.4322, lon: 102.8236 },
    "จันทบุรี": { lat: 12.6111, lon: 102.1139 },
    "ฉะเชิงเทรา": { lat: 13.6904, lon: 101.0772 },
    "ชลบุรี": { lat: 13.3611, lon: 100.9847 },
    "ชัยนาท": { lat: 15.1856, lon: 100.1251 },
    "ชัยภูมิ": { lat: 15.8068, lon: 102.0315 },
    "ชุมพร": { lat: 10.4930, lon: 99.1800 },
    "เชียงราย": { lat: 19.9071, lon: 99.8325 },
    "เชียงใหม่": { lat: 18.7883, lon: 98.9853 },
    "ตรัง": { lat: 7.5562, lon: 99.6114 },
    "ตราด": { lat: 12.2428, lon: 102.5175 },
    "ตาก": { lat: 16.8839, lon: 99.1258 },
    "นครนายก": { lat: 14.2069, lon: 101.2130 },
    "นครปฐม": { lat: 13.8140, lon: 100.0373 },
    "นครพนม": { lat: 17.3999, lon: 104.7951 },
    "นครราชสีมา": { lat: 14.9738, lon: 102.0836 },
    "นครศรีธรรมราช": { lat: 8.4333, lon: 99.9667 },
    "นครสวรรค์": { lat: 15.7001, lon: 100.1372 },
    "นนทบุรี": { lat: 13.8622, lon: 100.5144 },
    "นราธิวาส": { lat: 6.4255, lon: 101.8252 },
    "น่าน": { lat: 18.7831, lon: 100.7812 },
    "บึงกาฬ": { lat: 18.3626, lon: 103.6552 },
    "บุรีรัมย์": { lat: 14.9930, lon: 103.1029 },
    "ปทุมธานี": { lat: 14.0208, lon: 100.5250 },
    "ประจวบคีรีขันธ์": { lat: 11.8024, lon: 99.7956 },
    "ปราจีนบุรี": { lat: 14.0487, lon: 101.3725 },
    "ปัตตานี": { lat: 6.8680, lon: 101.2500 },
    "พระนครศรีอยุธยา": { lat: 14.3532, lon: 100.5681 },
    "พะเยา": { lat: 19.1661, lon: 99.9023 },
    "พังงา": { lat: 8.4501, lon: 98.5298 },
    "พัทลุง": { lat: 7.6167, lon: 100.0740 },
    "พิจิตร": { lat: 16.4410, lon: 100.3488 },
    "พิษณุโลก": { lat: 16.8219, lon: 100.2659 },
    "เพชรบุรี": { lat: 13.1118, lon: 99.9463 },
    "เพชรบูรณ์": { lat: 16.4190, lon: 101.1593 },
    "แพร่": { lat: 18.1446, lon: 100.1403 },
    "ภูเก็ต": { lat: 7.8804, lon: 98.3923 },
    "มหาสารคาม": { lat: 16.1850, lon: 103.3008 },
    "มุกดาหาร": { lat: 16.5430, lon: 104.7245 },
    "แม่ฮ่องสอน": { lat: 19.3004, lon: 97.9685 },
    "ยโสธร": { lat: 15.7926, lon: 104.1453 },
    "ยะลา": { lat: 6.5399, lon: 101.2809 },
    "ร้อยเอ็ด": { lat: 16.0538, lon: 103.6528 },
    "ระนอง": { lat: 9.9658, lon: 98.6348 },
    "ระยอง": { lat: 12.6814, lon: 101.2813 },
    "ราชบุรี": { lat: 13.5283, lon: 99.8134 },
    "ลพบุรี": { lat: 14.7995, lon: 100.6534 },
    "ลำปาง": { lat: 18.2917, lon: 99.4928 },
    "ลำพูน": { lat: 18.5771, lon: 99.0076 },
    "เลย": { lat: 17.4862, lon: 101.7223 },
    "ศรีสะเกษ": { lat: 15.1154, lon: 104.3291 },
    "สกลนคร": { lat: 17.1610, lon: 104.1486 },
    "สงขลา": { lat: 7.1898, lon: 100.5954 },
    "สตูล": { lat: 6.6231, lon: 100.0674 },
    "สมุทรปราการ": { lat: 13.5991, lon: 100.5968 },
    "สมุทรสงคราม": { lat: 13.4098, lon: 100.0023 },
    "สมุทรสาคร": { lat: 13.5475, lon: 100.2744 },
    "สระแก้ว": { lat: 13.8240, lon: 102.0646 },
    "สระบุรี": { lat: 14.5289, lon: 100.9101 },
    "สิงห์บุรี": { lat: 14.8936, lon: 100.3967 },
    "สุโขทัย": { lat: 17.0078, lon: 99.8262 },
    "สุพรรณบุรี": { lat: 14.4745, lon: 100.1176 },
    "สุราษฎร์ธานี": { lat: 9.1402, lon: 99.3331 },
    "สุรินทร์": { lat: 14.8818, lon: 103.4937 },
    "หนองคาย": { lat: 17.8785, lon: 102.7413 },
    "หนองบัวลำภู": { lat: 17.2003, lon: 102.4431 },
    "อ่างทอง": { lat: 14.5896, lon: 100.4551 },
    "อำนาจเจริญ": { lat: 15.8548, lon: 104.6245 },
    "อุดรธานี": { lat: 17.4138, lon: 102.7858 },
    "อุตรดิตถ์": { lat: 17.6256, lon: 100.0993 },
    "อุทัยธานี": { lat: 15.3804, lon: 100.0247 },
    "อุบลราชธานี": { lat: 15.2287, lon: 104.8564 }
};

function initProvinceDropdown() {
    const list = document.getElementById('provincesDatalist');
    const input = document.getElementById('weatherProvinceInput');
    if (!list) return;
    
    list.innerHTML = '';
    Object.keys(THAI_PROVINCES).sort().forEach(prov => {
        const opt = document.createElement('option');
        opt.value = prov;
        list.appendChild(opt);
    });
    
    if (input && !input.value) {
        input.value = "นครศรีธรรมราช";
    }
}

async function fetchWeather() {
    const input = document.getElementById('weatherProvinceInput');
    if (!input) return;
    
    let prov = input.value.trim();
    if (!prov) {
        prov = "นครศรีธรรมราช";
        input.value = prov;
    }
    
    const coords = THAI_PROVINCES[prov];
    if (!coords) return; // Keep searching/typing
    
    const lat = coords.lat;
    const lon = coords.lon;
    
    const tempEl = document.getElementById('weatherTemp');
    const humEl = document.getElementById('weatherHum');
    const humStatusEl = document.getElementById('weatherHumStatus');
    const forecastEl = document.getElementById('weatherForecast');
    
    if (tempEl) tempEl.textContent = 'กำลังโหลด...';
    if (humEl) humEl.textContent = 'กำลังโหลด...';
    if (humStatusEl) humStatusEl.textContent = '';
    if (forecastEl) forecastEl.textContent = 'กำลังโหลด...';
    
    try {
        const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code`);
        if (!res.ok) throw new Error('API Error');
        const data = await res.json();
        
        const temp = data.current.temperature_2m;
        const hum = data.current.relative_humidity_2m;
        const code = data.current.weather_code;
        
        if (tempEl) tempEl.textContent = `${temp.toFixed(1)} °C`;
        if (humEl) humEl.textContent = `${hum}% RH`;
        
        if (humStatusEl) {
            if (hum >= 70 && hum <= 90) {
                humStatusEl.textContent = '🟢 เหมาะสมกับการเพาะ (70-90%)';
                humStatusEl.className = 'text-[7px] font-bold block text-emerald-500 mt-0.5';
            } else if (hum < 70) {
                humStatusEl.textContent = '⚠️ แห้งเกินไป (ควรฉีดน้ำเพิ่ม)';
                humStatusEl.className = 'text-[7px] font-bold block text-amber-500 mt-0.5';
            } else {
                humStatusEl.textContent = '⚠️ ชื้นเกินไป (ระวังราปนเปื้อน)';
                humStatusEl.className = 'text-[7px] font-bold block text-blue-500 mt-0.5';
            }
        }
        
        let desc = 'ไม่ทราบ';
        if (code === 0) desc = '☀️ แดดจัด / ฟ้าใส';
        else if ([1, 2, 3].includes(code)) desc = '⛅ มีเมฆบางส่วน';
        else if ([45, 48].includes(code)) desc = '🌫️ มีหมอกหนา';
        else if ([51, 53, 55].includes(code)) desc = '🌧️ ฝนตกละออง';
        else if ([61, 63, 65].includes(code)) desc = '🌧️ ฝนตก';
        else if ([80, 81, 82].includes(code)) desc = '🌦️ ฝนโปรยปราย';
        else if ([95, 96, 99].includes(code)) desc = '⛈️ พายุฝนฟ้าคะนอง';
        else desc = '☁️ ครึ้มฟ้าครึ้มฝน';
        
        if (forecastEl) forecastEl.textContent = desc;
        
    } catch (e) {
        console.error("Error fetching weather data", e);
        if (tempEl) tempEl.textContent = 'ล้มเหลว';
        if (humEl) humEl.textContent = 'ล้มเหลว';
        if (forecastEl) forecastEl.textContent = 'เชื่อมต่อล้มเหลว';
    }
}
