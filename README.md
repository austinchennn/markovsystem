<div align="center">

# Markov Chain System 

<p>
    <a href="#chinese">中文</a> • <a href="#english">English</a>
</p>

</div>

---

<div id="chinese"></div>

# 中文

本项目分为两个独立的部分：**后端（Python 核心逻辑）** 和 **前端（Next.js 可视化界面）**。

这是一个基于马尔可夫链（Markov Chain）的系统模拟与可视化工具，旨在提供直观的状态转移编辑与概率分析功能。

## 项目结构

- `backend/` - 包含用 Python 实现的核心马尔可夫链逻辑与计算引擎。
- `frontend/` - 包含 Next.js 前端应用程序（React, Tailwind CSS, TypeScript）。

---

## 快速开始

### 1. 后端 (Python Core)

马尔可夫系统的数学核心由 Python 实现，负责处理矩阵运算和系统模拟。

#### 核心文件说明 (`backend/`)

- `markov_system.py`: 系统主控制器。管理状态机、验证转移概率完整性（Sum=1.0），并执行矩阵乘法进行模拟。
- `event.py`: 定义马尔可夫链中的状态（节点）。
- `transition.py`: 定义状态之间的转移路径及其概率（边）。

#### 使用示例

您可以直接在 Python 中调用核心逻辑：

```python
from backend.markov_system import MarkovSystem

system = MarkovSystem()
system.add_event("1", "Event A")
system.add_event("2", "Event B")
system.add_transition("t1", "1", "2", 1.0)
system.add_transition("t2", "2", "1", 1.0)

# 验证系统完整性
errors = system.validate()
if not errors:
    # 模拟 10 步状态分布
    steps, distributions = system.simulate(10)
    print(distributions)
```

### 2. 前端 (Next.js Application)

前端提供了一个 **复古未来主义 (Retro-Futuristic)** 风格的交互式可视化界面，支持拖拽连线、动态调整概率矩阵，以及实时查看收敛图表。

#### 技术栈

- **框架**: Next.js 14+ (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **可视化**: React Flow (流程图核心), Recharts (数据图表)

#### 运行步骤

请确保您已安装 Node.js 环境。

1. 进入 `frontend` 目录：
   ```bash
   cd frontend
   ```

2. 安装依赖：
   ```bash
   npm install
   ```

3. 启动开发服务器：
   ```bash
   npm run dev
   ```

4. 打开浏览器访问 [http://localhost:3000](http://localhost:3000) 查看界面。

---

## 关于 `node_modules`

`node_modules` 目录包含了项目运行所需的所有第三方库和依赖项。您不需要编辑此文件夹中的文件。

**重要**: 请勿将 `node_modules` 提交到版本控制（它已被 `.gitignore` 忽略）。

---

<div id="english"></div>

# English

This project is divided into two distinct parts: the **Backend (Core Logic in Python)** and the **Frontend (Next.js Application)**.

## Project Structure

- `backend/` - Contains the core Markov Chain logic implemented in Python.
- `frontend/` - Contains the Next.js frontend application (React, Tailwind CSS).

---

## 1. Backend (Python Core)

The mathematical core of the Markov System is implemented in Python for robust matrix operations and system simulation.

### Core Files (`backend/`)

- `markov_system.py`: The main controller class. Manages the system state, validates probabilities, and performs matrix multiplication for simulation.
- `event.py`: Represents a state (node) in the Markov Chain.
- `transition.py`: Represents a transition (edge) between states with a probability.

### Usage (Python)

You can run the core logic directly in Python:

```python
from backend.markov_system import MarkovSystem

system = MarkovSystem()
system.add_event("1", "Event A")
system.add_event("2", "Event B")
system.add_transition("t1", "1", "2", 1.0)
system.add_transition("t2", "2", "1", 1.0)

# Validate
errors = system.validate()
if not errors:
    # Simulate
    steps, distributions = system.simulate(10)
    print(distributions)
```

---

## 2. Frontend (Next.js Application)

The frontend provides an interactive visualization interface inspired by a **Minimalist / Retro-Futuristic** aesthetic.

### Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Visualization**: React Flow
- **Charts**: Recharts

### Running the Frontend

Navigate to the `frontend` directory first:

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the interface.

---

## 3. About `node_modules`

The `node_modules` directory contains all the external libraries and dependencies required for the project to run. You do not need to edit files in this folder.

**Important**: Do not commit `node_modules` to version control (it is ignored by `.gitignore`).
