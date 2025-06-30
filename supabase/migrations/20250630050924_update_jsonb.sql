create or replace function increment_reaction(confession_id_in uuid, reaction_in text)
returns void as $$
begin
  update confessions
  set reactions = jsonb_set(
    reactions,
    array[reaction_in],
    (coalesce(reactions->>reaction_in, '0')::int + 1)::text::jsonb
  )
  where id = confession_id_in;
end;
$$ language plpgsql;

create or replace function increment_poll(confession_id_in uuid, vote_in text)
returns void as $$
begin
  update confessions
  set poll = jsonb_set(
    poll,
    array[vote_in],
    (coalesce(poll->>vote_in, '0')::int + 1)::text::jsonb
  )
  where id = confession_id_in;
end;
$$ language plpgsql; 