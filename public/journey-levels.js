const lands = [
  ["Thung lũng Mầm Chữ", "Mở sách, làm quen với nhịp đọc và giữ lại điều đầu tiên khiến mình tò mò.", [
    ["Mở Trang Đầu", "Bắt đầu đọc và gọi tên điều khiến bạn muốn đọc tiếp.", "Chúc mừng trang khởi hành! Giữ lại một câu khiến bạn muốn mở sách lần nữa."],
    ["Gieo Tò Mò", "Nêu được một câu hỏi trước khi đọc.", "Bạn đã gieo một câu hỏi hay. Thử tìm xem chương kế tiếp gợi mở điều gì."],
    ["Đọc Có Hẹn", "Dành được một khoảng thời gian chủ động cho sách.", "Bạn đã có một cuộc hẹn với sách. Hãy giữ cuộc hẹn kế tiếp vừa sức với mình."],
    ["Người Giữ Dấu", "Đánh dấu và quay lại đúng đoạn quan trọng.", "Chúc mừng! Một dấu trang hôm nay giúp bạn trở lại mạch ý vào ngày mai."],
    ["Chậm Một Nhịp", "Nhận ra đoạn cần đọc chậm hoặc đọc lại.", "Bạn biết lúc nào nên chậm lại. Hãy thử đọc thành tiếng câu quan trọng nhất."],
    ["Bắt Mạch Chuyện", "Kể được trình tự chính của một chương.", "Bạn đã theo được mạch kể. Thử kể lại chương này bằng ba câu ngắn."],
    ["Gọi Tên Ý Chính", "Tách được ý chính khỏi chi tiết minh họa.", "Ý chính đã hiện ra. Hãy đặt một nhan đề mới cho đoạn vừa đọc."],
    ["Lắng Nghe Chữ", "Chú ý đến từ ngữ và sắc thái của câu văn.", "Chúc mừng! Chọn một từ đáng nhớ và thử tìm vì sao tác giả dùng nó."],
    ["Trang Sách Có Dấu", "Ghi lại một nhận xét đi cùng câu trích.", "Trang sách đã có dấu vết của riêng bạn. Viết thêm một dòng về điều khiến bạn dừng lại."],
    ["Người Đọc Đều", "Gây dựng được nhịp đọc có thể duy trì.", "Bạn đang có một nhịp đọc đáng quý. Chọn giờ đọc phù hợp cho tuần tới."]
  ]],
  ["Rừng Ký Ức", "Nhớ bằng cách kể lại, tự kiểm tra và nối ý mới với điều đã biết.", [
    ["Nhặt Hạt Ý", "Rút ra được vài ý đáng lưu sau mỗi chương.", "Chúc mừng! Chọn ba ý có ích nhất và bỏ bớt những dòng bạn sẽ không dùng."],
    ["Kể Lại Bằng Lời Mình", "Diễn đạt ý đã đọc bằng cách nói của mình.", "Bạn đã tìm được giọng của mình. Thử giải thích lại mà không nhìn vào trang sách."],
    ["Nối Hai Trang", "Liên hệ ý ở chương hiện tại với chương trước.", "Hai chương đã bắt đầu trò chuyện. Ghi lại một điểm chúng bổ sung cho nhau."],
    ["Ghi Nhớ Có Hình", "Chuyển một ý trừu tượng thành hình ảnh dễ nhớ.", "Chúc mừng! Thử vẽ một hình nhỏ cho khái niệm khó nhớ nhất hôm nay."],
    ["Ôn Lại Đúng Lúc", "Chủ động quay lại kiến thức sau một khoảng nghỉ.", "Bạn đã biết quay lại đúng lúc. Đặt một câu hỏi để tự kiểm tra sau vài ngày."],
    ["Người Tóm Ý", "Tóm tắt được một chương trong một đoạn ngắn.", "Bản tóm tắt đã có trọng tâm. Rút tiếp còn một câu để thấy điều cốt lõi."],
    ["Lập Sơ Đồ Ý", "Nhóm được các ý theo quan hệ chính và phụ.", "Chúc mừng! Thêm một mũi tên ở nơi bạn thấy hai ý ảnh hưởng đến nhau."],
    ["Thử Trí Nhớ", "Trả lời câu hỏi trước khi xem lại ghi chú.", "Bạn đã dám thử trí nhớ của mình. Đánh dấu phần cần ôn và dành công cho đúng chỗ."],
    ["Nhớ Theo Ngữ Cảnh", "Nhớ được hoàn cảnh gắn với một ý hoặc thuật ngữ.", "Bạn đã nhớ cả bối cảnh. Thử dùng khái niệm ấy trong một tình huống khác."],
    ["Người Gieo Liên Tưởng", "Dùng liên tưởng có ý nghĩa để ghi nhớ lâu hơn.", "Chúc mừng! Nối ý mới với một trải nghiệm thật để lần sau dễ tìm lại."]
  ]],
  ["Suối Hiểu Sâu", "Giải thích được điều mình đọc và tìm ra chỗ mình còn chưa hiểu.", [
    ["Hỏi Cho Rõ", "Đặt câu hỏi làm rõ một ý mơ hồ.", "Bạn đã tìm được chỗ cần hỏi. Đổi một câu hỏi chung thành câu hỏi cụ thể hơn."],
    ["Hiểu Một Khái Niệm", "Định nghĩa một khái niệm kèm ví dụ.", "Chúc mừng! Tìm thêm một ví dụ trái ngược để thấy ranh giới của khái niệm."],
    ["Biết Mình Chưa Biết", "Gọi tên được phần hiểu chưa chắc.", "Bạn đã nhìn thấy khoảng trống của mình. Ghi nó thành câu hỏi để quay lại sau."],
    ["Lần Theo Nguyên Nhân", "Giải thích quan hệ nguyên nhân trong một lập luận.", "Mạch nguyên nhân đã rõ hơn. Thử hỏi còn yếu tố nào có thể góp phần."],
    ["Đọc Ý Ẩn", "Phân biệt điều tác giả nói rõ với điều người đọc suy ra.", "Chúc mừng! Chỉ ra câu văn đã dẫn bạn đến cách suy ra ấy."],
    ["Đổi Góc Nhìn", "Diễn giải một đoạn từ góc nhìn khác.", "Bạn đã mở thêm một cửa sổ. Hãy thử đọc đoạn ấy từ góc nhìn của nhân vật phụ."],
    ["Dùng Ví Dụ Thật", "Chọn ví dụ vừa khớp vừa đủ đơn giản để giải thích.", "Ví dụ của bạn giúp ý sáng rõ. Hãy thử nói lại cho người lần đầu nghe."],
    ["Nhìn Cả Bối Cảnh", "Xem thời đại và hoàn cảnh tác giả viết.", "Chúc mừng! Ghi một chi tiết về thời điểm viết đã làm bạn đổi cách hiểu."],
    ["Gỡ Nút Mơ Hồ", "Tách hai cách hiểu dễ bị trộn lẫn.", "Bạn đã gỡ được một nút thắt. Viết mỗi cách hiểu thành một câu riêng."],
    ["Người Hiểu Mạch Sâu", "Giải thích nhất quán sự liên hệ giữa các ý lớn.", "Chúc mừng! Bạn có thể thử giảng lại mạch ý mà vẫn giữ những chỗ còn bỏ ngỏ."]
  ]],
  ["Đèo Đối Chiếu", "Đọc nhiều phía, kiểm tra nguồn và học cách phân biệt bằng chứng với khẳng định.", [
    ["Mở Nguồn Thứ Hai", "Tìm được một nguồn độc lập cho cùng câu hỏi.", "Bạn đã có thêm một nguồn. So hai tác giả ở điểm họ bất đồng rõ nhất."],
    ["Tìm Xuất Xứ", "Lần được một câu trích về nguồn ban đầu.", "Chúc mừng! Khi gặp một câu trích ấn tượng, hãy thử đọc cả phần đứng trước nó."],
    ["Đọc Nghiêng Hai Phía", "Trình bày công bằng hai cách lý giải.", "Bạn đã giữ được cả hai tiếng nói. Thử nêu điểm mạnh nhất của mỗi phía."],
    ["Phân Biệt Ý Kiến", "Nhận ra thứ có thể kiểm chứng và điều thuộc đánh giá cá nhân.", "Chúc mừng! Gạch chân một mệnh đề có thể kiểm tra và tìm cách kiểm tra nó."],
    ["Tìm Dấu Bằng Chứng", "Chỉ được bằng chứng dùng cho một kết luận.", "Bạn đã nhìn thấy bằng chứng. Hỏi xem nó thực sự nâng đỡ phần nào của kết luận."],
    ["Đọc Chú Thích", "Dùng chú thích để hiểu nguồn và giới hạn trích dẫn.", "Chúc mừng! Một chú thích nhỏ có thể đưa bạn tới cả một cuộc đối thoại lớn."],
    ["Kiểm Chứng Dữ Kiện", "Đối chiếu số liệu và ngữ cảnh trước khi dùng.", "Bạn đã nhìn kỹ con số. Nhớ kiểm tra đơn vị, thời điểm và nhóm được đo."],
    ["Xem Mắt Xích Yếu", "Phát hiện bước suy luận thiếu căn cứ.", "Chúc mừng! Ghi riêng mắt xích còn yếu và nghĩ xem cần thêm điều gì để nối nó."],
    ["Đọc Với Hoài Nghi", "Đặt câu hỏi khó mà vẫn tôn trọng người viết.", "Bạn đã giữ được sự nghiêm túc trong hoài nghi. Thử hỏi tác giả điều bạn muốn hiểu thêm."],
    ["Người Giữ Cân Bằng", "Cân nhắc nhiều nguồn trước khi kết luận.", "Chúc mừng! Lúc ý kiến dễ nghiêng về một phía, hãy quay lại nguồn có lập luận mạnh nhất."]
  ]],
  ["Cầu Thực Hành", "Biến điều đã đọc thành việc có thể làm, quan sát và điều chỉnh.", [
    ["Thử Một Việc Nhỏ", "Chuyển một ý trong sách thành hành động cụ thể.", "Chúc mừng! Chọn việc nhỏ đủ để làm ngay hôm nay rồi ghi điều bạn quan sát được."],
    ["Chọn Việc Đáng Thử", "Cân nhắc việc nào phù hợp điều kiện thực tế.", "Bạn đã biết chọn nơi để thử. Hãy ghi vì sao ý này hợp với tình huống của bạn."],
    ["Quan Sát Kết Quả", "Ghi lại điều thực tế xảy ra sau một lần thử.", "Chúc mừng! Kết quả khác dự đoán cũng là dữ liệu tốt cho lần đọc tiếp theo."],
    ["Đặt Dấu Kiểm", "Dùng tiêu chí rõ ràng để đánh giá việc áp dụng.", "Bạn đã có điểm để đối chiếu. Chọn một dấu hiệu bạn có thể quan sát lại vào tuần sau."],
    ["Thay Đổi Có Lý Do", "Điều chỉnh một cách làm theo phản hồi.", "Chúc mừng! Hãy ghi lại lý do điều chỉnh để lần sau biết mình đã học gì."],
    ["Gặp Giới Hạn", "Nhận ra khi nào một lời khuyên không còn phù hợp.", "Bạn đã thấy giới hạn của một ý hay. Thử nêu trường hợp nó vẫn phát huy tác dụng."],
    ["Đọc Từ Trải Nghiệm", "Dùng trải nghiệm mới để xem lại cách hiểu sách.", "Chúc mừng! Mở lại một đoạn cũ và xem lần thực hành vừa rồi thay đổi cách hiểu ra sao."],
    ["Luyện Một Thói Quen", "Lặp lại một bước vừa sức đến khi thành thói quen.", "Bạn đang làm cho kiến thức có chỗ đứng trong ngày. Chọn một nhịp lặp đủ nhẹ để giữ đều."],
    ["Rút Bài Học Từ Sai", "Mô tả một lần thử thất bại và điều sẽ đổi.", "Chúc mừng! Ghi chính xác điều đã sai, rồi giữ lại phần vẫn dùng được."],
    ["Người Nối Chữ Với Đời", "Chuyển hiểu biết thành việc hữu ích lặp lại được.", "Những trang đã đọc bắt đầu giúp được việc thật. Chọn một bài học để tiếp tục làm sâu."]
  ]],
  ["Vườn Liên Ngành", "Nối tri thức giữa nhiều lĩnh vực và thử giới hạn của những liên hệ đó.", [
    ["Bước Qua Ranh Giới", "Đọc một chủ đề quen từ lĩnh vực mới.", "Chúc mừng! Để một lĩnh vực lạ đặt câu hỏi mới cho điều bạn tưởng đã hiểu."],
    ["Tìm Dáng Chung", "Nhận ra mẫu hình giống nhau ở hai hoàn cảnh.", "Bạn đã thấy một dáng chung. Viết thêm điểm khác quan trọng nhất để tránh so sánh vội."],
    ["Mở Từ Điển Riêng", "Tìm đúng nghĩa của thuật ngữ ở từng lĩnh vực.", "Chúc mừng! Hai ngành có thể dùng cùng một từ theo hai cách, hãy ghi rõ từng nghĩa."],
    ["Nhìn Hệ Thống", "Thấy các bộ phận và mối liên hệ tạo nên một kết quả.", "Bạn đã nhìn được cả hệ. Thử vẽ mối liên hệ tác động ngược mà bạn dễ bỏ sót."],
    ["So Mẫu Hình", "Đối chiếu hai mẫu hình bằng cùng một tiêu chí.", "Chúc mừng! Hãy thử tiêu chí khác và xem kết luận của bạn có đổi không."],
    ["Tìm Mức Độ Phù Hợp", "Đánh giá một phép tương tự trước khi suy rộng.", "Bạn đã biết thử sức phép so sánh. Ghi nơi nó bắt đầu mất tác dụng."],
    ["Nối Ý Xa", "Nối hai ý xa nhau bằng một lý giải rõ ràng.", "Chúc mừng! Dùng một ví dụ đời thường để kiểm tra cầu nối bạn vừa dựng."],
    ["Chọn Công Cụ Đúng", "Dùng cách tiếp cận hợp với câu hỏi đang giải.", "Bạn có thêm công cụ trong tay. Nêu rõ vì sao bạn chọn cách này cho câu hỏi ấy."],
    ["Đọc Qua Thời Đại", "So ý tưởng cũ và mới với sự chú ý đến bối cảnh.", "Chúc mừng! Tìm một điều đã đổi theo thời đại và một điều vẫn đáng hỏi."],
    ["Người Dệt Mạng Ý", "Tạo một mạng liên hệ có căn cứ giữa nhiều chủ đề.", "Bạn đã dệt được một mạng ý. Thử bỏ một liên hệ yếu để những mối nối tốt lộ rõ."]
  ]],
  ["Đài Tư Biện", "Thử sức với lập luận, giả định, phản ví dụ và sự không chắc chắn.", [
    ["Gọi Tên Giả Định", "Đưa một giả định ẩn ra thành lời rõ ràng.", "Chúc mừng! Hỏi xem lập luận còn đứng vững nếu giả định ấy thay đổi."],
    ["Lập Luận Theo Bước", "Trình bày luận điểm, lý do và kết luận có trật tự.", "Bạn đã dựng được đường lập luận. Đọc lại từng bước như người mới gặp ý này."],
    ["Tìm Phản Ví Dụ", "Tìm trường hợp cụ thể làm yếu một kết luận chung.", "Chúc mừng! Một phản ví dụ tốt giúp bạn nói chính xác hơn về nơi ý tưởng đúng."],
    ["Tính Đến Ngoại Lệ", "Đưa ngoại lệ có ý nghĩa vào cách kết luận.", "Bạn đã dành chỗ cho ngoại lệ. Thử viết lại quy tắc để nó giữ được cả tính hữu ích."],
    ["Đổi Ý Khi Có Căn Cứ", "Chỉnh quan điểm khi bằng chứng mới đáng tin hơn.", "Chúc mừng! Ghi xem bằng chứng nào khiến bạn đổi ý để nhớ mình đã học như thế nào."],
    ["Giữ Điều Chưa Chắc", "Nói rõ phần chắc chắn và phần chỉ là giả thiết.", "Bạn đã biết nói vừa đủ. Hãy chỉ rõ điều gì sẽ làm độ tin cậy của bạn tăng lên."],
    ["Phản Biện Tử Tế", "Tranh luận về ý tưởng mà vẫn giữ thiện chí.", "Chúc mừng! Hãy tóm tắt ý kiến kia sao cho chính họ thấy mình được hiểu."],
    ["Kiểm Tra Thiên Kiến", "Nhận ra khi sở thích cá nhân ảnh hưởng đến đánh giá.", "Bạn đã bắt gặp một thiên kiến. Thử đọc một nguồn đáng tin mà trước đây bạn hay tránh."],
    ["Phân Tách Dữ Liệu Và Ý Nghĩa", "Tách điều quan sát được khỏi cách diễn giải.", "Chúc mừng! Bạn có thể viết hai cách diễn giải cho cùng một quan sát rồi so lại."],
    ["Người Soi Lập Luận", "Đánh giá lập luận bằng căn cứ, giới hạn và phản hồi.", "Ánh soi của bạn đã vững hơn. Lần tới, dùng nó nhẹ nhàng cả với lập luận của mình."]
  ]],
  ["Thư Các Sáng Tạo", "Từ tổng hợp và thử nghiệm đến viết lại, chia sẻ và giải thích sáng rõ.", [
    ["Chắp Nối Tư Liệu", "Gom các ý liên quan thành một cấu trúc có chủ đích.", "Chúc mừng! Hãy sắp các ghi chú theo câu hỏi bạn muốn trả lời."],
    ["Viết Bản Nháp", "Tạo bản viết đầu tiên từ hiểu biết đã tích lũy.", "Bạn đã có bản nháp để làm việc. Đánh dấu câu quan trọng nhất trước khi sửa."],
    ["Đặt Câu Hỏi Mới", "Đặt một câu hỏi có thể dẫn đến hướng tìm hiểu khác.", "Chúc mừng! Hỏi xem câu hỏi mới của bạn đòi thêm nguồn hay một cách quan sát mới."],
    ["Thử Cách Kể", "Chọn cách kể phù hợp người nghe và mục đích.", "Bạn đã tìm thêm một cách diễn đạt. Thử nói cùng ý ấy cho hai người có trải nghiệm khác nhau."],
    ["Tạo Mô Hình Nhỏ", "Dựng một biểu diễn giản lược để hiểu việc phức tạp.", "Chúc mừng! Cho mô hình một tình huống bất ngờ để xem nó giải thích được tới đâu."],
    ["Biên Tập Có Mục Đích", "Sửa văn bản theo điều người đọc cần hiểu.", "Bạn đã biết sửa vì người đọc. Thử bỏ một câu thừa và đọc lại mạch nối."],
    ["Đón Nhận Phản Hồi", "Dùng góp ý cụ thể để cải thiện bản làm.", "Chúc mừng! Chọn một góp ý bạn có thể thử ngay rồi xem bản sửa có rõ hơn không."],
    ["Sáng Tạo Có Nguồn", "Kết hợp ý mới và ghi nhận đúng đóng góp của nguồn.", "Bạn đã giữ được đường dẫn về nguồn. Đó là món quà cho người muốn đi xa hơn."],
    ["Giải Thích Cái Khó", "Diễn đạt một ý khó bằng hình ảnh hoặc ví dụ chính xác.", "Chúc mừng! Nếu ví dụ vừa dễ nhớ vừa đúng, bạn đã làm một việc rất đáng giá."],
    ["Người Khơi Mở", "Tạo nội dung giúp người khác tự đặt câu hỏi và tìm hiểu.", "Điều bạn làm đã mở đường cho người khác. Hãy chừa trong đó một câu hỏi còn sống."]
  ]],
  ["Hồ Lắng Chiếu", "Dùng việc đọc để nhìn lại mình, lắng nghe người khác và cân nhắc giá trị.", [
    ["Nhìn Lại Mình", "Nhận ra một cách nghĩ quen của bản thân qua sách.", "Chúc mừng! Viết một đoạn nhẹ nhàng về điều bạn vừa nhận ra ở mình."],
    ["Nghe Điều Chưa Nói", "Lắng nghe cảm xúc và hoàn cảnh đằng sau lời kể.", "Bạn đã nghe thêm một tầng ý. Hãy thử hỏi một câu giúp người kia được nói trọn hơn."],
    ["Chậm Trước Khi Phán", "Dừng lại để kiểm tra cách hiểu trước khi đánh giá.", "Chúc mừng! Dành một nhịp để tự hỏi mình còn thiếu thông tin gì."],
    ["Hiểu Người Qua Chữ", "Nhìn thấy kinh nghiệm khác biệt mà một câu chuyện mang đến.", "Bạn đã đến gần một đời sống khác. Ghi điều bạn hiểu thêm về lựa chọn của người ấy."],
    ["Tách Giá Trị Với Thói Quen", "Phân biệt điều mình trân trọng với điều làm vì quen.", "Chúc mừng! Thử xem một thói quen nhỏ có đang phục vụ giá trị quan trọng của bạn."],
    ["Đọc Điều Trái Lòng", "Đọc một ý khó chịu mà vẫn có thể suy xét.", "Bạn đã giữ được sự bình tĩnh khi đọc điều trái ý. Tìm một câu hỏi thật sự đáng hỏi ở đó."],
    ["Đặt Mình Trong Hoàn Cảnh", "Xét bối cảnh trước khi đánh giá quyết định của người khác.", "Chúc mừng! Hỏi xem bạn sẽ cần gì nếu đứng trong hoàn cảnh ấy."],
    ["Giữ Lời Khiêm Tốn", "Trình bày hiểu biết cùng giới hạn và sự cởi mở.", "Bạn đã để người khác có chỗ góp lời. Điều đó giúp cuộc trao đổi đi xa hơn."],
    ["Soi Lại Điều Tin", "Xem lại một niềm tin qua nhiều trải nghiệm và nguồn đọc.", "Chúc mừng! Bạn có thể giữ điều có căn cứ và đồng thời làm cho cách nhìn rộng thêm."],
    ["Người Nhìn Hai Chiều", "Quan sát quan hệ giữa hiểu mình và hiểu người.", "Bạn đã thấy hai chiều của sự hiểu. Thử đáp lại một câu chuyện bằng một câu hỏi ân cần."]
  ]],
  ["Đỉnh Hiền Triết", "Cân nhắc lợi ích, hệ quả và cách dùng kiến thức có trách nhiệm.", [
    ["Nhìn Xa Một Bước", "Cân nhắc hệ quả của lựa chọn ngoài kết quả trước mắt.", "Chúc mừng! Dành một câu để hỏi điều sẽ xảy ra sau kết quả bạn mong đợi."],
    ["Chọn Điều Đáng Học", "Ưu tiên câu hỏi có ý nghĩa lâu dài.", "Bạn đã biết chọn điều đáng dành thời gian. Hãy dành cho câu hỏi ấy một nhịp đọc bền."],
    ["Cân Nhắc Giá Trị", "Nhận ra các giá trị có thể xung đột trong một tình huống.", "Chúc mừng! Gọi rõ tên hai giá trị rồi xem mỗi bên đang bảo vệ điều gì."],
    ["Dùng Tri Thức Có Trách Nhiệm", "Cân nhắc ai được lợi hoặc bị ảnh hưởng bởi một cách áp dụng.", "Bạn đã nhìn tới những người chịu tác động. Mời thêm một góc nhìn trước khi quyết định."],
    ["Gạn Điều Thiết Yếu", "Giữ được phần cần thiết trong một vấn đề nhiều lớp.", "Chúc mừng! Thử nói điều cốt lõi bằng một câu không cần thuật ngữ."],
    ["Để Chỗ Cho Khác Biệt", "Tôn trọng khác biệt khi chia sẻ điều mình hiểu.", "Bạn đã để người khác được đi bằng nhịp của họ. Hãy giữ sự rộng rãi ấy khi góp ý."],
    ["Trao Lại Điều Học", "Chia sẻ kiến thức phù hợp nhu cầu và hoàn cảnh người nhận.", "Chúc mừng! Chọn một điều nhỏ có thể giúp ai đó ngay ở bước họ đang đứng."],
    ["Kết Hợp Hiểu Và Làm", "Đưa hiểu biết và giá trị cá nhân vào cùng một lựa chọn.", "Bạn đã đưa điều tin vào việc làm. Quan sát xem lựa chọn ấy giúp gì và cần sửa gì."],
    ["Giữ Được Điều Tốt", "Duy trì cách học và hành xử có lợi bền vững.", "Chúc mừng! Nhìn lại một điều tốt bạn đã làm đều và cho nó một chỗ trong tuần tới."],
    ["Người Gìn Giữ Tri Thức", "Giữ nguồn, truyền lại và sẵn sàng sửa sai khi cần.", "Bạn đã biết cách chuyển giao điều đã học. Để lại cả nguồn và những câu hỏi còn mở."]
  ]],
  ["Cổng Tam Tài", "Nhìn rộng từ thiên nhiên, không gian sống đến lòng người.", [
    ["Ngước Nhìn Trời", "Giữ sự tò mò trước thiên nhiên và những quy luật lớn.", "Chúc mừng! Chọn một quan sát ngoài trời và đặt cho nó một câu hỏi có thể tìm hiểu."],
    ["Đọc Dấu Đất", "Để ý địa hình, nơi chốn và điều kiện sống.", "Bạn đã nhìn kỹ nơi mình đứng. Thử mô tả điều kiện của nó trước khi đưa ra lời khuyên."],
    ["Học Từ Mùa", "Nhận ra nhịp biến đổi trong tự nhiên và đời sống.", "Chúc mừng! So hai thời điểm khác nhau để thấy điều một lần quan sát chưa kể hết."],
    ["Hiểu Cái Riêng Của Nơi Chốn", "So sánh nơi chốn mà vẫn giữ tính đặc thù của mỗi nơi.", "Bạn đã nhìn thấy tính riêng. Khi chuyển một bài học sang nơi khác, hãy kiểm tra điều kiện trước."],
    ["Lắng Nghe Lòng Người", "Tìm điều người khác thực sự cần qua sự lắng nghe.", "Chúc mừng! Hãy hỏi thêm trước khi giúp, để sự giúp đỡ đến đúng chỗ."],
    ["Kết Nối Thiên Nhiên Và Xã Hội", "Thấy cách môi trường và lựa chọn xã hội ảnh hưởng qua lại.", "Bạn đã thấy hai phía tác động nhau. Thử lần theo một hệ quả xuất hiện chậm."],
    ["Cân Bằng Tri Và Hành", "Đặt chiều sâu hiểu biết bên cạnh chất lượng hành động.", "Chúc mừng! Chọn một hiểu biết đã chín và cho nó một việc làm vừa sức."],
    ["Biết Khi Nào Cần Hỏi", "Nhận ra câu hỏi nào cần người có kinh nghiệm hoặc nguồn khác.", "Bạn đã biết lúc nào cần tìm thêm người đồng hành. Một lời hỏi đúng chỗ tiết kiệm rất nhiều đường vòng."],
    ["Giữ Tâm Mở", "Tiếp tục học và sửa cách hiểu dù đã biết nhiều.", "Chúc mừng! Xem lại một điều từng tin chắc và cho bằng chứng mới cơ hội lên tiếng."],
    ["Người Nối Trời Đất", "Đặt con người, nơi sống và tự nhiên vào cùng một cách nhìn.", "Bạn đã đi qua nhiều tầng hiểu biết. Hãy tiếp tục dành sự chú ý cho điều nhỏ bé ngay trước mắt."]
  ]],
  ["Đỉnh Thông Tuệ", "Chặng cuối của bản đồ đọc sách.", [
    ["Bậc Thầy Thông Tuệ", "Trên thông thiên văn, dưới tường địa lý, giữa đắc nhân tâm.", "Chúc mừng chặng 111! Mang sự hiểu biết về trời đất vào cách bạn lắng nghe con người, rồi vẫn mở một trang mới với sự tò mò của ngày đầu."]
  ]]
];

let level = 1;

export const journeyLands = lands.map(([name, description, entries], index) => ({
  name, description, index,
  levels: entries.map(([title, insight, quote], step) => ({ level: level++, title, insight, quote, land: index, step }))
}));

export const journeyLevels = journeyLands.flatMap(land => land.levels);
