
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

```mq5
BrokerFeed feed;
TradingEngine engine(strategy);

engine.Run(feed);
```