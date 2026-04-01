import { useState } from "react";
import "../../styles/css/SkillPicker.css";

function SkillPicker({
  availableSkills,
  selectedSkills,
  onToggleSkill,
  onRemoveSkill,
  onAddSkill,
  loading = false,
  adding = false,
  helpText = "",
  searchPlaceholder = "Search skills",
  emptyMessage = "No skills available yet.",
}) {
  const [query, setQuery] = useState("");

  const trimmedQuery = query.trim();
  const normalizedQuery = trimmedQuery.toLowerCase();
  const filteredSkills = availableSkills.filter((skill) =>
    !normalizedQuery || skill.name.toLowerCase().includes(normalizedQuery)
  );
  const exactMatchExists = availableSkills.some(
    (skill) => skill.name.toLowerCase() === normalizedQuery
  );

  const handleAddNewSkill = async () => {
    if (!trimmedQuery) {
      return;
    }

    const created = await onAddSkill(trimmedQuery);
    if (created !== false) {
      setQuery("");
    }
  };

  return (
    <div className="skp-root">
      {helpText ? <p className="skp-help">{helpText}</p> : null}

      <div className="skp-search-row">
        <input
          className="skp-search-input"
          type="text"
          placeholder={searchPlaceholder}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        {trimmedQuery && !exactMatchExists ? (
          <button
            type="button"
            className="skp-add-btn"
            disabled={adding}
            onClick={handleAddNewSkill}
          >
            {adding ? "Adding..." : `Add "${trimmedQuery}"`}
          </button>
        ) : null}
      </div>

      <div className="skp-option-list">
        {loading ? (
          <p className="skp-note">Loading skills...</p>
        ) : filteredSkills.length > 0 ? (
          filteredSkills.map((skill) => {
            const isSelected = selectedSkills.includes(skill.name);
            return (
              <button
                key={skill.id ?? skill.name}
                type="button"
                className={`skp-option ${isSelected ? "selected" : ""}`}
                onClick={() => onToggleSkill(skill.name)}
              >
                {skill.name}
              </button>
            );
          })
        ) : (
          <p className="skp-note">
            {trimmedQuery
              ? `No matching skills for "${trimmedQuery}".`
              : emptyMessage}
          </p>
        )}
      </div>

      {selectedSkills.length > 0 ? (
        <div className="skp-selected">
          {selectedSkills.map((skill) => (
            <span key={skill} className="skp-chip">
              <span>{skill}</span>
              <button
                type="button"
                className="skp-chip-remove"
                aria-label={`Remove ${skill}`}
                onClick={() => onRemoveSkill(skill)}
              >
                x
              </button>
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export default SkillPicker;
