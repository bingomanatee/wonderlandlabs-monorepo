export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      bydate: {
        Row: {
          administrative_area_level: number;
          confirmed: number;
          created_at: string;
          date: string;
          deaths: number;
          id: string;
          place: string | null;
        };
        Insert: {
          administrative_area_level?: number;
          confirmed?: number;
          created_at?: string;
          date?: string;
          deaths?: number;
          id: string;
          place?: string | null;
        };
        Update: {
          administrative_area_level?: number;
          confirmed?: number;
          created_at?: string;
          date?: string;
          deaths?: number;
          id?: string;
          place?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'bydate_place_fkey';
            columns: ['place'];
            isOneToOne: false;
            referencedRelation: 'bydate_places';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'bydate_place_fkey';
            columns: ['place'];
            isOneToOne: false;
            referencedRelation: 'places_with_data';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'bydate_place_fkey';
            columns: ['place'];
            isOneToOne: false;
            referencedRelation: 'places_with_data_l1';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'bydate_place_fkey';
            columns: ['place'];
            isOneToOne: false;
            referencedRelation: 'places_with_data_l2';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'bydate_place_fkey';
            columns: ['place'];
            isOneToOne: false;
            referencedRelation: 'places_with_data_l3';
            referencedColumns: ['id'];
          },
        ];
      };
      bydate_places: {
        Row: {
          administrative_area_level: number;
          administrative_area_level_1: string;
          administrative_area_level_2: string;
          administrative_area_level_3: string;
          id: string;
          iso_alpha_2: string;
          iso_alpha_3: string;
          latitude: number;
          longitude: number;
          population: number;
        };
        Insert: {
          administrative_area_level?: number;
          administrative_area_level_1?: string;
          administrative_area_level_2?: string;
          administrative_area_level_3?: string;
          id: string;
          iso_alpha_2?: string;
          iso_alpha_3?: string;
          latitude?: number;
          longitude?: number;
          population?: number;
        };
        Update: {
          administrative_area_level?: number;
          administrative_area_level_1?: string;
          administrative_area_level_2?: string;
          administrative_area_level_3?: string;
          id?: string;
          iso_alpha_2?: string;
          iso_alpha_3?: string;
          latitude?: number;
          longitude?: number;
          population?: number;
        };
        Relationships: [];
      };
    };
    Views: {
      places_with_data: {
        Row: {
          administrative_area_level: number | null;
          administrative_area_level_1: string | null;
          administrative_area_level_2: string | null;
          administrative_area_level_3: string | null;
          dates: string[] | null;
          deaths: number[] | null;
          id: string | null;
        };
        Relationships: [];
      };
      places_with_data_l1: {
        Row: {
          administrative_area_level: number | null;
          administrative_area_level_1: string | null;
          administrative_area_level_2: string | null;
          administrative_area_level_3: string | null;
          confirmed: number[] | null;
          dates: string[] | null;
          deaths: number[] | null;
          id: string | null;
        };
        Relationships: [];
      };
      places_with_data_l2: {
        Row: {
          administrative_area_level: number | null;
          administrative_area_level_1: string | null;
          administrative_area_level_2: string | null;
          administrative_area_level_3: string | null;
          confirmed: number[] | null;
          dates: string[] | null;
          deaths: number[] | null;
          id: string | null;
        };
        Relationships: [];
      };
      places_with_data_l3: {
        Row: {
          administrative_area_level: number | null;
          administrative_area_level_1: string | null;
          administrative_area_level_2: string | null;
          administrative_area_level_3: string | null;
          dates: string[] | null;
          deaths: number[] | null;
          id: string | null;
        };
        Relationships: [];
      };
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

type PublicSchema = Database[Extract<keyof Database, 'public'>];

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema['Tables'] & PublicSchema['Views'])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions['$schema']]['Tables'] &
        Database[PublicTableNameOrOptions['$schema']]['Views'])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions['$schema']]['Tables'] &
      Database[PublicTableNameOrOptions['$schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema['Tables'] &
        PublicSchema['Views'])
    ? (PublicSchema['Tables'] &
        PublicSchema['Views'])[PublicTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema['Tables']
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['$schema']]['Tables']
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['$schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema['Tables']
    ? PublicSchema['Tables'][PublicTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema['Tables']
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['$schema']]['Tables']
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['$schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema['Tables']
    ? PublicSchema['Tables'][PublicTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema['Enums']
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions['schema']]['Enums'][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema['Enums']
    ? PublicSchema['Enums'][PublicEnumNameOrOptions]
    : never;
