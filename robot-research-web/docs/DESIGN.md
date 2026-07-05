# Theme Name: 极客终端 (Geek Terminal)
# Vibe & Description: 深色金融投研终端，融合CRT复古终端美学与现代数据仪表盘。以荧光绿和琥珀橙为核心色调，等宽字体营造专业CLI氛围，扫描线纹理强化终端沉浸感。适合机器人产业链投研分析平台的专业、高密度信息呈现。

## Vibe
- CRT复古终端 × 现代金融数据终端（Bloomberg/Wind风格）

## Color
- Primary: #00E676（荧光绿，核心强调色）
- On Primary: #0A0E0A（近黑）
- Accent: #FFB000（琥珀橙，次强调色）
- On Accent: #0A0E0A
- Background: #0A0E0A（极深绿黑）
- Foreground: #C8E6C9（柔和荧光绿白）
- Muted: #111811（深绿灰）
- Muted Foreground: #6B8E6B（暗绿灰）
- Border: #1A2E1A（深绿边框）
- Card: #0D130D（卡片底色）
- Secondary: #1B3A1B（深绿，次操作）
- Destructive: #FF4444
- Success: #00E676
- Warning: #FFB000
- Info: #4FC3F7

## Typography
- Heading: Source Han Mono SC (family: 'Source Han Mono SC', monospace, weight: 700, url: https://resource-static.cdn.bcebos.com/fonts/SourceHanMonoSC-Regular.woff2)
- Body: Source Han Mono SC (family: 'Source Han Mono SC', monospace, weight: 400)
- 数字/代码: JetBrains Mono / 系统等宽

## Visual Language
- 核心视觉签名：CRT扫描线纹理（repeating-linear-gradient模拟）+ 荧光绿辉光（text-shadow glow）
- 材质与深度：卡片使用极深绿底+细绿边框，无大投影；通过亮度差异区分层级
- 容器与按钮：直角/小圆角卡片，绿色描边，hover时辉光增强
- 布局节奏：高密度信息排列，等宽字体对齐数字，留白克制

## Animation
- 入场：元素逐行fade-in，模拟终端输出
- 交互：hover辉光增强，节点展开/折叠平滑过渡
- 光标：闪烁的下划线光标（blink动画）

## Forbidden
- 禁大块纯色铺底（Primary/Accent仅小面积焦点）
- 禁圆角过大、通用投影、渐变背景充当核心视觉
- 禁Emoji图标，使用lucide-react

## Additional Notes
- 所有用户可见文案使用中文
- 图表配色基于荧光绿/琥珀橙色相派生
- 深色模式为默认且唯一模式