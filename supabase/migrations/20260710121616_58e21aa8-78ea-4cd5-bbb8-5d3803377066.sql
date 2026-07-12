
-- Allow anonymous visitors to read public content
GRANT SELECT ON public.scripts TO anon;
GRANT SELECT ON public.resources TO anon;
GRANT SELECT ON public.categories TO anon;

CREATE POLICY "Scripts: anon read public"
ON public.scripts FOR SELECT TO anon
USING (visibility = 'public'::script_visibility);

CREATE POLICY "Resources: anon read public"
ON public.resources FOR SELECT TO anon
USING (visibility = 'public'::resource_visibility);

CREATE POLICY "Categories: anon read visible"
ON public.categories FOR SELECT TO anon
USING (is_visible = true);
