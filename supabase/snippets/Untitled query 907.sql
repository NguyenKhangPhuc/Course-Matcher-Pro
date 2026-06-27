-- 1. Tạo Database Function xử lý việc chèn dữ liệu
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer -- Bắt buộc có dòng này để hàm có quyền ghi vào public.profiles
as $$
begin
  insert into public.profiles (id, full_name, avatar_url, email)
  values (
    new.id, 
    new.raw_user_meta_data->>'full_name', 
    null,
    lower(new.raw_user_meta_data->>'email')
  );
  return new;
end;
$$;

-- 2. Tạo Trigger liên kết hàm trên với sự kiện Sign-up của Auth
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();