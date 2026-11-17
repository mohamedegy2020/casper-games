import * as XLSX from 'xlsx';
import { QuestionItem, GameId } from '../types';

// Default Question Banks for each game
export const DEFAULT_QUESTIONS: Record<string, QuestionItem[]> = {
  scrambled_letters: [
    {
      id: 1,
      question: 'ك ب و ك',
      answer: 'كوكب',
      hint: 'جسم سماوي يدور حول الشمس',
      extraAnswers: ['الكوكب']
    },
    {
      id: 2,
      question: 'ح ا س ب',
      answer: 'حاسب',
      hint: 'جهاز إلكتروني أو كمبيوتر',
      extraAnswers: ['حاسوب', 'الحاسوب']
    },
    {
      id: 3,
      question: 'ف ر ا ش ة',
      answer: 'فراشة',
      hint: 'حشرة جميلة ذات أجنحة ملونة',
      extraAnswers: ['الفراشة']
    },
    {
      id: 4,
      question: 'ق د س',
      answer: 'قدس',
      hint: 'مدينة السلام والمسجد الأقصى',
      extraAnswers: ['القدس', 'بيت المقدس']
    },
    {
      id: 5,
      question: 'أ هـ ر ا م',
      answer: 'أهرام',
      hint: 'عجائب الفراعنة في الجيزة بمصر',
      extraAnswers: ['الاهرام', 'الاهرامات', 'أهرامات']
    },
    {
      id: 6,
      question: 'ص ح ر ا ء',
      answer: 'صحراء',
      hint: 'أرض شاسعة مليئة بالرمال والجمال',
      extraAnswers: ['الصحراء']
    },
    {
      id: 7,
      question: 'ط ا ئ ر ة',
      answer: 'طائرة',
      hint: 'وسيلة نقل تحلق في السماء',
      extraAnswers: ['الطيارة', 'طيارة', 'الطائرة']
    },
    {
      id: 8,
      question: 'غ ا ب ة',
      answer: 'غابة',
      hint: 'مساحة كثيفة من الأشجار والحيوانات',
      extraAnswers: ['الغابة']
    }
  ],

  guessing: [
    {
      id: 1,
      question: 'شيء يكسوه الشعر، وله أسنان ولا يعض، ما هو؟',
      answer: 'مشط',
      hint: 'يستخدم لتصفيف الشعر يومياً',
      extraAnswers: ['المشط', 'مشط الشعر']
    },
    {
      id: 2,
      question: 'يمشي بلا أرجل، ويبكي بلا عيون، من هو؟',
      answer: 'سحاب',
      hint: 'في السماء ويمطر ماءً',
      extraAnswers: ['السحاب', 'الغيم', 'الغيوم', 'سحابة']
    },
    {
      id: 3,
      question: 'كلما أخذت منه كَبُر، وكلما وضعت فيه صَغُر؟',
      answer: 'حفرة',
      hint: 'تحدث عند الحفر في الأرض',
      extraAnswers: ['الحفرة']
    },
    {
      id: 4,
      question: 'له رقبة بلا رأس، فما هو؟',
      answer: 'قميص',
      hint: 'قطعة ملابس نرتديها',
      extraAnswers: ['القميص', 'الزجاجة', 'زجاجة']
    },
    {
      id: 5,
      question: 'شيء يملك أربعة أرجل ولا يستطيع المشي؟',
      answer: 'طاولة',
      hint: 'نضع عليها الطعام أو الكتب',
      extraAnswers: ['الطاولة', 'الكرسي', 'كرسي']
    },
    {
      id: 6,
      question: 'يسمع بلا أذن، ويتكلم بلا لسان، ما هو؟',
      answer: 'هاتف',
      hint: 'جهاز اتصال بين يديك طوال اليوم',
      extraAnswers: ['الهاتف', 'الجوال', 'الموبايل', 'تلفون']
    }
  ],

  write_things: [
    {
      id: 1,
      question: 'اذكر 10 فواكه شائعة:',
      answer: '10 فواكه',
      hint: 'تفاح، موز، برتقال، عنب...',
      items: [
        'تفاح', 'موز', 'برتقال', 'عنب', 'مانجو', 
        'رمان', 'فراولة', 'بطيخ', 'كيوي', 'أناناس'
      ]
    },
    {
      id: 2,
      question: 'اذكر 10 عواصم عربية:',
      answer: '10 عواصم عربية',
      hint: 'القاهرة، الرياض، بغداد، دمشق...',
      items: [
        'القاهرة', 'الرياض', 'القدس', 'عمان', 'بغداد', 
        'دمشق', 'بيروت', 'الرباط', 'تونس', 'الكويت'
      ]
    },
    {
      id: 3,
      question: 'اذكر 10 حيوانات برية مفترسة أو أليفة:',
      answer: '10 حيوانات',
      hint: 'أسد، نمر، ذئب، فيل...',
      items: [
        'اسد', 'نمر', 'فهد', 'ذئب', 'دب', 
        'فيل', 'زرافة', 'غزال', 'ثعلب', 'حصان'
      ]
    },
    {
      id: 4,
      question: 'اذكر 10 دول بدون نقط في حروفها (أو دول عربية مشهورة):',
      answer: '10 دول عربية',
      hint: 'مصر، السودان، الأردن، العراق...',
      items: [
        'مصر', 'السودان', 'الاردن', 'العراق', 'المغرب', 
        'الجزائر', 'تونس', 'ليبيا', 'اليمن', 'عمان'
      ]
    }
  ],

  roulette: [
    {
      id: 1,
      question: 'ما هو أكبر كواكب مجموعتنا الشمسية حجماً؟',
      answer: 'المشتري',
      hint: 'كوكب غازي عملاق يتميز ببقعة حمراء',
      extraAnswers: ['المشتري', 'كوكب المشتري']
    },
    {
      id: 2,
      question: 'ما هي عاصمة سلطنة عمان؟',
      answer: 'مسقط',
      hint: 'مدينة عريقة تطل على بحر عمان',
      extraAnswers: ['مسقط']
    },
    {
      id: 3,
      question: 'ما هو أسرع حيوان بري على وجه الأرض؟',
      answer: 'الفهد',
      hint: 'تبلغ سرعته أكثر من 110 كم/س',
      extraAnswers: ['فهد', 'الفهد الصياد', 'الشيتا']
    },
    {
      id: 4,
      question: 'ما هو العنصر الكيميائي الذي رمزه O؟',
      answer: 'أكسجين',
      hint: 'الغاز الضروري لتنفس الكائنات الحية',
      extraAnswers: ['الاكسجين', 'أكسجين']
    },
    {
      id: 5,
      question: 'كم عدد ألوان قوس قزح؟',
      answer: '7',
      hint: 'رقم فردي مبارك',
      extraAnswers: ['سبعة', 'سبع']
    },
    {
      id: 6,
      question: 'ما هي أصغر دولة في العالم من حيث المساحة؟',
      answer: 'الفاتيكان',
      hint: 'تقع داخل العاصمة الإيطالية روما',
      extraAnswers: ['فاتيكان', 'دولة الفاتيكان']
    },
    {
      id: 7,
      question: 'ما هو الحيوان الملقب بسفينة الصحراء؟',
      answer: 'الجمل',
      hint: 'يتحمل العطش ويمتلك سناماً',
      extraAnswers: ['جمل', 'الناقة', 'الابل']
    },
    {
      id: 8,
      question: 'ما هي أطول سورة في القرآن الكريم؟',
      answer: 'البقرة',
      hint: 'السورة الثانية في المصحف الشريف',
      extraAnswers: ['سورة البقرة', 'بقرة']
    }
  ],

  proverbs: [
    {
      id: 1,
      question: 'من جد وجد ومن زرع .....',
      answer: 'حصد',
      hint: 'جني المحصول بعد التعب والزراعة',
      extraAnswers: ['حصد', 'الحصاد']
    },
    {
      id: 2,
      question: 'الوقت كالسيف إن لم تقطعه .....',
      answer: 'قطعك',
      hint: 'ينبهك إلى قيمة وأهمية الوقت',
      extraAnswers: ['قطعك']
    },
    {
      id: 3,
      question: 'رب أخ لك لم تلده .....',
      answer: 'أمك',
      hint: 'أقرب الناس إليك في العائلة',
      extraAnswers: ['امك', 'أمك']
    },
    {
      id: 4,
      question: 'الصبر مفتاح .....',
      answer: 'الفرج',
      hint: 'زوال الهم والضيق بعد الشدة',
      extraAnswers: ['الفرج', 'فرج']
    },
    {
      id: 5,
      question: 'إذا كان حبيبك عسل لا تلحسه .....',
      answer: 'كله',
      hint: 'دلالة على عدم الإفراط والإحراج',
      extraAnswers: ['كله', 'كلو']
    },
    {
      id: 6,
      question: 'عصفور في اليد خير من عشرة على .....',
      answer: 'الشجرة',
      hint: 'نبات كبير بأغصان وأوراق',
      extraAnswers: ['الشجرة', 'شجرة']
    },
    {
      id: 7,
      question: 'خير الكلام ما قل و .....',
      answer: 'دل',
      hint: 'أعطى المعنى والمطلوب باختصار',
      extraAnswers: ['دل']
    },
    {
      id: 8,
      question: 'لا تؤجل عمل اليوم إلى .....',
      answer: 'الغد',
      hint: 'اليوم التالي',
      extraAnswers: ['الغد', 'غدا', 'بكرة']
    }
  ],

  iq_game: [
    {
      id: 1,
      question: 'أنا أمامك دائماً لكنك لا تستطيع رؤيتي أبداً، من أنا؟',
      answer: 'المستقبل',
      hint: 'ما يأتي بعد الحاضر وغداً',
      extraAnswers: ['المستقبل', 'مستقبل', 'الغد']
    },
    {
      id: 2,
      question: 'إذا كان معك 3 تفاحات وأخذت منها تفاحتين، كم تفاحة معك الآن؟',
      answer: '2',
      hint: 'ركز جيداً فيما أخذته أنت!',
      extraAnswers: ['تفاحتين', 'اثنان', 'اثنين', '2 تفاحة']
    },
    {
      id: 3,
      question: 'شيء يملك عيناً واحدة ولكنه لا يرى بها شيئاً؟',
      answer: 'إبرة',
      hint: 'تستخدم في خياطة الملابس',
      extraAnswers: ['الابرة', 'ابرة', 'الإبرة', 'إبرة الخياطة']
    },
    {
      id: 4,
      question: 'ما الذي يرتفع ولا ينزل أبداً؟',
      answer: 'العمر',
      hint: 'سنوات حياتك التي تزيد كل عام',
      extraAnswers: ['عمرك', 'العمر', 'السن']
    },
    {
      id: 5,
      question: 'ما هو الشيء الذي يدور حول البيت دون أن يتحرك؟',
      answer: 'السور',
      hint: 'جدار يحيط بالحديقة أو المنزل',
      extraAnswers: ['السور', 'سور', 'الجدار', 'السياج']
    },
    {
      id: 6,
      question: 'كلمة واحدة تتكون من 7 أحرف إذا حذفت حرفاً أصبحت 8 أحرف؟',
      answer: 'عثمانية',
      hint: 'احذف حرف النون والياء والتاء تبقى كلمة "ثمانية"!',
      extraAnswers: ['عثمانية', 'العثمانية']
    }
  ],

  grand_challenge: [
    {
      id: 1,
      question: 'ما هي أكبر قارات العالم من حيث المساحة؟',
      answer: 'آسيا',
      hint: 'تضم الصين والهند ومعظم العالم العربي الشرقي',
      extraAnswers: ['اسيا', 'قارة اسيا', 'قارة آسيا']
    },
    {
      id: 2,
      question: 'كم عدد أضلاع الشكل السداسي (خلية النحل)؟',
      answer: '6',
      hint: 'رقم زوجي أقل من 8 وأكثر من 4',
      extraAnswers: ['ستة', 'ست', 'ست اضلاع', '6 اضلاع']
    },
    {
      id: 3,
      question: 'ما هي عاصمة المملكة العربية السعودية؟',
      answer: 'الرياض',
      hint: 'تقع في قلب نجد',
      extraAnswers: ['رياض', 'مدينة الرياض']
    },
    {
      id: 4,
      question: 'ما هو أسرع طائر في العالم عند الانقضاض؟',
      answer: 'الصقر',
      hint: 'طائر جارح مشهور في الخليج العربي',
      extraAnswers: ['صقر', 'الشاهين', 'صقر الشاهين']
    },
    {
      id: 5,
      question: 'ما هو المعدن السائل الوحيد في درجة حرارة الغرفة؟',
      answer: 'الزئبق',
      hint: 'يستخدم في موازين الحرارة القديمة',
      extraAnswers: ['زئبق']
    },
    {
      id: 6,
      question: 'من هو الصحابي الملقب بسيف الله المسلول؟',
      answer: 'خالد بن الوليد',
      hint: 'قائد معركة اليرموك',
      extraAnswers: ['خالد', 'خالد بن وليد']
    },
    {
      id: 7,
      question: 'ما هو الكوكب الملقب بالكوكب الأحمر؟',
      answer: 'المريخ',
      hint: 'رابع كواكب المجموعة الشمسية',
      extraAnswers: ['مريخ', 'كوكب المريخ']
    },
    {
      id: 8,
      question: 'كم عدد سور القرآن الكريم؟',
      answer: '114',
      hint: 'أكثر من مائة وعشر سور',
      extraAnswers: ['مائة واربعة عشر', 'مئة واربعة عشر', '114 سورة']
    },
    {
      id: 9,
      question: 'ما هي العملة الرسمية لدولة اليابان؟',
      answer: 'الين',
      hint: 'عملة آسيوية قصيرة الاسم من حرفين بعد ال',
      extraAnswers: ['ين', 'الين الياباني']
    },
    {
      id: 10,
      question: 'ما هو أطول نهر في قارة أفريقيا؟',
      answer: 'النيل',
      hint: 'يمر في مصر والسودان',
      extraAnswers: ['نهر النيل', 'نيل']
    },
    {
      id: 11,
      question: 'كم دقيقة في الساعة ونصف؟',
      answer: '90',
      hint: '60 + 30',
      extraAnswers: ['تسعون', 'تسعين', '90 دقيقة']
    },
    {
      id: 12,
      question: 'ما هو الحيوان الذي ينام وإحدى عينيه مفتوحة؟',
      answer: 'الدولفين',
      hint: 'ثديي بحري ذكي جداً',
      extraAnswers: ['دولفين', 'الدلفين', 'دلفين']
    },
    {
      id: 13,
      question: 'ما هي اللغة الرسمية في البرازيل؟',
      answer: 'البرتغالية',
      hint: 'ليست الإسبانية رغم وجودها في أمريكا الجنوبية!',
      extraAnswers: ['برتغالية', 'اللغة البرتغالية']
    },
    {
      id: 14,
      question: 'ما هو الغاز الأكثر وفرة في الغلاف الجوي للأرض؟',
      answer: 'النيتروجين',
      hint: 'يشكل حوالي 78% من الهواء',
      extraAnswers: ['نيتروجين', 'الآزوت']
    }
  ]
};

/**
 * Downloads a sample Excel file (.xlsx) formatted for the given game
 */
export function downloadSampleExcel(gameId: GameId, gameTitle: string) {
  const wb = XLSX.utils.book_new();

  if (gameId === 'write_things') {
    const sampleData = [
      {
        'رقم_السؤال': 1,
        'الموضوع_المطلوب': 'اذكر 10 فواكه شائعة',
        'العنصر_1': 'تفاح',
        'العنصر_2': 'موز',
        'العنصر_3': 'برتقال',
        'العنصر_4': 'عنب',
        'العنصر_5': 'مانجو',
        'العنصر_6': 'رمان',
        'العنصر_7': 'فراولة',
        'العنصر_8': 'بطيخ',
        'العنصر_9': 'كيوي',
        'العنصر_10': 'أناناس',
        'تلميح_المبدع': 'فواكه لذيذة ومغذية'
      },
      {
        'رقم_السؤال': 2,
        'الموضوع_المطلوب': 'اذكر 10 عواصم عربية',
        'العنصر_1': 'القاهرة',
        'العنصر_2': 'الرياض',
        'العنصر_3': 'القدس',
        'العنصر_4': 'عمان',
        'العنصر_5': 'بغداد',
        'العنصر_6': 'دمشق',
        'العنصر_7': 'بيروت',
        'العنصر_8': 'الرباط',
        'العنصر_9': 'تونس',
        'العنصر_10': 'الكويت',
        'تلميح_المبدع': 'عواصم بلدان عربية شقيقة'
      }
    ];
    const ws = XLSX.utils.json_to_sheet(sampleData);
    XLSX.utils.book_append_sheet(wb, ws, 'الأسئلة');
  } else if (gameId === 'grand_challenge') {
    const sampleList = DEFAULT_QUESTIONS.grand_challenge;
    const sampleData = sampleList.map((item, idx) => ({
      'رقم_السؤال': idx + 1,
      'السؤال': item.question,
      'الاجابة_الصحيحة': item.answer,
      'الاجابة_المقبولة': (item.extraAnswers || []).join(' | '),
      'التلميح': item.hint || ''
    }));
    const ws = XLSX.utils.json_to_sheet(sampleData);
    XLSX.utils.book_append_sheet(wb, ws, 'الأسئلة');
  } else {
    const sampleList = DEFAULT_QUESTIONS[gameId] || DEFAULT_QUESTIONS['scrambled_letters'];
    const sampleData = sampleList.map((item, idx) => ({
      'رقم_السؤال': idx + 1,
      'السؤال': item.question,
      'الاجابة_الصحيحة': item.answer,
      'التلميح': item.hint || '',
      'اجابات_بديلة_مقبولة': (item.extraAnswers || []).join(' | ')
    }));
    const ws = XLSX.utils.json_to_sheet(sampleData);
    XLSX.utils.book_append_sheet(wb, ws, 'الأسئلة');
  }

  // Trigger file download
  XLSX.writeFile(wb, `شيت_استرشادي_${gameTitle.replace(/\s+/g, '_')}.xlsx`);
}

/**
 * Parses an uploaded Excel or CSV file into QuestionItem array
 */
export async function parseUploadedExcel(file: File, isWriteThings: boolean = false): Promise<QuestionItem[]> {
  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data, { type: 'array' });
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rawRows: any[] = XLSX.utils.sheet_to_json(worksheet);

  if (!rawRows || rawRows.length === 0) {
    throw new Error('الملف فارغ أو لا يحتوي على صفوف بيانات صالحة.');
  }

  const items: QuestionItem[] = [];

  rawRows.forEach((row, index) => {
    if (isWriteThings) {
      // Find topic question
      const question = row['الموضوع_المطلوب'] || row['السؤال'] || row['الموضوع'] || Object.values(row)[1] || `موضوع ${index + 1}`;
      const hint = row['تلميح_المبدع'] || row['التلميح'] || '';
      
      // Extract 10 items
      const subItems: string[] = [];
      for (let i = 1; i <= 10; i++) {
        const val = row[`العنصر_${i}`] || row[`اجابة_${i}`] || row[`الاجابة_${i}`] || row[`عنصر_${i}`];
        if (val) {
          subItems.push(String(val).trim());
        }
      }
      
      // If none found by key, grab next 10 columns
      if (subItems.length === 0) {
        const values = Object.values(row).map(String).filter(Boolean);
        subItems.push(...values.slice(1, 11));
      }

      if (subItems.length > 0) {
        items.push({
          id: index + 1,
          question: String(question),
          answer: String(question),
          hint: String(hint),
          items: subItems
        });
      }
    } else {
      // Standard Question format (supports both الاجابة_المقبولة and اجابات_بديلة_مقبولة)
      const hasNamedQuestion = 'السؤال' in row || 'نص_السؤال' in row;
      const question = row['السؤال'] ?? row['نص_السؤال'] ?? (!hasNamedQuestion ? Object.values(row)[1] : '') ?? '';

      const hasNamedAnswer =
        'الاجابة_الصحيحة' in row ||
        'الإجابة_الصحيحة' in row ||
        'الاجابة الصحيحة' in row ||
        'الاجابة' in row ||
        'الإجابة' in row;
      const answer =
        row['الاجابة_الصحيحة'] ??
        row['الإجابة_الصحيحة'] ??
        row['الاجابة الصحيحة'] ??
        row['الاجابة'] ??
        row['الإجابة'] ??
        (!hasNamedAnswer ? Object.values(row)[2] : '') ??
        '';

      const hasNamedHint = 'التلميح' in row || 'تلميح' in row || 'تلميح_المبدع' in row;
      const hint =
        row['التلميح'] ??
        row['تلميح'] ??
        row['تلميح_المبدع'] ??
        (!hasNamedHint ? Object.values(row)[3] : '') ??
        '';

      const hasNamedAlt =
        'الاجابة_المقبولة' in row ||
        'الإجابة_المقبولة' in row ||
        'الاجابة المقبولة' in row ||
        'الإجابة المقبولة' in row ||
        'اجابات_مقبولة' in row ||
        'الاجابات_المقبولة' in row ||
        'اجابات_بديلة_مقبولة' in row ||
        'بدائل' in row;
      const alternativesRaw =
        row['الاجابة_المقبولة'] ??
        row['الإجابة_المقبولة'] ??
        row['الاجابة المقبولة'] ??
        row['الإجابة المقبولة'] ??
        row['اجابات_مقبولة'] ??
        row['الاجابات_المقبولة'] ??
        row['اجابات_بديلة_مقبولة'] ??
        row['بدائل'] ??
        (!hasNamedAlt ? Object.values(row)[4] : '') ??
        '';

      const alternatives = alternativesRaw !== undefined && alternativesRaw !== null && String(alternativesRaw).trim() !== ''
        ? String(alternativesRaw).split(/[|,/،]/).map(s => s.trim()).filter(Boolean)
        : [];

      if (String(question).trim() && String(answer).trim()) {
        items.push({
          id: index + 1,
          question: String(question).trim(),
          answer: String(answer).trim(),
          hint: String(hint || '').trim(),
          extraAnswers: alternatives
        });
      }
    }
  });

  if (items.length === 0) {
    throw new Error('لم يتم العثور على أعمدة صالحة في الملف. يرجى مراجعة الشيت الاسترشادي.');
  }

  return items;
}
