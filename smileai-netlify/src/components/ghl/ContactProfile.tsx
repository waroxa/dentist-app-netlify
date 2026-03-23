import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  Phone,
  Mail,
  Calendar,
  MapPin,
  Tag,
  Image as ImageIcon,
  Video,
  Download,
  ExternalLink,
  Clock,
  User,
  FileText,
  Eye,
  X as XIcon,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { Button } from '../ui/button';
import { StatusDropdown, ReviewStatusType } from './ReviewStatus';

interface ContactProfileProps {
  contactId?: string;
  onBack: () => void;
  primaryColor?: string;
}

interface MediaItem {
  id: string;
  type: 'image' | 'video';
  url: string;
  thumbnail?: string;
  filename: string;
  size: string;
  uploadedAt: string;
  description?: string;
}

interface ContactData {
  id: string;
  name: string;
  email: string;
  phone: string;
  dateAdded: string;
  lastActivity: string;
  location: string;
  source: string;
  tags: string[];
  interestedIn: string;
  notes: string;
  media: MediaItem[];
}

function formatDate(value: string) {
  try {
    return new Date(value).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  } catch {
    return value || 'Unknown';
  }
}

function formatDateTime(value: string) {
  try {
    return new Date(value).toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  } catch {
    return value || 'Unknown';
  }
}

function toReviewStatus(tags: string[]): ReviewStatusType {
  if (tags.includes('Video Ready')) return 'Dentist Reviewed';
  if (tags.includes('Preview Ready')) return 'Media Received';
  return 'New Smile Submission';
}

export function ContactProfile({ contactId, onBack, primaryColor = '#0ea5e9' }: ContactProfileProps) {
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [contact, setContact] = useState<ContactData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reviewStatus, setReviewStatus] = useState<ReviewStatusType>('New Smile Submission');

  useEffect(() => {
    let isMounted = true;

    async function fetchPatientProfile() {
      if (!contactId) {
        setLoadError('Patient id is missing.');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setLoadError(null);

      try {
        const response = await fetch(`/api/admin/patient-detail?id=${encodeURIComponent(contactId)}`, { credentials: 'include' });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || 'Failed to load patient profile.');
        if (!isMounted) return;
        setContact(data.patient || null);
        setReviewStatus(toReviewStatus(data.patient?.tags || []));
      } catch (error: any) {
        if (!isMounted) return;
        setLoadError(error.message || 'Failed to load patient profile.');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    fetchPatientProfile();
    return () => {
      isMounted = false;
    };
  }, [contactId]);

  const initials = useMemo(() => {
    if (!contact?.name) return 'SV';
    return contact.name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase();
  }, [contact?.name]);

  const tagColors: { [key: string]: string } = {
    'New Submission': 'bg-blue-100 text-blue-700 border-blue-200',
    'Preview Ready': 'bg-violet-100 text-violet-700 border-violet-200',
    'Video Ready': 'bg-emerald-100 text-emerald-700 border-emerald-200',
  };

  const handleDownload = (media: MediaItem) => {
    if (!media.url) return;
    window.open(media.url, '_blank', 'noopener,noreferrer');
  };

  const handleView = (media: MediaItem) => {
    setSelectedMedia(media);
  };

  if (isLoading) {
    return (
      <div className="h-full bg-gray-50 overflow-auto">
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="px-6 py-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={onBack} className="hover:bg-gray-100">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Patients
              </Button>
              <div className="h-6 w-px bg-gray-300" />
              <h1 className="text-xl font-semibold text-gray-900">Contact Profile</h1>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center px-6 py-16">
          <div className="flex flex-col items-center text-center">
            <Loader2 className="h-8 w-8 animate-spin" style={{ color: primaryColor }} />
            <p className="mt-3 text-sm text-gray-500">Loading patient profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (loadError || !contact) {
    return (
      <div className="h-full bg-gray-50 overflow-auto">
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="px-6 py-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={onBack} className="hover:bg-gray-100">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Patients
              </Button>
              <div className="h-6 w-px bg-gray-300" />
              <h1 className="text-xl font-semibold text-gray-900">Contact Profile</h1>
            </div>
          </div>
        </div>
        <div className="mx-auto max-w-xl px-6 py-16">
          <div className="rounded-xl border border-red-200 bg-white p-8 text-center shadow-sm">
            <AlertCircle className="mx-auto h-8 w-8 text-red-500" />
            <h2 className="mt-4 text-lg font-semibold text-gray-900">Profile unavailable</h2>
            <p className="mt-2 text-sm text-gray-600">{loadError || 'We could not load this patient profile.'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gray-50 overflow-auto">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={onBack} className="hover:bg-gray-100">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Patients
            </Button>
            <div className="h-6 w-px bg-gray-300" />
            <h1 className="text-xl font-semibold text-gray-900">Contact Profile</h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center gap-4 mb-4">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-semibold"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {initials}
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">{contact.name}</h2>
                    <p className="text-sm text-gray-500">Patient ID: #{contact.id}</p>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Phone</p>
                    <a href={`tel:${contact.phone}`} className="text-sm font-medium text-gray-900 hover:text-blue-600">
                      {contact.phone}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Email</p>
                    <a href={`mailto:${contact.email}`} className="text-sm font-medium text-gray-900 hover:text-blue-600 break-all">
                      {contact.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Location</p>
                    <p className="text-sm font-medium text-gray-900">{contact.location}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Date Added</p>
                    <p className="text-sm font-medium text-gray-900">{formatDate(contact.dateAdded)}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Last Activity</p>
                    <p className="text-sm font-medium text-gray-900">{formatDateTime(contact.lastActivity)}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <ExternalLink className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Source</p>
                    <p className="text-sm font-medium text-gray-900">{contact.source}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-gray-600" />
                  <h3 className="font-semibold text-gray-900">Tags</h3>
                </div>
              </div>
              <div className="p-4">
                <div className="flex flex-wrap gap-2">
                  {contact.tags.map((tag, index) => (
                    <span
                      key={index}
                      className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium border ${
                        tagColors[tag] || 'bg-gray-100 text-gray-700 border-gray-200'
                      }`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-600" />
                  <h3 className="font-semibold text-gray-900">Service Interest</h3>
                </div>
              </div>
              <div className="p-4">
                <div
                  className="px-4 py-3 rounded-lg border-2 font-medium text-center"
                  style={{
                    borderColor: primaryColor,
                    backgroundColor: `${primaryColor}10`,
                    color: primaryColor,
                  }}
                >
                  {contact.interestedIn}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-gray-600" />
                  <h3 className="font-semibold text-gray-900">Review Status</h3>
                </div>
              </div>
              <div className="p-4">
                <StatusDropdown currentStatus={reviewStatus} onStatusChange={setReviewStatus} />
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-gray-600" />
                    <h3 className="font-semibold text-gray-900">Clinical Notes</h3>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <p className="text-sm text-gray-700 leading-relaxed">{contact.notes}</p>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-gray-600" />
                    <h3 className="font-semibold text-gray-900">Uploaded Media</h3>
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                      {contact.media.length}
                    </span>
                  </div>
                </div>
              </div>
              <div className="p-4">
                {contact.media.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-gray-200 px-6 py-10 text-center">
                    <p className="text-sm text-gray-500">No media has been generated for this patient yet.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {contact.media.map((media) => (
                      <div
                        key={media.id}
                        className="group border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow bg-white"
                      >
                        <div className="relative aspect-video bg-gray-100">
                          {media.type === 'video' ? (
                            <>
                              {media.thumbnail ? (
                                <img
                                  src={media.thumbnail}
                                  alt={media.description}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-gray-200" />
                              )}
                              <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
                                  <Video className="w-6 h-6 text-gray-700" />
                                </div>
                              </div>
                            </>
                          ) : (
                            <img
                              src={media.thumbnail || media.url}
                              alt={media.description}
                              className="w-full h-full object-cover"
                            />
                          )}

                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="bg-white/90 hover:bg-white"
                              onClick={() => handleView(media)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="bg-white/90 hover:bg-white"
                              onClick={() => handleDownload(media)}
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="p-3 border-t border-gray-100">
                          <div className="flex items-start gap-2 mb-2">
                            {media.type === 'image' ? (
                              <ImageIcon className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                            ) : (
                              <Video className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-gray-900 truncate">{media.filename}</p>
                              {media.description && (
                                <p className="text-xs text-gray-500 truncate">{media.description}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>{media.size || 'Generated asset'}</span>
                            <span>{formatDateTime(media.uploadedAt)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-600" />
                  <h3 className="font-semibold text-gray-900">Recent Activity</h3>
                </div>
              </div>
              <div className="p-4">
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                      <FileText className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">Submitted intake form</p>
                      <p className="text-xs text-gray-500">{formatDateTime(contact.dateAdded)}</p>
                    </div>
                  </div>

                  {contact.media.map((media) => (
                    <div key={`activity-${media.id}`} className="flex gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                        {media.type === 'image' ? (
                          <ImageIcon className="w-4 h-4 text-blue-600" />
                        ) : (
                          <Video className="w-4 h-4 text-blue-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">{media.description || media.filename}</p>
                        <p className="text-xs text-gray-500">{formatDateTime(media.uploadedAt)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {selectedMedia && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-5xl w-full">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedMedia(null)}
              className="absolute -top-12 right-0 text-white hover:bg-white/20"
            >
              <XIcon className="w-5 h-5 mr-2" />
              Close
            </Button>
            <div className="bg-white rounded-lg overflow-hidden">
              {selectedMedia.type === 'video' ? (
                <video controls className="w-full max-h-[70vh] bg-black">
                  <source src={selectedMedia.url} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              ) : (
                <img
                  src={selectedMedia.url}
                  alt={selectedMedia.description}
                  className="w-full max-h-[70vh] object-contain"
                />
              )}
              <div className="p-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{selectedMedia.filename}</p>
                    <p className="text-sm text-gray-500">{formatDateTime(selectedMedia.uploadedAt)} • {selectedMedia.size || 'Generated asset'}</p>
                  </div>
                  <Button size="sm" onClick={() => handleDownload(selectedMedia)}>
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
