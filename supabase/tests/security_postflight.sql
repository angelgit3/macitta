select jsonb_build_object(
    'public_tables_without_rls', (
        select count(*)
        from pg_class c
        join pg_namespace n on n.oid = c.relnamespace
        where n.nspname = 'public'
          and c.relkind = 'r'
          and not c.relrowsecurity
    ),
    'anon_table_privileges', (
        select count(*)
        from information_schema.role_table_grants
        where table_schema = 'public'
          and grantee = 'anon'
    ),
    'authenticated_dangerous_privileges', (
        select count(*)
        from information_schema.role_table_grants
        where table_schema = 'public'
          and grantee = 'authenticated'
          and privilege_type in ('TRUNCATE', 'TRIGGER', 'REFERENCES')
    ),
    'public_functions_executable_by_anon', (
        select count(*)
        from pg_proc p
        join pg_namespace n on n.oid = p.pronamespace
        where n.nspname = 'public'
          and has_function_privilege('anon', p.oid, 'EXECUTE')
    ),
    'private_schema_visible_to_clients', (
        select count(*)
        from unnest(array['public', 'anon', 'authenticated']) as role_name
        where has_schema_privilege(role_name, 'private', 'USAGE')
    ),
    'handle_new_user_is_private', (
        select count(*) = 1
        from pg_proc p
        join pg_namespace n on n.oid = p.pronamespace
        where n.nspname = 'private'
          and p.proname = 'handle_new_user'
    ),
    'write_limit_triggers', (
        select count(*)
        from pg_trigger
        where not tgisinternal
          and tgname like '%_write_rate_limit'
    ),
    'hardening_constraints', (
        select count(*)
        from pg_constraint
        where connamespace = 'public'::regnamespace
          and conname in (
              'decks_title_size_check',
              'decks_description_size_check',
              'decks_color_size_check',
              'decks_question_labels_size_check',
              'decks_answer_labels_size_check',
              'cards_front_text_size_check',
              'cards_front_media_size_check',
              'card_slots_label_size_check',
              'card_slots_answers_size_check',
              'card_slots_order_index_bounds_check',
              'card_slots_advanced_rules_size_check',
              'card_slots_media_size_check',
              'feedback_message_size_check',
              'profiles_username_format_check',
              'profiles_full_name_size_check',
              'profiles_avatar_url_size_check',
              'profiles_email_size_check',
              'profiles_daily_goal_bounds_check',
              'profiles_streak_bounds_check',
              'srem_inbox_word_size_check',
              'srem_inbox_context_size_check',
              'study_logs_grade_bounds_check',
              'study_logs_time_bounds_check',
              'study_logs_accuracy_bounds_check',
              'study_sessions_counts_bounds_check',
              'study_sessions_time_bounds_check',
              'study_sessions_time_order_check',
              'user_items_stability_bounds_check',
              'user_items_difficulty_bounds_check',
              'user_items_reps_bounds_check',
              'user_items_lapses_bounds_check',
              'user_items_state_check',
              'grammar_attempts_previous_state_size_check',
              'grammar_attempts_next_state_size_check',
              'grammar_attempts_response_upper_bound_check'
          )
    ),
    'load_indexes', (
        select count(*)
        from pg_indexes
        where schemaname = 'public'
          and indexname in (
              'decks_author_id_idx',
              'user_progress_verb_id_idx',
              'user_question_answers_question_id_idx',
              'user_items_user_due_idx',
              'feedback_user_created_idx'
          )
    )
) as security_state;
