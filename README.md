# Westlake Noter 课程笔记索引 / Course Notes Index

这里仅整理组织内已有的课程笔记，具体内容与编译方式见各仓库 README。

An index of the organization's existing course notes. See each repository's README for details and build instructions.

## 课程笔记 / Course Notes

| 课程 / Course | 笔记仓库 / Repository | 内容与维护情况 / Contents & Maintenance |
| :--- | :--- | :--- |
| 代数与分析基础 / Fundamental Algebra and Analysis | [FAA-lecture-notes](https://github.com/westlake-noter/FAA-lecture-notes) | 第一、二部分 LaTeX 讲义源码归档，后续以勘误和小范围修正为主。/ Parts I & II source archive; occasional corrections. |
| 常微分方程 / Ordinary Differential Equations | [Ordinary-Differential-Equations](https://github.com/westlake-noter/Ordinary-Differential-Equations) | 按章节整理的 LaTeX 课程笔记，随新增章节与勘误更新。/ Chapter-based LaTeX notes; updated with new chapters and corrections. |
| 测度论与实分析 / Measure Theory and Real Analysis | [Measure-Theory-and-Real-Analysis](https://github.com/westlake-noter/Measure-Theory-and-Real-Analysis) | 按章节整理的 LaTeX 课程笔记，随新增章节与勘误更新。/ Chapter-based LaTeX notes; updated with new chapters and corrections. |
| 概率论 / Probability Theory | [Probability-Theory](https://github.com/westlake-noter/Probability-Theory) | 按章节整理的 LaTeX 课程笔记，随新增笔记与勘误更新。/ Chapter-based LaTeX notes; updated with new notes and corrections. |

## 仓库标签要求 / Required Repository Topics

所有课程笔记仓库必须设置 GitHub **Topics**（仓库标签，不是 Issue Labels）：

- `notes`：所有课程笔记仓库必需，用于统一识别笔记。
- 学科标签：按实际内容设置；当前四个仓库均使用 `math`。
- 格式标签：提供 LaTeX 源码的仓库必须设置 `latex`。
- 课程标签：至少设置一个能明确识别课程的标签，当前约定如下。

| 笔记仓库 / Repository | 课程标签 / Course Topics |
| :--- | :--- |
| FAA-lecture-notes | `fundamental-algebra-and-analysis`、`faa` |
| Ordinary-Differential-Equations | `ordinary-differential-equations` |
| Measure-Theory-and-Real-Analysis | `measure-theory`、`real-analysis` |
| Probability-Theory | `probability-theory` |

新增仓库时，在仓库首页 **About** 的设置中添加 Topics，使用小写英文和连字符，并同步更新本索引。保留已有且相关的标签，避免重复添加含义相同的标签。

Every course notes repository must have GitHub Topics: `notes`, a subject topic (`math` for the current repositories), and at least one course topic listed above. Repositories containing LaTeX sources must also use `latex`. These are repository Topics, not issue labels. Set them in the repository's About settings and update this index when adding a course.

## 阅读与勘误 / Reading & Corrections

- 各仓库提供 LaTeX 源码；PDF 的获取方式以各仓库说明为准。代数与分析基础的 PDF 包请查看其 [Releases](https://github.com/westlake-noter/FAA-lecture-notes/releases)。
- 内容问题请在对应笔记仓库提交 Issue，或通过 Pull Request 提交勘误。
- 新增课程笔记仓库时，按上述要求设置标签，并在课程笔记表中补充课程名称、仓库链接和简短说明。

Repositories provide LaTeX sources; consult their READMEs for PDF availability. For Fundamental Algebra and Analysis PDF bundles, check its Releases page. Report errors or submit corrections in the relevant notes repository. Set the required Topics for new course notes and add them to the course table with a course name, repository link, and brief description.
