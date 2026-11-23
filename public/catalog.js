export const samples = [
  {
    id: "demo-1", type: "book", title: "Một khu vườn tĩnh lặng", author: "An Khê",
    cover: "/assets/cover-1.webp", category: "Thiên nhiên", done: 8, total: 12,
    checkpoint: "Chương 9 · Lắng nghe khu vườn", starred: true,
    summary: "Qua những việc nhỏ như ủ lá, tỉa cành và quan sát đất sau mưa, người làm vườn dần học cách để khu vườn tự dẫn đường."
  },
  {
    id: "demo-2", type: "book", title: "Một trời bình yên", author: "Minh An",
    cover: "/assets/cover-2.webp", category: "Chánh niệm", done: 3, total: 10,
    checkpoint: "Chương 4 · Buổi sáng đủ chậm", starred: true,
    summary: "Một tập tản văn về cách có mặt trong những chuyện rất đỗi bình thường, từ mở cửa sổ đầu ngày đến lắng nghe một người bạn."
  },
  {
    id: "demo-3", type: "podcast", title: "Tiếng lá và trang sách", author: "Thu Nguyên",
    cover: "/assets/cover-4.webp", category: "Tản mạn", done: 5, total: 8,
    checkpoint: "Tập 6 · Một buổi chiều rất thường", starred: true,
    summary: "Những cuộc trò chuyện ngắn về việc đọc, những câu hỏi còn ở lại khi khép sách và những điều nhỏ bé đáng để nghe thêm lần nữa."
  },
  {
    id: "demo-4", type: "book", title: "Đường về tĩnh lặng", author: "Lam Vũ",
    cover: "/assets/cover-3.webp", category: "Thiền tập", done: 6, total: 16,
    checkpoint: "Chương 7 · Trở về với hơi thở", starred: false,
    summary: "Ghi chép từ một người mới tập thiền về những lần mất kiên nhẫn, những ngày làm lại và những khoảnh khắc an tĩnh bất ngờ."
  },
  {
    id: "demo-5", type: "book", title: "Những mùa hoa đi qua", author: "Diệp Hoài",
    cover: "/assets/cover-5.webp", category: "Tản văn", done: 10, total: 10,
    checkpoint: "", starred: false,
    summary: "Những câu chuyện về ký ức, về một ngôi nhà cũ và những mùa hoa người kể chuyện nhớ theo cách riêng của mình."
  },
  {
    id: "demo-6", type: "podcast", title: "Chậm cùng hoàng hôn", author: "Miên",
    cover: "/assets/cover-6.webp", category: "Đời sống", done: 0, total: 16,
    checkpoint: "", starred: false,
    summary: "Một góc nghe cuối ngày với những suy tưởng ngắn về thói quen, sự nghỉ ngơi và những người ta muốn dành thời gian cho."
  }
].map((item, index) => ({ ...item, demo: true, updated: 100 - index, link: "" }));

export const views = [
  { id: "tong-quan", label: "Tổng quan", mobile: "Tổng quan", icon: "dashboard" },
  { id: "sach-doc", label: "Sách đọc", mobile: "Sách", icon: "book" },
  { id: "podcast", label: "Podcast", mobile: "Podcast", icon: "headphones" },
  { id: "danh-dau", label: "Đánh dấu sao", mobile: "Có sao", icon: "star" },
  { id: "cai-dat", label: "Cài đặt", mobile: "Cài đặt", icon: "settings" }
];
