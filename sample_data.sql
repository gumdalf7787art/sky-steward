-- Insert Sample Businesses
INSERT INTO businesses (id, user_id, church_id, biz_no, name, category, address, phone, description, images)
VALUES 
('sample-biz-bakery', '93163a21-cfc2-4524-a594-fbe62de77c3c', null, '123-45-67890', '은혜로운 베이커리', 'restaurant', '서울 서초구 서초대로 321', '02-123-4567', '매일 아침 새벽 기도로 시작하는 정직한 베이커리입니다. 천연 발효종을 사용하여 건강하고 속이 편한 빵을 만듭니다.', '["businesses/sample-bakery-1.jpg"]'),
('sample-biz-math', '93163a21-cfc2-4524-a594-fbe62de77c3c', null, '987-65-43210', '하늘 꿈 수학학원', 'education', '서울 위례대로 777', '02-777-8888', '하나님이 주신 지혜로 아이들의 꿈을 키워나가는 수학 전문 학원입니다. 초심을 잃지 않는 명쾌한 강의로 함께합니다.', '["businesses/sample-math-1.jpg"]');

-- Insert Sample Menus for Physiocompany
INSERT INTO menus (id, business_id, name, price, description)
VALUES 
('m1', '7bbb8867-d638-4007-b1b0-315bf1955a96', '체형 교정 1:1 세션', '80,000원', '정밀 측정을 통한 맞춤형 체형 교정'),
('m2', '7bbb8867-d638-4007-b1b0-315bf1955a96', '재활 필라테스', '60,000원', '신체 균형과 근력을 강화하는 프로그램');

-- Insert Sample Menus for Bakery
INSERT INTO menus (id, business_id, name, price, description)
VALUES 
('m3', 'sample-biz-bakery', '시그니처 단팥빵', '2,500원', '국산 팥으로 직접 끓여 달지 않고 고소한 맛'),
('m4', 'sample-biz-bakery', '천연발효 깜빠뉴', '6,000원', '72시간 저온 숙성으로 깊은 풍미가 살아있습니다'),
('m5', 'sample-biz-bakery', '카페라떼', '4,500원', '스페셜티 원두를 사용한 부드러운 우유와의 조화');

-- Insert Sample Reviews
INSERT INTO reviews (id, business_id, user_id, rating, comment)
VALUES 
('r1', 'sample-biz-bakery', '93163a21-cfc2-4524-a594-fbe62de77c3c', 5, '빵이 정말 신선하고 맛있어요! 교회 분들께도 추천해 드렸습니다.'),
('r2', 'sample-biz-bakery', '93163a21-cfc2-4524-a594-fbe62de77c3c', 4, '조금 늦게 가면 품절되는 빵들이 많아서 아쉬울 정도입니다.'),
('r3', '7bbb8867-d638-4007-b1b0-315bf1955a96', '93163a21-cfc2-4524-a594-fbe62de77c3c', 5, '어깨 통증이 심했는데 원장님이 정성껏 봐주셔서 많이 좋아졌어요.');
