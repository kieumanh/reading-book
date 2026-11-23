import { mamFigure } from "./mam-scenes.js";
import { esc } from "./tutor-view.js";

export function authPage(registering, rememberedEmail) {
  const title=registering?"Tạo góc đọc của anh":"Trở lại góc đọc của anh";
  const buttonLabel=registering?"Tạo tài khoản":"Đăng nhập";
  const eye='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M2 12s3.7-6 10-6 10 6 10 6-3.7 6-10 6-10-6-10-6Z"/><circle cx="12" cy="12" r="2.7"/></svg>';
  return `<div class="reading-auth">
    <section class="auth-illustration" aria-label="Reading Book">
      <a class="auth-brand" href="#tong-quan"><img src="/assets/icon-192.png" alt="" width="42" height="42"><span>Reading Book</span></a>
      <div class="auth-story"><h2>Mở sách.<br>Mở một thế giới.</h2><p>Đi từng chương một cùng sóc Mầm.</p></div>
      ${mamFigure("read")}
      <a href="#tong-quan" class="auth-demo">Dùng thử Reading Book <span aria-hidden="true">→</span></a>
    </section>
    <section class="auth-card" aria-labelledby="auth-title">
      <nav class="auth-tabs" aria-label="Tài khoản">
        <a href="#dang-nhap" ${registering?"":'aria-current="page"'}>Đăng nhập</a>
        <a href="#dang-ky" ${registering?'aria-current="page"':""}>Đăng ký</a>
      </nav>
      <h1 id="auth-title">${title}</h1>
      <p>${registering?"Lưu tiến độ đọc, huy hiệu và ghi chú của anh trên nhiều thiết bị.":"Sách đang đọc và các chặng đã mở đang chờ anh."}</p>
      <form class="form" data-form="${registering?"register":"login"}">
        ${registering?'<label class="control-label">Tên hiển thị<input name="name" maxlength="60" autocomplete="nickname" required></label>':""}
        <label class="control-label">${registering?"Email":"Email hoặc tên đăng nhập"}
          <input type="${registering?"email":"text"}" name="username" maxlength="254" autocomplete="username" inputmode="email"
            autocapitalize="none" spellcheck="false" value="${registering?"":esc(rememberedEmail)}" required>
        </label>
        <label class="control-label" for="auth-password">Mật khẩu</label>
        <div class="auth-password"><input id="auth-password" name="password" type="password" minlength="10" maxlength="128"
            autocomplete="${registering?"new-password":"current-password"}" required>
          <button type="button" data-action="auth-password" aria-label="Hiện mật khẩu" aria-pressed="false">${eye}</button>
        </div>
        ${registering?'<label class="control-label">Nhập lại mật khẩu<input name="confirmPassword" type="password" minlength="10" maxlength="128" autocomplete="new-password" required></label><p class="hint">Mật khẩu dùng ít nhất 10 ký tự.</p>':
          `<label class="check"><input name="remember" type="checkbox" ${rememberedEmail?"checked":""}> Ghi nhớ email trên thiết bị</label>`}
        <p class="error" role="alert" hidden></p>
        <button class="button" type="submit">${buttonLabel}</button>
      </form>
      <a class="auth-back" href="#tong-quan">Quay về dùng thử</a>
    </section>
  </div>`;
}
