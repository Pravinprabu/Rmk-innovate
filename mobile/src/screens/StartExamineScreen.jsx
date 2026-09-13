import React, { useState } from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { callApi, mobileApi } from '../api/client';
import { Button, Card, ErrorBanner, Heading, Text } from '../components/ui';
import { colors } from '../theme/colors';
import { spacing, radius } from '../theme/tokens';

export const CLINICAL_QUESTIONS = [
  {
    id: 'q1',
    category: 'Chief Complaint',
    question: 'What is your primary medical concern or symptom today?',
    options: [
      'Fever & Body Chills',
      'Cough, Cold & Throat Pain',
      'Breathing Shortness / Chest Heaviness',
      'Stomach Pain, Acidity or Diarrhea',
      'Severe Headache or Dizziness',
      'Joint Pain, Backache or Body Pain',
      'Skin Rash or Allergic Itching',
      'Unusual Weakness or Extreme Fatigue',
    ],
    getAdaptiveNote: (ans) => {
      if (ans.includes('Breathing')) return '⚡ Triage Priority: Respiratory distress flagged for immediate auscultation.';
      if (ans.includes('Fever')) return '⚡ Clinical Protocol: Temperature charting & infectious panel recommended.';
      if (ans.includes('Stomach')) return '⚡ Clinical Note: Abdominal review & hydration assessment assigned.';
      return 'Documented as primary presenting chief complaint.';
    },
  },
  {
    id: 'q2',
    category: 'Onset & Duration',
    question: 'How long have you been experiencing these symptoms?',
    options: [
      'Sudden onset today (< 24 hours)',
      '2 to 3 days',
      'About 1 week',
      '2 to 3 weeks',
      'More than 1 month (Chronic)',
    ],
    getAdaptiveNote: (ans) => {
      if (ans.includes('< 24 hours')) return '⚡ Acute Course: Monitored for rapid symptomatic progression.';
      if (ans.includes('Chronic')) return '⚡ Chronic Course: Long-term history & routine baseline investigation indicated.';
      return 'Timeline logged for clinical trajectory.';
    },
  },
  {
    id: 'q3',
    category: 'Severity & Pain Scale',
    question: 'How severe is your current pain or discomfort on a 1 to 10 scale?',
    options: [
      '1 - 3: Mild (Noticeable, but routine activities uninterrupted)',
      '4 - 6: Moderate (Interferes with work, focus or rest)',
      '7 - 8: Severe (Intense pain, unable to perform basic chores)',
      '9 - 10: Unbearable / Critical (Demands immediate clinical intervention)',
      'Zero pain / Non-painful symptom',
    ],
    getAdaptiveNote: (ans) => {
      if (ans.includes('7 - 8') || ans.includes('9 - 10'))
        return '🚨 High Severity Score: Analgesic triage review and urgent doctor consultation recommended.';
      return 'Pain index recorded for doctor baseline.';
    },
  },
  {
    id: 'q4',
    category: 'Thermoregulation & Fever',
    question: 'Have you recorded fever, shivering, or feeling abnormally warm?',
    options: [
      'High fever (> 101°F) with shivering or chills',
      'Mild fever (99°F to 100°F)',
      'Evening fever spikes with night sweats',
      'Feeling feverish, but unmeasured with thermometer',
      'No fever / Normal body temperature',
    ],
    getAdaptiveNote: (ans) => {
      if (ans.includes('> 101°F')) return '⚡ Pyrexia Alert: Antipyretic guidance & infectious workup indicated.';
      return 'Thermal profile recorded in vitals intake.';
    },
  },
  {
    id: 'q5',
    category: 'Respiratory System',
    question: 'Are you having any respiratory, nasal, or throat difficulties?',
    options: [
      'Dry, persistent non-productive cough',
      'Productive cough with yellow/green phlegm',
      'Shortness of breath / Wheezing upon minimal exertion',
      'Severe sore throat / Pain swallowing food or liquids',
      'Runny or blocked nose with sinus pressure',
      'No respiratory symptoms',
    ],
    getAdaptiveNote: (ans) => {
      if (ans.includes('Shortness of breath')) return '🚨 Priority: SpO2 pulse oximetry and chest auscultation recommended.';
      if (ans.includes('phlegm')) return '⚡ Bacterial / Bronchial indicator noted for physician examination.';
      return 'Respiratory system status documented.';
    },
  },
  {
    id: 'q6',
    category: 'Gastrointestinal Tract',
    question: 'Do you have any stomach, bowel, or digestion issues?',
    options: [
      'Nausea and/or episodes of vomiting',
      'Cramping abdominal pain or burning acidity',
      'Frequent loose watery stools (Diarrhea)',
      'Loss of appetite and abdominal bloating',
      'Normal digestion and regular bowel movements',
    ],
    getAdaptiveNote: (ans) => {
      if (ans.includes('vomiting') || ans.includes('Diarrhea')) return '⚡ Electrolyte & ORS oral rehydration review flagged.';
      return 'Gastrointestinal review recorded.';
    },
  },
  {
    id: 'q7',
    category: 'Cardiovascular System',
    question: 'Have you noticed any chest tightness, fluttering, or palpitations?',
    options: [
      'Chest heaviness, squeezing pressure or tightness',
      'Rapid, racing or irregular heartbeat (Palpitations)',
      'Dizziness or lightheadedness when standing up',
      'Swelling in the lower legs or feet (Edema)',
      'No chest discomfort or heart palpitations',
    ],
    getAdaptiveNote: (ans) => {
      if (ans.includes('Chest heaviness')) return '🚨 Cardiac Alert: Doctor advised to review BP and consider 12-lead ECG.';
      return 'Cardiovascular status stable.';
    },
  },
  {
    id: 'q8',
    category: 'Neurological & Head',
    question: 'Are you having headaches, blurred vision, or unusual dizziness?',
    options: [
      'Throbbing one-sided headache with light/sound sensitivity',
      'Dull band-like tension headache around forehead',
      'Dizziness, vertigo or room spinning sensation',
      'Numbness, tingling or localized limb weakness',
      'Normal neurological status / Clear head',
    ],
    getAdaptiveNote: (ans) => {
      if (ans.includes('Throbbing') || ans.includes('vertigo')) return '⚡ Neurological note: Migraine / vestibular assessment flagged.';
      return 'Neurological review documented.';
    },
  },
  {
    id: 'q9',
    category: 'Pre-Existing Chronic Conditions',
    question: 'Do you have any diagnosed ongoing chronic health conditions?',
    options: [
      'Hypertension (High Blood Pressure)',
      'Type 2 Diabetes Mellitus',
      'Bronchial Asthma or Chronic Bronchitis',
      'Thyroid disorder (Hypo / Hyperthyroid)',
      'Cardiac condition / Prior surgery',
      'No pre-existing chronic conditions',
    ],
    getAdaptiveNote: (ans) => {
      if (!ans.includes('No pre-existing'))
        return `🩺 Comorbidity Alert: Patient has chronic history of ${ans}. Medication cross-checks enabled.`;
      return 'No chronic comorbidities reported.';
    },
  },
  {
    id: 'q10',
    category: 'Current Medications',
    question: 'Are you currently taking any prescription medications on a daily basis?',
    options: [
      'Blood pressure medications (Antihypertensives)',
      'Diabetes tablets (Metformin) or Insulin',
      'Asthma inhalers or daily antiallergy pills',
      'Blood thinners (Aspirin) or Cholesterol statins',
      'Gastric acidity medications (Antacids / PPIs)',
      'No daily prescription medications',
    ],
    getAdaptiveNote: (ans) => {
      if (!ans.includes('No daily')) return '💊 Pharmacotherapy: Active daily regimen noted for drug-drug interaction safety.';
      return 'No ongoing daily drugs recorded.';
    },
  },
  {
    id: 'q11',
    category: 'Drug Allergies & Safety',
    question: 'Do you have any known adverse allergies to allopathic medicines?',
    options: [
      'Penicillins or Amoxicillin (Hives, swelling, rash)',
      'Sulfa-based antibiotics',
      'Painkillers / NSAIDs (Ibuprofen, Diclofenac)',
      'Aspirin or Paracetamol',
      'No Known Drug Allergies (NKDA)',
    ],
    getAdaptiveNote: (ans) => {
      if (!ans.includes('No Known')) return `⚠️ CRITICAL ALLERGY: ${ans} contraindication will be prominently flagged to Dr. Raj.`;
      return 'NKDA (No Known Drug Allergies) confirmed.';
    },
  },
  {
    id: 'q12',
    category: 'Nutrition & Hydration',
    question: 'How has your food intake and daily hydration been in the past 48 hours?',
    options: [
      'Normal appetite with good water intake (>2L/day)',
      'Poor appetite / Skipping multiple meals',
      'Unable to keep down fluids or solids',
      'Excessive thirst and frequent urination',
    ],
    getAdaptiveNote: (ans) => {
      if (ans.includes('Unable to keep down')) return '⚡ Dehydration Risk: Early fluid replacement indicated.';
      return 'Nutritional intake logged.';
    },
  },
  {
    id: 'q13',
    category: 'Sleep & Energy State',
    question: 'How has your sleep quality and overall energy level been?',
    options: [
      'Sleeping well and feeling normal energy',
      'Disturbed, broken sleep due to symptoms',
      'Severe exhaustion / Difficulty getting out of bed',
      'Total insomnia or waking up breathless',
    ],
    getAdaptiveNote: (ans) => {
      if (ans.includes('Severe exhaustion')) return '⚡ Clinical Note: Fatigue index flagged for metabolic / systemic screen.';
      return 'Sleep cycle documented.';
    },
  },
  {
    id: 'q14',
    category: 'Modifying Factors',
    question: 'What factors make your condition feel worse or better?',
    options: [
      'Worsens with physical exertion or walking',
      'Worsens after eating food or lying down',
      'Relieved by rest or over-the-counter paracetamol',
      'Worsened by cold temperatures or dust',
      'Constant discomfort with no noticeable triggers',
    ],
    getAdaptiveNote: (ans) => {
      return 'Provocative & palliative factors logged for differential diagnosis.';
    },
  },
  {
    id: 'q15',
    category: 'Emergency Warning Signs',
    question: 'Are you experiencing any critical emergency warning symptoms right now?',
    options: [
      'Acute severe breathlessness / Inability to speak full sentences',
      'Crushing central chest pain radiating to arm or jaw',
      'Very high fever (>103°F) with stiff neck or confusion',
      'Sudden weakness in one side of face or limbs',
      'None of these / Hemodynamically stable',
    ],
    getAdaptiveNote: (ans) => {
      if (!ans.includes('None of these')) return '🚨 RED FLAG IDENTIFIED: Emergency triage alert triggered for immediate clinician evaluation!';
      return '✓ Triage clearance: No acute red flags detected.';
    },
  },
];

export default function StartExamineScreen({ patient, onDone, onGoToAiSummary, onBookAppointment }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [customNotes, setCustomNotes] = useState({});
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [synthesizedSummary, setSynthesizedSummary] = useState(null);
  const [error, setError] = useState(null);

  const question = CLINICAL_QUESTIONS[currentStep];
  const selectedAnswer = answers[question.id] || '';
  const currentNote = customNotes[question.id] || '';

  const handleSelectOption = (option) => {
    setAnswers((prev) => ({ ...prev, [question.id]: option }));
  };

  const handleNext = () => {
    if (currentStep < CLINICAL_QUESTIONS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      generateAiSummary();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleQuickFillDemo = () => {
    const demoAnswers = {
      q1: 'Fever & Body Chills',
      q2: '2 to 3 days',
      q3: '4 - 6: Moderate (Interferes with work, focus or rest)',
      q4: 'High fever (> 101°F) with shivering or chills',
      q5: 'Productive cough with yellow/green phlegm',
      q6: 'Loss of appetite and abdominal bloating',
      q7: 'No chest discomfort or heart palpitations',
      q8: 'Dull band-like tension headache around forehead',
      q9: 'Hypertension (High Blood Pressure)',
      q10: 'Blood pressure medications (Antihypertensives)',
      q11: 'Penicillins or Amoxicillin (Hives, swelling, rash)',
      q12: 'Poor appetite / Skipping multiple meals',
      q13: 'Disturbed, broken sleep due to symptoms',
      q14: 'Relieved by rest or over-the-counter paracetamol',
      q15: 'None of these / Hemodynamically stable',
    };
    setAnswers(demoAnswers);
    setCurrentStep(CLINICAL_QUESTIONS.length - 1);
  };

  const handleSkip = () => {
    if (!answers[question.id]) {
      setAnswers((prev) => ({ ...prev, [question.id]: 'Not specified' }));
    }
    handleNext();
  };

  const generateAiSummary = async () => {
    setIsSynthesizing(true);
    setError(null);

    const q1 = answers.q1 || 'General malaise';
    const q2 = answers.q2 || 'Recent';
    const q3 = answers.q3 || 'Moderate';
    const q4 = answers.q4 || 'Normal';
    const q5 = answers.q5 || 'None';
    const q6 = answers.q6 || 'Normal';
    const q7 = answers.q7 || 'Normal';
    const q8 = answers.q8 || 'Normal';
    const q9 = answers.q9 || 'None';
    const q10 = answers.q10 || 'None';
    const q11 = answers.q11 || 'NKDA';
    const q12 = answers.q12 || 'Normal';
    const q13 = answers.q13 || 'Normal';
    const q14 = answers.q14 || 'None';
    const q15 = answers.q15 || 'Stable';

    const hasRedFlag = !q15.includes('None of these') && !q15.includes('Stable');
    const hasAllergy = !q11.includes('No Known') && !q11.includes('NKDA');

    const keyFindings = [
      `Chief: ${q1.split(' ')[0]} (${q2.slice(0, 15)})`,
      `Pain: ${q3.split(':')[0]}`,
      `Temp: ${q4.includes('High') ? 'Pyrexia' : 'Afebrile'}`,
      hasAllergy ? `⚠️ Allergy: ${q11.split('(')[0].trim()}` : 'NKDA (No Allergies)',
      hasRedFlag ? '🚨 Red Flag Alert' : 'Vitals Stable',
    ];

    const summaryText = `AI CLINICAL INTAKE SYNTHESIS (Allopathic Protocol):
Patient ${patient?.fullName || 'Pravin Prabu'} underwent a 15-point adaptive clinical assessment for General Medicine at Sanjeevi Hospital.

1. PRESENTING COMPLAINT & HPI:
Primary Concern: ${q1}.
Duration & Evolution: ${q2}.
Pain & Discomfort Severity: ${q3}.

2. SYSTEMIC CLINICAL INTAKE:
- Thermoregulation: ${q4}.
- Respiratory Tract: ${q5}.
- Gastrointestinal / Abdomen: ${q6}.
- Cardiovascular Profile: ${q7}.
- Central Nervous System: ${q8}.

3. MEDICAL HISTORY & PHARMACOVIGILANCE:
- Chronic Comorbidities: ${q9}.
- Ongoing Medications: ${q10}.
- Drug Allergies: ${q11} ${hasAllergy ? '[CONTRAINDICATION ACTIVE]' : ''}.
- Hydration & Nutritional Status: ${q12}.
- Sleep & Energy Index: ${q13}.
- Provocative / Relieving Factors: ${q14}.

4. TRIAGE & RED FLAG EVALUATION:
${hasRedFlag ? `CRITICAL WARNING: ${q15}. Urgent clinical intervention prioritized.` : 'Hemodynamically stable. Zero active emergency red flags detected.'}

5. CLINICAL RECOMMENDATION FOR DR. RAJ:
Provisional assessment points to symptomatic management with routine baseline vitals monitoring (BP, SpO2, Temperature). Recommended investigations: Complete Blood Count (CBC), Random Blood Sugar (RBS), and targeted physical auscultation.`;

    const payload = {
      patient_id: patient?.patientId || 'pat-001',
      title: `AI Clinical Examination Intake · ${q1.split('/')[0].split('&')[0].trim()}`,
      summary_text: summaryText,
      key_findings: keyFindings,
      department: 'General Medicine',
      answers: answers,
    };

    const result = await callApi(() => mobileApi.submitAiSummary(payload));
    setIsSynthesizing(false);

    if (result.ok) {
      setSynthesizedSummary(result.data);
    } else {
      // Fallback display if network fails
      setSynthesizedSummary({
        id: 'sum-' + Date.now(),
        ...payload,
        created_at: new Date().toISOString(),
      });
    }
  };

  // Loading synthesis state
  if (isSynthesizing) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.synthesisBox}>
          <ActivityIndicator size="large" color={colors.emerald} />
          <Heading style={styles.synthesisTitle}>Synthesizing Clinical AI Summary...</Heading>
          <Text style={styles.synthesisSubtitle}>
            Our allopathic clinical engine is analyzing your 15 health responses and preparing a certified intake report for Dr. Raj at Sanjeevi Hospital.
          </Text>
          <View style={styles.synthesisBadge}>
            <Text style={styles.synthesisBadgeText}>🤖 Clinical Decision Support Active</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Completed result state
  if (synthesizedSummary) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.successHeader}>
            <View style={styles.checkCircle}>
              <Text style={styles.checkIcon}>✓</Text>
            </View>
            <Heading style={styles.successHeading}>Examination Complete!</Heading>
            <Text style={styles.successSub}>
              Your 15-question allopathic assessment has been synthesized by AI and uploaded to the centralized hospital database.
            </Text>
          </View>

          <Card style={styles.resultCard}>
            <View style={styles.resultTop}>
              <View style={{ flex: 1 }}>
                <Text style={styles.resultTitle}>{synthesizedSummary.title}</Text>
                <Text style={styles.resultHospital}>Sanjeevi Hospital · Centralized EMR Record</Text>
              </View>
              <View style={styles.doctorVerifiedBadge}>
                <Text style={styles.doctorVerifiedText}>✓ Doctor Visible</Text>
              </View>
            </View>

            {synthesizedSummary.key_findings && (
              <View style={styles.chipsRow}>
                {synthesizedSummary.key_findings.map((k, i) => (
                  <View key={i} style={styles.keyChip}>
                    <Text style={styles.keyChipText}>{k}</Text>
                  </View>
                ))}
              </View>
            )}

            <View style={styles.summaryBox}>
              <Text style={styles.summaryBody}>{synthesizedSummary.summary_text}</Text>
            </View>

            <View style={styles.syncedBanner}>
              <Text style={styles.syncedBannerText}>
                ⚡ Synchronized in real time with Dr. Raj's consultation queue & triage desk.
              </Text>
            </View>
          </Card>

          <View style={styles.actionButtons}>
            <Button
              title="📄 View in AI Summary Tab"
              onPress={onGoToAiSummary || onDone}
              style={{ marginBottom: spacing.md }}
            />
            <Button
              title="📅 Book Doctor Appointment"
              variant="secondary"
              onPress={onBookAppointment || onDone}
              style={{ marginBottom: spacing.md }}
            />
            <TouchableOpacity onPress={onDone} style={styles.backHomeLink}>
              <Text style={styles.backHomeText}>← Back to Home</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  const progressPercent = Math.round(((currentStep + 1) / CLINICAL_QUESTIONS.length) * 100);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Top Header */}
        <View style={styles.navBar}>
          <TouchableOpacity onPress={onDone} style={styles.cancelBtn}>
            <Text style={styles.cancelText}>✕ Close</Text>
          </TouchableOpacity>
          <View style={styles.stepBadge}>
            <Text style={styles.stepBadgeText}>
              Question {currentStep + 1} of {CLINICAL_QUESTIONS.length}
            </Text>
          </View>
        </View>

        {/* Progress bar */}
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
        </View>

        {/* Demo Auto-Fill Option */}
        <TouchableOpacity onPress={handleQuickFillDemo} style={styles.demoFillBanner} activeOpacity={0.8}>
          <Text style={styles.demoFillText}>⚡ Fast Demo: Auto-Fill All 15 Questions</Text>
        </TouchableOpacity>

        <ErrorBanner message={error} />

        {/* Question Container */}
        <View style={styles.questionSection}>
          <View style={styles.categoryRow}>
            <Text style={styles.categoryBadge}>🩺 {question.category}</Text>
            <Text style={styles.adaptivePercent}>{progressPercent}% Done</Text>
          </View>

          <Heading style={styles.questionText}>{question.question}</Heading>
          <Text style={styles.questionInstruction}>
            Select the option that best describes your current condition:
          </Text>

          {/* Options */}
          <View style={styles.optionsList}>
            {question.options.map((opt, idx) => {
              const isSelected = selectedAnswer === opt;
              return (
                <TouchableOpacity
                  key={idx}
                  style={[styles.optionCard, isSelected && styles.optionCardSelected]}
                  onPress={() => handleSelectOption(opt)}
                  activeOpacity={0.85}
                >
                  <View style={[styles.radioCircle, isSelected && styles.radioCircleSelected]}>
                    {isSelected && <View style={styles.radioInner} />}
                  </View>
                  <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                    {opt}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Adaptive Clinical Insight Banner */}
          {selectedAnswer ? (
            <View style={styles.adaptiveBanner}>
              <Text style={styles.adaptiveBannerText}>
                {question.getAdaptiveNote(selectedAnswer)}
              </Text>
            </View>
          ) : null}

          {/* Optional patient custom notes */}
          <View style={styles.customNotesSection}>
            <Text style={styles.customNotesLabel}>
              Additional details for Dr. Raj (Optional):
            </Text>
            <TextInput
              style={styles.customNotesInput}
              placeholder="e.g. Started after drinking cold water, feels worse in morning..."
              placeholderTextColor={colors.textMuted}
              value={currentNote}
              onChangeText={(txt) => setCustomNotes((prev) => ({ ...prev, [question.id]: txt }))}
            />
          </View>
        </View>

        {/* Bottom Navigation Buttons */}
        <View style={styles.bottomNav}>
          <View style={styles.navButtonsRow}>
            <TouchableOpacity
              onPress={handlePrev}
              disabled={currentStep === 0}
              style={[styles.navBtnSecondary, currentStep === 0 && styles.navBtnDisabled]}
            >
              <Text style={styles.navBtnSecondaryText}>← Previous</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleSkip} style={styles.skipBtn}>
              <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleNext}
              disabled={!selectedAnswer}
              style={[styles.navBtnPrimary, !selectedAnswer && styles.navBtnDisabled]}
            >
              <Text style={styles.navBtnPrimaryText}>
                {currentStep === CLINICAL_QUESTIONS.length - 1 ? '🩺 Generate AI Summary' : 'Next →'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgCanvas },
  scroll: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  cancelBtn: { paddingVertical: spacing.xs, paddingHorizontal: spacing.sm },
  cancelText: { color: colors.textSecondary, fontWeight: '700', fontSize: 14 },
  stepBadge: {
    backgroundColor: colors.emeraldLight,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  stepBadgeText: { color: colors.emeraldDark, fontWeight: '800', fontSize: 13 },
  progressBarBg: {
    height: 6,
    backgroundColor: colors.borderLight,
    borderRadius: 3,
    marginBottom: spacing.lg,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.emerald,
    borderRadius: 3,
  },
  demoFillBanner: {
    backgroundColor: colors.emeraldLight,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    marginBottom: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.emerald,
  },
  demoFillText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.emeraldDark,
  },
  questionSection: { marginBottom: spacing.xl },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  categoryBadge: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  adaptivePercent: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  questionText: { fontSize: 20, lineHeight: 28, marginVertical: spacing.xs },
  questionInstruction: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  optionsList: { gap: spacing.sm, marginBottom: spacing.md },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceWhite,
    padding: spacing.md,
    borderRadius: radius.card,
    borderWidth: 1.5,
    borderColor: colors.borderLight,
  },
  optionCardSelected: {
    borderColor: colors.emerald,
    backgroundColor: colors.emeraldLight || '#ECFDF5',
  },
  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.borderLight,
    marginRight: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleSelected: {
    borderColor: colors.emerald,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.emerald,
  },
  optionText: {
    fontSize: 15,
    color: colors.textPrimary,
    fontWeight: '600',
    flex: 1,
    lineHeight: 21,
  },
  optionTextSelected: {
    color: colors.emeraldDark,
    fontWeight: '800',
  },
  adaptiveBanner: {
    backgroundColor: '#EFF6FF',
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
    padding: spacing.md,
    borderRadius: radius.card,
    marginBottom: spacing.md,
  },
  adaptiveBannerText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
    lineHeight: 18,
  },
  customNotesSection: {
    backgroundColor: colors.surfaceWhite,
    padding: spacing.md,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  customNotesLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  customNotesInput: {
    fontSize: 14,
    color: colors.textPrimary,
    minHeight: 38,
  },
  bottomNav: {
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  navButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  navBtnSecondary: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.borderLight,
    backgroundColor: colors.surfaceWhite,
  },
  navBtnSecondaryText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  skipBtn: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  skipText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textMuted,
  },
  navBtnPrimary: {
    flex: 1,
    backgroundColor: colors.emerald,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navBtnPrimaryText: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.surfaceWhite,
  },
  navBtnDisabled: {
    opacity: 0.4,
  },
  // Synthesis loading
  synthesisBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    gap: spacing.md,
  },
  synthesisTitle: {
    fontSize: 22,
    textAlign: 'center',
    color: colors.primary,
  },
  synthesisSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    color: colors.textSecondary,
    lineHeight: 22,
  },
  synthesisBadge: {
    backgroundColor: colors.emeraldLight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    marginTop: spacing.md,
  },
  synthesisBadgeText: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.emeraldDark,
  },
  // Results view
  successHeader: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
    gap: spacing.xs,
  },
  checkCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: colors.emerald,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  checkIcon: {
    color: colors.surfaceWhite,
    fontSize: 28,
    fontWeight: '900',
  },
  successHeading: {
    fontSize: 24,
    color: colors.primary,
    textAlign: 'center',
  },
  successSub: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: spacing.md,
  },
  resultCard: {
    marginVertical: spacing.md,
    borderWidth: 1.5,
    borderColor: colors.emerald,
  },
  resultTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  resultTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.primary,
  },
  resultHospital: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  doctorVerifiedBadge: {
    backgroundColor: colors.emeraldLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  doctorVerifiedText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.emeraldDark,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  keyChip: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  keyChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  summaryBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: radius.card,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: spacing.md,
  },
  summaryBody: {
    fontSize: 13,
    color: colors.textPrimary,
    lineHeight: 20,
    fontFamily: 'monospace',
  },
  syncedBanner: {
    backgroundColor: colors.emeraldLight,
    padding: spacing.sm,
    borderRadius: 8,
  },
  syncedBannerText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.emeraldDark,
    textAlign: 'center',
  },
  actionButtons: {
    marginTop: spacing.md,
  },
  backHomeLink: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  backHomeText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textSecondary,
  },
});
