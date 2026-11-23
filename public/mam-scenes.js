// Each scene starts in a named illustration pose and has its own movement and prop.
const choreography = [
  ["read", "greet", [
    ["Vẫy chào", "✦", 870, [[0,-10,-8,1.03],[0,-7,9,1.02],[0,-3,-4,1]]],
    ["Bước vào lớp", "🍃", 900, [[-22,0,-8,.92],[-7,-17,5,1.03],[6,0,-4,.98]]],
    ["Gật đầu", "•", 710, [[0,5,8,.97],[0,-4,-4,1.02],[0,3,5,1]]],
    ["Chào buổi sáng", "☀", 1050, [[0,5,0,.95],[0,-19,-7,1.08],[0,0,5,1]]],
    ["Rủ đọc cùng", "♪", 1000, [[-8,-3,-5,1],[13,-12,7,1.03],[5,-4,0,1]]],
    ["Vươn vai", "✺", 940, [[0,4,-3,.95],[0,-16,1,1.12],[0,-4,3,1.01]]],
    ["Gặp lại bạn", "♥", 920, [[0,-15,6,1.07],[-8,-8,-7,1.02],[6,-2,4,1.01]]]
  ]],
  ["read", "reading", [
    ["Mở sách", "▰", 900, [[0,-5,-10,.98],[0,-11,5,1.08],[0,-4,1,1.02]]],
    ["Lật trang", "▱", 810, [[-5,2,-12,1],[7,-7,12,1.03],[1,-2,-2,1]]],
    ["Đọc chậm", "·", 1210, [[0,-2,-3,1],[1,-5,-6,1.02],[0,-1,-2,1]]],
    ["Dừng ở đoạn hay", "✧", 920, [[0,-8,5,1.04],[0,-8,5,1.04],[0,2,0,.99]]],
    ["Giữ dấu trang", "◆", 870, [[-8,3,-6,.99],[5,-8,9,1.04],[2,3,-4,1]]],
    ["Tìm ý chính", "◇", 1020, [[0,-4,-9,1.01],[6,-8,4,1.06],[-2,-4,7,1.02]]],
    ["Đọc lại câu yêu thích", "♥", 1030, [[-8,-6,-5,1.02],[0,-9,0,1.06],[8,-6,6,1.01]]]
  ]],
  ["think", "thinking", [
    ["Suy nghĩ một chút", "?", 1130, [[-5,-6,-11,1.02],[4,-3,8,1],[1,-4,3,1.02]]],
    ["Nảy ra ý tưởng", "✦", 880, [[0,5,-5,.96],[0,-21,3,1.09],[3,-7,6,1.02]]],
    ["Đổi góc nhìn", "↗", 1000, [[-11,-4,-13,1],[12,-6,14,1.03],[0,-3,-2,1]]],
    ["Nối hai điều", "∞", 1100, [[-13,-5,-7,1],[15,-9,7,1.04],[0,-4,0,1.03]]],
    ["Tìm ví dụ", "◇", 950, [[5,3,8,.98],[5,-14,-4,1.06],[-4,-2,7,1]]],
    ["Xem lại suy luận", "∴", 1050, [[0,-8,8,1.04],[-8,0,-10,.99],[4,-5,2,1.02]]],
    ["Đặt một câu hỏi", "?", 900, [[7,0,10,1],[3,-18,-6,1.05],[0,-5,5,1]]]
  ]],
  ["guide", "guide", [
    ["Mời ghi chú", "✎", 840, [[9,-4,8,1.03],[-4,-10,-6,1.06],[1,0,2,1]]],
    ["Chỉ một chi tiết", "→", 850, [[12,-2,13,1.04],[17,-5,10,1.05],[3,-2,-2,1]]],
    ["Gợi sách liên quan", "▰", 980, [[8,-8,9,1.03],[15,-17,-4,1.06],[4,-3,3,1]]],
    ["Đề nghị thử lại", "↻", 1020, [[-6,-4,-11,1],[0,-8,11,1.06],[8,-3,-7,1.01]]],
    ["Dẫn đường ôn tập", "➜", 1110, [[-20,1,-6,.98],[7,-13,10,1.03],[12,-4,2,1.02]]],
    ["Tóm tắt chương", "≋", 920, [[0,-6,-5,1.04],[6,-6,6,1.04],[0,-2,0,1.02]]],
    ["Mở góc tranh luận", "↔", 1050, [[-7,-6,-12,1.02],[8,-9,12,1.04],[0,-2,-3,1]]]
  ]],
  ["guide", "search", [
    ["Tra cứu đầu sách", "⌕", 1050, [[-13,-4,-12,1],[4,-11,8,1.07],[4,-4,1,1]]],
    ["Dò tên tác giả", "◇", 1000, [[-11,1,-7,1],[13,-7,11,1.04],[7,-1,3,1]]],
    ["Quay lại thư viện", "↶", 910, [[11,-2,6,1.04],[-12,-8,-12,1.02],[-3,-2,2,1]]],
    ["Tìm từ khóa", "✦", 880, [[-5,5,-4,.98],[5,-13,9,1.06],[4,-3,3,1]]],
    ["So hai nguồn", "↔", 1140, [[-12,-6,-9,1.04],[12,-6,9,1.04],[0,-3,0,1.01]]],
    ["Lưu điều vừa biết", "●", 930, [[0,-5,-8,1.05],[0,4,4,.96],[0,-2,0,1]]],
    ["Tìm được nguồn", "✓", 950, [[0,-8,8,1.04],[0,-14,-6,1.08],[0,-5,3,1]]]
  ]],
  ["celebrate", "celebrate", [
    ["Chúc mừng lên cấp", "✦", 1160, [[0,8,0,.93],[0,-35,-9,1.13],[0,-9,7,1.04]]],
    ["Hoàn thành một chương", "✓", 850, [[0,4,-5,.97],[0,-20,5,1.07],[0,-3,-2,1.02]]],
    ["Khép lại một cuốn", "★", 1010, [[-5,5,-3,.95],[6,-32,8,1.12],[0,-7,-6,1.02]]],
    ["Huy hiệu mới", "◆", 1180, [[0,-10,-8,1.09],[0,-28,12,1.13],[0,-3,-5,1.03]]],
    ["Vỗ tay", "✺", 940, [[-3,-8,-6,1.04],[3,-15,7,1.08],[-3,-5,-5,1.02]]],
    ["Nhảy ăn mừng", "♪", 960, [[-14,-7,-10,1.05],[12,-27,9,1.12],[0,-8,-6,1.05]]],
    ["Làm được rồi", "♥", 1070, [[0,-13,7,1.12],[0,-23,-9,1.09],[0,-4,4,1.02]]]
  ]],
  ["read", "encourage", [
    ["Thêm một trang thôi", "•", 830, [[-6,3,-6,.98],[5,-13,7,1.03],[3,-2,-2,1]]],
    ["Nghỉ một nhịp", "☁", 1240, [[0,3,-5,.98],[0,-3,1,1.02],[0,3,4,.99]]],
    ["Quay về với sách", "↶", 970, [[12,-1,8,1],[-10,-10,-7,1.06],[0,0,2,1]]],
    ["Thử một bước nhỏ", "✧", 820, [[-7,2,-5,.98],[3,-12,5,1.04],[9,-3,1,1]]],
    ["Chuẩn bị góc đọc", "▰", 1030, [[-15,2,-9,1],[0,-10,0,1.06],[10,0,4,1]]],
    ["Tự nhắc mình", "♥", 990, [[0,-4,8,1.02],[0,-11,-7,1.04],[0,1,3,1]]],
    ["Hẹn gặp ngày mai", "☾", 1170, [[-8,-6,-8,1.01],[8,-4,8,1.03],[0,2,-3,1]]]
  ]],
  ["think", "review", [
    ["Nhìn lại tuần qua", "▥", 1020, [[-8,-6,-9,1.02],[8,-12,8,1.07],[0,-4,0,1.02]]],
    ["Đếm chương đã đọc", "✓", 880, [[0,3,-8,.99],[5,-17,6,1.07],[0,-3,2,1]]],
    ["Ôn điều đáng nhớ", "✦", 1070, [[-5,-8,-10,1.03],[0,-16,4,1.08],[6,-2,7,1]]],
    ["Chọn ngày đọc", "◷", 930, [[-10,0,-5,1],[10,-10,6,1.05],[5,-2,1,1]]],
    ["So tiến độ hai tuần", "↔", 1080, [[-15,-5,-12,1.03],[14,-8,12,1.06],[0,-3,-2,1]]],
    ["Nhắc xem lại ghi chú", "✎", 1000, [[7,-7,9,1.05],[-7,-12,-9,1.05],[0,2,0,1]]],
    ["Kết thúc buổi ôn", "✺", 1160, [[-6,-6,-8,1.03],[6,-18,8,1.1],[0,-5,-2,1.02]]]
  ]]
];

export const mamScenes = choreography.flatMap(([pose, mood, entries]) =>
  entries.map(([name, prop, duration, frames], index) => ({ id: mood + "-" + (index + 1), pose, mood, name, prop, duration, frames })));

export function mamFigure(pose = "read", extra = "") {
  return `<span class="mam-figure ${extra}" aria-hidden="true" data-mam>
    <img class="mam-body" src="/assets/mam-${pose}.webp" width="420" height="380" alt="" decoding="async" draggable="false">
    <span class="mam-prop"></span><span class="mam-glow"></span>
  </span>`;
}

const activeScenes = new WeakMap();

export function playMam(element, scene, motion = true) {
  const figure = element?.matches?.("[data-mam]") ? element : element?.querySelector?.("[data-mam]");
  if (!figure) return;
  const model = mamScenes.find(item => item.id === scene) || mamScenes[0];
  const image = figure.querySelector("img");
  const prop = figure.querySelector(".mam-prop");
  const glow = figure.querySelector(".mam-glow");
  activeScenes.get(figure)?.forEach(animation => animation.cancel());
  image.src = "/assets/mam-" + model.pose + ".webp";
  prop.textContent = "";
  if (!motion || matchMedia("(prefers-reduced-motion: reduce)").matches || !image.animate) return;

  prop.textContent = model.prop;
  const frames = model.frames.map(([x,y,angle,size]) => ({
    transform: `translate(${x}px,${y}px) rotate(${angle}deg) scale(${size})`
  }));
  const fresh = [
    image.animate([{ transform:"none" }, ...frames, { transform:"none" }], { duration:model.duration, easing:"ease-in-out" }),
    prop.animate([{ opacity:0, transform:"translate(0,8px) scale(.5)" }, { opacity:1, offset:.45, transform:"translate(7px,-19px) scale(1.13)" }, { opacity:0, transform:"translate(14px,-39px) scale(.73)" }], { duration:model.duration, fill:"both" }),
    glow.animate([{ opacity:0, transform:"scale(.55)" }, { opacity:.6, offset:.45, transform:"scale(1.07)" }, { opacity:0, transform:"scale(1.34)" }], { duration:model.duration, fill:"both" })
  ];
  for (const animation of fresh) void animation.finished?.catch(() => {});
  activeScenes.set(figure, fresh);
}
