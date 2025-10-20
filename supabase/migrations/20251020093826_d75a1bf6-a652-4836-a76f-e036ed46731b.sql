-- プロフィールテーブル（オンボーディング情報）
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users ON DELETE CASCADE,
  age INTEGER,
  diagnosed BOOLEAN DEFAULT false,
  diagnosis_year INTEGER,
  currently_treating BOOLEAN DEFAULT false,
  triggers TEXT,
  onboarding_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 症状記録テーブル
CREATE TABLE public.symptom_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  mood_score INTEGER NOT NULL CHECK (mood_score >= 0 AND mood_score <= 10),
  memo TEXT,
  tags TEXT[] DEFAULT '{}',
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ほめほめメッセージテーブル
CREATE TABLE public.homehome_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- お気に入りメッセージテーブル
CREATE TABLE public.favorite_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  message_id UUID NOT NULL REFERENCES public.homehome_messages ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, message_id)
);

-- RLSを有効化
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.symptom_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homehome_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorite_messages ENABLE ROW LEVEL SECURITY;

-- profilesのRLSポリシー
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- symptom_recordsのRLSポリシー
CREATE POLICY "Users can view their own symptom records"
  ON public.symptom_records FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own symptom records"
  ON public.symptom_records FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own symptom records"
  ON public.symptom_records FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own symptom records"
  ON public.symptom_records FOR DELETE
  USING (auth.uid() = user_id);

-- homehome_messagesのRLSポリシー（全員が読める）
CREATE POLICY "Anyone can view homehome messages"
  ON public.homehome_messages FOR SELECT
  USING (true);

-- favorite_messagesのRLSポリシー
CREATE POLICY "Users can view their own favorites"
  ON public.favorite_messages FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own favorites"
  ON public.favorite_messages FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorites"
  ON public.favorite_messages FOR DELETE
  USING (auth.uid() = user_id);

-- タイムスタンプ更新関数
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- profilesのタイムスタンプトリガー
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 新規ユーザー登録時にprofileを自動作成する関数
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id)
  VALUES (new.id);
  RETURN new;
END;
$$;

-- 新規ユーザー作成時のトリガー
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 初期ほめほめメッセージを挿入
INSERT INTO public.homehome_messages (message, category) VALUES
  ('今日も一日、よく頑張りましたね', 'daily'),
  ('あなたの存在は、それだけで価値があります', 'affirmation'),
  ('小さな一歩でも、前に進んでいますよ', 'progress'),
  ('不安を感じても大丈夫。あなたは強い人です', 'courage'),
  ('深呼吸をして、今この瞬間に集中しましょう', 'mindfulness'),
  ('完璧じゃなくても、あなたは十分素晴らしい', 'affirmation'),
  ('今日できたことを、ひとつ思い出してみて', 'reflection'),
  ('あなたのペースで、ゆっくり進めば大丈夫', 'pace'),
  ('不安な気持ちを認めてあげることも、勇気です', 'courage'),
  ('今日も呼吸ができている。それだけで素晴らしい', 'daily');