/**
 * CRM storage utility - location-specific storage using custom values
 * 
 * This utility stores app presentation settings locally in the browser.
 * Marketplace API credentials and OAuth tokens are never stored here.
 * 
 * Data stored with SEPARATE KEYS for better organization:
 * - Hashed admin password (PBKDF2 via Web Crypto API)
 * - Clinic branding (logo, name, colors, hero image)
 * - Contact info (address, phone, email)
 * - Social media (facebook, instagram, tiktok, linkedin, youtube)
 * - Testimonials (patient reviews)
 * - Google Reviews script (widget embed code)
 */

import { hashPassword, verifyPassword, isHashedPassword } from './password-utils';
import { cloneBuiltInTestimonials } from '../data/testimonials';

// Custom value keys for platform storage - separate keys for each data type
const STORAGE_KEYS = {
  ADMIN_PASSWORD_HASH: 'smileai_admin_password_hash',
  BRANDING: 'smileai_branding',
  CONTACT_INFO: 'smileai_contact_info',
  SOCIAL_MEDIA: 'smileai_social_media',
  TESTIMONIALS: 'smileai_testimonials',
  GOOGLE_REVIEWS: 'smileai_google_reviews',
  // Legacy key for migration
  LEGACY_CLINIC_BRANDING: 'smileai_clinic_branding',
} as const;

const CRM_STORAGE = {
  CURRENT_WORKSPACE: 'workspace_current_location_id',
} as const;

/**
 * Get CRM location ID from URL params or sessionStorage fallback
 */
function getLocationId(): string | null {
  // First, try to get from URL params (embedded CRM context)
  const urlParams = new URLSearchParams(window.location.search);
  const locationId = urlParams.get('location_id') || urlParams.get('locationId');
  
  if (locationId) {
    // Cache it in sessionStorage for this session
    sessionStorage.setItem(CRM_STORAGE.CURRENT_WORKSPACE, locationId);
    return locationId;
  }
  
  // Fallback to sessionStorage
  const cached = sessionStorage.getItem(CRM_STORAGE.CURRENT_WORKSPACE);
  if (cached) return cached;
  
  return null;
}

/**
 * Generic function to get a local presentation setting.
 */
async function getCustomValue(key: string): Promise<string | null> {
  return localStorage.getItem(key);
}

/**
 * Generic function to set a local presentation setting.
 */
async function setCustomValue(key: string, value: string): Promise<boolean> {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (error) {
    console.error(`Error setting custom value ${key}:`, error);
    return false;
  }
}

// ============================================
// PASSWORD MANAGEMENT (Hashed with PBKDF2 via Web Crypto API)
// ============================================

/**
 * Get stored password hash from the platform
 */
export async function getPasswordHash(): Promise<string | null> {
  const hash = await getCustomValue(STORAGE_KEYS.ADMIN_PASSWORD_HASH);
  
  return hash;
}

/**
 * Set password hash in the platform
 */
export async function setPasswordHash(hash: string): Promise<boolean> {
  return setCustomValue(STORAGE_KEYS.ADMIN_PASSWORD_HASH, hash);
}

/**
 * Update password (hashes it before storing)
 */
export async function updatePassword(newPassword: string): Promise<boolean> {
  const hash = await hashPassword(newPassword);
  return setPasswordHash(hash);
}

/**
 * Verify login password
 */
export async function verifyLoginPassword(password: string): Promise<boolean> {
  const hash = await getPasswordHash();
  if (!hash) return false;
  return verifyPassword(password, hash);
}

// ============================================
// CLINIC BRANDING MANAGEMENT
// ============================================

export interface Branding {
  clinicName: string;
  logo: string | null;
  heroImage: string | null;
  colors: {
    primary: string;
    secondary: string;
  };
}

/**
 * Get clinic branding from the platform
 */
export async function getBranding(): Promise<Branding | null> {
  const data = await getCustomValue(STORAGE_KEYS.BRANDING);
  if (!data) return null;
  
  try {
    return JSON.parse(data);
  } catch (error) {
    console.error('Error parsing clinic branding:', error);
    return null;
  }
}

/**
 * Set clinic branding in the platform
 */
export async function setBranding(branding: Branding): Promise<boolean> {
  return setCustomValue(STORAGE_KEYS.BRANDING, JSON.stringify(branding));
}

// ============================================
// CONTACT INFO MANAGEMENT
// ============================================

export interface ContactInfo {
  address?: string;
  phone?: string;
  email?: string;
}

/**
 * Get contact info from the platform
 */
export async function getContactInfo(): Promise<ContactInfo | null> {
  const data = await getCustomValue(STORAGE_KEYS.CONTACT_INFO);
  if (!data) return null;
  
  try {
    return JSON.parse(data);
  } catch (error) {
    console.error('Error parsing contact info:', error);
    return null;
  }
}

/**
 * Set contact info in the platform
 */
export async function setContactInfo(contactInfo: ContactInfo): Promise<boolean> {
  return setCustomValue(STORAGE_KEYS.CONTACT_INFO, JSON.stringify(contactInfo));
}

// ============================================
// SOCIAL MEDIA MANAGEMENT
// ============================================

export interface SocialMedia {
  facebook?: string;
  instagram?: string;
  tiktok?: string;
  linkedin?: string;
  youtube?: string;
}

/**
 * Get social media links from the platform
 */
export async function getSocialMedia(): Promise<SocialMedia | null> {
  const data = await getCustomValue(STORAGE_KEYS.SOCIAL_MEDIA);
  if (!data) return null;
  
  try {
    return JSON.parse(data);
  } catch (error) {
    console.error('Error parsing social media links:', error);
    return null;
  }
}

/**
 * Set social media links in the platform
 */
export async function setSocialMedia(socialMedia: SocialMedia): Promise<boolean> {
  return setCustomValue(STORAGE_KEYS.SOCIAL_MEDIA, JSON.stringify(socialMedia));
}

// ============================================
// TESTIMONIALS MANAGEMENT
// ============================================

export interface Testimonial {
  id: string;
  text: string;
  rating: number;
  image: string | null;
  name: string;
  city: string;
  service: string;
}

/**
 * Get testimonials from the platform
 */
export async function getTestimonials(): Promise<Testimonial[] | null> {
  const data = await getCustomValue(STORAGE_KEYS.TESTIMONIALS);
  if (!data) return null;
  
  try {
    return JSON.parse(data);
  } catch (error) {
    console.error('Error parsing testimonials:', error);
    return null;
  }
}

/**
 * Set testimonials in the platform
 */
export async function setTestimonials(testimonials: Testimonial[]): Promise<boolean> {
  return setCustomValue(STORAGE_KEYS.TESTIMONIALS, JSON.stringify(testimonials));
}

// ============================================
// GOOGLE REVIEWS MANAGEMENT
// ============================================

export interface GoogleReviews {
  script: string;
}

/**
 * Get Google Reviews script from the platform
 */
export async function getGoogleReviews(): Promise<GoogleReviews | null> {
  const data = await getCustomValue(STORAGE_KEYS.GOOGLE_REVIEWS);
  if (!data) return null;
  
  try {
    return JSON.parse(data);
  } catch (error) {
    console.error('Error parsing Google Reviews script:', error);
    return null;
  }
}

/**
 * Set Google Reviews script in the platform
 */
export async function setGoogleReviews(googleReviews: GoogleReviews): Promise<boolean> {
  return setCustomValue(STORAGE_KEYS.GOOGLE_REVIEWS, JSON.stringify(googleReviews));
}

// ============================================
// API CREDENTIALS MANAGEMENT
// ============================================

export interface ApiCredentials {
  crmApiKey: string;
  crmLocationId: string;
}

/**
 * Get API credentials.
 * OAuth credentials are server-side only, so this always returns null.
 */
export async function getApiCredentials(): Promise<ApiCredentials | null> {
  return null;
}

/**
 * Set API credentials.
 * Kept for compatibility; credentials must be configured through OAuth.
 */
export async function setApiCredentials(credentials: ApiCredentials): Promise<boolean> {
  void credentials;
  return false;
}

// ============================================
// MIGRATION HELPERS
// ============================================

/**
 * Legacy ClinicBranding interface (for backward compatibility)
 */
export interface ClinicBranding {
  clinicName: string;
  logo: string | null;
  heroImage: string | null;
  primaryColor?: string;
  contactInfo: {
    address?: string;
    phone?: string;
    email?: string;
  };
  socialMedia: {
    facebook?: string;
    instagram?: string;
    tiktok?: string;
    linkedin?: string;
    youtube?: string;
  };
  testimonials: Array<{
    id: string;
    text: string;
    rating: number;
    image: string | null;
    name: string;
    city: string;
    service: string;
  }>;
  googleReviewsScript?: string;
}

/**
 * Get all clinic data (combined from separate keys) - Legacy support
 * This maintains backward compatibility with existing code
 */
export async function getClinicBranding(): Promise<ClinicBranding | null> {
  // First, check if we need to migrate from legacy single-key structure
  const legacyData = await getCustomValue(STORAGE_KEYS.LEGACY_CLINIC_BRANDING);
  if (legacyData) {
    console.log('🔄 Detected legacy data, migrating to new structure...');
    try {
      const legacy: ClinicBranding = JSON.parse(legacyData);
      
      // Migrate to new separate-key structure
      if (legacy.clinicName || legacy.logo || legacy.heroImage) {
        await setBranding({
          clinicName: legacy.clinicName || '',
          logo: legacy.logo,
          heroImage: legacy.heroImage,
          colors: {
            primary: legacy.primaryColor || '#3b82f6',
            secondary: '#8b5cf6',
          },
        });
      }
      
      if (legacy.contactInfo && Object.keys(legacy.contactInfo).length > 0) {
        await setContactInfo(legacy.contactInfo);
      }
      
      if (legacy.socialMedia && Object.keys(legacy.socialMedia).length > 0) {
        await setSocialMedia(legacy.socialMedia);
      }
      
      if (legacy.testimonials && legacy.testimonials.length > 0) {
        await setTestimonials(legacy.testimonials);
      }
      
      if (legacy.googleReviewsScript) {
        await setGoogleReviews({ script: legacy.googleReviewsScript });
      }
      
      console.log('✅ Migration complete! Removing legacy key...');
      // Don't delete the legacy key immediately - keep it as backup for now
      
    } catch (error) {
      console.error('❌ Migration failed:', error);
    }
  }
  
  // Load from new separate-key structure
  const [branding, contactInfo, socialMedia, testimonials, googleReviews] = await Promise.all([
    getBranding(),
    getContactInfo(),
    getSocialMedia(),
    getTestimonials(),
    getGoogleReviews(),
  ]);
  
  // Combine into legacy format for backward compatibility
  return {
    clinicName: branding?.clinicName || 'SmileVisionPro',
    logo: branding?.logo || null,
    heroImage: branding?.heroImage || null,
    primaryColor: branding?.colors?.primary || '#3b82f6',
    contactInfo: contactInfo || {},
    socialMedia: socialMedia || {},
    testimonials: testimonials && testimonials.length > 0 ? testimonials : cloneBuiltInTestimonials(),
    googleReviewsScript: googleReviews?.script || '',
  };
}

/**
 * Set all clinic data (saves to separate keys) - Legacy support
 * This maintains backward compatibility with existing code
 */
export async function setClinicBranding(branding: ClinicBranding): Promise<boolean> {
  try {
    // Save to new separate-key structure
    const results = await Promise.all([
      setBranding({
        clinicName: branding.clinicName,
        logo: branding.logo,
        heroImage: branding.heroImage,
        colors: {
          primary: branding.primaryColor || '#3b82f6',
          secondary: '#8b5cf6',
        },
      }),
      setContactInfo(branding.contactInfo || {}),
      setSocialMedia(branding.socialMedia || {}),
      setTestimonials(branding.testimonials || []),
      branding.googleReviewsScript 
        ? setGoogleReviews({ script: branding.googleReviewsScript })
        : Promise.resolve(true),
    ]);
    
    // Return true only if all saves succeeded
    return results.every(result => result === true);
  } catch (error) {
    console.error('Error saving clinic branding:', error);
    return false;
  }
}

/**
 * Migrate old localStorage data to platform custom values
 */
export async function migrateLocalStorageToGHL(): Promise<void> {
  console.log('🔄 Starting migration from localStorage to platform custom values...');
  
  try {
    // Migrate password (hash it if not already hashed)
    const oldPassword = localStorage.getItem('smileai_admin_password');
    if (oldPassword) {
      console.log('  📝 Migrating password...');
      // Check if it's already a bcrypt hash
      if (isHashedPassword(oldPassword)) {
        await setPasswordHash(oldPassword);
      } else {
        // Plain text password, hash it
        const hash = await hashPassword(oldPassword);
        await setPasswordHash(hash);
      }
      console.log('  ✅ Password migrated and hashed');
    }
    
    // Migrate clinic branding (will auto-migrate via getClinicBranding)
    const oldBranding = localStorage.getItem('smileai_clinic_branding');
    if (oldBranding) {
      console.log('  📝 Migrating clinic branding to new structure...');
      try {
        const legacy: ClinicBranding = JSON.parse(oldBranding);
        await setClinicBranding(legacy);
        console.log('  ✅ Clinic branding migrated to separate keys');
      } catch (error) {
        console.error('  ❌ Failed to migrate branding:', error);
      }
    }
    
    console.log('✅ Migration complete!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
  }
}

/**
 * Check if platform custom values are configured
 */
export function isGHLStorageConfigured(): boolean {
  const locationId = getLocationId();
  return !!locationId;
}
