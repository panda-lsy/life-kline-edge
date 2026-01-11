# 人生 K 线 API 文档

本文档描述人生 K 线应用的 API 接口规范。

## 📋 目录

- [边缘函数 API](#边缘函数-api)
- [前端服务层 API](#前端服务层-api)
- [数据模型](#数据模型)
- [错误码](#错误码)

---

## 边缘函数 API

边缘函数部署在 ESA Edge Functions 或 Cloudflare Workers,提供低延迟的服务端计算能力。

### 基础信息

- **Base URL**: `https://your-worker.workers.dev` 或 `https://your-domain.com/api`
- **Content-Type**: `application/json`
- **API Version**: `v1`

### 接口列表

#### 1. 八字分析接口

生成八字分析和 K 线图数据。

**端点**: `POST /api/kline-analysis`

**请求头**:

```http
Content-Type: application/json
```

**请求体**:

```json
{
  "name": "string",      // 姓名(可选)
  "birthDate": "string", // 出生日期(必填,格式: YYYY-MM-DD)
  "birthTime": "string", // 出生时间(可选,格式: HH:mm,默认: 12:00)
  "gender": "string"     // 性别(可选,可选值: "male", "female", "other")
}
```

**请求示例**:

```javascript
const response = await fetch('/api/kline-analysis', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: '张三',
    birthDate: '1990-01-01',
    birthTime: '12:30',
    gender: 'male',
  }),
});

const data = await response.json();
```

**响应体**:

```json
{
  "id": "uuid-v4",
  "name": "张三",
  "birthData": {
    "birthDate": "1990-01-01",
    "birthTime": "12:30",
    "gender": "male"
  },
  "bazi": {
    "year": "甲子",
    "month": "乙丑",
    "day": "丙寅",
    "hour": "丁卯",
    "wuxing": {
      "year": "金",
      "month": "木",
      "day": "火",
      "hour": "火"
    },
    "shishen": {
      "year": "伤官",
      "month": "食神",
      "day": "正财",
      "hour": "偏财"
    }
  },
  "klineData": [
    {
      "year": 1990,
      "age": 0,
      "open": 100.00,
      "high": 105.50,
      "low": 98.00,
      "close": 102.30,
      "volume": 5000
    }
    // ... 更多年份数据
  ],
  "dimensions": {
    "career": 75,   // 事业运 (0-100)
    "wealth": 68,   // 财运 (0-100)
    "health": 82,   // 健康 (0-100)
    "love": 71,     // 感情 (0-100)
    "study": 79     // 学业 (0-100)
  },
  "createdAt": "2026-01-09T12:00:00.000Z"
}
```

**响应字段说明**:

| 字段 | 类型 | 说明 |
|------|------|------|
| id | string | 记录唯一标识 |
| name | string | 姓名 |
| birthData | object | 出生信息 |
| bazi | object | 八字信息 |
| bazi.year | string | 年柱 (天干地支) |
| bazi.month | string | 月柱 |
| bazi.day | string | 日柱 |
| bazi.hour | string | 时柱 |
| bazi.wuxing | object | 五行属性 |
| bazi.shishen | object | 十神属性 |
| klineData | array | K 线数据 (101条,0-100岁) |
| dimensions | object | 五维运势评分 |
| createdAt | string | 创建时间 (ISO 8601) |

**错误响应**:

```json
{
  "error": "错误类型",
  "message": "错误详细信息"
}
```

**错误码**:

| HTTP 状态码 | 错误类型 | 说明 |
|------------|---------|------|
| 400 | ValidationError | 请求参数验证失败 |
| 405 | MethodNotAllowed | 不允许的请求方法 |
| 500 | InternalServerError | 服务器内部错误 |

---

## 前端服务层 API

前端服务层提供与边缘函数交互的 TypeScript 接口。

### BaziService

八字计算服务。

#### TypeScript 接口

```typescript
// src/services/baziService.ts

export interface BirthData {
  name?: string;
  birthDate: string; // YYYY-MM-DD
  birthTime?: string; // HH:mm
  gender?: 'male' | 'female' | 'other';
}

export interface BaziInfo {
  year: string;   // 年柱
  month: string;  // 月柱
  day: string;    // 日柱
  hour: string;   // 时柱
  wuxing: {
    year: string;
    month: string;
    day: string;
    hour: string;
  };
  shishen?: {
    year: string;
    month: string;
    day: string;
    hour: string;
  };
}

export interface BaziResult {
  id: string;
  name: string;
  birthData: BirthData;
  bazi: BaziInfo;
  klineData: KLineDataPoint[];
  dimensions: DimensionScores;
  createdAt: string;
}

/**
 * 计算八字
 * @param birthData 出生信息
 * @returns 八字计算结果
 */
export async function calculateBazi(
  birthData: BirthData
): Promise<BaziResult>;
```

#### 使用示例

```typescript
import { calculateBazi } from '@/services/baziService';

const result = await calculateBazi({
  name: '张三',
  birthDate: '1990-01-01',
  birthTime: '12:30',
  gender: 'male',
});

console.log(result.bazi); // 八字信息
console.log(result.klineData); // K 线数据
console.log(result.dimensions); // 运势评分
```

### KLineService

K 线图数据服务。

#### TypeScript 接口

```typescript
// src/services/klineService.ts

export interface KLineDataPoint {
  year: number;
  age: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface KLineAnalysis {
  maxPrice: number;
  minPrice: number;
  avgPrice: number;
  volatility: number;
  trend: 'up' | 'down' | 'stable';
}

/**
 * 分析 K 线数据
 * @param klineData K 线数据
 * @returns 分析结果
 */
export function analyzeKLine(
  klineData: KLineDataPoint[]
): KLineAnalysis;

/**
 * 预测未来趋势
 * @param klineData 历史 K 线数据
 * @param years 预测年数
 * @returns 预测数据
 */
export function predictTrend(
  klineData: KLineDataPoint[],
  years: number
): KLineDataPoint[];
```

#### 使用示例

```typescript
import { analyzeKLine, predictTrend } from '@/services/klineService';

const analysis = analyzeKLine(klineData);
console.log(analysis.trend); // 'up' | 'down' | 'stable'

const prediction = predictTrend(klineData, 10);
console.log(prediction); // 未来10年的预测数据
```

### HistoryService

历史记录管理服务。

#### TypeScript 接口

```typescript
// src/services/historyService.ts

export interface HistoryRecord {
  id: string;
  name: string;
  birthData: BirthData;
  bazi: BaziInfo;
  klineData: KLineDataPoint[];
  dimensions: DimensionScores;
  createdAt: string;
}

/**
 * 获取所有历史记录
 */
export function getHistory(): HistoryRecord[];

/**
 * 保存记录
 * @param record 记录数据
 */
export function saveRecord(record: Omit<HistoryRecord, 'id' | 'createdAt'>): void;

/**
 * 删除记录
 * @param id 记录 ID
 */
export function deleteRecord(id: string): void;

/**
 * 清空所有记录
 */
export function clearHistory(): void;
```

#### 使用示例

```typescript
import { getHistory, saveRecord, deleteRecord } from '@/services/historyService';

// 获取历史
const history = getHistory();

// 保存记录
saveRecord({
  name: '张三',
  birthData: { ... },
  bazi: { ... },
  klineData: [ ... ],
  dimensions: { ... },
});

// 删除记录
deleteRecord('record-id');
```

### ExportService

导出服务。

#### TypeScript 接口

```typescript
// src/services/exportService.ts

export interface ExportOptions {
  format: 'pdf' | 'image';
  quality?: number;
  includeDimensions?: boolean;
  includeDetails?: boolean;
}

/**
 * 导出为 PDF
 * @param data 数据
 * @param options 选项
 */
export async function exportToPDF(
  data: BaziResult,
  options?: Partial<ExportOptions>
): Promise<Blob>;

/**
 * 导出为图片
 * @param element DOM 元素
 * @param options 选项
 */
export async function exportToImage(
  element: HTMLElement,
  options?: Partial<ExportOptions>
): Promise<Blob>;
```

#### 使用示例

```typescript
import { exportToPDF, exportToImage } from '@/services/exportService';

// 导出 PDF
const pdfBlob = await exportToPDF(data, {
  quality: 0.9,
  includeDimensions: true,
  includeDetails: true,
});

// 下载 PDF
downloadFile(pdfBlob, 'life-kline.pdf');

// 导出图片
const imageBlob = await exportToImage(shareCardRef.current);
downloadFile(imageBlob, 'life-kline.png');
```

---

## 数据模型

### BirthData

出生信息模型。

```typescript
interface BirthData {
  name?: string;           // 姓名
  birthDate: string;       // 出生日期 (YYYY-MM-DD)
  birthTime?: string;      // 出生时间 (HH:mm)
  gender?: 'male' | 'female' | 'other'; // 性别
}
```

### BaziInfo

八字信息模型。

```typescript
interface BaziInfo {
  year: string;   // 年柱 (例: "甲子")
  month: string;  // 月柱
  day: string;    // 日柱
  hour: string;   // 时柱
  wuxing: {       // 五行
    year: string; // 金/木/水/火/土
    month: string;
    day: string;
    hour: string;
  };
  shishen?: {     // 十神 (可选)
    year: string;
    month: string;
    day: string;
    hour: string;
  };
}
```

### KLineDataPoint

K 线数据点模型。

```typescript
interface KLineDataPoint {
  year: number;   // 年份
  age: number;    // 年龄
  open: number;   // 开盘价
  high: number;   // 最高价
  low: number;    // 最低价
  close: number;  // 收盘价
  volume: number; // 成交量
}
```

### DimensionScores

五维运势评分模型。

```typescript
interface DimensionScores {
  career: number; // 事业运 (0-100)
  wealth: number; // 财运 (0-100)
  health: number; // 健康 (0-100)
  love: number;   // 感情 (0-100)
  study: number;  // 学业 (0-100)
}
```

---

## 错误码

### HTTP 状态码

| 状态码 | 名称 | 说明 |
|--------|------|------|
| 200 | OK | 请求成功 |
| 400 | Bad Request | 请求参数错误 |
| 404 | Not Found | 资源不存在 |
| 405 | Method Not Allowed | 请求方法不允许 |
| 500 | Internal Server Error | 服务器内部错误 |

### 业务错误码

| 错误码 | 说明 | 处理建议 |
|--------|------|----------|
| INVALID_DATE | 日期格式无效 | 检查日期格式是否为 YYYY-MM-DD |
| INVALID_TIME | 时间格式无效 | 检查时间格式是否为 HH:mm |
| INVALID_GENDER | 性别值无效 | 检查性别是否为 male/female/other |
| MISSING_REQUIRED_FIELD | 缺少必填字段 | 检查是否提供 birthDate |
| CALCULATION_FAILED | 计算失败 | 检查输入数据,稍后重试 |
| RATE_LIMIT_EXCEEDED | 超出速率限制 | 降低请求频率 |
| INTERNAL_ERROR | 内部错误 | 联系技术支持 |

---

## 使用示例

### 完整流程示例

```typescript
// 1. 导入服务
import { calculateBazi } from '@/services/baziService';
import { saveRecord } from '@/services/historyService';
import { exportToPDF } from '@/services/exportService';

// 2. 用户提交表单
const birthData = {
  name: '张三',
  birthDate: '1990-01-01',
  birthTime: '12:30',
  gender: 'male' as const,
};

// 3. 调用 API 计算
try {
  const result = await calculateBazi(birthData);

  // 4. 保存到历史
  saveRecord(result);

  // 5. 显示结果
  renderResult(result);

  // 6. 导出 PDF (用户点击)
  const pdf = await exportToPDF(result);
  downloadFile(pdf, `${result.name}-人生K线.pdf`);

} catch (error) {
  console.error('计算失败:', error);
  showErrorToast('计算失败,请稍后重试');
}
```

### React Hook 示例

```typescript
import { useState } from 'react';
import { calculateBazi } from '@/services/baziService';
import { useToast } from '@/components/Toast';

function useBaziCalculation() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<BaziResult | null>(null);
  const { error } = useToast();

  const calculate = async (birthData: BirthData) => {
    setLoading(true);
    try {
      const result = await calculateBazi(birthData);
      setData(result);
      return result;
    } catch (err) {
      error('计算失败,请检查输入信息');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { calculate, loading, data };
}
```

---

## 版本历史

| 版本 | 日期 | 变更 |
|------|------|------|
| v1.0.0 | 2026-01-09 | 初始版本 |

---

**最后更新**: 2026-01-09
