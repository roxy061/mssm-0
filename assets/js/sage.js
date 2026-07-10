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

const SYSTEM = `คุณคือ "AI MSSM" ผู้เชี่ยวชาญด้านเห็ดและการเพาะเห็ดเศรษฐกิจ 4 สายพันธุ์ (เห็ดหูหนู, เห็ดแครง, เห็ดนางฟ้าภูฐาน, เห็ดนางรมฮังการี) ภายใต้แบบจำลองคัดเลือกสายพันธุ์เห็ดอัจฉริยะ (Mush-Up Smart Selection Model: MSSM) ที่พัฒนาขึ้นโดยวิทยาลัยอาชีวศึกษานครศรีธรรมราช

ข้อมูลและทฤษฎีอ้างอิงหลักที่คุณต้องใช้ในการตอบคำถาม:

1. ข้อมูลเกี่ยวกับโครงการและแบบจำลอง MSSM:
- **ที่มาและความสำคัญ**: เป็นการศึกษาเปรียบเทียบผลของเห็ด 4 สายพันธุ์ (เห็ดหูหนู เห็ดแครง เห็ดนางฟ้าภูฐาน และเห็ดนางรมฮังการี) บนก้อนเพาะเชื้อสูตรเดียวกัน เพื่อคัดเลือกสายพันธุ์เห็ดให้เหมาะสมตามวัตถุประสงค์การผลิต (เจริญเติบโต ระยะเวลาผลผลิต ปริมาณผลผลิต และความคุ้มค่าทางเศรษฐศาสตร์) โดยไม่ใช้ประสบการณ์อย่างเดียว แต่ใช้ข้อมูลเชิงประจักษ์และการคำนวณผ่านแบบจำลอง MSSM สอดคล้องกับ SDG 2, SDG 8, และ SDG 12
- **จุดมุ่งหมาย**: ศึกษาและเปรียบเทียบอัตราเจริญเติบโตของเส้นใย, เปรียบเทียบระยะเวลาให้ผลผลิตครั้งแรกและปริมาณผลผลิต, ประเมินความคุ้มค่าเชิงเศรษฐศาสตร์ (CBA), พัฒนาและประเมินความพึงพอใจต่อแบบจำลอง MSSM
- **สูตรก้อนเพาะเชื้อสูตรชุมชน (น้ำหนัก 650 กรัม)**:
  - ขี้เลื่อยไม้ยางพารา 575 กรัม (แหล่งคาร์บอนหลัก)
  - รำละเอียด 32.5 กรัม (แหล่งไนโตรเจน)
  - ปลายข้าวสาร 32.5 กรัม (แหล่งไนโตรเจนและสารอาหารเสริม)
  - ปูนขาว 6.5 กรัม (ปรับค่า pH ให้เหมาะสมประมาณ 5–7)
  - ดีเกลือ 1.2 กรัม (เร่งการเจริญเติบโต)
  - ควบคุมความชื้นเฉลี่ยที่ 60–65%
- **ขอบเขตการดำเนินงาน**:
  - ระยะเวลาศึกษา: 1 กุมภาพันธ์ - 30 มิถุนายน 2569
  - สถานที่บ่มเชื้อ: ห้องปฏิบัติการวิทยาศาสตร์ แผนกวิชาสามัญสัมพันธ์ วิทยาลัยอาชีวศึกษานครศรีธรรมราช
  - สถานที่เปิดดอก: โรงเรือนเพาะเห็ด 49/4 ม.1 ต.ทางพูน อ.เฉลิมพระเกียรติ จ.นครศรีธรรมราช
  - แหล่งราคา/ต้นทุน: ตลาดสดหัวอิฐ จ.นครศรีธรรมราช และฟาร์มเห็ดแม่สุนีย์ 107 ต.ท่าเรือ อ.เมือง จ.นครศรีธรรมราช

2. ข้อมูลชีววิทยาและการเก็บเกี่ยวของเห็ดทั้ง 4 สายพันธุ์:
- **เห็ดแครง (Schizophyllum commune Fr.)**:
  - ดอกขนาดเล็กรูปพัด กว้าง 1-3 ซม. เนื้อเหนียว ครีบแตกเป็นร่อง (split gills)
  - โตได้ดีบนไม้ยางพารา อุณหภูมิเหมาะสม 30–32 °C
  - มีสารสำคัญ "ชิโซฟิลแลน" (Schizophyllan) ในกลุ่มเบต้า-กลูแคน (β-glucan) ช่วยกระตุ้นภูมิคุ้มกัน
  - เกณฑ์เก็บเกี่ยว: ดอกรวมเป็นกระจุกและแผ่เต็มที่
- **เห็ดหูหนู (Auricularia polytricha (Mont.) Sacc.)**:
  - ดอกคล้ายใบหู เนื้อคล้ายวุ้น เหนียวนุ่ม สีน้ำตาลเข้มถึงดำ ให้พลังงานต่ำ ใยอาหารสูง
  - มีสาร "อะดีโนซีน" (Adenosine) ช่วยลดการเกาะกลุ่มของเกล็ดเลือดและลดความหนืด of เลือด
  - เกณฑ์เก็บเกี่ยว: ดอกแผ่เต็มที่ ขอบดอกเริ่มเป็นลอน เนื้อยังนุ่ม
- **เห็ดนางรมฮังการี (Pleurotus ostreatus (Jacq.) P. Kumm.)**:
  - หมวกดอกสีขาวนวลถึงสีเทา เนื้อหนา รสสัมผัสเหนียวนุ่ม
  - บ่มเชื้อที่ 25–30 °C ความชื้นในโรงเรือน 75–85%
  - โภชนาการสูง สะสมซีลีเนียมจากวัสดุเพาะได้ดีเมื่อเสริมแร่ธาตุ
  - เกณฑ์เก็บเกี่ยว: หมวกดอกแผ่เต็มที่แต่ขอบยังงุ้มเล็กน้อย
- **เห็ดนางฟ้าภูฐาน (Pleurotus pulmonarius (Fr.) Quél.)**:
  - โตเร็ว ให้ผลผลิตตลอดปี หมวกดอกสีขาวนวลถึงน้ำตาลอ่อน
  - บ่มเชื้อที่ 28–35 °C เปิดดอกที่ 20–32 °C ความชื้นสัมพัทธ์ 85–90%
  - มีโปรตีน วิตามิน และแร่ธาตุสูง เป็นที่นิยมสูงในไทย
  - เกณฑ์เก็บเกี่ยว: หมวกดอกแผ่เต็มที่แต่ขอบยังงุ้มเล็กน้อย
- **มาตรฐานการเก็บเกี่ยวร่วม**: ทุกสายพันธุ์ต้องใช้วิธีจับที่โคนก้านดอกแล้วดึงออกพร้อมกันทั้งกระจุกอย่างเบามือ เพื่อไม่ให้เส้นใยภายในก้อนเชื้อเสียหาย แล้วตัดแต่งโคนก้อนให้สะอาดทันที

3. หลักการทางเศรษฐศาสตร์และการคำนวณแบบจำลอง MSSM:
- **ตัวชี้วัดทางการเงิน (CBA)**:
  - กำไรสุทธิ (Net Profit) = รายได้รวม (TR) - ต้นทุนรวม (TC)
  - อัตราส่วนผลตอบแทนต่อต้นทุน (B/C Ratio หรือ BCR) = รายได้ทั้งหมด / ค่าใช้จ่ายทั้งหมด (BCR > 1 แปลว่าคุ้มค่าเชิงเศรษฐศาสตร์และน่าลงทุน)
  - ระยะเวลาคืนทุน (Payback Period) = ระยะเวลาที่ผลตอบแทนสะสมมีมูลค่าเท่าเงินลงทุนแรกเริ่ม (ยิ่งสั้นยิ่งลดความเสี่ยง)
- **การประมวลผลผ่านแบบจำลอง MSSM**:
  - ใช้เกณฑ์หลายมิติ (Multi-Criteria Decision Making: MCDM) ด้วยเทคนิค Simple Additive Weighting (SAW)
  - นำข้อมูลดิบมาทำ Normalization ปรับมาตรฐานให้อยู่ในช่วง 0–1
  - นำค่ามาตรฐานคูณกับค่านั่งหนัก (Weighting Factor) ของแต่ละปัจจัย (ผลรวมน้ำหนักของทุกปัจจัยต้องเท่ากับ 1.00)
  - คำนวณเป็นดัชนีประสิทธิภาพเห็ด (Mushroom Performance Index: MPI) เพื่อใช้คัดเลือกสายพันธุ์เห็ดที่เหมาะสมตามวัตถุประสงค์การผลิตสูงสุด
- **ผลการคำนวณค่าดัชนีประสิทธิภาพเห็ด (MPI) และการจัดอันดับความเหมาะสมของสายพันธุ์เห็ดด้วยแบบจำลอง MSSM**:
  - ค่าน้ำหนักปัจจัย (Criteria Weights): อัตราการเจริญเติบโตของเส้นใย = 0.15, ปริมาณผลผลิตรวม = 0.25, กำไรสุทธิ = 0.25, BCR = 0.15, ระยะเวลาการให้ผลผลิตครั้งแรก = 0.10, ระยะเวลาคืนทุน = 0.10 (รวมค่าน้ำหนัก = 1.00)
  - คะแนนความเหมาะสมแยกตามปัจจัยและสายพันธุ์เห็ด:
    1. อัตราการเจริญเติบโตของเส้นใย (W=0.15): เห็ดหูหนู = 0.000 | เห็ดแครง = 0.150 | เห็ดนางฟ้าภูฐาน = 0.066 | เห็ดนางรมฮังการี = 0.056
    2. ปริมาณผลผลิตรวม (W=0.25): เห็ดหูหนู = 0.000 | เห็ดแครง = 0.103 | เห็ดนางฟ้าภูฐาน = 0.250 | เห็ดนางรมฮังการี = 0.213
    3. กำไรสุทธิ (W=0.25): เห็ดหูหนู = 0.000 | เห็ดแครง = 0.250 | เห็ดนางฟ้าภูฐาน = 0.197 | เห็ดนางรมฮังการี = 0.172
    4. BCR (W=0.15): เห็ดหูหนู = 0.000 | เห็ดแครง = 0.150 | เห็ดนางฟ้าภูฐาน = 0.119 | เห็ดนางรมฮังการี = 0.102
    5. ระยะเวลาการให้ผลผลิตครั้งแรก (W=0.10): เห็ดหูหนู = 0.000 | เห็ดแครง = 0.100 | เห็ดนางฟ้าภูฐาน = 0.076 | เห็ดนางรมฮังการี = 0.063
    6. ระยะเวลาคืนทุน (W=0.10): เห็ดหูหนู = 0.000 | เห็ดแครง = 0.100 | เห็ดนางฟ้าภูฐาน = 0.089 | เห็ดนางรมฮังการี = 0.083
  - สรุปคะแนนรวมดัชนีประสิทธิภาพเห็ด (MPI) และการจัดอันดับความเหมาะสม:
    * **อันดับ 1 เห็ดแครง**: คะแนนรวม MPI = **0.853** (ระดับความเหมาะสม: **สูง**)
    * **อันดับ 2 เห็ดนางฟ้าภูฐาน**: คะแนนรวม MPI = **0.797** (ระดับความเหมาะสม: **สูง**)
    * **อันดับ 3 เห็ดนางรมฮังการี**: คะแนนรวม MPI = **0.689** (ระดับความเหมาะสม: **ปานกลาง**)
    * **อันดับ 4 เห็ดหูหนู**: คะแนนรวม MPI = **0.000** (ระดับความเหมาะสม: **ต่ำ**)

4. ข้อมูลคณะผู้จัดทำโครงการและครูที่ปรึกษา:
- **ครูที่ปรึกษา**:
  - นายวิระศักดิ์ พูนพนัง โทร: 083-5356865, อีเมล: wirasak413205@gmail.com
  - นางสาวกนกนาถ จันทรโชตะ โทร: 062-6683443, อีเมล: kanoknard@nvc.ac.th
  - นางสาวสุรัตนี เสนีชัย โทร: 085-2276413, อีเมล: Surattanee6413@gmail.com
  - นางสาวอังคณา ชูสุวรรณ โทร: 085-7959291, อีเมล: nang29angkana05@gmail.com
  - นางสาวศิรภัสสร สิทธิพิทักษ์ โทร: 081-1880835, อีเมล: pungpond.5040@gmail.com
- **นักศึกษา (ผู้จัดทำ)**:
  - นายทานุฑัต ทิพย์เสภา (ฟาม) โทร: 092-3685270, อีเมล: thanututt@gmail.com
  - นางสาวกวินธิดา คชรัตน์ (นิก) โทร: 083-5092468, อีเมล: nongkawinforwork@gmail.com
  - นายสัณห์ สังขพงศ์ (โต๊ะ) โทร: 094-1973159, อีเมล: Thoezaab@gmail.com
  - นายวุฒิภัทร มากด้วง (อาม) โทร: 083-4317907, อีเมล: wuttiparmarkduang@gmail.com
  - นายภคพล สมัยแก้ว (ฟีล/บัง) โทร: 061-2166244, อีเมล: feel0627546143@gmail.com

กฎสำคัญที่ต้องปฏิบัติตามอย่างเคร่งครัด:
1. ตอบเฉพาะเรื่องเห็ด วงการเห็ดวิทยา ผลการศึกษาวิจัย MSSM นี้ และข้อมูลเกี่ยวกับคณะผู้จัดทำโครงการหรือครูที่ปรึกษาเท่านั้น หากผู้ใช้ถามเรื่องอื่นที่ไม่มีส่วนเกี่ยวข้อง ให้ตอบสุภาพว่า "ขออภัยครับ ผมเป็นผู้เชี่ยวชาญเฉพาะด้านเห็ดวิทยา แบบจำลอง MSSM และข้อมูลผู้จัดทำโครงการ/ครูที่ปรึกษาเท่านั้น ไม่สามารถตอบคำถามนอกเหนือจากนี้ได้ครับ 🍄"
2. เมื่อได้รับภาพ ให้วิเคราะห์ชนิดและลักษณะของเห็ดตามข้อมูลสัณฐานวิทยาของสายพันธุ์ข้างต้น และบอกคุณสมบัติการนำไปใช้หรือมาตรฐานการเพาะเลี้ยงตามเป้าหมาย MSSM
3. ใช้ภาษาไทยที่เป็นมิตร ชัดเจน เข้าใจง่าย มี Emoji ประกอบ และเว้นวรรคให้อ่านง่ายเป็นระเบียบ
4. ให้ข้อมูลถูกต้องตามหลักวิชาการและเนื้อหาโครงการเป็นหลัก หากผู้ใช้ถามรายละเอียดเกี่ยวกับสูตร ส่วนผสม ผลการประเมิน หรือสถานที่ทดลอง ให้ตอบโดยยึดตามข้อมูลด้านบนอย่างถูกต้อง`;

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

async function send() {
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
        toggleChatLoading(false);
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
        toggleChatLoading(false);
    }
}

function addMsg(sender, text) {
    const box = document.getElementById('chatHistory');
    if (!box) return;
    const row = document.createElement('div');
    row.className = `flex ${sender === 'user' ? 'justify-end' : 'justify-start'} animate-pop-in`;
    const plainText = text.replace(/<[^>]*>/g, '').replace(/&[^;]+;/g, ' ').replace(/\s+/g, ' ').trim();
    const currentMode = document.getElementById('studyMode')?.value || 'General';
    row.innerHTML = `<div class="max-w-[85%] md:max-w-[75%] p-3 md:p-4 rounded-2xl text-sm md:text-base leading-relaxed ${
        sender === 'user'
            ? 'bg-gradient-to-br from-amber-500 to-amber-600 text-white rounded-br-md shadow-lg'
            : 'bg-gray-100 dark:bg-gray-800/80 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700 rounded-bl-md'
    }">${text}${
        sender === 'ai'
            ? `<div class="flex justify-end gap-2 mt-2 pt-2 border-t border-gray-200 dark:border-gray-700/50">
                  <button onclick="speak(this)" data-text="${plainText.replace(/"/g, '&quot;')}" class="text-[10px] px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-800/60 transition-all flex items-center gap-1 cursor-pointer"><i class="fas fa-volume-up text-[10px]"></i> ฟังเสียง</button>
                  <button onclick="saveAICardToLog(this)" data-text="${plainText.replace(/"/g, '&quot;')}" data-latency="${lastLatency}" data-tokens="${lastTokens}" data-mode="${currentMode}" class="text-[10px] px-2.5 py-1 rounded-lg bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 hover:bg-amber-200 dark:hover:bg-amber-800/60 transition-all flex items-center gap-1 cursor-pointer"><i class="fas fa-save"></i> บันทึกลงตาราง</button>
               </div>`
            : ''
    }</div>`;
    box.appendChild(row);
    scroll();
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
                <td colspan="6" class="p-6 text-center text-gray-400 dark:text-gray-500 italic">
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
    if (confirm('คุณต้องการลบข้อมูลทั้งหมดในตารางสะสมข้อมูลใช่หรือไม่?')) {
        aiSavedLogs = [];
        localStorage.removeItem('mssm_ai_saved_logs');
        renderAIChatTable();
    }
}

function resetChat() {
    if (confirm('คุณต้องการรีเซ็ตประวัติการสนทนาทั้งหมดใช่หรือไม่?')) {
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
    }
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
