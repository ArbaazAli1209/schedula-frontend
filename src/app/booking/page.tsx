'use client';

import { useState } from 'react';
import { doctors } from '../../lib/mock-data/doctors';
import type { Doctor, DoctorSlot } from '../../types/doctor';
import Link from 'next/link';

export default function BookingFlow() {
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<DoctorSlot | null>(null);
  const [confirmationId, setConfirmationId] = useState('');
  const [isBooking, setIsBooking] = useState(false);

  const handleConfirm = async () => {
    if (!selectedDoctor || !selectedSlot) return;
    setIsBooking(true);
    
    try {
      // Reusing the API route created previously
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctorId: selectedDoctor.id,
          slotId: selectedSlot.id,
          userEmail: 'patient@example.com' // Mocked for the flow
        })
      });
      
      const data = await res.json();
      if (data.success) {
        setConfirmationId(data.confirmationId);
      }
    } catch (err) {
      console.error('Booking failed', err);
    } finally {
      setIsBooking(false);
    }
  };

  // Step 5: Show booking confirmation
  if (confirmationId) {
    return (
      <div className="max-w-2xl mx-auto mt-12 bg-white p-8 rounded-lg shadow-sm text-center border border-green-100">
        <div className="text-green-500 text-5xl mb-4">✓</div>
        <h2 className="text-2xl font-bold mb-2 text-gray-800">Appointment Confirmed!</h2>
        <p className="text-gray-600 mb-6">Your booking has been successfully recorded.</p>
        <div className="bg-gray-50 p-6 rounded-md mb-8 text-left border border-gray-100">
          <p className="mb-2"><strong className="text-gray-700">Booking ID:</strong> <span className="font-mono bg-gray-200 px-2 py-1 rounded">{confirmationId}</span></p>
          <p className="mb-2"><strong className="text-gray-700">Doctor:</strong> {selectedDoctor?.name}</p>
          <p><strong className="text-gray-700">Date & Time:</strong> {selectedSlot?.date} at {selectedSlot?.time}</p>
        </div>
        <Link href="/doctors" className="text-blue-600 hover:underline font-medium">
          &larr; Return to Doctor Listing
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto mt-12 bg-white p-8 rounded-lg shadow-sm border border-gray-200">
      <h1 className="text-2xl font-bold mb-8 text-gray-800 border-b pb-4">Schedule an Appointment</h1>
      
      {/* Step 1: Select a doctor */}
      {!selectedDoctor ? (
        <div>
          <h2 className="text-lg font-semibold mb-4 text-gray-700">1. Select a Doctor</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {doctors.map(doc => (
              <button 
                key={doc.id} 
                onClick={() => setSelectedDoctor(doc)}
                className="text-left border border-gray-200 p-4 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
              >
                <h3 className="font-bold text-gray-900">{doc.name}</h3>
                <p className="text-sm text-blue-600 font-medium">{doc.specialty}</p>
              </button>
            ))}
          </div>
        </div>
      ) : 
      
      /* Step 2 & 3: View available slots and Select date and time */
      !selectedSlot ? (
        <div>
          <button onClick={() => setSelectedDoctor(null)} className="text-sm text-gray-500 mb-6 hover:text-blue-600 font-medium">
            &larr; Change Doctor
          </button>
          <h2 className="text-lg font-semibold mb-4 text-gray-700">2. Select Date & Time for {selectedDoctor.name}</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {selectedDoctor.slots
              .filter(s => s.isAvailable)
              .map(slot => (
                <button 
                  key={slot.id}
                  onClick={() => setSelectedSlot(slot)}
                  className="border border-gray-200 p-3 rounded-lg text-center hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-colors group"
                >
                  <p className="font-semibold text-gray-800 group-hover:text-white">{slot.date}</p>
                  <p className="text-sm text-gray-500 group-hover:text-blue-100">{slot.time}</p>
                </button>
            ))}
          </div>
        </div>
      ) : 
      
      /* Step 4: Confirm appointment */
      (
        <div>
          <button onClick={() => setSelectedSlot(null)} className="text-sm text-gray-500 mb-6 hover:text-blue-600 font-medium">
            &larr; Change Date & Time
          </button>
          <h2 className="text-lg font-semibold mb-4 text-gray-700">3. Confirm Your Appointment</h2>
          <div className="border border-gray-200 p-6 rounded-lg bg-gray-50 mb-8">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Doctor</p>
                <p className="font-semibold text-gray-900">{selectedDoctor.name}</p>
                <p className="text-sm text-blue-600">{selectedDoctor.specialty}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Schedule</p>
                <p className="font-semibold text-gray-900">{selectedSlot.date}</p>
                <p className="text-sm text-gray-700">{selectedSlot.time}</p>
              </div>
            </div>
          </div>
          <button 
            onClick={handleConfirm}
            disabled={isBooking}
            className="w-full bg-blue-600 text-white p-4 rounded-lg font-bold text-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {isBooking ? 'Processing...' : 'Confirm Appointment'}
          </button>
        </div>
      )}
    </div>
  );
}