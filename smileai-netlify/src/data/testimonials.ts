export interface LandingPageTestimonial {
  id: string;
  name: string;
  city: string;
  rating: number;
  text: string;
  service: string;
  image: string | null;
}

export const builtInTestimonials: LandingPageTestimonial[] = [
  {
    id: 'builtin-1',
    name: 'Maria Gonzalez',
    city: 'Miami Beach, FL',
    rating: 5,
    text: 'The AI preview gave me confidence to move forward with veneers. The actual results exceeded my expectations! My smile has completely transformed my life.',
    service: 'Veneers',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80',
  },
  {
    id: 'builtin-2',
    name: 'David Chen',
    city: 'Brickell, FL',
    rating: 5,
    text: 'I was skeptical at first, but the AI showed me exactly what was possible. The team delivered on every promise. Highly recommend for anyone considering dental work.',
    service: 'Dental Implants',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80',
  },
  {
    id: 'builtin-3',
    name: 'Amanda Rodriguez',
    city: 'Coconut Grove, FL',
    rating: 5,
    text: 'Best decision ever! The AI preview was spot-on. The staff was professional, caring, and the results speak for themselves. I can\'t stop smiling!',
    service: 'Smile Makeover',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&q=80',
  },
  {
    id: 'builtin-4',
    name: 'James Patterson',
    city: 'Coral Gables, FL',
    rating: 5,
    text: 'From consultation to final result, everything was perfect. The technology made it easy to visualize my new smile, and the team made it a reality.',
    service: 'Full Mouth Reconstruction',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&q=80',
  },
  {
    id: 'builtin-5',
    name: 'Sarah Williams',
    city: 'Kendall, FL',
    rating: 5,
    text: 'After years of hiding my smile, I finally have the confidence I always wanted. The preview tool was incredible and gave me hope. Couldn\'t be happier!',
    service: 'Teeth Whitening & Veneers',
    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&q=80',
  },
];
