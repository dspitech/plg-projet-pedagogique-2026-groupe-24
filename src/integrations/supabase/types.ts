export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      archived_logs: {
        Row: {
          action: string
          archived_at: string
          category: string
          details: Json | null
          id: string
          ip_address: string | null
          original_created_at: string
          resource: string
          resource_id: string | null
          user_agent: string | null
          user_email: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          archived_at?: string
          category?: string
          details?: Json | null
          id: string
          ip_address?: string | null
          original_created_at: string
          resource: string
          resource_id?: string | null
          user_agent?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          archived_at?: string
          category?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          original_created_at?: string
          resource?: string
          resource_id?: string | null
          user_agent?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          category: string
          created_at: string
          details: Json | null
          id: string
          ip_address: string | null
          resource: string
          resource_id: string | null
          user_agent: string | null
          user_email: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          category?: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          resource: string
          resource_id?: string | null
          user_agent?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          category?: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          resource?: string
          resource_id?: string | null
          user_agent?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      categories: {
        Row: {
          color: string
          created_at: string
          created_by: string | null
          description: string | null
          icon: string
          id: string
          is_visible: boolean
          name: string
          position: number
          status: Database["public"]["Enums"]["category_status"]
          type: string | null
          updated_at: string
        }
        Insert: {
          color?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          icon?: string
          id?: string
          is_visible?: boolean
          name: string
          position?: number
          status?: Database["public"]["Enums"]["category_status"]
          type?: string | null
          updated_at?: string
        }
        Update: {
          color?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          icon?: string
          id?: string
          is_visible?: boolean
          name?: string
          position?: number
          status?: Database["public"]["Enums"]["category_status"]
          type?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          category: string
          company: string | null
          created_at: string
          email: string
          id: string
          ip_address: string | null
          message: string
          name: string
          phone: string | null
          status: string
          subject: string
          updated_at: string
          user_agent: string | null
        }
        Insert: {
          category?: string
          company?: string | null
          created_at?: string
          email: string
          id?: string
          ip_address?: string | null
          message: string
          name: string
          phone?: string | null
          status?: string
          subject: string
          updated_at?: string
          user_agent?: string | null
        }
        Update: {
          category?: string
          company?: string | null
          created_at?: string
          email?: string
          id?: string
          ip_address?: string | null
          message?: string
          name?: string
          phone?: string | null
          status?: string
          subject?: string
          updated_at?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      guest_users: {
        Row: {
          created_at: string
          id: string
          ip_address: string | null
          last_seen_at: string
          pseudo: string
          pseudo_lower: string | null
          user_agent: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          ip_address?: string | null
          last_seen_at?: string
          pseudo: string
          pseudo_lower?: string | null
          user_agent?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          ip_address?: string | null
          last_seen_at?: string
          pseudo?: string
          pseudo_lower?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      permissions: {
        Row: {
          action: string
          created_at: string
          description: string | null
          id: string
          resource: string
        }
        Insert: {
          action: string
          created_at?: string
          description?: string | null
          id?: string
          resource: string
        }
        Update: {
          action?: string
          created_at?: string
          description?: string | null
          id?: string
          resource?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string | null
          avatar_url: string | null
          bio: string | null
          city: string | null
          country: string | null
          created_at: string
          email: string
          first_name: string | null
          id: string
          is_active: boolean
          is_suspended: boolean
          last_login: string | null
          must_change_password: boolean
          name: string
          phone: string | null
          profession: string | null
          status: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          email: string
          first_name?: string | null
          id: string
          is_active?: boolean
          is_suspended?: boolean
          last_login?: string | null
          must_change_password?: boolean
          name?: string
          phone?: string | null
          profession?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          email?: string
          first_name?: string | null
          id?: string
          is_active?: boolean
          is_suspended?: boolean
          last_login?: string | null
          must_change_password?: boolean
          name?: string
          phone?: string | null
          profession?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      resources: {
        Row: {
          author_id: string | null
          category_id: string | null
          created_at: string
          criticality: Database["public"]["Enums"]["resource_criticality"]
          description: string | null
          downloads_count: number
          favorites_count: number
          file_path: string | null
          file_size: number | null
          id: string
          is_featured: boolean
          language: string | null
          mime_type: string | null
          name: string
          resource_type: Database["public"]["Enums"]["resource_type"]
          status: Database["public"]["Enums"]["resource_status"]
          tags: string[]
          thumbnail_url: string | null
          updated_at: string
          url: string | null
          version: string
          views_count: number
          visibility: Database["public"]["Enums"]["resource_visibility"]
        }
        Insert: {
          author_id?: string | null
          category_id?: string | null
          created_at?: string
          criticality?: Database["public"]["Enums"]["resource_criticality"]
          description?: string | null
          downloads_count?: number
          favorites_count?: number
          file_path?: string | null
          file_size?: number | null
          id?: string
          is_featured?: boolean
          language?: string | null
          mime_type?: string | null
          name: string
          resource_type?: Database["public"]["Enums"]["resource_type"]
          status?: Database["public"]["Enums"]["resource_status"]
          tags?: string[]
          thumbnail_url?: string | null
          updated_at?: string
          url?: string | null
          version?: string
          views_count?: number
          visibility?: Database["public"]["Enums"]["resource_visibility"]
        }
        Update: {
          author_id?: string | null
          category_id?: string | null
          created_at?: string
          criticality?: Database["public"]["Enums"]["resource_criticality"]
          description?: string | null
          downloads_count?: number
          favorites_count?: number
          file_path?: string | null
          file_size?: number | null
          id?: string
          is_featured?: boolean
          language?: string | null
          mime_type?: string | null
          name?: string
          resource_type?: Database["public"]["Enums"]["resource_type"]
          status?: Database["public"]["Enums"]["resource_status"]
          tags?: string[]
          thumbnail_url?: string | null
          updated_at?: string
          url?: string | null
          version?: string
          views_count?: number
          visibility?: Database["public"]["Enums"]["resource_visibility"]
        }
        Relationships: [
          {
            foreignKeyName: "resources_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      role_permissions: {
        Row: {
          permission_id: string
          role: Database["public"]["Enums"]["app_role"]
        }
        Insert: {
          permission_id: string
          role: Database["public"]["Enums"]["app_role"]
        }
        Update: {
          permission_id?: string
          role?: Database["public"]["Enums"]["app_role"]
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["id"]
          },
        ]
      }
      script_likes: {
        Row: {
          created_at: string
          guest_id: string | null
          id: string
          script_id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          guest_id?: string | null
          id?: string
          script_id: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          guest_id?: string | null
          id?: string
          script_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "script_likes_guest_id_fkey"
            columns: ["guest_id"]
            isOneToOne: false
            referencedRelation: "guest_users"
            referencedColumns: ["id"]
          },
        ]
      }
      script_shares: {
        Row: {
          channel: string
          created_at: string
          guest_id: string | null
          id: string
          ip_address: string | null
          script_id: string
          user_id: string | null
        }
        Insert: {
          channel?: string
          created_at?: string
          guest_id?: string | null
          id?: string
          ip_address?: string | null
          script_id: string
          user_id?: string | null
        }
        Update: {
          channel?: string
          created_at?: string
          guest_id?: string | null
          id?: string
          ip_address?: string | null
          script_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "script_shares_guest_id_fkey"
            columns: ["guest_id"]
            isOneToOne: false
            referencedRelation: "guest_users"
            referencedColumns: ["id"]
          },
        ]
      }
      scripts: {
        Row: {
          author_id: string | null
          average_rating: number
          category_id: string | null
          compatibility: string | null
          content: string
          created_at: string
          criticality: Database["public"]["Enums"]["script_criticality"]
          dependencies: string | null
          description: string | null
          documentation: string | null
          downloads_count: number
          favorites_count: number
          features: string | null
          id: string
          is_validated: boolean
          language: string | null
          license: string | null
          likes_count: number
          name: string
          prerequisites: string | null
          screenshots: string[]
          script_type: Database["public"]["Enums"]["script_type"]
          shares_count: number
          status: Database["public"]["Enums"]["script_status"]
          tags: string[]
          updated_at: string
          usage_example: string | null
          version: string
          version_history: Json
          views_count: number
          visibility: Database["public"]["Enums"]["script_visibility"]
        }
        Insert: {
          author_id?: string | null
          average_rating?: number
          category_id?: string | null
          compatibility?: string | null
          content?: string
          created_at?: string
          criticality?: Database["public"]["Enums"]["script_criticality"]
          dependencies?: string | null
          description?: string | null
          documentation?: string | null
          downloads_count?: number
          favorites_count?: number
          features?: string | null
          id?: string
          is_validated?: boolean
          language?: string | null
          license?: string | null
          likes_count?: number
          name: string
          prerequisites?: string | null
          screenshots?: string[]
          script_type?: Database["public"]["Enums"]["script_type"]
          shares_count?: number
          status?: Database["public"]["Enums"]["script_status"]
          tags?: string[]
          updated_at?: string
          usage_example?: string | null
          version?: string
          version_history?: Json
          views_count?: number
          visibility?: Database["public"]["Enums"]["script_visibility"]
        }
        Update: {
          author_id?: string | null
          average_rating?: number
          category_id?: string | null
          compatibility?: string | null
          content?: string
          created_at?: string
          criticality?: Database["public"]["Enums"]["script_criticality"]
          dependencies?: string | null
          description?: string | null
          documentation?: string | null
          downloads_count?: number
          favorites_count?: number
          features?: string | null
          id?: string
          is_validated?: boolean
          language?: string | null
          license?: string | null
          likes_count?: number
          name?: string
          prerequisites?: string | null
          screenshots?: string[]
          script_type?: Database["public"]["Enums"]["script_type"]
          shares_count?: number
          status?: Database["public"]["Enums"]["script_status"]
          tags?: string[]
          updated_at?: string
          usage_example?: string | null
          version?: string
          version_history?: Json
          views_count?: number
          visibility?: Database["public"]["Enums"]["script_visibility"]
        }
        Relationships: [
          {
            foreignKeyName: "scripts_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      trash_items: {
        Row: {
          created_at: string
          deleted_by: string | null
          deleted_by_email: string | null
          id: string
          payload: Json
          reason: string | null
          resource_id: string
          resource_type: string
        }
        Insert: {
          created_at?: string
          deleted_by?: string | null
          deleted_by_email?: string | null
          id?: string
          payload: Json
          reason?: string | null
          resource_id: string
          resource_type: string
        }
        Update: {
          created_at?: string
          deleted_by?: string | null
          deleted_by_email?: string | null
          id?: string
          payload?: Json
          reason?: string | null
          resource_id?: string
          resource_type?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      archive_old_audit_logs: { Args: never; Returns: number }
      global_admin_exists: { Args: never; Returns: boolean }
      has_permission: {
        Args: { _action: string; _resource: string; _user_id: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_script_views: {
        Args: { _script_id: string }
        Returns: undefined
      }
      is_active_user: { Args: { _user_id: string }; Returns: boolean }
      is_pseudo_available: { Args: { _pseudo: string }; Returns: boolean }
      log_audit_event:
        | {
            Args: {
              _action: string
              _details?: Json
              _ip_address?: string
              _resource: string
              _resource_id?: string
              _user_agent?: string
            }
            Returns: string
          }
        | {
            Args: {
              _action: string
              _category?: string
              _details?: Json
              _ip_address?: string
              _resource: string
              _resource_id?: string
              _user_agent?: string
            }
            Returns: string
          }
      register_guest: {
        Args: { _pseudo: string }
        Returns: {
          id: string
          pseudo: string
        }[]
      }
    }
    Enums: {
      app_role: "global_admin" | "admin" | "editor" | "viewer"
      category_status: "active" | "inactive" | "archived"
      resource_criticality: "low" | "medium" | "high" | "critical"
      resource_status: "draft" | "active" | "archived"
      resource_type:
        | "link"
        | "document"
        | "file"
        | "video"
        | "image"
        | "repository"
        | "other"
      resource_visibility: "public" | "private"
      script_criticality: "low" | "medium" | "high" | "critical"
      script_status: "draft" | "active" | "inactive" | "archived" | "deprecated"
      script_type:
        | "powershell"
        | "bash"
        | "python"
        | "azure_cli"
        | "aws_cli"
        | "terraform"
        | "bicep"
        | "arm"
        | "cloudformation"
        | "ansible"
        | "kubernetes"
        | "docker"
        | "sql"
        | "javascript"
        | "typescript"
        | "go"
        | "ruby"
        | "perl"
        | "yaml"
        | "json"
        | "other"
        | "rust"
        | "java"
        | "kotlin"
        | "scala"
        | "csharp"
        | "fsharp"
        | "vbnet"
        | "php"
        | "r"
        | "julia"
        | "lua"
        | "dart"
        | "swift"
        | "objective_c"
        | "c"
        | "cpp"
        | "graphql"
        | "xml"
        | "hcl"
        | "gcloud"
        | "helm"
        | "makefile"
        | "cmake"
        | "gradle"
        | "jenkinsfile"
        | "github_actions"
        | "gitlab_ci"
        | "azure_devops"
        | "matlab"
        | "fortran"
        | "cobol"
        | "pascal"
        | "ada"
        | "plsql"
        | "tsql"
        | "toml"
        | "ini"
        | "nix"
        | "chef"
        | "puppet"
        | "zig"
        | "nim"
        | "haskell"
        | "elixir"
        | "erlang"
        | "clojure"
        | "groovy"
        | "assembly"
        | "objectivec"
        | "solidity"
        | "move"
        | "vyper"
        | "prolog"
        | "scheme"
        | "lisp"
        | "abap"
        | "sas"
        | "stata"
        | "ocaml"
      script_visibility: "public" | "private"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

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
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
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
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
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
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
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
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
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
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["global_admin", "admin", "editor", "viewer"],
      category_status: ["active", "inactive", "archived"],
      resource_criticality: ["low", "medium", "high", "critical"],
      resource_status: ["draft", "active", "archived"],
      resource_type: [
        "link",
        "document",
        "file",
        "video",
        "image",
        "repository",
        "other",
      ],
      resource_visibility: ["public", "private"],
      script_criticality: ["low", "medium", "high", "critical"],
      script_status: ["draft", "active", "inactive", "archived", "deprecated"],
      script_type: [
        "powershell",
        "bash",
        "python",
        "azure_cli",
        "aws_cli",
        "terraform",
        "bicep",
        "arm",
        "cloudformation",
        "ansible",
        "kubernetes",
        "docker",
        "sql",
        "javascript",
        "typescript",
        "go",
        "ruby",
        "perl",
        "yaml",
        "json",
        "other",
        "rust",
        "java",
        "kotlin",
        "scala",
        "csharp",
        "fsharp",
        "vbnet",
        "php",
        "r",
        "julia",
        "lua",
        "dart",
        "swift",
        "objective_c",
        "c",
        "cpp",
        "graphql",
        "xml",
        "hcl",
        "gcloud",
        "helm",
        "makefile",
        "cmake",
        "gradle",
        "jenkinsfile",
        "github_actions",
        "gitlab_ci",
        "azure_devops",
        "matlab",
        "fortran",
        "cobol",
        "pascal",
        "ada",
        "plsql",
        "tsql",
        "toml",
        "ini",
        "nix",
        "chef",
        "puppet",
        "zig",
        "nim",
        "haskell",
        "elixir",
        "erlang",
        "clojure",
        "groovy",
        "assembly",
        "objectivec",
        "solidity",
        "move",
        "vyper",
        "prolog",
        "scheme",
        "lisp",
        "abap",
        "sas",
        "stata",
        "ocaml",
      ],
      script_visibility: ["public", "private"],
    },
  },
} as const
