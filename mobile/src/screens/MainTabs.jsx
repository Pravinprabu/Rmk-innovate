import React, { useState } from 'react';
import { View } from 'react-native';
import { callApi, mobileApi } from '../api/client';
import BottomTabBar from '../components/BottomTabBar';
import TopNavbar from '../components/TopNavbar';
import { colors } from '../theme/colors';
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

  function resetSubFlows() {
    setIsExamining(false);
    setBookingStep(null);
    setUploadStep(null);
  }

  function handleTabChange(newTab) {
    resetSubFlows();
    setTab(newTab);
  }

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

  function handleBack() {
    if (isExamining) {
      setIsExamining(false);
      return;
    }
    if (bookingStep) {
      if (bookingStep === 'confirm') setBookingStep(null);
      else if (bookingStep === 'slot') setBookingStep('department');
      else if (bookingStep === 'department') setBookingStep('search');
      else setBookingStep(null);
      return;
    }
    if (uploadStep) {
      if (uploadStep === 'action') setUploadStep('search');
      else setUploadStep(null);
      return;
    }
  }

  const isSubFlowActive = isExamining || !!bookingStep || !!uploadStep;

  function renderMainContent() {
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
      <>
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
        {tab === 'profile' && <ProfileTab patientId={patient.patientId} onNavigateTab={handleTabChange} />}
      </>
    );
  }

  let navTitle = 'MediKiosk';
  if (bookingStep) navTitle = 'Book Appointment';
  else if (uploadStep) navTitle = 'Upload Record';
  else if (isExamining) navTitle = 'AI Intake';

  return (
    <View style={{ flex: 1, backgroundColor: colors.bgCanvas }}>
      <TopNavbar
        title={navTitle}
        showBack={isSubFlowActive}
        onBack={handleBack}
      />
      <View style={{ flex: 1 }}>
        {renderMainContent()}
      </View>
      <BottomTabBar active={tab} onChange={handleTabChange} />
    </View>
  );
}

