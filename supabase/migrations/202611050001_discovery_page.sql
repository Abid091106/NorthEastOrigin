begin;
-- Returns one page plus the true total as a single JSON value, so the API's row cap
-- cannot hide projects from filtering. Invoker rights keep RLS active. Rows match the
-- shape the discovery service summarises, so skill names stay canonical in one place.
create function public.discover_projects_page(
  filter_q text default null, filter_location text default null, filter_sector text default null,
  filter_stage text default null, filter_skills text[] default null,
  page_limit integer default 20, page_offset integer default 0
) returns jsonb language sql stable security invoker set search_path = '' as $$
  with matching as (
    select p.id, p.title, p.pitch, p.sector, p.location, p.stage, p.status, p.visibility,
      p.owner_display_name, p.created_at
    from public.projects p
    where p.visibility = 'public'
      and (nullif(btrim(filter_q), '') is null
        or position(lower(btrim(filter_q)) in lower(p.title)) > 0
        or position(lower(btrim(filter_q)) in lower(p.pitch)) > 0)
      and (filter_location is null or lower(btrim(p.location)) = lower(btrim(filter_location)))
      and (filter_sector is null or lower(btrim(p.sector)) = lower(btrim(filter_sector)))
      and (filter_stage is null or p.stage = filter_stage)
      and (filter_skills is null or exists (
        select 1 from public.project_needs n cross join unnest(n.required_skills) s
        where n.project_id = p.id and n.status = 'open' and lower(btrim(s)) = any(filter_skills)
      ))
  ), page as (
    select * from matching order by created_at desc, id
    limit least(greatest(page_limit, 0), 50) offset greatest(page_offset, 0)
  )
  select jsonb_build_object(
    'total', (select count(*) from matching),
    'rows', coalesce((select jsonb_agg(to_jsonb(page) || jsonb_build_object(
      'project_needs', coalesce((select jsonb_agg(jsonb_build_object('status', n.status, 'required_skills', n.required_skills) order by n.created_at, n.id)
        from public.project_needs n where n.project_id = page.id), '[]'::jsonb),
      'project_posts', coalesce((select jsonb_agg(jsonb_build_object('type', post.type, 'created_at', post.created_at))
        from public.project_posts post where post.project_id = page.id), '[]'::jsonb),
      'milestones', coalesce((select jsonb_agg(jsonb_build_object('achieved_at', m.achieved_at))
        from public.milestones m where m.project_id = page.id), '[]'::jsonb)
    ) order by page.created_at desc, page.id) from page), '[]'::jsonb)
  )
$$;
revoke all on function public.discover_projects_page(text,text,text,text,text[],integer,integer) from public, anon, authenticated;
grant execute on function public.discover_projects_page(text,text,text,text,text[],integer,integer) to anon, authenticated;
commit;
