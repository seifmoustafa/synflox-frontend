# 📊 Professional Charts System - Complete Documentation Guide

## 🎯 Overview

The Professional Charts System is a comprehensive, enterprise-grade charting solution built with Chart.js and React. It provides a generic, reusable component system with advanced filtering, professional styling, and full localization support.

## 🚀 Quick Start

### Basic Usage

```tsx
import { ProfessionalChart } from "@/components/charts/professional-chart";

const MyChart = () => {
  const data = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May"],
    datasets: [
      {
        label: "Sales",
        data: [12, 19, 3, 5, 2],
        backgroundColor: "#8884d8",
        borderColor: "#8884d8",
      },
    ],
  };

  return (
    <ProfessionalChart
      title="Monthly Sales"
      description="Sales data for the first quarter"
      data={data}
      type="line"
    />
  );
};
```

## 📋 Component API

### ProfessionalChart Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | - | Chart title |
| `description` | `string` | - | Chart description |
| `data` | `ChartData` | - | Chart.js data object |
| `type` | `"line" \| "bar" \| "pie" \| "doughnut" \| "radar" \| "scatter" \| "bubble"` | - | Chart type |
| `options` | `ChartOptions` | `{}` | Custom Chart.js options |
| `className` | `string` | - | Additional CSS classes |
| `exportable` | `boolean` | `true` | Enable export functionality |
| `resizable` | `boolean` | `true` | Enable resize functionality |
| `filterable` | `boolean` | `true` | Enable dataset filtering |
| `height` | `number \| string` | `400` | Chart height |
| `width` | `number \| string` | `"100%"` | Chart width |
| `theme` | `"light" \| "dark" \| "auto"` | `"auto"` | Chart theme |
| `animation` | `boolean \| object` | `true` | Animation settings |
| `responsive` | `boolean` | `true` | Responsive behavior |
| `maintainAspectRatio` | `boolean` | `false` | Maintain aspect ratio |
| `plugins` | `object` | `{}` | Plugin configurations |
| `scales` | `object` | `{}` | Scale configurations |
| `elements` | `object` | `{}` | Element configurations |
| `interaction` | `object` | `{}` | Interaction settings |
| `dataTransform` | `object` | `{}` | Data transformation options |
| `exportOptions` | `object` | `{}` | Export configuration |
| `loading` | `boolean` | `false` | Loading state |
| `error` | `string \| null` | `null` | Error message |
| `onError` | `function` | - | Error handler |
| `ariaLabel` | `string` | - | Accessibility label |
| `ariaDescription` | `string` | - | Accessibility description |
| `onReset` | `function` | - | Reset handler |

## 🎨 Chart Types

### 1. Line Charts
Perfect for showing trends over time.

```tsx
<ProfessionalChart
  title="Sales Trend"
  description="Monthly sales data"
  data={lineData}
  type="line"
  filterable={true}
/>
```

**Features:**
- Smooth curves with customizable tension
- Multi-series support
- Real-time updates
- Interactive tooltips

### 2. Area Charts
Great for emphasizing magnitude of change.

```tsx
<ProfessionalChart
  title="Revenue Growth"
  description="Quarterly revenue with filled areas"
  data={areaData}
  type="line"
  options={{
    elements: {
      line: { fill: true }
    }
  }}
/>
```

**Features:**
- Gradient fills
- Stacked areas
- Smooth animations
- Range visualization

### 3. Bar Charts
Ideal for comparing categories.

```tsx
<ProfessionalChart
  title="Product Sales"
  description="Sales by product category"
  data={barData}
  type="bar"
  filterable={true}
/>
```

**Features:**
- Horizontal and vertical bars
- Stacked and grouped options
- Custom colors
- Interactive filtering

### 4. Pie Charts
Perfect for showing proportional data.

```tsx
<ProfessionalChart
  title="Market Share"
  description="Market share by region"
  data={pieData}
  type="pie"
  filterable={false}
/>
```

**Features:**
- Doughnut charts
- Exploded segments
- Custom colors
- Percentage labels

### 5. Scatter Charts
Excellent for showing relationships between variables.

```tsx
<ProfessionalChart
  title="Price vs Performance"
  description="Correlation between price and performance"
  data={scatterData}
  type="scatter"
  filterable={true}
/>
```

**Features:**
- Bubble charts
- Multi-series support
- Correlation analysis
- Custom point styles

### 6. Radar Charts
Great for multi-dimensional data visualization.

```tsx
<ProfessionalChart
  title="Performance Analysis"
  description="Multi-dimensional performance metrics"
  data={radarData}
  type="radar"
  filterable={true}
/>
```

**Features:**
- Multi-series comparison
- Filled areas
- Custom scales
- Interactive legends

### 7. Mixed Charts
Combine different chart types for comprehensive views.

```tsx
<ProfessionalChart
  title="Sales & Revenue"
  description="Combined bar and line chart"
  data={mixedData}
  type="line"
  options={{
    scales: {
      y: { type: "linear", position: "left" },
      y1: { type: "linear", position: "right", grid: { drawOnChartArea: false } }
    }
  }}
/>
```

**Features:**
- Multiple chart types
- Dual y-axes
- Custom datasets
- Advanced scaling

### 8. Heatmap Charts
Perfect for pattern recognition and intensity visualization.

```tsx
<ProfessionalChart
  title="Activity Heatmap"
  description="Daily activity patterns"
  data={heatmapData}
  type="scatter"
  filterable={false}
/>
```

**Features:**
- Color intensity mapping
- Calendar views
- Correlation matrices
- Geographic data

### 9. Treemap Charts
Excellent for hierarchical data visualization.

```tsx
<ProfessionalChart
  title="Budget Allocation"
  description="Budget distribution by department"
  data={treemapData}
  type="pie"
  filterable={false}
/>
```

**Features:**
- Hierarchical structure
- Nested rectangles
- Size-based encoding
- Interactive drilling

### 10. Timeline Charts
Great for project tracking and milestone visualization.

```tsx
<ProfessionalChart
  title="Project Timeline"
  description="Project milestones and progress"
  data={timelineData}
  type="line"
  filterable={false}
/>
```

**Features:**
- Milestone tracking
- Progress visualization
- Gantt-style views
- Resource allocation

### 11. Funnel Charts
Perfect for conversion process visualization.

```tsx
<ProfessionalChart
  title="Sales Funnel"
  description="Customer conversion process"
  data={funnelData}
  type="bar"
  filterable={false}
/>
```

**Features:**
- Conversion tracking
- Step-by-step process
- Drop-off analysis
- Performance metrics

### 12. Gauge Charts
Excellent for KPI and performance indicators.

```tsx
<ProfessionalChart
  title="Performance Gauge"
  description="Current performance level"
  data={gaugeData}
  type="pie"
  filterable={false}
/>
```

**Features:**
- KPI visualization
- Performance indicators
- Threshold levels
- Multi-gauge support

## 🔧 Advanced Configuration

### Custom Styling

```tsx
<ProfessionalChart
  title="Custom Styled Chart"
  description="Chart with custom styling"
  data={data}
  type="line"
  height={500}
  width="100%"
  theme="dark"
  animation={{
    duration: 2000,
    easing: "easeOutBounce"
  }}
  plugins={{
    legend: {
      position: "bottom",
      display: true
    },
    tooltip: {
      enabled: true,
      mode: "nearest",
      intersect: false
    }
  }}
  scales={{
    x: {
      display: true,
      title: "Time Period",
      stacked: false
    },
    y: {
      display: true,
      title: "Value",
      stacked: false,
      beginAtZero: true
    }
  }}
  elements={{
    point: {
      radius: 6,
      hoverRadius: 8,
      borderWidth: 2
    },
    line: {
      tension: 0.6,
      borderWidth: 3
    }
  }}
  interaction={{
    mode: "nearest",
    intersect: false
  }}
/>
```

### Data Transformation

```tsx
<ProfessionalChart
  title="Transformed Data"
  description="Chart with data transformation"
  data={rawData}
  type="bar"
  dataTransform={{
    sort: true,
    reverse: false,
    filter: (item) => item.value > 10,
    map: (item) => ({ ...item, value: item.value * 2 })
  }}
/>
```

### Export Configuration

```tsx
<ProfessionalChart
  title="Exportable Chart"
  description="Chart with custom export options"
  data={data}
  type="line"
  exportOptions={{
    formats: ["png", "jpeg", "pdf", "svg"],
    filename: "my-chart",
    quality: 0.9
  }}
/>
```

## 🎛️ Filtering System

The charts include a powerful filtering system for multi-series data:

### Basic Filtering

```tsx
<ProfessionalChart
  title="Filterable Chart"
  description="Chart with dataset filtering"
  data={multiSeriesData}
  type="line"
  filterable={true}
/>
```

### Filtering Features:
- **Show/Hide datasets** with checkboxes
- **Toggle all** functionality
- **Real-time updates** when filters change
- **Visual feedback** for active/inactive datasets
- **Accessibility support** with proper labels

## 🌍 Localization

The charts system supports full localization:

### English (en.ts)
```typescript
charts: {
  common: {
    sales: "Sales",
    revenue: "Revenue",
    users: "Users",
    // ... more terms
  },
  line: {
    basic: {
      title: "Basic Line Chart",
      description: "Simple line chart showing trends"
    }
  }
}
```

### Arabic (ar.ts)
```typescript
charts: {
  common: {
    sales: "المبيعات",
    revenue: "الإيرادات",
    users: "المستخدمون",
    // ... more terms
  },
  line: {
    basic: {
      title: "رسم بياني خطي أساسي",
      description: "رسم بياني خطي بسيط يوضح الاتجاهات"
    }
  }
}
```

### Using Localization

```tsx
import { useI18n } from "@/providers/i18n-provider";

const MyChart = () => {
  const { t } = useI18n();
  
  return (
    <ProfessionalChart
      title={t("charts.line.basic.title")}
      description={t("charts.line.basic.description")}
      data={data}
      type="line"
    />
  );
};
```

## 🎨 Professional Styling

### Color Palettes

The system includes professional color palettes:

```tsx
const professionalColors = [
  "#8884d8", // Primary
  "#82ca9d", // Success
  "#ffc658", // Warning
  "#ff7300", // Orange
  "#0088FE", // Blue
  "#00C49F", // Green
  "#FFBB28", // Yellow
  "#FF8042", // Red-orange
  "#AF19FF", // Purple
  "#FF1919", // Red
];
```

### Theme Support

```tsx
<ProfessionalChart
  title="Themed Chart"
  description="Chart with theme support"
  data={data}
  type="line"
  theme="dark" // or "light" or "auto"
/>
```

## 📱 Responsive Design

Charts automatically adapt to different screen sizes:

```tsx
<ProfessionalChart
  title="Responsive Chart"
  description="Chart that adapts to screen size"
  data={data}
  type="line"
  responsive={true}
  maintainAspectRatio={false}
  height="auto"
/>
```

## ♿ Accessibility

The charts include comprehensive accessibility features:

```tsx
<ProfessionalChart
  title="Accessible Chart"
  description="Chart with accessibility features"
  data={data}
  type="line"
  ariaLabel="Sales data chart showing monthly trends"
  ariaDescription="Interactive chart displaying sales performance over time"
/>
```

## 🔄 Loading and Error States

Handle loading and error states gracefully:

```tsx
<ProfessionalChart
  title="Chart with States"
  description="Chart with loading and error handling"
  data={data}
  type="line"
  loading={isLoading}
  error={error}
  onError={(error) => console.error("Chart error:", error)}
/>
```

## 📊 Data Format

### Standard Chart.js Format

```typescript
interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[] | { x: number; y: number; r?: number }[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
    fill?: boolean;
    tension?: number;
    // ... other Chart.js dataset options
  }>;
}
```

### Example Data

```typescript
const lineData = {
  labels: ["Jan", "Feb", "Mar", "Apr", "May"],
  datasets: [
    {
      label: "Sales",
      data: [12, 19, 3, 5, 2],
      backgroundColor: "rgba(136, 132, 216, 0.2)",
      borderColor: "#8884d8",
      borderWidth: 2,
      tension: 0.4,
      fill: true,
    },
    {
      label: "Revenue",
      data: [20, 30, 25, 40, 35],
      backgroundColor: "rgba(130, 202, 157, 0.2)",
      borderColor: "#82ca9d",
      borderWidth: 2,
      tension: 0.4,
      fill: true,
    },
  ],
};

const scatterData = {
  labels: ["Point 1", "Point 2", "Point 3"],
  datasets: [
    {
      label: "Correlation",
      data: [
        { x: 10, y: 20 },
        { x: 15, y: 25 },
        { x: 20, y: 30 },
      ],
      backgroundColor: "#ffc658",
      borderColor: "#ffc658",
    },
  ],
};
```

## 🚀 Performance Optimization

### Best Practices

1. **Use appropriate chart types** for your data
2. **Enable filtering** for multi-series charts
3. **Optimize data size** for better performance
4. **Use responsive design** for mobile compatibility
5. **Implement proper error handling**

### Performance Tips

```tsx
// Good: Use appropriate data size
const optimizedData = {
  labels: data.slice(0, 100), // Limit to 100 points
  datasets: [/* ... */]
};

// Good: Enable filtering for large datasets
<ProfessionalChart
  data={largeDataset}
  type="line"
  filterable={true}
/>

// Good: Use loading states
<ProfessionalChart
  data={data}
  type="line"
  loading={isLoading}
/>
```

## 🔧 Customization Examples

### Custom Chart with All Options

```tsx
<ProfessionalChart
  title="Fully Customized Chart"
  description="Chart with all customization options"
  data={data}
  type="line"
  className="my-custom-chart"
  height={600}
  width="100%"
  theme="dark"
  animation={{
    duration: 1500,
    easing: "easeInOutCubic"
  }}
  responsive={true}
  maintainAspectRatio={false}
  plugins={{
    legend: {
      position: "bottom",
      display: true
    },
    tooltip: {
      enabled: true,
      mode: "nearest",
      intersect: false
    },
    title: {
      display: true,
      text: "Custom Title",
      position: "top"
    }
  }}
  scales={{
    x: {
      display: true,
      title: "Time Period",
      stacked: false
    },
    y: {
      display: true,
      title: "Value",
      stacked: false,
      beginAtZero: true
    }
  }}
  elements={{
    point: {
      radius: 5,
      hoverRadius: 7,
      borderWidth: 2
    },
    line: {
      tension: 0.5,
      borderWidth: 3
    },
    bar: {
      borderWidth: 1,
      borderRadius: 6
    }
  }}
  interaction={{
    mode: "nearest",
    intersect: false
  }}
  dataTransform={{
    sort: true,
    reverse: false
  }}
  exportOptions={{
    formats: ["png", "jpeg", "pdf"],
    filename: "custom-chart",
    quality: 0.95
  }}
  exportable={true}
  resizable={true}
  filterable={true}
  ariaLabel="Custom chart with full configuration"
  ariaDescription="Interactive chart with all available options enabled"
/>
```

## 📚 Complete Examples

### Sales Dashboard

```tsx
const SalesDashboard = () => {
  const salesData = {
    labels: ["Q1", "Q2", "Q3", "Q4"],
    datasets: [
      {
        label: "Sales",
        data: [100, 120, 110, 140],
        backgroundColor: "#8884d8",
        borderColor: "#8884d8",
      },
      {
        label: "Target",
        data: [90, 100, 110, 120],
        backgroundColor: "transparent",
        borderColor: "#82ca9d",
        borderDash: [5, 5],
      },
    ],
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <ProfessionalChart
        title="Quarterly Sales"
        description="Sales vs targets for each quarter"
        data={salesData}
        type="line"
        filterable={true}
        height={400}
      />
      
      <ProfessionalChart
        title="Sales Distribution"
        description="Sales by product category"
        data={pieData}
        type="pie"
        filterable={false}
        height={400}
      />
    </div>
  );
};
```

### Performance Analytics

```tsx
const PerformanceAnalytics = () => {
  const performanceData = {
    labels: ["Speed", "Quality", "Reliability", "Efficiency", "Innovation"],
    datasets: [
      {
        label: "Current Performance",
        data: [80, 70, 90, 85, 75],
        backgroundColor: "rgba(136, 132, 216, 0.2)",
        borderColor: "#8884d8",
        borderWidth: 2,
      },
      {
        label: "Target Performance",
        data: [90, 80, 95, 90, 85],
        backgroundColor: "rgba(130, 202, 157, 0.2)",
        borderColor: "#82ca9d",
        borderWidth: 2,
      },
    ],
  };

  return (
    <ProfessionalChart
      title="Performance Radar"
      description="Multi-dimensional performance analysis"
      data={performanceData}
      type="radar"
      filterable={true}
      height={500}
      plugins={{
        legend: {
          position: "top",
          display: true
        }
      }}
    />
  );
};
```

## 🎯 Conclusion

The Professional Charts System provides a comprehensive, enterprise-grade solution for data visualization. With its generic, reusable components, advanced filtering capabilities, professional styling, and full localization support, it's perfect for any application requiring high-quality charts.

Key benefits:
- ✅ **Generic and reusable** - Pass data and get professional charts
- ✅ **Advanced filtering** - Show/hide datasets with checkboxes
- ✅ **Professional styling** - Enterprise-grade appearance
- ✅ **Full localization** - Support for multiple languages
- ✅ **Responsive design** - Works on all devices
- ✅ **Accessibility** - WCAG compliant
- ✅ **Export capabilities** - PNG, JPEG, PDF, SVG
- ✅ **Performance optimized** - Efficient rendering
- ✅ **TypeScript support** - Full type safety
- ✅ **Comprehensive documentation** - Easy to use and customize

Start building amazing charts today! 🚀
