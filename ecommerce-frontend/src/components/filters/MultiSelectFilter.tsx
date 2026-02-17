import React from "react";
import "../../styles/filters.css";

export interface FilterOption {
  id: number;
  label: string;
}

interface Props {
  title: string;
  options: FilterOption[];
  selected: number[];
  onChange: (selected: number[]) => void;
}

const MultiSelectFilter: React.FC<Props> = ({
  title,
  options,
  selected,
  onChange,
}) => {
  const toggle = (id: number) => {
    if (selected.includes(id)) {
      onChange(selected.filter((v) => v !== id));
    } else {
      onChange([...selected, id]);
    }
  };

  return (
    <div className="filter-box">
      <h4>{title}</h4>

      {options.map((opt) => (
        <label key={opt.id} className="filter-option">
          <input
            type="checkbox"
            checked={selected.includes(opt.id)}
            onChange={() => toggle(opt.id)}
          />
          <span>{opt.label}</span>
        </label>
      ))}
    </div>
  );
};

export default MultiSelectFilter;
