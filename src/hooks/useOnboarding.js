import { useState, useCallback } from 'react';
import { submitListing } from '../api';

const INITIAL_STATE = {
  name: '', type: '', city: '', country: '', bedrooms: '1', maxGuests: '2', description: '',
  address: '', lat: null, lng: null,
  photos: [],
  price: '', minStay: '1 night', cleaningFee: '',
  halalChecks: {
    alcoholFree: false, noNonHalalMeat: false, petFree: false,
    halalKitchen: false, prayerSpace: false, mosqueInfo: false, noInappropriateDecor: false,
  },
  fullName: '', email: '', phone: '', termsAccepted: false,
};

export function useOnboarding() {
  const [step, setStep]             = useState(1);
  const [form, setForm]             = useState(INITIAL_STATE);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted]   = useState(false);
  const [error, setError]           = useState(null);

  const update = useCallback((field, value) => {
    setForm(f => ({ ...f, [field]: value }));
  }, []);

  const toggleHalalCheck = useCallback((key) => {
    setForm(f => ({
      ...f,
      halalChecks: { ...f.halalChecks, [key]: !f.halalChecks[key] },
    }));
  }, []);

  const addPhoto = useCallback((photo) => {
    setForm(f => ({ ...f, photos: [...f.photos, photo] }));
  }, []);

  const removePhoto = useCallback((idx) => {
    setForm(f => ({ ...f, photos: f.photos.filter((_, i) => i !== idx) }));
  }, []);

  const goStep = useCallback((n) => {
    setStep(n);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const checkedCount = Object.values(form.halalChecks).filter(Boolean).length;
  const totalChecks  = Object.keys(form.halalChecks).length;
  const hostFee      = form.price ? Math.round(parseFloat(form.price) * 0.08) : 0;
  const hostEarns    = form.price ? Math.round(parseFloat(form.price) - hostFee) : 0;

  const handleSubmit = useCallback(async () => {
    if (!form.termsAccepted) {
      setError('Please accept the Host Agreement to continue.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await submitListing(form);
      setSubmitted(true);
    } catch (e) {
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }, [form]);

  const reset = useCallback(() => {
    setForm(INITIAL_STATE);
    setStep(1);
    setSubmitted(false);
    setError(null);
  }, []);

  return {
    step, goStep, form, update, toggleHalalCheck,
    addPhoto, removePhoto, submitting, submitted, error,
    checkedCount, totalChecks, hostFee, hostEarns,
    handleSubmit, reset,
  };
}
