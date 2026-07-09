
## Quy trình làm việc
Từ giờ mỗi Sprint đều theo quy trình:
```plaintext
Đặc tả
    ↓
Review
    ↓
Code
    ↓
Unit Test
    ↓
Demo
    ↓
Review
    ↓
Khóa API
```

## Mục tiêu cuối cùng

Mình muốn xây cái này như một framework, không phải một project.  
Tức là sau này bạn chỉ cần:
```typescript
const feed = new CsvFeed(file);

const engine = new TradingEngine({
    strategy: new TrendStrategy(),
});

await engine.run(feed);
```

```cpp
//*.mq5

BrokerFeed feed;
TradingEngine engine(strategy);

engine.Run(feed);
```

## Kết
Mỗi Sprint chỉ hoàn thành khi đạt đủ 4 tiêu chí:

* ✅ Thiết kế rõ ràng.
* ✅ Code sạch, dễ mở rộng.
* ✅ Có Unit Test.
* ✅ Có thể đối chiếu kết quả với MT5 hoặc dữ liệu chuẩn khi áp dụng.


### Sprint 1
```plaintext
01. Models
    ✅ Candle

02. Feed Interface

03. CSV Stream Reader

04. CSV Parser

05. Candle Factory

06. Validator

07. CsvFeed

08. Unit Test
```

```plaintext
src/
└── trading/
    └── core/
        └── models/
            └── Candle.ts
```







