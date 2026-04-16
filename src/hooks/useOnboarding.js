import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../supabase';
import { submitListing } from '../api';

const INITIAL_STATE = {
  name: '', type: '', city: '', country: '', bedrooms: '1', maxGuests: '2', description: '',
  address: '', lat: null, lng: null,
  instantBooking: false,
  cancellationPolicy: 'moderate',
  photos: [],
  price: '', minStay: '1 night', cleaningFee: '',
  halalChecks: {
    alcoholFree: false, noNonHalalMeat: false, petFree: false,
    halalKitchen: false, prayerSpace: false, mosqueInfo: false, noInappropriateDecor: false,
  },
  houseRules: {
    noSmoking: false, noParties: false, noPets: false,
    quietHours: false, noUnmahrems: false, shoesOff: false,
  },
  customRules: '',
  fullName: '', email: '', phone: '', termsAccepted: false,
};

export function useOnboarding() {
  const [step, setStep]             = useState(1);
  const [form, setForm]             = useState(INITIAL_STATE);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted]   = useState(false);
  const [error, setError]           = useState(null);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      const { data: profile } = await supabase
        .from('profiles')
        .select('display_name, full_name, email, phone')
        .eq('user_id', user.id)
        .single();
      if (profile) {
        setForm(f => ({
          ...f,
          fullName: profile.full_name || profile.display_name || f.fullName || '',
          email:    profile.email || user.email || f.email || '',
          phone:    profile.phone || f.phone || '',
        }));
      } else if (user.email) {
        setForm(f => ({ ...f, email: user.email }));
      }
    });
  }, []);

  const update = useCallback((field, value) => {
    setForm(f => ({ ...f, [field]: value }));
  }, []);

  const toggleHalalCheck = useCallback((key) => {
    setForm(f => ({
      ...f,
      halalChecks: { ...f.halalChecks, [key]: !f.halalChecks[key] },
    }));
  }, []);

  const toggleHouseRule = useCallback((key) => {
    setForm(f => ({
      ...f,
      houseRules: { ...f.houseRules, [key]: !f.houseRules[key] },
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
  const hostFee      = form.price ? Math.round(parseFloat(form.price) * 0.03) : 0;
  const hostEarns    = form.price ? Math.round(parseFloat(form.price) - hostFee) : 0;

  const handleSubmit = useCallback(async () => {
    if (!form.termsAccepted) {
      setError('Please accept the Host Agreement to continue.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      await submitListing({ ...form, hostId: user?.id });
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
    step, goStep, form, update, toggleHalalCheck, toggleHouseRule,
    addPhoto, removePhoto, submitting, submitted, error,
    checkedCount, totalChecks, hostFee, hostEarns,
    handleSubmit, reset,
  };
}
