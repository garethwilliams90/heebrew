
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  
  "graphql_public": {
          Tables: {
            [_ in never]: never
          }
          Views: {
            [_ in never]: never
          }
          Functions: {
            "graphql":
{ Args: { "extensions"?: Json,"operationName"?: string,"query"?: string,"variables"?: Json }; Returns: Json
                           }
          }
          Enums: {
            [_ in never]: never
          }
          CompositeTypes: {
            [_ in never]: never
          }
        },"public": {
          Tables: {
            "card_progress": {
                  Row: {
                    "card_id": string,"card_state": string,"created_at": string,"deck_id": string,"due_at": string | null,"ease": number,"id": string,"interval_minutes": number,"lapses": number,"last_practiced_at": string | null,"learning_step": number,"mastery": number,"practice_count": number,"reps": number,"updated_at": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "card_id": string,"card_state"?: string,"created_at"?: string,"deck_id": string,"due_at"?: string | null,"ease"?: number,"id"?: string,"interval_minutes"?: number,"lapses"?: number,"last_practiced_at"?: string | null,"learning_step"?: number,"mastery"?: number,"practice_count"?: number,"reps"?: number,"updated_at"?: string,"user_id"?: string
                  }
                  Update: {
                    "card_id"?: string,"card_state"?: string,"created_at"?: string,"deck_id"?: string,"due_at"?: string | null,"ease"?: number,"id"?: string,"interval_minutes"?: number,"lapses"?: number,"last_practiced_at"?: string | null,"learning_step"?: number,"mastery"?: number,"practice_count"?: number,"reps"?: number,"updated_at"?: string,"user_id"?: string
                  }
                  Relationships: [
                    
                  ]
                },"cards": {
                  Row: {
                    "audio_url": string | null,"created_at": string,"deck_id": string,"english": string,"example": string,"example_audio_url": string | null,"gender": string | null,"hebrew": string,"hebrew_example": string,"hidden": boolean,"id": string,"part_of_speech": string,"source_card_id": string | null,"updated_at": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "audio_url"?: string | null,"created_at"?: string,"deck_id": string,"english": string,"example"?: string,"example_audio_url"?: string | null,"gender"?: string | null,"hebrew": string,"hebrew_example"?: string,"hidden"?: boolean,"id"?: string,"part_of_speech": string,"source_card_id"?: string | null,"updated_at"?: string,"user_id"?: string
                  }
                  Update: {
                    "audio_url"?: string | null,"created_at"?: string,"deck_id"?: string,"english"?: string,"example"?: string,"example_audio_url"?: string | null,"gender"?: string | null,"hebrew"?: string,"hebrew_example"?: string,"hidden"?: boolean,"id"?: string,"part_of_speech"?: string,"source_card_id"?: string | null,"updated_at"?: string,"user_id"?: string
                  }
                  Relationships: [
                    
                  ]
                },"daily_card_practice": {
                  Row: {
                    "cards": number,"practiced_on": string,"updated_at": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "cards"?: number,"practiced_on": string,"updated_at"?: string,"user_id"?: string
                  }
                  Update: {
                    "cards"?: number,"practiced_on"?: string,"updated_at"?: string,"user_id"?: string
                  }
                  Relationships: [
                    
                  ]
                },"deck_edits": {
                  Row: {
                    "created_at": string,"deck_id": string,"description": string,"title": string,"updated_at": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"deck_id": string,"description"?: string,"title": string,"updated_at"?: string,"user_id"?: string
                  }
                  Update: {
                    "created_at"?: string,"deck_id"?: string,"description"?: string,"title"?: string,"updated_at"?: string,"user_id"?: string
                  }
                  Relationships: [
                    
                  ]
                },"decks": {
                  Row: {
                    "created_at": string,"description": string,"id": string,"title": string,"updated_at": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"description"?: string,"id"?: string,"title": string,"updated_at"?: string,"user_id"?: string
                  }
                  Update: {
                    "created_at"?: string,"description"?: string,"id"?: string,"title"?: string,"updated_at"?: string,"user_id"?: string
                  }
                  Relationships: [
                    
                  ]
                },"learner_experience": {
                  Row: {
                    "experience": number,"updated_at": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "experience"?: number,"updated_at"?: string,"user_id"?: string
                  }
                  Update: {
                    "experience"?: number,"updated_at"?: string,"user_id"?: string
                  }
                  Relationships: [
                    
                  ]
                },"lesson_sentences": {
                  Row: {
                    "audio_url": string | null,"created_at": string,"difficulty_level": number | null,"en": string,"es": string | null,"exercise_type": string | null,"fr": string | null,"hebrew": string,"id": string,"lesson_id": string,"niqqud": string | null,"sentence_order": number | null,"word_ids": (string)[]
                  }
                  ComputedFields: never
                  Insert: {
                    "audio_url"?: string | null,"created_at"?: string,"difficulty_level"?: number | null,"en": string,"es"?: string | null,"exercise_type"?: string | null,"fr"?: string | null,"hebrew": string,"id"?: string,"lesson_id": string,"niqqud"?: string | null,"sentence_order"?: number | null,"word_ids": (string)[]
                  }
                  Update: {
                    "audio_url"?: string | null,"created_at"?: string,"difficulty_level"?: number | null,"en"?: string,"es"?: string | null,"exercise_type"?: string | null,"fr"?: string | null,"hebrew"?: string,"id"?: string,"lesson_id"?: string,"niqqud"?: string | null,"sentence_order"?: number | null,"word_ids"?: (string)[]
                  }
                  Relationships: [
                    {
      foreignKeyName: "lesson_sentences_lesson_id_fkey"
      columns: ["lesson_id"]
isOneToOne: false
      referencedRelation: "lessons"
      referencedColumns: ["id"]
    }
                  ]
                },"lesson_vocabulary": {
                  Row: {
                    "context_notes": string | null,"created_at": string,"id": string,"introduction_order": number | null,"is_primary": boolean | null,"lesson_id": string,"word_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "context_notes"?: string | null,"created_at"?: string,"id"?: string,"introduction_order"?: number | null,"is_primary"?: boolean | null,"lesson_id": string,"word_id": string
                  }
                  Update: {
                    "context_notes"?: string | null,"created_at"?: string,"id"?: string,"introduction_order"?: number | null,"is_primary"?: boolean | null,"lesson_id"?: string,"word_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "lesson_vocabulary_lesson_id_fkey"
      columns: ["lesson_id"]
isOneToOne: false
      referencedRelation: "lessons"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "lesson_vocabulary_word_id_fkey"
      columns: ["word_id"]
isOneToOne: false
      referencedRelation: "vocabulary_words"
      referencedColumns: ["id"]
    }
                  ]
                },"lessons": {
                  Row: {
                    "created_at": string,"description_en": string | null,"description_es": string | null,"description_fr": string | null,"difficulty_level": number,"id": string,"is_exam": boolean | null,"level_id": number,"level_order": number,"section_id": number,"section_order": number,"title_en": string,"title_es": string | null,"title_fr": string | null,"unlock_requirements": Json | null,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"description_en"?: string | null,"description_es"?: string | null,"description_fr"?: string | null,"difficulty_level"?: number,"id"?: string,"is_exam"?: boolean | null,"level_id": number,"level_order": number,"section_id": number,"section_order": number,"title_en": string,"title_es"?: string | null,"title_fr"?: string | null,"unlock_requirements"?: Json | null,"updated_at"?: string
                  }
                  Update: {
                    "created_at"?: string,"description_en"?: string | null,"description_es"?: string | null,"description_fr"?: string | null,"difficulty_level"?: number,"id"?: string,"is_exam"?: boolean | null,"level_id"?: number,"level_order"?: number,"section_id"?: number,"section_order"?: number,"title_en"?: string,"title_es"?: string | null,"title_fr"?: string | null,"unlock_requirements"?: Json | null,"updated_at"?: string
                  }
                  Relationships: [
                    
                  ]
                },"vocabulary_words": {
                  Row: {
                    "binyan": string | null,"created_at": string,"default_audio_url": string | null,"difficulty_level": number,"en": string,"es": string | null,"etymology": string | null,"fr": string | null,"frequency_rank": number | null,"gender": string | null,"hebrew": string,"hebrew_variations": Json | null,"id": string,"niqqud": string | null,"notes": string | null,"number": string | null,"part_of_speech": string,"pronunciation_notes": string | null,"root": string | null,"tags": (string)[] | null,"transliteration": string | null,"updated_at": string,"usage_context": string | null,"word_key": string
                  }
                  ComputedFields: never
                  Insert: {
                    "binyan"?: string | null,"created_at"?: string,"default_audio_url"?: string | null,"difficulty_level"?: number,"en": string,"es"?: string | null,"etymology"?: string | null,"fr"?: string | null,"frequency_rank"?: number | null,"gender"?: string | null,"hebrew": string,"hebrew_variations"?: Json | null,"id"?: string,"niqqud"?: string | null,"notes"?: string | null,"number"?: string | null,"part_of_speech": string,"pronunciation_notes"?: string | null,"root"?: string | null,"tags"?: (string)[] | null,"transliteration"?: string | null,"updated_at"?: string,"usage_context"?: string | null,"word_key": string
                  }
                  Update: {
                    "binyan"?: string | null,"created_at"?: string,"default_audio_url"?: string | null,"difficulty_level"?: number,"en"?: string,"es"?: string | null,"etymology"?: string | null,"fr"?: string | null,"frequency_rank"?: number | null,"gender"?: string | null,"hebrew"?: string,"hebrew_variations"?: Json | null,"id"?: string,"niqqud"?: string | null,"notes"?: string | null,"number"?: string | null,"part_of_speech"?: string,"pronunciation_notes"?: string | null,"root"?: string | null,"tags"?: (string)[] | null,"transliteration"?: string | null,"updated_at"?: string,"usage_context"?: string | null,"word_key"?: string
                  }
                  Relationships: [
                    
                  ]
                },"word_conjugations": {
                  Row: {
                    "audio_url": string | null,"created_at": string,"gender": string | null,"hebrew": string,"id": string,"niqqud": string | null,"number": string | null,"person": string | null,"tense": string,"transliteration": string | null,"word_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "audio_url"?: string | null,"created_at"?: string,"gender"?: string | null,"hebrew": string,"id"?: string,"niqqud"?: string | null,"number"?: string | null,"person"?: string | null,"tense": string,"transliteration"?: string | null,"word_id": string
                  }
                  Update: {
                    "audio_url"?: string | null,"created_at"?: string,"gender"?: string | null,"hebrew"?: string,"id"?: string,"niqqud"?: string | null,"number"?: string | null,"person"?: string | null,"tense"?: string,"transliteration"?: string | null,"word_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "word_conjugations_word_id_fkey"
      columns: ["word_id"]
isOneToOne: false
      referencedRelation: "vocabulary_words"
      referencedColumns: ["id"]
    }
                  ]
                },"word_examples": {
                  Row: {
                    "audio_url": string | null,"created_at": string,"difficulty_level": number | null,"en": string,"es": string | null,"fr": string | null,"hebrew": string,"id": string,"niqqud": string | null,"word_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "audio_url"?: string | null,"created_at"?: string,"difficulty_level"?: number | null,"en": string,"es"?: string | null,"fr"?: string | null,"hebrew": string,"id"?: string,"niqqud"?: string | null,"word_id": string
                  }
                  Update: {
                    "audio_url"?: string | null,"created_at"?: string,"difficulty_level"?: number | null,"en"?: string,"es"?: string | null,"fr"?: string | null,"hebrew"?: string,"id"?: string,"niqqud"?: string | null,"word_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "word_examples_word_id_fkey"
      columns: ["word_id"]
isOneToOne: false
      referencedRelation: "vocabulary_words"
      referencedColumns: ["id"]
    }
                  ]
                },"word_media": {
                  Row: {
                    "alt_text": string | null,"audio_quality": string | null,"created_at": string,"dialect": string | null,"id": string,"image_type": string | null,"is_default": boolean | null,"media_type": string,"media_url": string,"speaker": string | null,"uploaded_by": string | null,"word_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "alt_text"?: string | null,"audio_quality"?: string | null,"created_at"?: string,"dialect"?: string | null,"id"?: string,"image_type"?: string | null,"is_default"?: boolean | null,"media_type": string,"media_url": string,"speaker"?: string | null,"uploaded_by"?: string | null,"word_id": string
                  }
                  Update: {
                    "alt_text"?: string | null,"audio_quality"?: string | null,"created_at"?: string,"dialect"?: string | null,"id"?: string,"image_type"?: string | null,"is_default"?: boolean | null,"media_type"?: string,"media_url"?: string,"speaker"?: string | null,"uploaded_by"?: string | null,"word_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "word_media_word_id_fkey"
      columns: ["word_id"]
isOneToOne: false
      referencedRelation: "vocabulary_words"
      referencedColumns: ["id"]
    }
                  ]
                },"blog_posts": {
                  Row: {
                    "author_id": string | null,"body": string,"created_at": string,"id": string,"published": boolean,"published_at": string | null,"slug": string,"title": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "author_id"?: string | null,"body": string,"created_at"?: string,"id"?: string,"published"?: boolean,"published_at"?: string | null,"slug": string,"title": string,"updated_at"?: string
                  }
                  Update: {
                    "author_id"?: string | null,"body"?: string,"created_at"?: string,"id"?: string,"published"?: boolean,"published_at"?: string | null,"slug"?: string,"title"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    
                  ]
                },"stories": {
                  Row: {
                    "audio_path": string,"created_at": string,"created_by": string | null,"hebrew_transcript": string,"id": string,"level": string,"published": boolean,"title": string,"transcript_en": string,"transcript_es": string,"transcript_fr": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "audio_path": string,"created_at"?: string,"created_by"?: string | null,"hebrew_transcript": string,"id"?: string,"level": string,"published"?: boolean,"title": string,"transcript_en"?: string,"transcript_es"?: string,"transcript_fr"?: string,"updated_at"?: string
                  }
                  Update: {
                    "audio_path"?: string,"created_at"?: string,"created_by"?: string | null,"hebrew_transcript"?: string,"id"?: string,"level"?: string,"published"?: boolean,"title"?: string,"transcript_en"?: string,"transcript_es"?: string,"transcript_fr"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    
                  ]
                },"content_media": {
                  Row: {
                    "alt_text": string,"created_at": string,"id": string,"kind": string,"post_id": string | null,"sort_order": number,"storage_path": string,"story_id": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "alt_text"?: string,"created_at"?: string,"id"?: string,"kind": string,"post_id"?: string | null,"sort_order"?: number,"storage_path": string,"story_id"?: string | null
                  }
                  Update: {
                    "alt_text"?: string,"created_at"?: string,"id"?: string,"kind"?: string,"post_id"?: string | null,"sort_order"?: number,"storage_path"?: string,"story_id"?: string | null
                  }
                  Relationships: []
                },"story_hearts": {
                  Row: { "created_at": string,"story_id": string,"user_id": string }
                  ComputedFields: never
                  Insert: { "created_at"?: string,"story_id": string,"user_id": string }
                  Update: { "created_at"?: string,"story_id"?: string,"user_id"?: string }
                  Relationships: []
                },"story_completions": {
                  Row: { "completed_at": string,"story_id": string,"user_id": string }
                  ComputedFields: never
                  Insert: { "completed_at"?: string,"story_id": string,"user_id": string }
                  Update: { "completed_at"?: string,"story_id"?: string,"user_id"?: string }
                  Relationships: []
                },"story_words": {
                  Row: {
                    "created_at": string,"end_ms": number,"id": string,"label": string,"phrase": string,"sort_order": number,"start_ms": number,"story_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"end_ms": number,"id"?: string,"label": string,"phrase": string,"sort_order"?: number,"start_ms": number,"story_id": string
                  }
                  Update: {
                    "created_at"?: string,"end_ms"?: number,"id"?: string,"label"?: string,"phrase"?: string,"sort_order"?: number,"start_ms"?: number,"story_id"?: string
                  }
                  Relationships: []
                },"story_questions": {
                  Row: { "id": string,"prompt": string,"sort_order": number,"story_id": string }
                  ComputedFields: never
                  Insert: { "id"?: string,"prompt": string,"sort_order"?: number,"story_id": string }
                  Update: { "id"?: string,"prompt"?: string,"sort_order"?: number,"story_id"?: string }
                  Relationships: []
                },"story_choices": {
                  Row: { "correct": boolean,"id": string,"label": string,"question_id": string,"sort_order": number }
                  ComputedFields: never
                  Insert: { "correct"?: boolean,"id"?: string,"label": string,"question_id": string,"sort_order"?: number }
                  Update: { "correct"?: boolean,"id"?: string,"label"?: string,"question_id"?: string,"sort_order"?: number }
                  Relationships: []
                }
          }
          Views: {
            [_ in never]: never
          }
          Functions: {
            "get_lesson_sentences_by_type":
{ Args: { "p_exercise_type"?: string,"p_lesson_id": string }; Returns: {
              "audio_url": string,"en": string,"hebrew": string,"id": string,"word_count": number
            }[]
                           },
"get_lesson_words":
{ Args: { "p_lesson_id": string }; Returns: {
              "en": string,"hebrew": string,"is_primary": boolean,"word_id": string,"word_key": string
            }[]
                           },
"record_daily_cards":
{ Args: { "amount": number,"practice_date": string }; Returns: undefined
                           }
          }
          Enums: {
            [_ in never]: never
          }
          CompositeTypes: {
            [_ in never]: never
          }
        }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
  : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
  : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  "graphql_public": {
          Enums: {
            
          }
        },"public": {
          Enums: {
            
          }
        }
} as const
