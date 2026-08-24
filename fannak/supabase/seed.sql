-- ===========================================================================
-- Fannak — reference seed data (Riyadh, AC-first taxonomy).
-- Mirrors src/lib/seed-data.ts, which the app uses when no database is set.
-- Providers are NOT seeded: real providers enter only via Wathq verification.
-- ===========================================================================

insert into cities (slug, name_ar, name_en) values
  ('riyadh', 'الرياض', 'Riyadh')
on conflict (slug) do nothing;

insert into districts (city_id, slug, name_ar, name_en) values
  ((select id from cities where slug='riyadh'), 'olaya', 'العليا', 'Al Olaya'),
  ((select id from cities where slug='riyadh'), 'malaz', 'الملز', 'Al Malaz'),
  ((select id from cities where slug='riyadh'), 'nakheel', 'النخيل', 'Al Nakheel'),
  ((select id from cities where slug='riyadh'), 'yasmin', 'الياسمين', 'Al Yasmin'),
  ((select id from cities where slug='riyadh'), 'narjis', 'النرجس', 'Al Narjis'),
  ((select id from cities where slug='riyadh'), 'king-fahd', 'الملك فهد', 'King Fahd'),
  ((select id from cities where slug='riyadh'), 'sulimaniyah', 'السليمانية', 'Al Sulimaniyah'),
  ((select id from cities where slug='riyadh'), 'rawdah', 'الروضة', 'Al Rawdah'),
  ((select id from cities where slug='riyadh'), 'wurud', 'الورود', 'Al Wurud'),
  ((select id from cities where slug='riyadh'), 'irqah', 'عرقة', 'Irqah'),
  ((select id from cities where slug='riyadh'), 'aqiq', 'العقيق', 'Al Aqiq'),
  ((select id from cities where slug='riyadh'), 'hittin', 'حطين', 'Hittin'),
  ((select id from cities where slug='riyadh'), 'muruj', 'المروج', 'Al Muruj'),
  ((select id from cities where slug='riyadh'), 'izdihar', 'الازدهار', 'Al Izdihar'),
  ((select id from cities where slug='riyadh'), 'sahafah', 'الصحافة', 'Al Sahafah'),
  ((select id from cities where slug='riyadh'), 'qurtubah', 'قرطبة', 'Qurtubah'),
  ((select id from cities where slug='riyadh'), 'naseem', 'النسيم', 'Al Naseem'),
  ((select id from cities where slug='riyadh'), 'shifa', 'الشفا', 'Al Shifa')
on conflict (city_id, slug) do nothing;

insert into services (slug, category, name_ar, name_en, description_ar, description_en, typical_price_min, typical_price_max, is_recurring, sort_order) values
  ('ac-split-clean', 'ac', 'تنظيف مكيف سبليت', 'Split AC deep clean', 'تنظيف عميق للوحدة الداخلية والخارجية مع تعقيم المرشحات.', 'Deep clean of indoor and outdoor units, including filter sanitising.', 99, 150, false, 1),
  ('ac-window-clean', 'ac', 'تنظيف مكيف شباك', 'Window AC clean', 'فك وتنظيف وتعقيم مكيف الشباك.', 'Removal, cleaning and sanitising of a window unit.', 89, 120, false, 2),
  ('ac-repair', 'ac', 'إصلاح مكيف', 'AC repair', 'تشخيص وإصلاح الأعطال — لا يبرد، تسريب مياه، أصوات غير طبيعية.', 'Diagnosis and repair — not cooling, water leaks, unusual noise.', 150, 400, false, 3),
  ('ac-gas-refill', 'ac', 'تعبئة فريون', 'Refrigerant refill', 'فحص التسريب وتعبئة غاز التبريد.', 'Leak check and refrigerant top-up.', 150, 300, false, 4),
  ('ac-install', 'ac', 'تركيب مكيف', 'AC installation', 'تركيب وحدة جديدة مع التمديدات والتشغيل.', 'New unit installation including pipework and commissioning.', 200, 450, false, 5),
  ('ac-amc', 'ac', 'عقد صيانة سنوي', 'Annual maintenance contract', 'زيارات صيانة مجدولة على مدار السنة مع خصم على قطع الغيار.', 'Scheduled maintenance visits across the year, with discounted parts.', 500, 800, true, 6),
  ('ac-duct-clean', 'ac', 'تنظيف مجاري التكييف', 'Duct cleaning', 'تنظيف وتعقيم مجاري الهواء للمنازل والمكاتب.', 'Cleaning and sanitising of air ducts for homes and offices.', 300, 800, false, 7),
  ('water-tank-clean', 'cleaning', 'تنظيف خزانات المياه', 'Water tank cleaning', 'تنظيف وتعقيم الخزان مع شهادة.', 'Tank cleaning and sanitising, with a certificate.', 200, 400, true, 8),
  ('home-clean', 'cleaning', 'تنظيف منازل', 'Home cleaning', 'تنظيف شامل بالساعة أو بالعقد الشهري.', 'Full clean, hourly or on a monthly contract.', 99, 400, true, 9)
on conflict (slug) do nothing;
