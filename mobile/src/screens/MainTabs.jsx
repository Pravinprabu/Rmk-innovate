import React, { useState } from 'react';
import { View } from 'react-native';
import { callApi, mobileApi } from '../api/client';
import BottomTabBar from '../components/BottomTabBar';
import HomeTab from './tabs/HomeTab';
import ReportsTab from './tabs/ReportsTab';
import AiSummaryTab from './tabs/AiSummaryTab';
import ProfileTab from './tabs/ProfileTab';
import SearchHospitalScreen from './SearchHospitalScreen';
import SelectDepartmentScreen from './SelectDepartmentScreen';
import PickSlotScreen from './PickSlotScreen';
import ConfirmScreen from './ConfirmScreen';
import UploadOrScanScreen from './UploadOrScanScreen';
import StartExamineScreen from './StartExamineScreen';

// Everything after login lives here: the persistent bottom-tab shell
// (Home/Reports/AI Summary/Profile), plus focused sub-flows that
// temporarily take over the whole screen (no tab bar) since they're
// multi-step tasks, not destinations -- start examine (15 questions AI intake),
// booking (search -> department -> slot -> confirm) from Home, and
// upload/scan from Home and Reports. All return to the tab shell when done.
export default function MainTabs({ patient }) {
  const [tab, setTab] = useState('home');

  // Examine sub-flow state
  const [isExamining, setIsExamining] = useState(false);

  // Booking sub-flow state
  const [bookingStep, setBookingStep] = useState(null); // null | 'search' | 'department' | 'slot' | 'confirm'
  const [bookingHospital, setBookingHospital] = useState(null);
  const [bookingDepartment, setBookingDepartment] = useState(null);
  const [booking, setBooking] = useState(null);
  const [bookingSubmitting, setBookingSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState(null);

  // Upload/scan sub-flow state
  const [uploadMode, setUploadMode] = useState(null); // null | 'upload' | 'scan'
  const [uploadStep, setUploadStep] = useState(null); // null | 'search' | 'action'
  const [uploadHospital, setUploadHospital] = useState(null);

  function startBooking() {
    setBookingHospital(null);
    setBookingDepartment(null);
    setBooking(null);
    setBookingError(null);
    setBookingStep('search');
  }

  function handleSelectBookingHospital(item) {
    setBookingHospital(item);
    setBookingStep('department');
  }

  function handleSelectBookingDepartment(dept) {
    setBookingDepartment(dept);
    setBookingStep('slot');
  }

  async function handleSlotSelected(selectedSlot) {
    setBookingError(null);
    setBookingSubmitting(true);
    const result = await callApi(() =>
      mobileApi.createBooking({
        hospital: bookingHospital.id,
        department: bookingDepartment.id,
        date: selectedSlot.date,
        time: selectedSlot.time,
        full_name: patient.fullName,
        abha_id: patient.abhaId,
        mobile_number: patient.mobileNumber,
      })
    );
    setBookingSubmitting(false);
    if (result.ok) {
      setBooking(result.data);
      setBookingStep('confirm');
    } else {
      setBookingError(result.error);
    }
  }

  function finishBooking() {
    setBookingStep(null);
  }

  function startUpload(mode) {
    setUploadMode(mode);
    setUploadHospital({ id: 'sanjeevi', name: 'Sanjeevi Hospital' });
    setUploadStep('action');
  }

  function handleSelectUploadHospital(item) {
    setUploadHospital(item);
    setUploadStep('action');
  }

  function finishUpload() {
    setUploadStep(null);
    setUploadMode(null);
  }

  // Examine sub-flow takes over the whole screen
  if (isExamining) {
    return (
      <StartExamineScreen
        patient={patient}
        onDone={() => setIsExamining(false)}
        onGoToAiSummary={() => {
          setIsExamining(false);
          setTab('aiSummary');
        }}
        onBookAppointment={() => {
          setIsExamining(false);
          startBooking();
        }}
      />
    );
  }

  // Booking sub-flow takes over the whole screen
  if (bookingStep) {
    return (
      <>
        {bookingStep === 'search' && (
          <SearchHospitalScreen onSelectHospital={handleSelectBookingHospital} onBack={finishBooking} />
        )}
        {bookingStep === 'department' && (
          <SelectDepartmentScreen
            hospital={bookingHospital}
            onSelectDepartment={handleSelectBookingDepartment}
            onBack={() => setBookingStep('search')}
          />
        )}
        {bookingStep === 'slot' && (
          <PickSlotScreen
            hospital={bookingHospital}
            department={bookingDepartment}
            onBack={() => setBookingStep('department')}
            onSlotSelected={handleSlotSelected}
            submitting={bookingSubmitting}
            error={bookingError}
          />
        )}
        {bookingStep === 'confirm' && (
          <ConfirmScreen hospital={bookingHospital} booking={booking} patient={patient} onDone={finishBooking} />
        )}
      </>
    );
  }

  // Upload/scan sub-flow takes over the whole screen
  if (uploadStep) {
    return (
      <>
        {uploadStep === 'search' && (
          <SearchHospitalScreen onSelectHospital={handleSelectUploadHospital} onBack={finishUpload} />
        )}
        {uploadStep === 'action' && (
          <UploadOrScanScreen
            mode={uploadMode}
            patientId={patient.patientId}
            hospital={uploadHospital}
            onDone={finishUpload}
            onBack={() => setUploadStep('search')}
          />
        )}
      </>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        {tab === 'home' && (
          <HomeTab
            fullName={patient?.fullName}
            onStartExamine={() => setIsExamining(true)}
            onBookAppointment={startBooking}
            onScanOrUploadDocument={() => startUpload('both')}
          />
        )}
        {tab === 'reports' && (
          <ReportsTab patientId={patient.patientId} onUpload={() => startUpload('upload')} onScan={() => startUpload('scan')} />
        )}
        {tab === 'aiSummary' && <AiSummaryTab patientId={patient.patientId} />}
        {tab === 'profile' && <ProfileTab patientId={patient.patientId} />}
      </View>
      <BottomTabBar active={tab} onChange={setTab} />
    </View>
  );
}
