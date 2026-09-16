// ── Language Definitions ──────────────────────────────────────────
export const LANGUAGES = {
  en: {
    code: 'en',
    name: 'English',
    flag: '🇬🇧',
    dir: 'ltr',
    welcome: 'Police Complaint Portal',
    subtitle: 'File your complaint safely and securely',
    placeholder: 'Describe your complaint or answer the question...',
    send: 'Send',
    generating: 'AI Officer is typing...',
    complaintSummary: 'Complaint Summary',
    submitBtn: 'Submit Complaint',
    newComplaint: 'New Complaint',
    track: 'Track Complaint',
    admin: 'Admin',
    trackLabel: 'Track Your Complaint',
    trackPlaceholder: 'Enter Complaint ID (e.g. CMP202405XXXXX)',
    trackBtn: 'Track',
    successMsg: 'Your complaint has been successfully registered.',
    trackId: 'Complaint ID',
    statusLabels: {
      pending: 'Pending',
      under_investigation: 'Under Investigation',
      fir_registered: 'FIR Registered',
      resolved: 'Resolved',
      closed: 'Closed',
      rejected: 'Rejected',
    },
    fields: {
      name: 'Complainant Name',
      phone: 'Phone Number',
      address: 'Address',
      incident: 'Incident Description',
      date: 'Date of Incident',
      location: 'Location of Incident',
      type: 'Type of Complaint',
    },
  },
  hi: {
    code: 'hi',
    name: 'हिन्दी',
    flag: '🇮🇳',
    dir: 'ltr',
    welcome: 'पुलिस शिकायत पोर्टल',
    subtitle: 'अपनी शिकायत सुरक्षित रूप से दर्ज करें',
    placeholder: 'अपनी शिकायत बताएं या प्रश्न का उत्तर दें...',
    send: 'भेजें',
    generating: 'AI अधिकारी टाइप कर रहे हैं...',
    complaintSummary: 'शिकायत सारांश',
    submitBtn: 'शिकायत दर्ज करें',
    newComplaint: 'नई शिकायत',
    track: 'शिकायत ट्रैक करें',
    admin: 'व्यवस्थापक',
    trackLabel: 'अपनी शिकायत ट्रैक करें',
    trackPlaceholder: 'शिकायत ID दर्ज करें (जैसे CMP202405XXXXX)',
    trackBtn: 'ट्रैक करें',
    successMsg: 'आपकी शिकायत सफलतापूर्वक दर्ज हो गई है।',
    trackId: 'शिकायत ID',
    statusLabels: {
      pending: 'लंबित',
      under_investigation: 'जांच जारी',
      fir_registered: 'FIR दर्ज',
      resolved: 'हल हो गई',
      closed: 'बंद',
      rejected: 'अस्वीकृत',
    },
    fields: {
      name: 'शिकायतकर्ता का नाम',
      phone: 'फोन नंबर',
      address: 'पता',
      incident: 'घटना विवरण',
      date: 'घटना की तारीख',
      location: 'घटना स्थान',
      type: 'शिकायत का प्रकार',
    },
  },
  te: {
    code: 'te',
    name: 'తెలుగు',
    flag: '🌟',
    dir: 'ltr',
    welcome: 'పోలీస్ ఫిర్యాదు పోర్టల్',
    subtitle: 'మీ ఫిర్యాదును సురక్షితంగా నమోదు చేయండి',
    placeholder: 'మీ ఫిర్యాదును వివరించండి లేదా ప్రశ్నకు సమాధానం ఇవ్వండి...',
    send: 'పంపు',
    generating: 'AI అధికారి టైప్ చేస్తున్నారు...',
    complaintSummary: 'ఫిర్యాదు సారాంశం',
    submitBtn: 'ఫిర్యాదు సమర్పించండి',
    newComplaint: 'కొత్త ఫిర్యాదు',
    track: 'ఫిర్యాదు ట్రాక్',
    admin: 'అడ్మిన్',
    trackLabel: 'మీ ఫిర్యాదును ట్రాక్ చేయండి',
    trackPlaceholder: 'ఫిర్యాదు ID నమోదు చేయండి (ఉదా: CMP202405XXXXX)',
    trackBtn: 'ట్రాక్ చేయి',
    successMsg: 'మీ ఫిర్యాదు విజయవంతంగా నమోదైంది.',
    trackId: 'ఫిర్యాదు ID',
    statusLabels: {
      pending: 'పెండింగ్',
      under_investigation: 'దర్యాప్తులో',
      fir_registered: 'FIR నమోదు',
      resolved: 'పరిష్కరించబడింది',
      closed: 'మూసివేయబడింది',
      rejected: 'తిరస్కరించబడింది',
    },
    fields: {
      name: 'ఫిర్యాదుదారు పేరు',
      phone: 'ఫోన్ నంబర్',
      address: 'చిరునామా',
      incident: 'సంఘటన వివరణ',
      date: 'సంఘటన తేదీ',
      location: 'సంఘటన స్థలం',
      type: 'ఫిర్యాదు రకం',
    },
  },
};

// ── System Prompts ────────────────────────────────────────────────
export const SYSTEM_PROMPTS = {
  en: `You are a compassionate and professional AI Police Complaint Officer for the Indian Police Department. Help citizens file police complaints in English.

Collect these 7 pieces of information one at a time:
1. Full name of complainant
2. Phone number (10 digits)
3. Complete address
4. Type of complaint: theft | assault | fraud | missing_person | cybercrime | domestic_violence | harassment | vandalism | accident | other
5. Date and time of incident (ask for approximate if unknown)
6. Location/place where incident occurred
7. Detailed description of what happened

Rules:
- Ask ONE question at a time with warmth and empathy
- Validate phone numbers (10 digits, Indian format)
- Acknowledge the user's difficulty and be supportive
- If answer is unclear, gently ask for clarification
- When ALL 7 details are confirmed, append this JSON to the END of your message:
  COMPLAINT_JSON:{"name":"...","phone":"...","address":"...","complaint_type":"...","incident_date":"...","incident_location":"...","incident_description":"..."}
- Only output COMPLAINT_JSON when every field is filled
- Be human, not robotic. Show genuine concern.
- Keep responses concise (2-4 sentences max per turn)`,

  hi: `आप भारतीय पुलिस विभाग के AI शिकायत अधिकारी हैं। नागरिकों को हिंदी में शिकायत दर्ज करने में मदद करें।

एक-एक करके ये 7 जानकारी एकत्र करें:
1. शिकायतकर्ता का पूरा नाम
2. फोन नंबर (10 अंक)
3. पूरा पता
4. शिकायत का प्रकार: theft | assault | fraud | missing_person | cybercrime | domestic_violence | harassment | vandalism | accident | other
5. घटना की तारीख और समय
6. घटना हुई जगह
7. घटना का विस्तृत विवरण

नियम:
- एक बार में एक प्रश्न, सहानुभूति के साथ
- फोन 10 अंकों का होना चाहिए
- सभी 7 विवरण मिलने पर संदेश के अंत में यह JSON जोड़ें:
  COMPLAINT_JSON:{"name":"...","phone":"...","address":"...","complaint_type":"...","incident_date":"...","incident_location":"...","incident_description":"..."}
- हर उत्तर 2-4 वाक्यों तक सीमित रखें`,

  te: `మీరు భారత పోలీస్ శాఖ AI ఫిర్యాదు అధికారి. పౌరులకు తెలుగులో ఫిర్యాదు దాఖలు చేయడంలో సహాయం చేయండి.

ఈ 7 వివరాలను ఒక్కొక్కటిగా సేకరించండి:
1. ఫిర్యాదుదారు పూర్తి పేరు
2. ఫోన్ నంబర్ (10 అంకెలు)
3. పూర్తి చిరునామా
4. ఫిర్యాదు రకం: theft | assault | fraud | missing_person | cybercrime | domestic_violence | harassment | vandalism | accident | other
5. సంఘటన తేదీ మరియు సమయం
6. సంఘటన జరిగిన స్థలం
7. సంఘటన వివరణ

నియమాలు:
- ఒక్కొక్కసారి ఒక ప్రశ్న మాత్రమే అడగండి
- ఫోన్ 10 అంకెలు ఉండాలి
- 7 వివరాలు అన్నీ అందిన తర్వాత సందేశం చివర ఈ JSON జోడించండి:
  COMPLAINT_JSON:{"name":"...","phone":"...","address":"...","complaint_type":"...","incident_date":"...","incident_location":"...","incident_description":"..."}
- ప్రతి సమాధానం 2-4 వాక్యాల్లో ఇవ్వండి`,
};

export const INITIAL_MESSAGES = {
  en: `Namaste 🙏 I am your AI Complaint Officer. I'm here to help you file a police complaint safely and confidentially. Your courage in coming forward is commendable, and we will ensure your complaint is handled with utmost care.\n\nTo begin, could you please tell me your **full name**?`,
  hi: `नमस्ते 🙏 मैं आपका AI शिकायत अधिकारी हूँ। आपकी पुलिस शिकायत सुरक्षित तरीके से दर्ज करने में मदद करूँगा। आपकी सुरक्षा हमारी प्राथमिकता है।\n\nशुरू करने के लिए, कृपया अपना **पूरा नाम** बताएं?`,
  te: `నమస్కారం 🙏 నేను మీ AI ఫిర్యాదు అధికారిని. మీ పోలీస్ ఫిర్యాదును సురక్షితంగా దాఖలు చేయడంలో సహాయం చేస్తాను. మీ ధైర్యం అభినందనీయం.\n\nప్రారంభించడానికి, మీ **పూర్తి పేరు** చెప్పగలరా?`,
};

export const STATUS_CONFIG = {
  pending:             { color: 'amber',  icon: '⏳', label: 'Pending' },
  under_investigation: { color: 'blue',   icon: '🔍', label: 'Under Investigation' },
  fir_registered:      { color: 'purple', icon: '📋', label: 'FIR Registered' },
  resolved:            { color: 'green',  icon: '✅', label: 'Resolved' },
  closed:              { color: 'gray',   icon: '🔒', label: 'Closed' },
  rejected:            { color: 'red',    icon: '❌', label: 'Rejected' },
};

export const COMPLAINT_TYPES = [
  'theft', 'assault', 'fraud', 'missing_person', 'cybercrime',
  'domestic_violence', 'harassment', 'vandalism', 'accident', 'other'
];

export const COMPLAINT_TYPE_LABELS = {
  theft: 'Theft',
  assault: 'Assault / Physical Violence',
  fraud: 'Fraud / Cheating',
  missing_person: 'Missing Person',
  cybercrime: 'Cybercrime',
  domestic_violence: 'Domestic Violence',
  harassment: 'Harassment',
  vandalism: 'Vandalism / Property Damage',
  accident: 'Accident',
  other: 'Other',
};
