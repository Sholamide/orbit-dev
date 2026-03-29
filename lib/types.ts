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
          push_token: string | null;
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
          push_token?: string | null;
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
          push_token?: string | null;
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
      conversations: {
        Row: {
          id: string;
          participant_ids: string[];
          event_id: string | null;
          last_message: string | null;
          last_message_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          participant_ids: string[];
          event_id?: string | null;
          last_message?: string | null;
          last_message_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          participant_ids?: string[];
          event_id?: string | null;
          last_message?: string | null;
          last_message_at?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      messages: {
        Row: {
          id: string;
          conversation_id: string;
          sender_id: string;
          body: string;
          is_anonymous: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          sender_id: string;
          body: string;
          is_anonymous?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          conversation_id?: string;
          sender_id?: string;
          body?: string;
          is_anonymous?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      reports: {
        Row: {
          id: string;
          reporter_id: string;
          reported_user_id: string;
          reason: string;
          details: string | null;
          status: 'pending' | 'reviewed' | 'resolved';
          created_at: string;
        };
        Insert: {
          id?: string;
          reporter_id: string;
          reported_user_id: string;
          reason: string;
          details?: string | null;
          status?: 'pending' | 'reviewed' | 'resolved';
          created_at?: string;
        };
        Update: {
          id?: string;
          reporter_id?: string;
          reported_user_id?: string;
          reason?: string;
          details?: string | null;
          status?: 'pending' | 'reviewed' | 'resolved';
          created_at?: string;
        };
        Relationships: [];
      };
      blocks: {
        Row: {
          id: string;
          blocker_id: string;
          blocked_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          blocker_id: string;
          blocked_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          blocker_id?: string;
          blocked_id?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      trusted_contacts: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          phone: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          phone: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          phone?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      safety_checkins: {
        Row: {
          id: string;
          user_id: string;
          event_id: string | null;
          venue_id: string | null;
          status: 'pending' | 'safe' | 'alert';
          check_in_at: string;
          resolved_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          event_id?: string | null;
          venue_id?: string | null;
          status?: 'pending' | 'safe' | 'alert';
          check_in_at?: string;
          resolved_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          event_id?: string | null;
          venue_id?: string | null;
          status?: 'pending' | 'safe' | 'alert';
          check_in_at?: string;
          resolved_at?: string | null;
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
export type Conversation = Database['public']['Tables']['conversations']['Row'];
export type Message = Database['public']['Tables']['messages']['Row'];

export type Report = Database['public']['Tables']['reports']['Row'];
export type Block = Database['public']['Tables']['blocks']['Row'];
export type TrustedContact = Database['public']['Tables']['trusted_contacts']['Row'];
export type SafetyCheckin = Database['public']['Tables']['safety_checkins']['Row'];

export type EventWithVenue = Event & { venue: Venue };
