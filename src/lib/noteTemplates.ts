export type NoteTemplate = {
  id: string;
  name: string;
  description: string;
  content: string;
  tags: string[];
  icon: string;
  category: "work" | "personal" | "learning" | "custom";
};

export const defaultTemplates: NoteTemplate[] = [
  {
    id: "blank",
    name: "Blank Note",
    description: "Start with an empty note",
    content: "",
    tags: [],
    icon: "mdiFileOutline",
    category: "personal",
  },
  {
    id: "meeting",
    name: "Meeting Notes",
    description: "Structure for meeting documentation",
    content: `# Meeting: [Title]
Date: ${new Date().toLocaleDateString()}
Attendees:

## Agenda
-

## Discussion
-

## Decisions
-

## Action Items
- [ ]
- [ ]

## Follow-up
`,
    tags: ["meeting", "work"],
    icon: "mdiAccountMultiple",
    category: "work",
  },
  {
    id: "daily-journal",
    name: "Daily Journal",
    description: "Daily reflection and planning",
    content: `# ${new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}

## Morning
🌅 How I'm feeling:

Today's priorities:
- [ ]
- [ ]
- [ ]

## Evening
🌙 What went well:

What I learned:

Tomorrow's focus:
`,
    tags: ["journal", "daily"],
    icon: "mdiBookOpen",
    category: "personal",
  },
  {
    id: "todo-list",
    name: "Todo List",
    description: "Simple task list",
    content: `# Tasks - ${new Date().toLocaleDateString()}

## High Priority
- [ ]
- [ ]

## Medium Priority
- [ ]
- [ ]

## Low Priority
- [ ]
- [ ]

## Completed
`,
    tags: ["todo", "tasks"],
    icon: "mdiCheckboxMarkedOutline",
    category: "work",
  },
  {
    id: "project-planning",
    name: "Project Planning",
    description: "Plan a new project",
    content: `# Project: [Name]

## Overview
**Goal:**
**Timeline:**
**Owner:**

## Objectives
1.
2.
3.

## Milestones
- [ ] Phase 1:
- [ ] Phase 2:
- [ ] Phase 3:

## Resources Needed
-
-

## Risks & Mitigation
- **Risk:**
  **Mitigation:**

## Success Criteria
-
-

## Notes
`,
    tags: ["project", "planning", "work"],
    icon: "mdiFolderOutline",
    category: "work",
  },
  {
    id: "study-notes",
    name: "Study Notes",
    description: "Learning and study template",
    content: `# Study Notes: [Topic]
Date: ${new Date().toLocaleDateString()}

## Key Concepts
-

## Important Definitions
**Term:**
Definition:

## Examples
1.

## Questions
- [ ]
- [ ]

## Summary
Main takeaways:
-
-

## Resources
-
`,
    tags: ["study", "learning"],
    icon: "mdiSchoolOutline",
    category: "learning",
  },
  {
    id: "brainstorm",
    name: "Brainstorming",
    description: "Capture ideas freely",
    content: `# Brainstorm: [Topic]

## Initial Thoughts
-
-
-

## Categories

### Ideas
-
-

### Questions
-
-

### Resources
-
-

## Next Steps
- [ ]
`,
    tags: ["ideas", "brainstorm"],
    icon: "mdiLightbulbOutline",
    category: "work",
  },
  {
    id: "recipe",
    name: "Recipe",
    description: "Document cooking recipes",
    content: `# [Recipe Name]

**Prep Time:**
**Cook Time:**
**Servings:**

## Ingredients
-
-
-

## Instructions
1.
2.
3.

## Notes
-

## Tags
#recipe #cooking
`,
    tags: ["recipe", "cooking"],
    icon: "mdiChefHat",
    category: "personal",
  },
];

export function getTemplateById(id: string): NoteTemplate | undefined {
  return defaultTemplates.find(t => t.id === id);
}

export function getTemplatesByCategory(category: NoteTemplate["category"]): NoteTemplate[] {
  return defaultTemplates.filter(t => t.category === category);
}
