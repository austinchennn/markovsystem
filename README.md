<div align="center">

# Markov Chain System 

<p>
    <a href="#english">English</a> • <a href="#chinese">中文</a>
</p>

</div>

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

**Note**: Since the core logic was moved to Python as requested, the frontend currently serves as a UI shell. To connect them, you would typically run the Python code as a backend API (e.g., using FastAPI or Flask) and have the Next.js app fetch data from it.

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

- **next**: The core framework driving the application.
- **react / react-dom**: The UI library for building components.
- **tailwindcss**: The utility-first CSS framework for styling.
- **reactflow**: The library used for the node-based graph editor.
- **recharts**: The library used for the convergence charts.
- **mathjs**: Used for mathematical operations (in the original TS implementation).
- **...and many others**: Dependencies of dependencies.

**Important**: Do not commit `node_modules` to version control (it is ignored by `.gitignore`).

---

<div id="chinese"></div>

# 中文

本项目分为两个独立的部分：**后端（Python 核心逻辑）** 和 **前端（Next.js 应用程序）**。

## 项目结构

- `backend/` - 包含用 Python 实现的核心马尔可夫链逻辑。
- `frontend/` - 包含 Next.js 前端应用程序（React, Tailwind CSS）。

---

## 1. 后端 (Python Core)

马尔可夫系统的数学核心主要由 Python 实现，以进行稳健的矩阵运算和系统模拟。

### 核心文件 (`backend/`)

- `markov_system.py`: 主控制器类。管理系统状态，验证概率，并为模拟执行矩阵乘法。
- `event.py`: 表示马尔可夫链中的一个状态（节点）。
- `transition.py`: 表示状态之间带有概率的转移（边）。

### 使用方法 (Python)

您可以直接在 Python 中运行核心逻辑：

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
    # 模拟系统
    steps, distributions = system.simulate(10)
    print(distributions)
```

---

## 2. 前端 (Next.js Application)

前端提供了一个受 **复古未来主义 (Retro-Futuristic)** 视觉风格启发的交互式可视化界面。

**注意**：由于核心逻辑已按要求移至 Python，目前前端主要作为 UI 外壳。为了连接它们，您通常需要将 Python 代码作为后端 API 运行（例如使用 FastAPI 或 Flask），并让 Next.js 应用程序从中获取数据。

### 技术栈

- **框架**: Next.js 14+ (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **可视化**: React Flow
- **图表**: Recharts

### 运行前端

首先进入 `frontend` 目录：

```bash
cd frontend
npm install
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000) 查看界面。

---

## 3. 关于 `node_modules`

`node_modules` 目录包含了项目运行所需的所有第三方库和依赖项。您不需要编辑此文件夹中的文件。

- **next**: 驱动应用程序的核心框架。
- **react / react-dom**: 用于构建组件的 UI 库。
- **tailwindcss**: 用于样式的实用优先 CSS 框架。
- **reactflow**: 用于基于节点的图形编辑器的库。
- **recharts**: 用于收敛图表的库。
- **mathjs**: 用于数学运算（在原始 TS 实现中）。
- **...以及其他许多**: 依赖项的依赖项。

**重要**: 请勿将 `node_modules` 提交到版本控制（它已被 `.gitignore` 忽略）。
