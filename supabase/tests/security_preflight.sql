select jsonb_build_object(
    'bad_decks', (
        select count(*) from public.decks
        where length(btrim(title)) not between 1 and 120
           or length(description) > 2000
           or length(color) > 32
           or (
                question_labels is not null
                and (
                    cardinality(question_labels) not between 0 and 8
                    or pg_column_size(question_labels) > 4096
                )
            )
           or (
                answer_labels is not null
                and (
                    cardinality(answer_labels) not between 0 and 8
                    or pg_column_size(answer_labels) > 4096
                )
            )
    ),
    'bad_cards', (
        select count(*) from public.cards
        where length(btrim(front_text)) not between 1 and 4000
           or pg_column_size(front_media) > 16384
    ),
    'bad_slots', (
        select count(*) from public.card_slots
        where length(btrim(label)) not between 1 and 80
           or cardinality(accepted_answers) > 20
           or order_index not between 0 and 31
           or pg_column_size(advanced_rules) > 32768
           or pg_column_size(media) > 16384
    ),
    'bad_profiles', (
        select count(*) from public.profiles
        where (
                username is not null
                and (
                    length(btrim(username)) not between 3 and 32
                    or username ~ '[[:cntrl:]]'
                )
            )
           or length(full_name) > 120
           or (
                avatar_url is not null
                and (
                    length(avatar_url) > 2048
                    or avatar_url !~ '^https://'
                )
            )
           or length(email) > 320
           or daily_goal not between 1 and 500
           or streak_current not between 0 and 100000
    ),
    'bad_profile_usernames', (
        select count(*) from public.profiles
        where username is not null
          and (
              length(btrim(username)) not between 3 and 32
              or username ~ '[[:cntrl:]]'
          )
    ),
    'profile_username_length_range', (
        select jsonb_build_object(
            'minimum', min(length(username)),
            'maximum', max(length(username)),
            'invalid_pattern', count(*) filter (
                where username ~ '[[:cntrl:]]'
            )
        )
        from public.profiles
        where username is not null
    ),
    'bad_profile_names', (
        select count(*) from public.profiles where length(full_name) > 120
    ),
    'bad_profile_avatars', (
        select count(*) from public.profiles
        where avatar_url is not null
          and (
              length(avatar_url) > 2048
              or avatar_url !~ '^https://'
          )
    ),
    'bad_profile_emails', (
        select count(*) from public.profiles where length(email) > 320
    ),
    'bad_profile_goals', (
        select count(*) from public.profiles
        where daily_goal not between 1 and 500
    ),
    'bad_profile_streaks', (
        select count(*) from public.profiles
        where streak_current not between 0 and 100000
    ),
    'bad_srem', (
        select count(*) from public.srem_inbox
        where length(btrim(word)) not between 1 and 200
           or length(context) > 4000
    ),
    'bad_logs', (
        select count(*) from public.study_logs
        where grade not between 0 and 3
           or time_taken_ms not between 0 and 86400000
           or accuracy not between 0 and 1
    ),
    'bad_sessions', (
        select count(*) from public.study_sessions
        where coalesce(total_cards, 0) < 0
           or coalesce(correct_cards, 0) < 0
           or coalesce(correct_cards, 0) > coalesce(total_cards, 0)
           or coalesce(total_time_ms, 0) not between 0 and 604800000
           or ended_at < started_at
    ),
    'bad_items', (
        select count(*) from public.user_items
        where stability not between 0 and 3650
           or difficulty not between 1 and 10
           or reps not between 0 and 100000
           or lapses not between 0 and 100000
           or state not in ('new', 'learning', 'review', 'mastered')
    ),
    'bad_grammar_attempts', (
        select count(*) from public.grammar_attempts
        where pg_column_size(previous_state) > 8192
           or pg_column_size(next_state) > 8192
           or response_ms > 86400000
    )
) as validation;
