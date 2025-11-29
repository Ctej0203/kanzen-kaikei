-- Add new gacha items
INSERT INTO public.items (name, description, category, rarity, image_url, is_default) VALUES
  ('ルノのさかなコス', 'ルノがかわいい魚になりました！', 'outfit', 'SR', '/src/assets/luno-fish.png', false),
  ('ルノのミルクコス', 'ルノがミルクパックに入っちゃった！', 'outfit', 'SR', '/src/assets/luno-milk.png', false),
  ('ルノのトナカイコス', 'ルノがトナカイに変身！クリスマス気分', 'outfit', 'SSR', '/src/assets/luno-tonakai.png', false),
  ('ルノの納豆コス', 'ルノと納豆のコラボ！ネバネバ美味しい', 'outfit', 'R', '/src/assets/luno-natto.png', false),
  ('ルノの小松菜コス', 'ルノが小松菜を抱えて健康的！', 'outfit', 'R', '/src/assets/luno-komatsuna.png', false),
  ('スーの枝豆コス', 'スーが枝豆を食べてる！ヘルシー', 'outfit', 'R', '/src/assets/suu-edamame.png', false),
  ('スーのいちごコス', 'スーがいちごになっちゃった！甘くてキュート', 'outfit', 'SR', '/src/assets/suu-strawberry.png', false),
  ('スーのマッチョコス', 'スーが筋トレ！ダンベルでパワーアップ', 'outfit', 'R', '/src/assets/suu-macho.png', false),
  ('スーのドクターコス', 'スーがお医者さんに！安心の白衣姿', 'outfit', 'SR', '/src/assets/suu-doctor.png', false),
  ('スーのパンプキンコス', 'スーがかぼちゃに変身！ハロウィン気分', 'outfit', 'SSR', '/src/assets/suu-pampukinn.png', false);