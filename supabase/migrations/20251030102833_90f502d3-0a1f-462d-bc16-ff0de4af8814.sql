-- =====================================
-- 1. テーブル作成
-- =====================================

-- itemsテーブル（アイテムマスター）
CREATE TABLE public.items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('outfit', 'accessory', 'background', 'effect')),
  rarity TEXT NOT NULL CHECK (rarity IN ('R', 'SR', 'SSR')),
  image_url TEXT NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- user_itemsテーブル（ユーザー所持アイテム）
CREATE TABLE public.user_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES public.items(id) ON DELETE CASCADE,
  obtained_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_equipped BOOLEAN DEFAULT false,
  UNIQUE(user_id, item_id)
);

-- user_currencyテーブル（ユーザー通貨残高）
CREATE TABLE public.user_currency (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  free_coins INTEGER DEFAULT 0 CHECK (free_coins >= 0),
  paid_coins INTEGER DEFAULT 0 CHECK (paid_coins >= 0),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- coin_transactionsテーブル（コイン取引履歴）
CREATE TABLE public.coin_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('earn', 'spend', 'purchase')),
  source TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- gacha_historyテーブル（ガチャ履歴）
CREATE TABLE public.gacha_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES public.items(id) ON DELETE CASCADE,
  cost INTEGER NOT NULL,
  roll_number INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- gacha_pityテーブル（ガチャ天井カウンター）
CREATE TABLE public.gacha_pity (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  current_count INTEGER DEFAULT 0,
  last_ssr_at TIMESTAMP WITH TIME ZONE
);

-- subscriptionsテーブル（サブスクリプション管理）
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT UNIQUE,
  status TEXT NOT NULL CHECK (status IN ('active', 'canceled', 'past_due')),
  plan TEXT NOT NULL CHECK (plan IN ('premium_monthly', 'premium_yearly')),
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ai_conversationsテーブル（AI会話履歴）
CREATE TABLE public.ai_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  response TEXT NOT NULL,
  tokens_used INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ai_quotaテーブル（AIメッセージクォータ）
CREATE TABLE public.ai_quota (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  free_messages_used INTEGER DEFAULT 0,
  reset_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '1 month')
);

-- profilesテーブルに追加カラム
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS condition_types TEXT[] DEFAULT ARRAY['panic_disorder'],
ADD COLUMN IF NOT EXISTS customization_preferences JSONB DEFAULT '{}';

-- =====================================
-- 2. RLSポリシー設定
-- =====================================

-- itemsテーブル（全ユーザー読み取り可能）
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view items" ON public.items FOR SELECT USING (true);

-- user_itemsテーブル（ユーザーは自分のレコードのみ操作可能）
ALTER TABLE public.user_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own items" ON public.user_items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own items" ON public.user_items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own items" ON public.user_items FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own items" ON public.user_items FOR DELETE USING (auth.uid() = user_id);

-- user_currencyテーブル（ユーザーは自分のレコードのみ参照・更新可能）
ALTER TABLE public.user_currency ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own currency" ON public.user_currency FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own currency" ON public.user_currency FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own currency" ON public.user_currency FOR UPDATE USING (auth.uid() = user_id);

-- coin_transactionsテーブル（ユーザーは自分のレコードのみ参照可能）
ALTER TABLE public.coin_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own transactions" ON public.coin_transactions FOR SELECT USING (auth.uid() = user_id);

-- gacha_historyテーブル（ユーザーは自分のレコードのみ参照可能）
ALTER TABLE public.gacha_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own gacha history" ON public.gacha_history FOR SELECT USING (auth.uid() = user_id);

-- gacha_pityテーブル（ユーザーは自分のレコードのみ参照・更新可能）
ALTER TABLE public.gacha_pity ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own pity" ON public.gacha_pity FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own pity" ON public.gacha_pity FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own pity" ON public.gacha_pity FOR UPDATE USING (auth.uid() = user_id);

-- subscriptionsテーブル（ユーザーは自分のレコードのみ参照可能）
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own subscriptions" ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);

-- ai_conversationsテーブル（ユーザーは自分のレコードのみ参照・削除可能）
ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own conversations" ON public.ai_conversations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own conversations" ON public.ai_conversations FOR DELETE USING (auth.uid() = user_id);

-- ai_quotaテーブル（ユーザーは自分のレコードのみ参照可能）
ALTER TABLE public.ai_quota ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own quota" ON public.ai_quota FOR SELECT USING (auth.uid() = user_id);

-- =====================================
-- 3. PostgreSQL関数
-- =====================================

-- add_coins関数（コイン付与）
CREATE OR REPLACE FUNCTION public.add_coins(
  p_user_id UUID,
  p_amount INTEGER,
  p_source TEXT
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- user_currencyレコードの作成または更新
  INSERT INTO public.user_currency (user_id, free_coins, updated_at)
  VALUES (p_user_id, p_amount, NOW())
  ON CONFLICT (user_id) DO UPDATE
  SET free_coins = public.user_currency.free_coins + p_amount,
      updated_at = NOW();

  -- coin_transactionsに履歴記録
  INSERT INTO public.coin_transactions (user_id, amount, type, source)
  VALUES (p_user_id, p_amount, 'earn', p_source);
END;
$$;

-- spend_coins関数（コイン消費）
CREATE OR REPLACE FUNCTION public.spend_coins(
  p_user_id UUID,
  p_amount INTEGER,
  p_source TEXT
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_free_coins INTEGER;
  v_paid_coins INTEGER;
  v_total_coins INTEGER;
  v_free_to_spend INTEGER;
  v_paid_to_spend INTEGER;
BEGIN
  -- 残高取得
  SELECT free_coins, paid_coins INTO v_free_coins, v_paid_coins
  FROM public.user_currency
  WHERE user_id = p_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'User currency not found';
  END IF;

  v_total_coins := v_free_coins + v_paid_coins;

  -- 残高確認
  IF v_total_coins < p_amount THEN
    RAISE EXCEPTION 'Insufficient coins';
  END IF;

  -- 無料コインから優先消費
  IF v_free_coins >= p_amount THEN
    v_free_to_spend := p_amount;
    v_paid_to_spend := 0;
  ELSE
    v_free_to_spend := v_free_coins;
    v_paid_to_spend := p_amount - v_free_coins;
  END IF;

  -- コイン消費
  UPDATE public.user_currency
  SET free_coins = free_coins - v_free_to_spend,
      paid_coins = paid_coins - v_paid_to_spend,
      updated_at = NOW()
  WHERE user_id = p_user_id;

  -- 履歴記録
  INSERT INTO public.coin_transactions (user_id, amount, type, source)
  VALUES (p_user_id, -p_amount, 'spend', p_source);
END;
$$;

-- perform_gacha関数（ガチャ実行）
CREATE OR REPLACE FUNCTION public.perform_gacha(
  p_user_id UUID,
  p_roll_count INTEGER
)
RETURNS TABLE(item_id UUID, rarity TEXT, is_new BOOLEAN)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_cost INTEGER;
  v_current_pity INTEGER;
  v_selected_rarity TEXT;
  v_selected_item RECORD;
  v_is_new BOOLEAN;
  v_roll_index INTEGER;
BEGIN
  -- コスト計算
  IF p_roll_count = 1 THEN
    v_cost := 80;
  ELSIF p_roll_count = 11 THEN
    v_cost := 800;
  ELSE
    RAISE EXCEPTION 'Invalid roll count';
  END IF;

  -- コイン消費
  PERFORM public.spend_coins(p_user_id, v_cost, 'gacha');

  -- 現在の天井カウント取得
  SELECT current_count INTO v_current_pity
  FROM public.gacha_pity
  WHERE user_id = p_user_id;

  IF NOT FOUND THEN
    -- 初回ガチャ時にレコード作成
    INSERT INTO public.gacha_pity (user_id, current_count)
    VALUES (p_user_id, 0);
    v_current_pity := 0;
  END IF;

  -- p_roll_count回分の抽選
  FOR v_roll_index IN 1..p_roll_count LOOP
    v_current_pity := v_current_pity + 1;

    -- 天井判定（50回でSSR確定）
    IF v_current_pity >= 50 THEN
      v_selected_rarity := 'SSR';
      v_current_pity := 0; -- 天井リセット
    ELSE
      -- 確率抽選
      DECLARE
        v_random FLOAT := random();
      BEGIN
        IF v_random < 0.03 THEN
          v_selected_rarity := 'SSR';
          v_current_pity := 0; -- SSR獲得時リセット
        ELSIF v_random < 0.15 THEN
          v_selected_rarity := 'SR';
        ELSE
          v_selected_rarity := 'R';
        END IF;
      END;
    END IF;

    -- レアリティに応じてアイテム選択
    SELECT * INTO v_selected_item
    FROM public.items
    WHERE rarity = v_selected_rarity
      AND is_default = false
    ORDER BY random()
    LIMIT 1;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'No items found for rarity %', v_selected_rarity;
    END IF;

    -- 既所持チェック
    SELECT EXISTS(
      SELECT 1 FROM public.user_items
      WHERE user_id = p_user_id AND item_id = v_selected_item.id
    ) INTO v_is_new;

    v_is_new := NOT v_is_new;

    IF v_is_new THEN
      -- 新規アイテムを追加
      INSERT INTO public.user_items (user_id, item_id, obtained_at)
      VALUES (p_user_id, v_selected_item.id, NOW());
    ELSE
      -- 重複時は20コイン返却
      PERFORM public.add_coins(p_user_id, 20, 'gacha_duplicate');
    END IF;

    -- ガチャ履歴記録
    INSERT INTO public.gacha_history (user_id, item_id, cost, roll_number)
    VALUES (p_user_id, v_selected_item.id, v_cost / p_roll_count, v_current_pity);

    -- 結果を返す
    RETURN QUERY SELECT v_selected_item.id, v_selected_item.rarity, v_is_new;
  END LOOP;

  -- 天井カウント更新
  UPDATE public.gacha_pity
  SET current_count = v_current_pity,
      last_ssr_at = CASE WHEN v_selected_rarity = 'SSR' THEN NOW() ELSE last_ssr_at END
  WHERE user_id = p_user_id;
END;
$$;

-- increment_ai_quota関数（AIクォータインクリメント）
CREATE OR REPLACE FUNCTION public.increment_ai_quota(
  p_user_id UUID
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_reset_at TIMESTAMP WITH TIME ZONE;
BEGIN
  -- ai_quotaレコード取得
  SELECT reset_at INTO v_reset_at
  FROM public.ai_quota
  WHERE user_id = p_user_id;

  IF NOT FOUND THEN
    -- 初回作成
    INSERT INTO public.ai_quota (user_id, free_messages_used, reset_at)
    VALUES (p_user_id, 1, NOW() + INTERVAL '1 month');
  ELSIF v_reset_at < NOW() THEN
    -- リセット期間経過時
    UPDATE public.ai_quota
    SET free_messages_used = 1,
        reset_at = NOW() + INTERVAL '1 month'
    WHERE user_id = p_user_id;
  ELSE
    -- 通常インクリメント
    UPDATE public.ai_quota
    SET free_messages_used = free_messages_used + 1
    WHERE user_id = p_user_id;
  END IF;
END;
$$;

-- =====================================
-- 4. 初期データ投入
-- =====================================

-- デフォルトアイテム（is_default=true）
INSERT INTO public.items (name, description, category, rarity, image_url, is_default) VALUES
('ベーシックワンピース', 'Curaちゃんの定番スタイル', 'outfit', 'R', '/assets/items/basic-dress.png', true),
('シンプルリボン', '小さくて可愛いリボン', 'accessory', 'R', '/assets/items/simple-ribbon.png', true),
('青空の公園', '爽やかな公園の風景', 'background', 'R', '/assets/items/park-bg.png', true),
('パステルカーディガン', '柔らかい色合いのカーディガン', 'outfit', 'SR', '/assets/items/cardigan.png', true),
('夕焼けの海', 'ロマンチックな夕暮れ時', 'background', 'SR', '/assets/items/sunset-bg.png', true);

-- ガチャ用追加アイテム（is_default=false）
INSERT INTO public.items (name, description, category, rarity, image_url, is_default) VALUES
-- R アイテム（60%）
('カジュアルTシャツ', 'リラックスできる普段着', 'outfit', 'R', '/assets/items/casual-tshirt.png', false),
('シンプルスカート', 'どんなトップスにも合わせやすい', 'outfit', 'R', '/assets/items/simple-skirt.png', false),
('ベーシックスニーカー', '歩きやすい定番シューズ', 'accessory', 'R', '/assets/items/basic-sneakers.png', false),
('小さなイヤリング', 'さりげないおしゃれ', 'accessory', 'R', '/assets/items/small-earrings.png', false),
('図書館', '静かで落ち着く空間', 'background', 'R', '/assets/items/library-bg.png', false),
('カフェテラス', '心地よい日常の風景', 'background', 'R', '/assets/items/cafe-bg.png', false),

-- SR アイテム（30%）
('ふんわりブラウス', 'やさしい印象のトップス', 'outfit', 'SR', '/assets/items/fluffy-blouse.png', false),
('エレガントワンピース', '特別な日に着たい一着', 'outfit', 'SR', '/assets/items/elegant-dress.png', false),
('おしゃれな帽子', 'コーディネートのアクセント', 'accessory', 'SR', '/assets/items/stylish-hat.png', false),
('キラキラメガネ', '知的な雰囲気を演出', 'accessory', 'SR', '/assets/items/sparkle-glasses.png', false),
('桜並木', '春の訪れを感じる景色', 'background', 'SR', '/assets/items/sakura-bg.png', false),
('星空の丘', 'ロマンチックな夜の風景', 'background', 'SR', '/assets/items/starry-hill-bg.png', false),

-- SSR アイテム（10%）
('プリンセスドレス', '夢のような豪華な衣装', 'outfit', 'SSR', '/assets/items/princess-dress.png', false),
('ティアラ', '輝く王冠', 'accessory', 'SSR', '/assets/items/tiara.png', false),
('虹の橋', '幻想的な世界', 'background', 'SSR', '/assets/items/rainbow-bridge-bg.png', false),
('キラキラオーラ', '全身を包む輝き', 'effect', 'SSR', '/assets/items/sparkle-aura.png', false);

-- =====================================
-- 5. トリガー設定（新規ユーザー登録時の処理）
-- =====================================

CREATE OR REPLACE FUNCTION public.handle_new_user_gamification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_default_item RECORD;
BEGIN
  -- user_currencyレコード作成（初期100コイン）
  INSERT INTO public.user_currency (user_id, free_coins)
  VALUES (NEW.id, 100);

  -- デフォルトアイテムを全て付与
  INSERT INTO public.user_items (user_id, item_id, is_equipped)
  SELECT NEW.id, id, (category = 'outfit') -- 最初の衣装のみ装備
  FROM public.items
  WHERE is_default = true;

  -- gacha_pityレコード作成
  INSERT INTO public.gacha_pity (user_id, current_count)
  VALUES (NEW.id, 0);

  -- ai_quotaレコード作成
  INSERT INTO public.ai_quota (user_id, free_messages_used)
  VALUES (NEW.id, 0);

  RETURN NEW;
END;
$$;

-- トリガーを既存のhandle_new_user関数に統合
DROP TRIGGER IF EXISTS on_auth_user_created_gamification ON auth.users;
CREATE TRIGGER on_auth_user_created_gamification
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_gamification();