/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  notesSidebar: [
    'notes',
    {
      type: 'category',
      label: 'Mathematics',
      link: { type: 'doc', id: 'notes/math' },
      items: [
        'notes/math/fundamental-algebra-analysis',
        'notes/math/calculus',
        'notes/math/linear-algebra',
        'notes/math/ordinary-differential-equations',
        'notes/math/measure-theory-real-analysis',
        'notes/math/probability-theory',
        'notes/math/partial-differential-equations',
      ],
    },
    {
      type: 'category',
      label: 'Chemistry',
      link: { type: 'doc', id: 'notes/chemistry' },
      items: ['notes/chemistry/general-chemistry'],
    },
  ],
  toolsSidebar: ['tools'],
};

export default sidebars;
