export interface Category {
    id: number;
    name: string;
    slug: string;
    tagline: string | null;
    description?: string | null;
    image: string | null;
    home_title?: string | null;
    home_text?: string | null;
    tours?: MenuTour[];
    items?: TourCard[];
}

export interface MenuTour {
    id: number;
    group_name: string | null;
    title: string;
    slug: string;
    duration_days: number;
}

export interface TourCard {
    id: number;
    group_name?: string | null;
    title: string;
    slug: string;
    image: string | null;
    duration_days: number;
    price_from: number | null;
    season: string | null;
    badge: string | null;
    excerpt: string | null;
    difficulty: string | null;
    category: { id: number; name: string; slug: string } | null;
}

export interface ItineraryDay {
    title: string;
    description: string;
    accommodation?: string;
    meals?: string;
    altitude?: string;
}

export interface Tour extends TourCard {
    subtitle: string | null;
    overview: string | null;
    price_note: string | null;
    group_size: string | null;
    min_age: string | null;
    gallery: string[] | null;
    highlights: string[] | null;
    itinerary: ItineraryDay[] | null;
    includes: string[] | null;
    excludes: string[] | null;
    route_map: string | null;
    departure: string | null;
    departure_time: string | null;
    return_time: string | null;
    dress_code: string | null;
    pricing: { people: string; price: string }[] | null;
    meta_title: string | null;
    meta_description: string | null;
    destinations: { id: number; name: string; slug: string; image: string | null }[];
}

export interface Destination {
    id: number;
    name: string;
    slug: string;
    region: string | null;
    tagline: string | null;
    excerpt?: string | null;
    body?: string | null;
    image: string | null;
    gallery?: string[] | null;
    best_time?: string | null;
    highlights?: string[] | null;
    tours_count?: number;
}

export interface Post {
    id: number;
    title: string;
    slug: string;
    topic: string | null;
    excerpt?: string | null;
    body?: string | null;
    image: string | null;
    author?: string | null;
    read_minutes: number;
    published_at: string | null;
}

export interface Page {
    id: number;
    title: string;
    slug: string;
    eyebrow: string | null;
    subtitle: string | null;
    image: string | null;
    body: string | null;
    sections: { title?: string; text?: string; image?: string }[] | null;
    meta_title: string | null;
    meta_description: string | null;
}

export interface Slide {
    id: number;
    eyebrow: string | null;
    title: string;
    subtitle: string | null;
    image: string;
    cta_label: string | null;
    cta_url: string | null;
}

export interface Testimonial {
    id: number;
    name: string;
    country: string | null;
    rating: number;
    title: string | null;
    quote: string;
    trip: string | null;
    source: string | null;
    avatar: string | null;
}

export interface Stat { id: number; value: string; suffix: string | null; label: string; caption: string | null }
export interface Partner { id: number; name: string; subtitle: string | null; logo: string | null; url: string | null }
export interface Faq { id: number; topic: string | null; question: string; answer: string }
export interface TeamMember { id: number; name: string; role: string | null; photo: string | null; bio: string | null; email: string | null }

export type Settings = Record<string, any>;

export interface SharedProps {
    settings: Settings;
    flash: { success: string | null; error: string | null };
    auth: { user: { id: number; name: string; email: string } | null };
    menu: {
        categories: Category[];
        destinations: Destination[];
        pages: { title: string; menu_title: string | null; slug: string; footer_group: string }[];
    } | null;
    admin: { nav: { key: string; label: string; icon: string; group: string }[]; newEnquiries: number } | null;
    [key: string]: unknown;
}

export interface Paginated<T> {
    data: T[];
    links: { url: string | null; label: string; active: boolean }[];
    current_page: number;
    last_page: number;
    total: number;
    from: number | null;
    to: number | null;
}
