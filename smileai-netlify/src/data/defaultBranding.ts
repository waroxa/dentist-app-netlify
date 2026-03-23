import { ClinicBranding } from '../App';
import { cloneBuiltInTestimonials } from './testimonials';

export function createDefaultClinicBranding(): ClinicBranding {
  return {
    clinicName: 'SmileVisionPro AI',
    primaryColor: '#0584fa',
    accentColor: '#3b82f6',
    contactInfo: { email: 'support@smilevisionpro.ai' },
    testimonials: cloneBuiltInTestimonials(),
  };
}
