export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string | null;
          display_name: string | null;
          avatar_url: string | null;
          bio: string | null;
          vibe_preferences: string[] | null;
          is_anonymous: boolean;
          created_at: string;
        };
        Insert: {
          id: string;
          username?: string | null;
          display_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          vibe_preferences?: string[] | null;
          is_anonymous?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          username?: string | null;
          display_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          vibe_preferences?: string[] | null;
          is_anonymous?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      venues: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          category: string;
          vibe_tags: string[] | null;
          cover_image_url: string | null;
          gallery_urls: string[] | null;
          address: string | null;
          latitude: number | null;
          longitude: number | null;
          hot_score: number;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          category: string;
          vibe_tags?: string[] | null;
          cover_image_url?: string | null;
          gallery_urls?: string[] | null;
          address?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          hot_score?: number;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          category?: string;
          vibe_tags?: string[] | null;
          cover_image_url?: string | null;
          gallery_urls?: string[] | null;
          address?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          hot_score?: number;
          created_by?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      events: {
        Row: {
          id: string;
          venue_id: string;
          title: string;
          description: string | null;
          cover_image_url: string | null;
          starts_at: string;
          ends_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          venue_id: string;
          title: string;
          description?: string | null;
          cover_image_url?: string | null;
          starts_at: string;
          ends_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          venue_id?: string;
          title?: string;
          description?: string | null;
          cover_image_url?: string | null;
          starts_at?: string;
          ends_at?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      swipes: {
        Row: {
          id: string;
          user_id: string;
          venue_id: string;
          direction: 'left' | 'right';
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          venue_id: string;
          direction: 'left' | 'right';
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          venue_id?: string;
          direction?: 'left' | 'right';
          created_at?: string;
        };
        Relationships: [];
      };
      attendances: {
        Row: {
          id: string;
          user_id: string;
          event_id: string;
          status: 'going' | 'maybe' | 'invited';
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          event_id: string;
          status: 'going' | 'maybe' | 'invited';
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          event_id?: string;
          status?: 'going' | 'maybe' | 'invited';
          created_at?: string;
        };
        Relationships: [];
      };
      companion_requests: {
        Row: {
          id: string;
          sender_id: string;
          receiver_id: string;
          event_id: string;
          status: 'pending' | 'accepted' | 'declined';
          created_at: string;
        };
        Insert: {
          id?: string;
          sender_id: string;
          receiver_id: string;
          event_id: string;
          status?: 'pending' | 'accepted' | 'declined';
          created_at?: string;
        };
        Update: {
          id?: string;
          sender_id?: string;
          receiver_id?: string;
          event_id?: string;
          status?: 'pending' | 'accepted' | 'declined';
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Venue = Database['public']['Tables']['venues']['Row'];
export type Event = Database['public']['Tables']['events']['Row'];
export type Swipe = Database['public']['Tables']['swipes']['Row'];
export type Attendance = Database['public']['Tables']['attendances']['Row'];
export type CompanionRequest = Database['public']['Tables']['companion_requests']['Row'];

export type EventWithVenue = Event & { venue: Venue };
