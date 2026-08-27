-- Shipping plan CMS content.

insert into public.site_content (key, content)
values
  (
    'shipping',
    jsonb_build_object(
      'rows', jsonb_build_array(
        jsonb_build_object('country', 'USA', 'province', '', 'region', '', 'twoKg', '59', 'additionalOneKg', '5.25', 'timeline', '4-6 days'),
        jsonb_build_object('country', 'Canada', 'province', 'Alberta', 'region', '', 'twoKg', '35', 'additionalOneKg', '2.61', 'timeline', 'up to 7 days'),
        jsonb_build_object('country', 'Canada', 'province', 'British Columbia', 'region', '', 'twoKg', '31', 'additionalOneKg', '1.93', 'timeline', 'up to 7 days'),
        jsonb_build_object('country', 'Canada', 'province', 'Manitoba', 'region', '', 'twoKg', '30', 'additionalOneKg', '1.43', 'timeline', 'up to 5 days'),
        jsonb_build_object('country', 'Canada', 'province', 'New Brunswick', 'region', '', 'twoKg', '33', 'additionalOneKg', '1.71', 'timeline', 'up to 5 days'),
        jsonb_build_object('country', 'Canada', 'province', 'Newfoundland and Labrador', 'region', '', 'twoKg', '34', 'additionalOneKg', '3.25', 'timeline', 'up to 7 days'),
        jsonb_build_object('country', 'Canada', 'province', 'Nova Scotia', 'region', '', 'twoKg', '30', 'additionalOneKg', '1.79', 'timeline', 'up to 5 days'),
        jsonb_build_object('country', 'Canada', 'province', 'Prince Edward Island', 'region', '', 'twoKg', '34', 'additionalOneKg', '2.11', 'timeline', 'up to 5 days'),
        jsonb_build_object('country', 'Canada', 'province', 'Quebec', 'region', '', 'twoKg', '22', 'additionalOneKg', '1.75', 'timeline', 'up to 3 days'),
        jsonb_build_object('country', 'Canada', 'province', 'Saskatchewan', 'region', '', 'twoKg', '28', 'additionalOneKg', '1.5', 'timeline', 'up to 5 days'),
        jsonb_build_object('country', 'Canada', 'province', 'Ontario', 'region', 'GTA', 'twoKg', '21', 'additionalOneKg', '1.04', 'timeline', 'up to 2 days'),
        jsonb_build_object('country', 'Canada', 'province', 'Ontario', 'region', 'Northern Ontario', 'twoKg', '27', 'additionalOneKg', '1.08', 'timeline', 'up to 2 days'),
        jsonb_build_object('country', 'Canada', 'province', 'Ontario', 'region', 'Southern Ontario', 'twoKg', '25', 'additionalOneKg', '1.15', 'timeline', 'up to 2 days')
      )
    )
  )
on conflict (key) do nothing;
