const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 8000;
const UPLOADS_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// In-memory data stores
const hospitals = [
  { id: 'sanjeevi', name: 'Sanjeevi Hospital', address: '12 Health City, Chennai', phone: '044-24567890' },
  { id: 'apollo', name: 'Apollo Health Centre', address: 'Greams Road, Chennai', phone: '044-28290200' },
];

const departments = [
  { id: 'gen-med', name: 'General Medicine', description: 'Primary care & general consultations' },
  { id: 'cardio', name: 'Cardiology', description: 'Heart and cardiovascular care' },
  { id: 'ortho', name: 'Orthopedics', description: 'Bone and joint care' },
  { id: 'pediatrics', name: 'Pediatrics', description: 'Child care and health' },
  { id: 'derma', name: 'Dermatology', description: 'Skin, hair and allergy care' },
  { id: 'ent', name: 'ENT', description: 'Ear, nose and throat care' },
];

const doctors = [
  {
    username: 'san-doc-001',
    password: 'raj12345',
    hospital: 'sanjeevi',
    id: 'san-doc-001',
    full_name: 'Dr. Raj',
    role: 'doctor',
    department: 'General Medicine',
  },
];

const triageStaff = [
  {
    username: 'kum-tri-001',
    password: 'kumar12345',
    hospital: 'sanjeevi',
    id: 'kum-tri-001',
    full_name: 'Kumar',
    role: 'triage',
    department: 'Emergency & Triage',
  },
];

let patients = [
  {
    id: 'pat-001',
    mobile_number: '9876543210',
    full_name: 'Pravin Prabu',
    age_years: 24,
    gender: 'Male',
    otp: '123456',
  },
];

let documents = [
  {
    id: 'doc-001',
    patient_id: 'pat-001',
    encounter_id: 'enc-001',
    title: 'Blood Test & CBC Report',
    category: 'Lab Report',
    file_url: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    is_flagged: true,
    diagnosis_extracted: 'Mild Vitamin D Deficiency, Normal Hemoglobin',
    investigation_summary: 'Serum 25-OH Vitamin D: 18 ng/mL (Suboptimal). TLC: 7,200/cumm.',
  },
  {
    id: 'doc-002',
    patient_id: 'pat-001',
    encounter_id: 'enc-001',
    title: 'Previous Prescription',
    category: 'Prescription',
    file_url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80',
    created_at: new Date(Date.now() - 172800000).toISOString(),
    is_flagged: false,
    diagnosis_extracted: 'Viral fever with cough',
    investigation_summary: 'Paracetamol 650mg SOS, Cetirizine 10mg OD x 3 days.',
  },
];

let bookings = [
  {
    id: 'bk-001',
    patient_id: 'pat-001',
    hospital_id: 'sanjeevi',
    department_name: 'General Medicine',
    slot_date: new Date().toISOString().slice(0, 10),
    slot_time: '10:00 AM - 10:30 AM',
    full_name: 'Pravin Prabu',
    mobile_number: '9876543210',
    token_no: 'SAN-101',
    created_at: new Date().toISOString(),
  },
];

let encounters = [
  {
    id: 'enc-001',
    patient_id: 'pat-001',
    hospital_id: 'sanjeevi',
    token_no: 'SAN-101',
    slot_date: new Date().toISOString().slice(0, 10),
    slot_time: '10:00 AM - 10:30 AM',
    department_name: 'General Medicine',
    status: 'Waiting',
    review_status: 'Pending',
    vitals: { bp: '120/80', pulse: 74, temp: '98.6°F', spo2: '99%' },
    ai_summaries: [
      {
        id: 'sum-001',
        encounter: 'enc-001',
        summary_text: 'Patient presented with seasonal fatigue. Previous lab report indicates borderline Vitamin D deficiency (18 ng/mL). Vitals stable (BP 120/80, SpO2 99%). Ready for consultation.',
      },
    ],
  },
];

let aiSummaries = [
  {
    id: 'sum-001',
    patient_id: 'pat-001',
    encounter_id: 'enc-001',
    title: 'Clinical Summary & Vitals Assessment',
    summary_text: 'AI Synthesis: Patient Pravin Prabu presented for routine review. Vitals stable (BP 120/80, SpO2 99%, Pulse 74 bpm). Recent Blood Test confirms normal hemoglobin (14.2 g/dL) with borderline sub-optimal Vitamin D (18 ng/mL). No acute cardiovascular or pulmonary distress noted. Recommendation: Vitamin D3 supplementation (60,000 IU weekly) with standard hydration.',
    key_findings: ['BP: 120/80 (Normal)', 'SpO2: 99% (Stable)', 'Vitamin D: 18 ng/mL (Suboptimal)'],
    created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
    department: 'General Medicine',
    doctor_reviewed: true,
  },
  {
    id: 'sum-002',
    patient_id: 'pat-001',
    encounter_id: 'enc-001',
    title: 'Prescription & Medication Insights',
    summary_text: 'Prior consultation records show resolution of seasonal viral fever and cough under symptomatic therapy (Paracetamol 650mg SOS, Cetirizine 10mg). Zero reported adverse drug reactions. Patient cleared for normal activity.',
    key_findings: ['No drug allergies recorded', 'Prior course completed successfully'],
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    department: 'Internal Medicine',
    doctor_reviewed: true,
  },
];

// Helper to parse multipart/form-data simple boundary
function parseMultipart(buffer, boundary) {
  const result = { fields: {}, files: [] };
  const boundaryStr = '--' + boundary;
  const parts = buffer.toString('binary').split(boundaryStr);

  for (const part of parts) {
    if (!part || part.trim() === '--' || part.trim() === '') continue;
    const headerEndIndex = part.indexOf('\r\n\r\n');
    if (headerEndIndex === -1) continue;

    const headers = part.slice(0, headerEndIndex);
    const bodyBinary = part.slice(headerEndIndex + 4, part.lastIndexOf('\r\n'));

    const dispMatch = headers.match(/name="([^"]+)"/);
    if (!dispMatch) continue;
    const fieldName = dispMatch[1];

    const fileMatch = headers.match(/filename="([^"]+)"/);
    if (fileMatch) {
      const filename = fileMatch[1];
      const contentTypeMatch = headers.match(/Content-Type:\s*([^\r\n]+)/i);
      const contentType = contentTypeMatch ? contentTypeMatch[1] : 'application/octet-stream';
      const fileBuffer = Buffer.from(bodyBinary, 'binary');
      result.files.push({ fieldName, filename, contentType, data: fileBuffer });
    } else {
      result.fields[fieldName] = Buffer.from(bodyBinary, 'binary').toString('utf8');
    }
  }
  return result;
}

const server = http.createServer((req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // Serve static uploaded files
  if (pathname.startsWith('/uploads/')) {
    const filename = path.basename(pathname);
    const filePath = path.join(UPLOADS_DIR, filename);
    if (fs.existsSync(filePath)) {
      const stat = fs.statSync(filePath);
      const ext = path.extname(filename).toLowerCase();
      const mimeMap = {
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.pdf': 'application/pdf',
      };
      res.writeHead(200, {
        'Content-Type': mimeMap[ext] || 'application/octet-stream',
        'Content-Length': stat.size,
      });
      fs.createReadStream(filePath).pipe(res);
      return;
    } else {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'File not found' }));
      return;
    }
  }

  // Health check
  if (pathname === '/api/health/' || pathname === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', time: new Date().toISOString() }));
    return;
  }

  // Read request body helper
  const readBody = (callback) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => {
      const buffer = Buffer.concat(chunks);
      callback(buffer);
    });
  };

  // 1. GET /api/hospitals/
  if (pathname === '/api/hospitals/' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(hospitals));
    return;
  }

  // 2. GET /api/mobile/hospitals/:id/departments/
  if (pathname.includes('/departments/') && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(departments));
    return;
  }

  // 3. GET /api/mobile/hospitals/:id/slots/
  if (pathname.includes('/slots/') && req.method === 'GET') {
    const slots = [
      { time: '09:00 - 09:30', available: true },
      { time: '09:30 - 10:00', available: true },
      { time: '10:00 - 10:30', available: true },
      { time: '10:30 - 11:00', available: true },
      { time: '11:00 - 11:30', available: true },
      { time: '11:30 - 12:00', available: true },
      { time: '02:00 - 02:30', available: true },
      { time: '02:30 - 03:00', available: true },
      { time: '03:00 - 03:30', available: true },
    ];
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ slots }));
    return;
  }

  // 4. POST /api/mobile/identify/ (Patient Login / Signup)
  if ((pathname === '/api/mobile/identify/' || pathname === '/api/mobile/auth/login/') && req.method === 'POST') {
    readBody((buffer) => {
      try {
        const body = JSON.parse(buffer.toString('utf8'));
        const mobile = (body.mobile_number || '').replace(/\D/g, '');
        const fullName = body.full_name || 'Patient';

        let patient = patients.find((p) => p.mobile_number === mobile);
        if (!patient) {
          patient = {
            id: 'pat-' + Date.now(),
            mobile_number: mobile || '9876543210',
            full_name: fullName,
            age_years: body.age_years || 25,
            gender: body.gender || 'Not specified',
            otp: '123456',
          };
          patients.push(patient);
        }

        let encounter = encounters.find((e) => e.patient_id === patient.id);
        if (!encounter) {
          encounter = {
            id: 'enc-' + Date.now(),
            patient_id: patient.id,
            hospital_id: 'sanjeevi',
            token_no: 'SAN-' + (100 + encounters.length + 1),
            slot_date: new Date().toISOString().slice(0, 10),
            slot_time: '10:00 AM - 10:30 AM',
            department_name: 'General Medicine',
            status: 'Waiting',
            review_status: 'Pending',
            vitals: { bp: '120/80', pulse: 72, temp: '98.4°F', spo2: '99%' },
            ai_summaries: [
              {
                id: 'sum-' + Date.now(),
                encounter: 'enc-' + Date.now(),
                summary_text: `Patient ${patient.full_name} registered for General Medicine consultation. Ready for doctor review.`,
              },
            ],
          };
          encounters.unshift(encounter);
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify({
            patient_id: patient.id,
            encounter_id: encounter.id,
            full_name: patient.full_name,
            mobile_number: patient.mobile_number,
            token_no: encounter.token_no,
          })
        );
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ detail: 'Invalid JSON payload' }));
      }
    });
    return;
  }

  // 5. POST /api/mobile/bookings/
  if (pathname === '/api/mobile/bookings/' && req.method === 'POST') {
    readBody((buffer) => {
      try {
        const body = JSON.parse(buffer.toString('utf8'));
        const tokenNo = 'SAN-' + (100 + encounters.length + 1);
        const deptName = body.department_name || (departments.find((d) => d.id === body.department)?.name) || 'General Medicine';
        const slotDate = body.date || body.slot_date || new Date().toISOString().slice(0, 10);
        const slotTime = body.time || body.slot_time || '10:00 AM - 10:30 AM';
        const patName = body.full_name || 'Patient';
        const patMobile = body.mobile_number || '9876543210';

        let patient = patients.find((p) => p.mobile_number === patMobile || (body.patient_id && p.id === body.patient_id));
        if (!patient) {
          patient = {
            id: 'pat-' + Date.now(),
            mobile_number: patMobile,
            full_name: patName,
            age_years: 25,
            gender: 'Not specified',
            otp: '123456',
          };
          patients.push(patient);
        }

        const newBooking = {
          id: 'bk-' + Date.now(),
          patient_id: patient.id,
          hospital_id: body.hospital || body.hospital_id || 'sanjeevi',
          department_name: deptName,
          slot_date: slotDate,
          slot_time: slotTime,
          full_name: patName,
          mobile_number: patMobile,
          token_no: tokenNo,
          created_at: new Date().toISOString(),
        };
        bookings.unshift(newBooking);

        const newEncounter = {
          id: 'enc-' + Date.now(),
          patient_id: patient.id,
          hospital_id: body.hospital || body.hospital_id || 'sanjeevi',
          department_name: deptName,
          slot_date: slotDate,
          slot_time: slotTime,
          token_no: tokenNo,
          status: 'Waiting',
          review_status: 'Pending',
          full_name: patName,
          mobile_number: patMobile,
          review_status: 'Pending',
          vitals: { bp: '120/80', pulse: 72, temp: '98.6°F', spo2: '99%' },
          ai_summaries: [
            {
              id: 'sum-' + Date.now(),
              encounter: 'enc-' + Date.now(),
              summary_text: `Appointment booked for ${deptName}. Patient queued under Token ${tokenNo}.`,
            },
          ],
        };
        encounters.unshift(newEncounter);

        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ booking_id: newBooking.id, token_no: tokenNo, ...newEncounter }));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ detail: 'Could not create booking' }));
      }
    });
    return;
  }

  // 6. POST /api/mobile/documents/ (Upload Document)
  if (pathname === '/api/mobile/documents/' && req.method === 'POST') {
    readBody((buffer) => {
      const contentType = req.headers['content-type'] || '';
      let fileUrl = 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80';
      let category = 'Medical Report';
      let title = 'Scanned Medical Record';
      let patientId = 'pat-001';
      let encounterId = 'enc-001';

      if (contentType.includes('multipart/form-data')) {
        const boundaryMatch = contentType.match(/boundary=(?:"([^"]+)"|([^;]+))/i);
        if (boundaryMatch) {
          const boundary = boundaryMatch[1] || boundaryMatch[2];
          const parsed = parseMultipart(buffer, boundary);
          category = parsed.fields['category'] || category;
          encounterId = parsed.fields['encounter'] || encounterId;
          patientId = parsed.fields['patient_id'] || patientId;

          if (parsed.files.length > 0) {
            const uploadedFile = parsed.files[0];
            const safeName = Date.now() + '-' + path.basename(uploadedFile.filename || 'document.jpg');
            fs.writeFileSync(path.join(UPLOADS_DIR, safeName), uploadedFile.data);
            fileUrl = `http://localhost:${PORT}/uploads/${safeName}`;
            title = uploadedFile.filename || title;
          }
        }
      } else {
        try {
          const body = JSON.parse(buffer.toString('utf8'));
          category = body.category || category;
          title = body.title || title;
          fileUrl = body.file_url || fileUrl;
          patientId = body.patient_id || patientId;
        } catch (_) {}
      }

      const newDoc = {
        id: 'doc-' + Date.now(),
        patient_id: patientId,
        encounter_id: encounterId,
        title: title,
        category: category,
        file_url: fileUrl,
        created_at: new Date().toISOString(),
        is_flagged: false,
        diagnosis_extracted: `${category} scanned via mobile`,
        investigation_summary: 'Uploaded and verified by patient.',
      };
      documents.unshift(newDoc);

      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(newDoc));
    });
    return;
  }

  // 7. GET /api/mobile/documents/list/
  if (pathname === '/api/mobile/documents/list/' && req.method === 'GET') {
    const patientId = parsedUrl.query.patient_id;
    const docList = patientId ? documents.filter((d) => d.patient_id === patientId) : documents;
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(docList));
    return;
  }

  // 7b. POST /api/mobile/documents/encounter/
  if (pathname === '/api/mobile/documents/encounter/' && req.method === 'POST') {
    readBody((buffer) => {
      try {
        const body = JSON.parse(buffer.toString('utf8'));
        const patientId = body.patient_id || 'pat-001';
        let enc = encounters.find((e) => e.patient_id === patientId);
        if (!enc) {
          enc = {
            id: 'enc-' + Date.now(),
            patient_id: patientId,
            hospital_id: body.hospital_id || 'sanjeevi',
            token_no: 'SAN-' + (100 + encounters.length + 1),
            slot_date: new Date().toISOString().slice(0, 10),
            slot_time: '10:00 AM - 10:30 AM',
            department_name: 'General Medicine',
            status: 'Waiting',
            review_status: 'Pending',
            vitals: { bp: '120/80', pulse: 72, temp: '98.6°F', spo2: '99%' },
            ai_summaries: [],
          };
          encounters.unshift(enc);
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ encounter_id: enc.id }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ detail: 'Invalid payload' }));
      }
    });
    return;
  }

  // 7c. GET /api/mobile/ai-summaries/
  if (pathname === '/api/mobile/ai-summaries/' && req.method === 'GET') {
    const patientId = parsedUrl.query.patient_id;
    const list = patientId ? aiSummaries.filter((s) => !s.patient_id || s.patient_id === patientId) : aiSummaries;
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(list.length > 0 ? list : aiSummaries));
    return;
  }

  // 7d. POST /api/mobile/ai-summaries/ (Submit patient 15-question AI examination summary)
  if (pathname === '/api/mobile/ai-summaries/' && req.method === 'POST') {
    readBody((buffer) => {
      try {
        const body = JSON.parse(buffer.toString('utf8'));
        const newSummary = {
          id: 'sum-' + Date.now(),
          patient_id: body.patient_id || 'pat-001',
          encounter_id: body.encounter_id || (encounters[0] ? encounters[0].id : 'enc-001'),
          title: body.title || 'AI Clinical Examination Intake',
          summary_text: body.summary_text || '15-question allopathic clinical examination completed.',
          key_findings: body.key_findings || [],
          department: body.department || 'General Medicine',
          answers: body.answers || {},
          created_at: new Date().toISOString(),
          doctor_reviewed: false,
        };
        aiSummaries.unshift(newSummary);

        // Synchronize with encounter so consulting doctor sees it immediately
        let enc = encounters.find((e) => e.id === newSummary.encounter_id || e.patient_id === newSummary.patient_id);
        if (!enc && encounters.length > 0) enc = encounters[0];
        if (enc) {
          if (!enc.ai_summaries) enc.ai_summaries = [];
          enc.ai_summaries.unshift({
            id: newSummary.id,
            encounter: enc.id,
            summary_text: newSummary.summary_text,
          });
        }

        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(newSummary));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ detail: 'Failed to create AI summary' }));
      }
    });
    return;
  }

  // 8. GET /api/mobile/profile/
  if (pathname === '/api/mobile/profile/' && req.method === 'GET') {
    const patientId = parsedUrl.query.patient_id;
    const patient = patients.find((p) => p.id === patientId) || patients[0];
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(patient));
    return;
  }

  // 9. POST /api/doctor/auth/login/
  if (pathname === '/api/doctor/auth/login/' && req.method === 'POST') {
    readBody((buffer) => {
      try {
        const body = JSON.parse(buffer.toString('utf8'));
        const { username, password, hospital } = body;

        const doc = doctors.find(
          (d) =>
            d.username.toLowerCase() === (username || '').toLowerCase() &&
            d.password === password &&
            (!hospital || d.hospital === hospital)
        );

        if (!doc) {
          res.writeHead(401, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ detail: 'Invalid Doctor ID, Password, or Hospital.' }));
          return;
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify({
            access: 'mock_jwt_access_san_doc_001',
            refresh: 'mock_jwt_refresh_san_doc_001',
            doctor: {
              id: doc.id,
              username: doc.username,
              full_name: doc.full_name,
              hospital: doc.hospital,
              hospital_name: 'Sanjeevi Hospital',
              department: doc.department,
            },
          })
        );
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ detail: 'Malformed request' }));
      }
    });
    return;
  }

  // 10. GET /api/doctor/auth/me/ & /api/doctor/profile/
  if ((pathname === '/api/doctor/auth/me/' || pathname === '/api/doctor/profile/') && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify({
        id: 'san-doc-001',
        full_name: 'Dr. Raj',
        hospital_name: 'Sanjeevi Hospital',
        department: 'General Medicine',
        email: 'dr.raj@sanjeevi.health',
        phone: '9840123456',
      })
    );
    return;
  }

  // 11. GET /api/doctor/dashboard/stats/
  if (pathname === '/api/doctor/dashboard/stats/' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify({
        total_patients: encounters.length + 8,
        waiting: encounters.length,
        completed: 8,
        emergency: 1,
      })
    );
    return;
  }

  // 12. GET /api/doctor/dashboard/queue/
  if (pathname === '/api/doctor/dashboard/queue/' && req.method === 'GET') {
    const queue = encounters.map((enc) => {
      const patient = patients.find((p) => p.id === enc.patient_id) || patients[0];
      const patientDocs = documents.filter((d) => d.patient_id === patient.id);
      return {
        id: enc.id,
        token_no: enc.token_no,
        patient: {
          id: patient.id,
          full_name: patient.full_name,
          mobile_number: patient.mobile_number,
          age_years: patient.age_years,
          gender: patient.gender,
        },
        encounter: enc,
        department_name: enc.department_name,
        slot_time: enc.slot_time,
        status: enc.status,
        review_status: enc.review_status,
        vitals: enc.vitals,
        ai_summaries: enc.ai_summaries,
        documents: patientDocs,
      };
    });

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(queue));
    return;
  }

  // 13. POST /api/doctor/patient-lookup/request-otp/
  if (pathname === '/api/doctor/patient-lookup/request-otp/' && req.method === 'POST') {
    readBody((buffer) => {
      try {
        const body = JSON.parse(buffer.toString('utf8'));
        const tokenQuery = body.token_no || body.value || '';
        const phoneQuery = body.phone || body.mobile_number || body.abha_id || '';

        let enc = encounters.find(
          (e) => e.token_no.toLowerCase() === tokenQuery.toLowerCase()
        );
        let pat = null;

        if (enc) {
          pat = patients.find((p) => p.id === enc.patient_id);
        } else if (phoneQuery) {
          pat = patients.find((p) => p.mobile_number.includes(phoneQuery));
          if (pat) enc = encounters.find((e) => e.patient_id === pat.id);
        }

        if (!pat) {
          pat = patients[0];
          enc = encounters[0];
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify({
            masked_mobile: (pat.mobile_number || '9876543210').replace(/(\d{2})\d+(\d{4})/, '$1******$2'),
            is_dummy: true,
            sms_sent: false,
            otp_valid_minutes: 10,
            detail: 'Demo OTP: 1234 or 123456',
          })
        );
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ detail: 'Invalid lookup' }));
      }
    });
    return;
  }

  // 14. POST /api/doctor/patient-lookup/verify-otp/
  if (pathname === '/api/doctor/patient-lookup/verify-otp/' && req.method === 'POST') {
    readBody((buffer) => {
      try {
        const body = JSON.parse(buffer.toString('utf8'));
        const otp = body.otp;
        if (otp !== '1234' && otp !== '123456') {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ detail: 'Invalid OTP. Use 1234 or 123456 for demo.' }));
          return;
        }

        const patient = patients[0];
        const encounter = encounters[0];
        const patientDocs = documents.filter((d) => d.patient_id === patient.id);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify({
            patient: {
              id: patient.id,
              full_name: patient.full_name,
              mobile_number: patient.mobile_number,
              age_years: patient.age_years,
              gender: patient.gender,
            },
            encounter: encounter,
            documents: patientDocs,
            ai_summaries: encounter.ai_summaries,
          })
        );
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ detail: 'Verification failed' }));
      }
    });
    return;
  }

  // 15. POST /api/doctor/patient-review/:id/confirm/
  if (pathname.includes('/confirm/') && req.method === 'POST') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ review_status: 'Confirmed', status: 'Consultation Complete' }));
    return;
  }

  // 15b. PATCH /api/doctor/ai-summary/:id/
  if (pathname.includes('/ai-summary/') && req.method === 'PATCH') {
    readBody((buffer) => {
      try {
        const body = JSON.parse(buffer.toString('utf8'));
        const summaryText = body.summary_text || '';
        const idMatch = pathname.match(/\/ai-summary\/([^/]+)\//);
        const sumId = idMatch ? idMatch[1] : '';

        aiSummaries = aiSummaries.map((s) => (s.id === sumId ? { ...s, summary_text: summaryText, doctor_reviewed: true } : s));
        encounters.forEach((enc) => {
          if (enc.ai_summaries) {
            enc.ai_summaries.forEach((s) => {
              if (s.id === sumId) s.summary_text = summaryText;
            });
          }
        });
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ id: sumId, summary_text: summaryText, ok: true }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ detail: 'Could not update AI summary' }));
      }
    });
    return;
  }

  // --- TRIAGE ENDPOINTS ---
  // 16. POST /api/triage/auth/login/
  if (pathname === '/api/triage/auth/login/' && req.method === 'POST') {
    readBody((buffer) => {
      try {
        const body = JSON.parse(buffer.toString('utf8'));
        const { username, password, hospital } = body;

        const staff = triageStaff.find(
          (t) =>
            t.username.toLowerCase() === (username || '').toLowerCase() &&
            t.password === password &&
            (!hospital || t.hospital === hospital)
        );

        if (!staff) {
          res.writeHead(401, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ detail: 'Invalid Worker ID, Password, or Hospital.' }));
          return;
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify({
            access: 'mock_jwt_access_kum_tri_001',
            refresh: 'mock_jwt_refresh_kum_tri_001',
            triage: {
              id: staff.id,
              username: staff.username,
              full_name: staff.full_name,
              hospital: staff.hospital,
              hospital_name: 'Sanjeevi Hospital',
              role: 'triage',
            },
          })
        );
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ detail: 'Malformed request' }));
      }
    });
    return;
  }

  // 17. GET /api/triage/auth/me/ & /api/triage/profile/
  if ((pathname === '/api/triage/auth/me/' || pathname === '/api/triage/profile/') && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify({
        id: 'kum-tri-001',
        full_name: 'Kumar',
        hospital_name: 'Sanjeevi Hospital',
        role: 'triage',
        email: 'kumar.triage@sanjeevi.health',
        phone: '9840998877',
      })
    );
    return;
  }

  // 18. GET /api/triage/queue/
  if (pathname.startsWith('/api/triage/queue/') && req.method === 'GET') {
    const deptFilter = parsedUrl.query.department;
    let list = encounters;
    if (deptFilter) {
      list = list.filter((e) => e.department_name === deptFilter);
    }
    const triageQueue = list.map((e) => {
      const pat = patients.find((p) => p.id === e.patient_id) || { full_name: 'Patient', mobile_number: '9876543210' };
      return {
        id: e.id,
        token_no: e.token_no,
        department_name: e.department_name || 'General Medicine',
        status: e.status || 'Waiting',
        slot_time: e.slot_time || '10:00 AM - 10:30 AM',
        vitals: e.vitals || { bp: '120/80', pulse: 72, temp: '98.6°F', spo2: '99%' },
        patient: {
          id: pat.id,
          full_name: pat.full_name,
          mobile_number: pat.mobile_number,
          age_years: pat.age_years || 25,
          gender: pat.gender || 'Male',
        },
      };
    });
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(triageQueue));
    return;
  }

  // 19. GET /api/triage/bookings/ (Patients booked from phones!)
  if (pathname === '/api/triage/bookings/' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(bookings));
    return;
  }

  // 20. GET /api/triage/alerts/
  if (pathname === '/api/triage/alerts/' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify([]));
    return;
  }

  // 21. POST /api/triage/alerts/:id/acknowledge/
  if (pathname.includes('/alerts/') && pathname.endsWith('/acknowledge/') && req.method === 'POST') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true, acknowledged: true }));
    return;
  }

  // 22. GET /api/triage/departments/
  if (pathname === '/api/triage/departments/' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(departments));
    return;
  }

  // 22a. POST /api/triage/tokens/ (Create normal patient walk-in token)
  if ((pathname === '/api/triage/tokens/' || pathname === '/api/triage/create-token/') && req.method === 'POST') {
    readBody((buffer) => {
      try {
        const body = JSON.parse(buffer.toString('utf8'));
        const fullName = body.full_name || body.name || 'Walk-in Patient';
        const ageYears = parseInt(body.age_years || body.age || '25', 10);
        const deptId = body.department || 'gen-med';
        const dept = departments.find((d) => d.id === deptId || d.name === deptId);
        const deptName = dept ? dept.name : (body.department_name || 'General Medicine');
        const tokenNo = 'SAN-' + (100 + encounters.length + 1);

        const newPatient = {
          id: 'pat-' + Date.now(),
          full_name: fullName,
          age_years: ageYears,
          gender: body.gender || 'Not specified',
          mobile_number: body.mobile_number || '9876543210',
          otp: '123456',
        };
        patients.push(newPatient);

        const newEncounter = {
          id: 'enc-' + Date.now(),
          patient_id: newPatient.id,
          hospital_id: 'sanjeevi',
          token_no: tokenNo,
          slot_date: new Date().toISOString().slice(0, 10),
          slot_time: 'Walk-in Queue',
          department_name: deptName,
          status: 'Waiting',
          review_status: 'Pending',
          full_name: fullName,
          age_years: ageYears,
          vitals: { bp: '120/80', pulse: 72, temp: '98.4°F', spo2: '99%' },
          ai_summaries: [
            {
              id: 'sum-' + Date.now(),
              encounter: 'enc-' + Date.now(),
              summary_text: `Patient ${fullName} (${ageYears}y) registered for ${deptName} by triage desk. Queued under Token ${tokenNo}.`,
            },
          ],
        };
        encounters.unshift(newEncounter);

        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify({
            ok: true,
            token_no: tokenNo,
            patient_name: fullName,
            age_years: ageYears,
            department_name: deptName,
            status: 'Waiting',
            slot_time: 'Walk-in Queue',
            created_at: new Date().toISOString(),
          })
        );
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ detail: 'Failed to create patient token' }));
      }
    });
    return;
  }

  // 22b. POST /api/triage/emergency-token/ (Emergency Token bypass)
  if (pathname === '/api/triage/emergency-token/' && req.method === 'POST') {
    readBody((buffer) => {
      try {
        const body = JSON.parse(buffer.toString('utf8'));
        const fullName = body.full_name || 'Emergency Patient';
        const deptId = body.department || 'Emergency';
        const dept = departments.find((d) => d.id === deptId || d.name === deptId);
        const deptName = dept ? dept.name : 'Emergency & Triage';
        const tokenNo = 'EMG-' + (100 + encounters.length + 1);

        const newPatient = {
          id: 'pat-' + Date.now(),
          full_name: fullName,
          age_years: parseInt(body.age_years || body.age || '30', 10),
          gender: body.gender || 'Not specified',
          mobile_number: body.mobile_number || '9876543210',
        };
        patients.push(newPatient);

        const newEncounter = {
          id: 'enc-' + Date.now(),
          patient_id: newPatient.id,
          hospital_id: 'sanjeevi',
          token_no: tokenNo,
          slot_date: new Date().toISOString().slice(0, 10),
          slot_time: 'HIGH ALERT',
          department_name: deptName,
          status: 'Emergency',
          review_status: 'Pending',
          full_name: fullName,
          vitals: { bp: '135/90', pulse: 92, temp: '99.2°F', spo2: '96%' },
          ai_summaries: [
            {
              id: 'sum-' + Date.now(),
              encounter: 'enc-' + Date.now(),
              summary_text: `EMERGENCY ALERT: Patient ${fullName} admitted with urgent status. Immediate doctor attention requested.`,
            },
          ],
        };
        encounters.unshift(newEncounter);

        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify({
            ok: true,
            token_no: tokenNo,
            patient_name: fullName,
            department_name: deptName,
            status: 'Emergency',
            created_at: new Date().toISOString(),
          })
        );
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ detail: 'Failed to create emergency token' }));
      }
    });
    return;
  }

  // 23. Fallback 404
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Endpoint not found', path: pathname }));
});

server.listen(PORT, () => {
  console.log(`MediKiosk Mock Backend listening on http://localhost:${PORT}`);
});
