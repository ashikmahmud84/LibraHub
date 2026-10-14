'use client';

import React, { useState } from 'react';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  Send, 
  CheckCircle2, 
  AlertCircle,
  Building,
  HelpCircle
} from 'lucide-react';
import SectionHeading from '../../components/SectionHeading.jsx';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    department: 'circulation',
    subject: '',
    message: ''
  });

  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const validate = () => {
    const errs = {};
    if (!formData.fullName.trim()) errs.fullName = 'Full name is required';
    if (!formData.email.trim()) {
      errs.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errs.email = 'Please provide a valid email address';
    }
    if (!formData.subject.trim()) errs.subject = 'Subject line is required';
    if (!formData.message.trim() || formData.message.trim().length < 10) {
      errs.message = 'Message must be at least 10 characters';
    }
    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      setSubmitted(true);
    }
  };

  const handleReset = () => {
    setFormData({
      fullName: '',
      email: '',
      department: 'circulation',
      subject: '',
      message: ''
    });
    setErrors({});
    setSubmitted(false);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      
      {/* Header */}
      <div className="max-w-2xl">
        <SectionHeading
          kicker="Connect With Us"
          title="Inquiries, Research Assistance & Stacks Support"
          subtitle="Reach our reference librarians, schedule study pod bookings, or inquire regarding archival loans."
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* Left Column: Contact Form */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs">
          {submitted ? (
            <div className="py-12 text-center flex flex-col items-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 mb-4">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold font-serif text-slate-900 mb-2">
                Inquiry Successfully Received
              </h3>
              <p className="text-sm text-slate-600 max-w-md mb-6 leading-relaxed">
                Thank you, <strong className="text-slate-900">{formData.fullName}</strong>. A reference librarian will respond to <strong className="text-slate-900">{formData.email}</strong> within one business day.
              </p>
              <button
                type="button"
                onClick={handleReset}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors"
              >
                Send Another Inquiry
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              <h3 className="text-lg font-bold font-serif text-slate-900 mb-4">
                Send a Message to the Reference Desk
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div className="space-y-1.5">
                  <label htmlFor="fullName" className="text-xs font-semibold text-slate-700">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="Enter Your Full Name"
                    className={`w-full px-3.5 py-2.5 text-sm rounded-xl border bg-white focus:outline-none focus:ring-4 transition-all ${
                      errors.fullName
                        ? 'border-rose-400 focus:ring-rose-100'
                        : 'border-slate-200 focus:border-blue-500 focus:ring-blue-100'
                    }`}
                  />
                  {errors.fullName && (
                    <p className="text-xs text-rose-600 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      <span>{errors.fullName}</span>
                    </p>
                  )}
                </div>

                {/* Email Address */}
                <div className="space-y-1.5">
                  <label htmlFor="email" className="text-xs font-semibold text-slate-700">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Enter Your Email Address"
                    className={`w-full px-3.5 py-2.5 text-sm rounded-xl border bg-white focus:outline-none focus:ring-4 transition-all ${
                      errors.email
                        ? 'border-rose-400 focus:ring-rose-100'
                        : 'border-slate-200 focus:border-blue-500 focus:ring-blue-100'
                    }`}
                  />
                  {errors.email && (
                    <p className="text-xs text-rose-600 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      <span>{errors.email}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Department Selector */}
              <div className="space-y-1.5">
                <label htmlFor="department" className="text-xs font-semibold text-slate-700">
                  Target Department
                </label>
                <select
                  id="department"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-white text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all"
                >
                  <option value="circulation">Circulation Desk & Book Borrowing</option>
                  <option value="research">Scholarly Research & Manuscripts Consultation</option>
                  <option value="interlibrary">Interlibrary Consortium & Resource Sharing</option>
                  <option value="membership">Patron Membership & Institutional Passes</option>
                </select>
              </div>

              {/* Subject */}
              <div className="space-y-1.5">
                <label htmlFor="subject" className="text-xs font-semibold text-slate-700">
                  Inquiry Subject <span className="text-rose-500">*</span>
                </label>
                <input
                  id="subject"
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="e.g. Rare manuscript consultation for doctoral thesis"
                  className={`w-full px-3.5 py-2.5 text-sm rounded-xl border bg-white focus:outline-none focus:ring-4 transition-all ${
                    errors.subject
                      ? 'border-rose-400 focus:ring-rose-100'
                      : 'border-slate-200 focus:border-blue-500 focus:ring-blue-100'
                  }`}
                />
                {errors.subject && (
                  <p className="text-xs text-rose-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    <span>{errors.subject}</span>
                  </p>
                )}
              </div>

              {/* Message */}
              <div className="space-y-1.5">
                <label htmlFor="message" className="text-xs font-semibold text-slate-700">
                  Message Details <span className="text-rose-500">*</span>
                </label>
                <textarea
                  id="message"
                  rows={5}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Please describe your inquiry or resource requirements in detail..."
                  className={`w-full px-3.5 py-2.5 text-sm rounded-xl border bg-white focus:outline-none focus:ring-4 transition-all resize-none ${
                    errors.message
                      ? 'border-rose-400 focus:ring-rose-100'
                      : 'border-slate-200 focus:border-blue-500 focus:ring-blue-100'
                  }`}
                />
                {errors.message && (
                  <p className="text-xs text-rose-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    <span>{errors.message}</span>
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm transition-all shadow-sm active:scale-[0.99]"
              >
                <Send className="h-4 w-4" />
                <span>Submit Inquiry</span>
              </button>
            </form>
          )}
        </div>

        {/* Right Column: Physical Directory & Hours */}
        <div className="lg:col-span-5 space-y-6">
          
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 text-white space-y-6 border border-slate-800 shadow-md">
            <h3 className="text-lg font-bold font-serif text-white">
              Visiting the Central Atrium
            </h3>
            
            <div className="space-y-4 text-xs sm:text-sm text-slate-300">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block font-semibold">Main Campus Sanctuary</strong>
                  <span>P73/2 Middle Badda</span>
                  <span className="block text-slate-400 mt-0.5">Station: Around Badda High School</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block font-semibold">Standard Reading Hours</strong>
                  <span>Monday – Friday: 08:00 – 22:00</span>
                  <span className="block text-slate-400">Saturday – Sunday: 09:00 – 20:00</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-blue-400 shrink-0" />
                <div>
                  <strong className="text-white block font-semibold">Phone </strong>
                  <span className="font-mono tabular-nums">+8801643536878</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-blue-400 shrink-0" />
                <div>
                  <strong className="text-white block font-semibold">Direct Email</strong>
                  <span>ashikmahmudabir24@gmail.com</span>
                </div>
              </div>
            </div>
          </div>

          {/* Department Directory Cards */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Direct Inquiries
            </h4>
            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <p className="font-semibold text-slate-900">Interlibrary Loans & Digital Access</p>
                <p className="text-slate-500 mt-0.5">ill-support@librahub.org · Desk B-4</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <p className="font-semibold text-slate-900">Special Collections & Archives</p>
                <p className="text-slate-500 mt-0.5">archives@librahub.org · By Appointment</p>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
