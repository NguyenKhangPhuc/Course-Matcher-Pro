-- 1. Function tạo usage row khi user mới đăng ký
CREATE OR REPLACE FUNCTION public.handle_new_user_usage()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.user_usage (user_id)
  VALUES (new.id);
  RETURN new;
END;
$$;

-- 2. Trigger chạy sau khi insert vào auth.users
CREATE OR REPLACE TRIGGER on_auth_user_created_usage
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user_usage();