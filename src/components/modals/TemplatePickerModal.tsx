import { mdiClose, mdiMagnify } from "@mdi/js";
import { useState } from "react";
import Modal from "react-modal";
import { iconButtonLabel } from "@/components/icons/IconButton";
import { Icon } from "@/components/icons/Icon";
import { defaultTemplates, type NoteTemplate } from "@/lib/noteTemplates";

Modal.setAppElement("#root");

export function TemplatePickerModal({
  isOpen,
  onClose,
  onSelectTemplate,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: NoteTemplate) => void;
}) {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<"all" | "work" | "personal" | "learning">("all");

  const filtered = defaultTemplates.filter(template => {
    const matchesQuery = !query || template.name.toLowerCase().includes(query.toLowerCase()) || template.description.toLowerCase().includes(query.toLowerCase());
    const matchesCategory = selectedCategory === "all" || template.category === selectedCategory;
    return matchesQuery && matchesCategory;
  });

  const categories = [
    { id: "all", label: "All Templates" },
    { id: "work", label: "Work" },
    { id: "personal", label: "Personal" },
    { id: "learning", label: "Learning" },
  ] as const;

  return (
    <Modal isOpen={isOpen} onRequestClose={onClose} className="app-modal template-picker-modal" overlayClassName="modal-overlay">
      <div className="modal-header">
        <h2>Choose Template</h2>
        {iconButtonLabel("Close", mdiClose, onClose)}
      </div>

      <div className="template-picker-content">
        <div className="template-search-bar">
          <Icon path={mdiMagnify} size={0.8} />
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search templates..." autoFocus />
        </div>

        <div className="template-categories">
          {categories.map(cat => (
            <button
              key={cat.id}
              type="button"
              className={`category-chip ${selectedCategory === cat.id ? "active" : ""}`}
              onClick={() => setSelectedCategory(cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="template-grid">
          {filtered.map(template => (
            <button
              key={template.id}
              type="button"
              className="template-card"
              onClick={() => {
                onSelectTemplate(template);
                onClose();
              }}
            >
              <div className="template-card-header">
                <div className="template-icon">{template.icon === "mdiFileOutline" ? "📄" : template.icon === "mdiAccountMultiple" ? "👥" : template.icon === "mdiBookOpen" ? "📖" : template.icon === "mdiCheckboxMarkedOutline" ? "✅" : template.icon === "mdiFolderOutline" ? "📁" : template.icon === "mdiSchoolOutline" ? "🎓" : template.icon === "mdiLightbulbOutline" ? "💡" : "🍳"}</div>
                <span className="template-category-badge">{template.category}</span>
              </div>
              <h3>{template.name}</h3>
              <p>{template.description}</p>
              {template.tags.length > 0 && (
                <div className="template-tags">
                  {template.tags.slice(0, 3).map(tag => (
                    <span key={tag} className="template-tag">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </button>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="template-empty-state">
            <p>No templates found matching "{query}"</p>
          </div>
        )}
      </div>
    </Modal>
  );
}
