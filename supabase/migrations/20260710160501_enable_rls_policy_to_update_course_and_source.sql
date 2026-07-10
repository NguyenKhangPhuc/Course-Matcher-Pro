drop policy "Users delete own courses" on "public"."courses";

drop policy "Users insert courses to own sources" on "public"."courses";

drop policy "Users delete own sources" on "public"."sources";

drop policy "Users insert own sources" on "public"."sources";


  create policy "Policy with table joins"
  on "public"."courses"
  as permissive
  for update
  to authenticated
using ((source_id IN ( SELECT sources.id
   FROM public.sources
  WHERE (sources.user_id = ( SELECT auth.uid() AS uid)))));



  create policy "Policy with table joins"
  on "public"."sources"
  as permissive
  for update
  to authenticated
using ((( SELECT auth.uid() AS uid) = user_id));



  create policy "Users delete own courses"
  on "public"."courses"
  as permissive
  for delete
  to public
using ((source_id IN ( SELECT sources.id
   FROM public.sources
  WHERE (sources.user_id = ( SELECT auth.uid() AS uid)))));



  create policy "Users insert courses to own sources"
  on "public"."courses"
  as permissive
  for insert
  to public
with check ((source_id IN ( SELECT sources.id
   FROM public.sources
  WHERE (sources.user_id = ( SELECT auth.uid() AS uid)))));



  create policy "Users delete own sources"
  on "public"."sources"
  as permissive
  for delete
  to public
using (((( SELECT auth.uid() AS uid) = user_id) AND (is_default = false)));



  create policy "Users insert own sources"
  on "public"."sources"
  as permissive
  for insert
  to public
with check ((( SELECT auth.uid() AS uid) = user_id));



